import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET — fetch friends list
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status") || "accepted";

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    if (status === "pending") {
      // Only show INCOMING requests (where current user is the RECEIVER)
      const incoming = await prisma.friendship.findMany({
        where: {
          friendId: userId,
          status: "pending",
        },
        include: {
          user: { select: { id: true, username: true, avatar: true, status: true } },
        },
      });

      const friends = incoming.map((f) => ({
        id: f.user.id,
        username: f.user.username,
        avatar: f.user.avatar,
        status: f.user.status,
        friendshipId: f.id,
        friendshipStatus: f.status,
        direction: "incoming" as const,
      }));

      // Also fetch outgoing so user can see sent requests
      const outgoing = await prisma.friendship.findMany({
        where: {
          userId: userId,
          status: "pending",
        },
        include: {
          friend: { select: { id: true, username: true, avatar: true, status: true } },
        },
      });

      const outgoingFriends = outgoing.map((f) => ({
        id: f.friend.id,
        username: f.friend.username,
        avatar: f.friend.avatar,
        status: f.friend.status,
        friendshipId: f.id,
        friendshipStatus: f.status,
        direction: "outgoing" as const,
      }));

      return NextResponse.json({ friends: [...friends, ...outgoingFriends] });
    }

    // Accepted friends — both directions
    const friendships = await prisma.friendship.findMany({
      where: {
        status: "accepted",
        OR: [{ userId }, { friendId: userId }],
      },
      include: {
        user: { select: { id: true, username: true, avatar: true, status: true } },
        friend: { select: { id: true, username: true, avatar: true, status: true } },
      },
    });

    const friends = friendships.map((f) => {
      const other = f.userId === userId ? f.friend : f.user;
      return {
        id: other.id,
        username: other.username,
        avatar: other.avatar,
        status: other.status,
        friendshipId: f.id,
        friendshipStatus: f.status,
      };
    });

    return NextResponse.json({ friends });
  } catch (error) {
    console.error("GET /api/friends error:", error);
    return NextResponse.json({ error: "Failed to fetch friends" }, { status: 500 });
  }
}

// POST — send friend request
export async function POST(req: Request) {
  try {
    const { userId, friendId } = await req.json();

    if (!userId || !friendId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (userId === friendId) {
      return NextResponse.json({ error: "You can't add yourself" }, { status: 400 });
    }

    // Check if friendship already exists in either direction
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });

    if (existing) {
      if (existing.status === "accepted") {
        return NextResponse.json({ error: "Already friends" }, { status: 400 });
      }
      if (existing.status === "pending") {
        // If the other person already sent a request, auto-accept
        if (existing.userId === friendId && existing.friendId === userId) {
          const updated = await prisma.friendship.update({
            where: { id: existing.id },
            data: { status: "accepted" },
          });
          return NextResponse.json({ friendship: updated, message: "Friend request accepted!" });
        }
        return NextResponse.json({ error: "Friend request already sent" }, { status: 400 });
      }
    }

    const friendship = await prisma.friendship.create({
      data: { userId, friendId, status: "pending" },
    });

    // Create notification for the receiver
    await prisma.notification.create({
      data: {
        userId: friendId,
        type: "friend_request",
        title: "New Friend Request",
        body: `You have a new friend request!`,
        data: JSON.stringify({ friendshipId: friendship.id, fromUserId: userId }),
      },
    }).catch(() => {}); // Don't fail if notification model is different

    return NextResponse.json({ friendship }, { status: 201 });
  } catch (error) {
    console.error("POST /api/friends error:", error);
    return NextResponse.json({ error: "Failed to send request" }, { status: 500 });
  }
}

// PATCH — accept/reject friend request
export async function PATCH(req: Request) {
  try {
    const { friendshipId, status } = await req.json();

    if (!friendshipId || !status) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const friendship = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status },
      include: {
        user: { select: { id: true, username: true } },
        friend: { select: { id: true, username: true } },
      },
    });

    // If accepted, notify the sender
    if (status === "accepted") {
      await prisma.notification.create({
        data: {
          userId: friendship.userId,
          type: "friend_accepted",
          title: "Friend Request Accepted",
          body: `${friendship.friend.username} accepted your friend request!`,
          data: JSON.stringify({ friendshipId: friendship.id }),
        },
      }).catch(() => {});
    }

    return NextResponse.json({ friendship });
  } catch (error) {
    console.error("PATCH /api/friends error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// DELETE — remove friend / cancel request
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const friendshipId = searchParams.get("friendshipId");

    if (!friendshipId) {
      return NextResponse.json({ error: "Missing friendshipId" }, { status: 400 });
    }

    await prisma.friendship.delete({ where: { id: friendshipId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/friends error:", error);
    return NextResponse.json({ error: "Failed to remove" }, { status: 500 });
  }
}