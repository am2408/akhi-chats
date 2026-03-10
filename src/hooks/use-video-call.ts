"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Peer, { MediaConnection } from "peerjs";

interface CallState {
  isInCall: boolean;
  isCalling: boolean;
  isReceiving: boolean;
  callId: string | null;
  roomId: string | null;
  remotePeerId: string | null;
  remoteUser: { id: string; username: string; avatar: string | null } | null;
  callType: "video" | "audio";
}

interface UseVideoCallOptions {
  userId: string | undefined;
  onCallEnded?: () => void;
}

export default function useVideoCall({ userId, onCallEnded }: UseVideoCallOptions) {
  const [callState, setCallState] = useState<CallState>({
    isInCall: false,
    isCalling: false,
    isReceiving: false,
    callId: null,
    roomId: null,
    remotePeerId: null,
    remoteUser: null,
    callType: "video",
  });

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const peerRef = useRef<Peer | null>(null);
  const callRef = useRef<MediaConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Initialize PeerJS
  useEffect(() => {
    if (!userId) return;

    const peer = new Peer(`akhi-${userId}`, {
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
        ],
      },
    });

    peer.on("open", (id) => {
      console.log("PeerJS connected with ID:", id);
    });

    // Handle incoming calls
    peer.on("call", (incomingCall) => {
      // Store the call reference — will be answered when user accepts
      callRef.current = incomingCall;
    });

    peer.on("error", (err) => {
      console.error("PeerJS error:", err);
      // Try to reconnect
      if (err.type === "disconnected") {
        peer.reconnect();
      }
    });

    peerRef.current = peer;

    return () => {
      peer.destroy();
      peerRef.current = null;
    };
  }, [userId]);

  const getMediaStream = useCallback(async (type: "video" | "audio") => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: type === "video" ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        } : false,
      });
      return stream;
    } catch (error) {
      console.error("Failed to get media stream:", error);
      // Fallback to audio only
      if (type === "video") {
        try {
          return await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        } catch {
          throw new Error("Cannot access microphone or camera");
        }
      }
      throw error;
    }
  }, []);

  // Start a call
  const startCall = useCallback(async (receiverId: string, type: "video" | "audio" = "video") => {
    if (!userId || !peerRef.current) return;

    try {
      // Create call in DB
      const res = await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callerId: userId, receiverId, type }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Failed to create call:", data.error);
        return;
      }

      const stream = await getMediaStream(type);
      localStreamRef.current = stream;
      setLocalStream(stream);

      setCallState({
        isInCall: false,
        isCalling: true,
        isReceiving: false,
        callId: data.call.id,
        roomId: data.call.roomId,
        remotePeerId: `akhi-${receiverId}`,
        remoteUser: data.call.receiver,
        callType: type,
      });

      // Play ringing sound
      const ringAudio = new Audio("/sounds/call-ringing.mp3");
      ringAudio.loop = true;
      ringAudio.play().catch(() => {});

      // Poll for call acceptance
      const pollInterval = setInterval(async () => {
        const callRes = await fetch(`/api/calls?userId=${userId}`);
        const callData = await callRes.json();

        if (!callData.call || callData.call.id !== data.call.id) {
          // Call was deleted/ended
          clearInterval(pollInterval);
          ringAudio.pause();
          hangUp();
          return;
        }

        if (callData.call.status === "active") {
          clearInterval(pollInterval);
          ringAudio.pause();

          // Make the peer call
          const peerCall = peerRef.current!.call(`akhi-${receiverId}`, stream);
          callRef.current = peerCall;

          peerCall.on("stream", (remoteStream) => {
            setRemoteStream(remoteStream);
          });

          peerCall.on("close", () => {
            hangUp();
          });

          setCallState((prev) => ({
            ...prev,
            isInCall: true,
            isCalling: false,
          }));
        } else if (callData.call.status === "declined" || callData.call.status === "missed" || callData.call.status === "ended") {
          clearInterval(pollInterval);
          ringAudio.pause();
          hangUp();
        }
      }, 1000);

      // Auto-timeout after 30s
      setTimeout(() => {
        clearInterval(pollInterval);
        ringAudio.pause();
      }, 30000);

    } catch (error) {
      console.error("Failed to start call:", error);
    }
  }, [userId, getMediaStream]);

  // Accept an incoming call
  const acceptCall = useCallback(async (callId: string, callType: "video" | "audio" = "video") => {
    if (!userId || !peerRef.current) return;

    try {
      const stream = await getMediaStream(callType);
      localStreamRef.current = stream;
      setLocalStream(stream);

      // Update call status to active
      await fetch("/api/calls", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId, status: "active" }),
      });

      // Answer the PeerJS call if we have one
      if (callRef.current) {
        callRef.current.answer(stream);

        callRef.current.on("stream", (remoteStream) => {
          setRemoteStream(remoteStream);
        });

        callRef.current.on("close", () => {
          hangUp();
        });
      }

      setCallState((prev) => ({
        ...prev,
        isInCall: true,
        isReceiving: false,
        isCalling: false,
      }));
    } catch (error) {
      console.error("Failed to accept call:", error);
    }
  }, [userId, getMediaStream]);

  // Decline a call
  const declineCall = useCallback(async (callId: string) => {
    await fetch("/api/calls", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callId, status: "declined" }),
    });

    callRef.current?.close();
    setCallState({
      isInCall: false, isCalling: false, isReceiving: false,
      callId: null, roomId: null, remotePeerId: null, remoteUser: null, callType: "video",
    });
  }, []);

  // Hang up
  const hangUp = useCallback(async () => {
    if (callState.callId) {
      await fetch("/api/calls", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId: callState.callId, status: "ended" }),
      }).catch(() => {});
    }

    callRef.current?.close();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());

    setLocalStream(null);
    setRemoteStream(null);
    setIsMuted(false);
    setIsCameraOff(false);
    setIsScreenSharing(false);

    setCallState({
      isInCall: false, isCalling: false, isReceiving: false,
      callId: null, roomId: null, remotePeerId: null, remoteUser: null, callType: "video",
    });

    // Play end sound
    const endAudio = new Audio("/sounds/call-end.mp3");
    endAudio.play().catch(() => {});

    onCallEnded?.();
  }, [callState.callId, onCallEnded]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach((track) => { track.enabled = !track.enabled; });
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Toggle camera
  const toggleCamera = useCallback(() => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach((track) => { track.enabled = !track.enabled; });
      setIsCameraOff(!isCameraOff);
    }
  }, [isCameraOff]);

  // Toggle screen share
  const toggleScreenShare = useCallback(async () => {
    if (!callRef.current || !localStreamRef.current) return;

    if (isScreenSharing) {
      // Stop screen share, restore camera
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      const stream = await getMediaStream(callState.callType);
      localStreamRef.current = stream;
      setLocalStream(stream);

      // Replace track in peer connection
      const sender = (callRef.current as unknown as { peerConnection: RTCPeerConnection }).peerConnection
        ?.getSenders()?.find((s: RTCRtpSender) => s.track?.kind === "video");
      if (sender && stream.getVideoTracks()[0]) {
        sender.replaceTrack(stream.getVideoTracks()[0]);
      }

      setIsScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        screenStreamRef.current = screenStream;

        // Replace video track
        const sender = (callRef.current as unknown as { peerConnection: RTCPeerConnection }).peerConnection
          ?.getSenders()?.find((s: RTCRtpSender) => s.track?.kind === "video");
        if (sender && screenStream.getVideoTracks()[0]) {
          sender.replaceTrack(screenStream.getVideoTracks()[0]);
        }

        // Update local preview
        const combinedStream = new MediaStream([
          ...screenStream.getVideoTracks(),
          ...(localStreamRef.current?.getAudioTracks() || []),
        ]);
        setLocalStream(combinedStream);

        // Handle when user stops sharing via browser UI
        screenStream.getVideoTracks()[0].onended = () => {
          toggleScreenShare();
        };

        setIsScreenSharing(true);
      } catch {
        console.error("Screen share cancelled");
      }
    }
  }, [isScreenSharing, callState.callType, getMediaStream]);

  return {
    callState,
    setCallState,
    localStream,
    remoteStream,
    isMuted,
    isCameraOff,
    isScreenSharing,
    startCall,
    acceptCall,
    declineCall,
    hangUp,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
  };
}