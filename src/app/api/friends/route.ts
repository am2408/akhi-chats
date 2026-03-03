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
          { userId, status },
          { friendId: userId, status },
        ],
      },
      include: {
        user: { select: { id: true, username: true, avatar: true, status: true } },
        friend: { select: { id: true, username: true, avatar: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Return the "other" user in each friendship
    const friends = friendships.map((f) => {
      const other = f.userId === userId ? f.friend : f.user;
      return { ...other, friendshipId: f.id, friendshipStatus: f.status };
    });

    return NextResponse.json({ friends });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ friends: [] });
  }
}

// POST — send friend request
export async function POST(req: Request) {
  try {
    const { userId, friendId } = await req.json();

    if (!userId || !friendId) {
      return NextResponse.json({ error: "Missing userId or friendId" }, { status: 400 });
    }

    if (userId === friendId) {
      return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 });
    }

    // Check if friendship already exists
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Friend request already exists", friendship: existing }, { status: 409 });
    }

    const friendship = await prisma.friendship.create({
      data: { userId, friendId, status: "pending" },
      include: {
        friend: { select: { id: true, username: true, avatar: true, status: true } },
      },
    });

    return NextResponse.json({ friendship }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to send friend request" }, { status: 500 });
  }
}

// PATCH — accept/block friend request
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
    console.error(error);
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
    console.error(error);
    return NextResponse.json({ error: "Failed to remove friend" }, { status: 500 });
  }
}