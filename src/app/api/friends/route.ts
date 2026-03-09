import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET — list friends
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status") || "accepted";

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: userId, status },
          { receiverId: userId, status },
        ],
      },
      include: {
        requester: { select: { id: true, username: true, avatar: true, status: true } },
        receiver: { select: { id: true, username: true, avatar: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const friends = friendships.map((f) => {
      const other = f.requesterId === userId ? f.receiver : f.requester;
      return { ...other, friendshipId: f.id, friendshipStatus: f.status };
    });

    return NextResponse.json({ friends });
  } catch (error) {
    console.error("GET /api/friends error:", error);
    return NextResponse.json({ friends: [] });
  }
}

// POST — send friend request
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, friendId } = body;

    if (!userId || !friendId) {
      return NextResponse.json({ error: "Missing userId or friendId" }, { status: 400 });
    }

    if (userId === friendId) {
      return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 });
    }

    // Verify both users exist
    const [user, friend] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.user.findUnique({ where: { id: friendId } }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "Your user account not found" }, { status: 404 });
    }

    if (!friend) {
      return NextResponse.json({ error: "Friend not found" }, { status: 404 });
    }

    // Check if friendship already exists (in either direction)
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: userId, receiverId: friendId },
          { requesterId: friendId, receiverId: userId },
        ],
      },
    });

    if (existing) {
      if (existing.status === "pending") {
        return NextResponse.json({ error: "Friend request already pending" }, { status: 409 });
      }
      if (existing.status === "accepted") {
        return NextResponse.json({ error: "Already friends" }, { status: 409 });
      }
      if (existing.status === "blocked") {
        return NextResponse.json({ error: "This user is blocked" }, { status: 409 });
      }
    }

    const friendship = await prisma.friendship.create({
      data: {
        requesterId: userId,
        receiverId: friendId,
        status: "pending",
      },
      include: {
        receiver: { select: { id: true, username: true, avatar: true, status: true } },
      },
    });

    return NextResponse.json({ friendship }, { status: 201 });
  } catch (error) {
    console.error("POST /api/friends error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to send friend request", details: message }, { status: 500 });
  }
}

// PATCH — accept / block friend request
export async function PATCH(req: Request) {
  try {
    const { friendshipId, status } = await req.json();

    if (!friendshipId || !["accepted", "blocked"].includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const friendship = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status },
    });

    return NextResponse.json({ friendship });
  } catch (error) {
    console.error("PATCH /api/friends error:", error);
    return NextResponse.json({ error: "Failed to update friendship" }, { status: 500 });
  }
}

// DELETE — remove friend
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const friendshipId = searchParams.get("friendshipId");

    if (!friendshipId) {
      return NextResponse.json({ error: "Missing friendshipId" }, { status: 400 });
    }

    await prisma.friendship.delete({ where: { id: friendshipId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/friends error:", error);
    return NextResponse.json({ error: "Failed to remove friend" }, { status: 500 });
  }
}