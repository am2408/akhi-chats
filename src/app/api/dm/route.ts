import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET — fetch DMs between two users
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const friendId = searchParams.get("friendId");

    if (!userId || !friendId) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId },
        ],
      },
      include: {
        sender: { select: { id: true, username: true, avatar: true } },
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("GET /api/dm error:", error);
    return NextResponse.json({ messages: [] });
  }
}

// POST — send a DM
export async function POST(req: Request) {
  try {
    const { senderId, receiverId, content } = await req.json();

    if (!senderId || !receiverId || !content?.trim()) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const message = await prisma.directMessage.create({
      data: {
        senderId,
        receiverId,
        content: content.trim(),
      },
      include: {
        sender: { select: { id: true, username: true, avatar: true } },
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("POST /api/dm error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}