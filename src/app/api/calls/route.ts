import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST — initiate a call
export async function POST(req: Request) {
  try {
    const { callerId, receiverId, type } = await req.json();

    if (!callerId || !receiverId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check if there's already an active call between them
    const existing = await prisma.call.findFirst({
      where: {
        status: { in: ["ringing", "active"] },
        OR: [
          { callerId, receiverId },
          { callerId: receiverId, receiverId: callerId },
        ],
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Call already in progress", call: existing }, { status: 409 });
    }

    const roomId = `call-${callerId}-${receiverId}-${Date.now()}`;

    const call = await prisma.call.create({
      data: {
        callerId,
        receiverId,
        type: type || "video",
        roomId,
        status: "ringing",
      },
      include: {
        caller: { select: { id: true, username: true, avatar: true } },
        receiver: { select: { id: true, username: true, avatar: true } },
      },
    });

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: "incoming_call",
        title: "Incoming Call",
        body: `is calling you...`,
        data: JSON.stringify({ callId: call.id, roomId, callerId, type: type || "video" }),
      },
    });

    return NextResponse.json({ call }, { status: 201 });
  } catch (error) {
    console.error("POST /api/calls error:", error);
    return NextResponse.json({ error: "Failed to create call" }, { status: 500 });
  }
}

// PATCH — accept, decline, end call
export async function PATCH(req: Request) {
  try {
    const { callId, status } = await req.json();

    if (!callId || !status) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { status };
    if (status === "ended" || status === "declined" || status === "missed") {
      updateData.endedAt = new Date();
    }

    const call = await prisma.call.update({
      where: { id: callId },
      data: updateData,
      include: {
        caller: { select: { id: true, username: true, avatar: true } },
        receiver: { select: { id: true, username: true, avatar: true } },
      },
    });

    return NextResponse.json({ call });
  } catch (error) {
    console.error("PATCH /api/calls error:", error);
    return NextResponse.json({ error: "Failed to update call" }, { status: 500 });
  }
}

// GET — get active call for user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const activeCall = await prisma.call.findFirst({
      where: {
        status: { in: ["ringing", "active"] },
        OR: [{ callerId: userId }, { receiverId: userId }],
      },
      include: {
        caller: { select: { id: true, username: true, avatar: true } },
        receiver: { select: { id: true, username: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ call: activeCall });
  } catch (error) {
    console.error("GET /api/calls error:", error);
    return NextResponse.json({ call: null });
  }
}