"use client";

import { useState } from "react";
import useAuth from "@/hooks/use-auth";
import useEvents from "@/hooks/use-events";
import useVideoCall from "@/hooks/use-video-call";
import IncomingCallToast from "@/components/media/incoming-call-toast";
import VideoCallRoom from "@/components/media/video-call-room";

// Export context so child pages can access call functions
import { createContext, useContext } from "react";

interface CallContextType {
  startCall: (receiverId: string, type?: "video" | "audio") => Promise<void>;
  callState: { isInCall: boolean; isCalling: boolean };
}

export const CallContext = createContext<CallContextType>({
  startCall: async () => {},
  callState: { isInCall: false, isCalling: false },
});

export function useCallContext() {
  return useContext(CallContext);
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [incomingCall, setIncomingCall] = useState<{
    callId: string;
    roomId: string;
    type: "video" | "audio";
    caller: { id: string; username: string; avatar: string | null };
  } | null>(null);

  const {
    callState,
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
    setCallState,
  } = useVideoCall({
    userId: user?.id,
    onCallEnded: () => setIncomingCall(null),
  });

  // Listen for incoming calls via SSE
  useEvents({
    userId: user?.id,
    onIncomingCall: (data) => {
      const callData = data as typeof incomingCall;
      if (callData && !callState.isInCall && !callState.isCalling) {
        setIncomingCall(callData);
        setCallState((prev) => ({
          ...prev,
          isReceiving: true,
          callId: callData.callId,
          roomId: callData.roomId,
          remoteUser: callData.caller,
          callType: callData.type,
        }));
      }
    },
    onCallEnded: () => {
      setIncomingCall(null);
      if (callState.isReceiving) {
        setCallState((prev) => ({
          ...prev,
          isReceiving: false,
          callId: null,
          roomId: null,
        }));
      }
    },
  });

  return (
    <CallContext.Provider value={{ startCall, callState }}>
      {children}

      {/* Incoming call toast */}
      {incomingCall && !callState.isInCall && (
        <IncomingCallToast
          callerName={incomingCall.caller.username}
          callerAvatar={incomingCall.caller.avatar}
          callType={incomingCall.type}
          onAccept={() => {
            acceptCall(incomingCall.callId, incomingCall.type);
            setIncomingCall(null);
          }}
          onDecline={() => {
            declineCall(incomingCall.callId);
            setIncomingCall(null);
          }}
        />
      )}

      {/* Active call overlay */}
      {callState.isInCall && (
        <VideoCallRoom
          localStream={localStream}
          remoteStream={remoteStream}
          remoteUser={callState.remoteUser}
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          isScreenSharing={isScreenSharing}
          onToggleMute={toggleMute}
          onToggleCamera={toggleCamera}
          onToggleScreenShare={toggleScreenShare}
          onHangUp={hangUp}
        />
      )}

      {/* Calling overlay */}
      {callState.isCalling && !callState.isInCall && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9998,
          background: "rgba(0,0,0,0.85)", display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 20, backdropFilter: "blur(8px)",
        }}>
          <style>{`
            @keyframes ring {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
          `}</style>
          <div style={{
            width: 100, height: 100, borderRadius: "50%",
            background: "#5865f2", display: "flex",
            alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 40, fontWeight: 700,
            animation: "ring 1.5s infinite",
          }}>
            {callState.remoteUser?.username?.[0]?.toUpperCase() || "?"}
          </div>
          <div style={{ color: "#fff", fontSize: 20, fontWeight: 600 }}>
            Calling {callState.remoteUser?.username}...
          </div>
          <div style={{ color: "#b5bac1", fontSize: 14 }}>Ringing</div>
          <button
            onClick={hangUp}
            style={{
              marginTop: 20, width: 56, height: 56, borderRadius: "50%",
              background: "#f23f43", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.956.956 0 0 1-.29-.7c0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28a11.27 11.27 0 0 0-2.67-1.85.996.996 0 0 1-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
            </svg>
          </button>
        </div>
      )}
    </CallContext.Provider>
  );
}