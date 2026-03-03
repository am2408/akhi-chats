import { NextApiRequest, NextApiResponse } from 'next';
import { createRoom, joinRoom, leaveRoom } from '@/lib/livekit';
import { NextResponse } from "next/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    switch (method) {
        case 'POST':
            const { action, roomName, userId } = req.body;

            if (action === 'create') {
                const room = await createRoom(roomName);
                return res.status(200).json(room);
            } else if (action === 'join') {
                const token = await joinRoom(roomName, userId);
                return res.status(200).json({ token });
            } else if (action === 'leave') {
                await leaveRoom(roomName, userId);
                return res.status(204).end();
            } else {
                return res.status(400).json({ error: 'Invalid action' });
            }

        default:
            res.setHeader('Allow', ['POST']);
            return res.status(405).end(`Method ${method} Not Allowed`);
    }
}

export async function GET() {
  return NextResponse.json({ message: "LiveKit endpoint — configure later" });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { action, roomName, participantName } = body;

  try {
    switch (action) {
      case "create": {
        const result = await createRoom(roomName);
        return NextResponse.json(result);
      }
      case "join": {
        const result = await joinRoom(roomName, participantName);
        return NextResponse.json(result);
      }
      case "leave": {
        const result = await leaveRoom(roomName, participantName);
        return NextResponse.json(result);
      }
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}