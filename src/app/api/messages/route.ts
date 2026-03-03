import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get("channelId");
    if (!channelId) return NextResponse.json({ error: "Missing channelId" }, { status: 400 });

    const messages = await prisma.message.findMany({
      where: { channelId },
      include: { user: { select: { id: true, username: true, avatar: true } } },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ messages });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ messages: [] });
  }
}

export async function POST(req: Request) {
  try {
    const { channelId, content, userId } = await req.json();
    const message = await prisma.message.create({
      data: { content, channelId, userId },
      include: { user: { select: { id: true, username: true, avatar: true } } },
    });
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}