import { AccessToken } from "livekit-server-sdk";

const apiKey = process.env.LIVEKIT_API_KEY!;
const apiSecret = process.env.LIVEKIT_API_SECRET!;
const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL!;

export async function createRoom(roomName: string) {
  // LiveKit creates rooms on-the-fly when a participant joins
  // No explicit creation needed with the JS SDK approach
  return { room: roomName, url: wsUrl };
}

export async function joinRoom(roomName: string, participantName: string) {
  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
  });
  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });
  const token = await at.toJwt();
  return { token, url: wsUrl };
}

export async function leaveRoom(_roomName: string, _participantName: string) {
  // Client-side disconnect handles this; stub for API completeness
  return { success: true };
}