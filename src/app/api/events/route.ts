import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return new Response("Missing userId", { status: 400 });
  }

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          closed = true;
        }
      };

      // Send heartbeat every 15s to keep connection alive
      const heartbeat = setInterval(() => {
        send("heartbeat", { time: Date.now() });
      }, 15000);

      // Poll DB for changes every 2 seconds and push events
      let lastNotifCheck = new Date();
      let lastFriendCheck = new Date();
      let lastDMCheck = new Date();
      let lastFriendStatuses: Record<string, string> = {};

      const poll = async () => {
        if (closed) return;

        try {
          // 1. Check new notifications
          const newNotifs = await prisma.notification.findMany({
            where: {
              userId,
              createdAt: { gt: lastNotifCheck },
            },
            orderBy: { createdAt: "asc" },
          });

          if (newNotifs.length > 0) {
            lastNotifCheck = new Date();
            for (const notif of newNotifs) {
              send("notification", notif);
            }
          }

          // 2. Check friendship changes
          const friendships = await prisma.friendship.findMany({
            where: {
              OR: [{ userId }, { friendId: userId }],
              createdAt: { gt: lastFriendCheck },
            },
            include: {
              user: { select: { id: true, username: true, avatar: true, status: true } },
              friend: { select: { id: true, username: true, avatar: true, status: true } },
            },
          });

          if (friendships.length > 0) {
            lastFriendCheck = new Date();
            send("friends_update", { friendships });
          }

          // 3. Check friend online status changes
          const acceptedFriendships = await prisma.friendship.findMany({
            where: {
              status: "accepted",
              OR: [{ userId }, { friendId: userId }],
            },
            include: {
              user: { select: { id: true, status: true } },
              friend: { select: { id: true, status: true } },
            },
          });

          const currentStatuses: Record<string, string> = {};
          for (const f of acceptedFriendships) {
            const other = f.userId === userId ? f.friend : f.user;
            currentStatuses[other.id] = other.status;
          }

          // Compare with last known statuses
          let statusChanged = false;
          for (const [id, status] of Object.entries(currentStatuses)) {
            if (lastFriendStatuses[id] !== status) {
              statusChanged = true;
              break;
            }
          }
          if (Object.keys(lastFriendStatuses).length !== Object.keys(currentStatuses).length) {
            statusChanged = true;
          }

          if (statusChanged) {
            lastFriendStatuses = currentStatuses;
            send("status_update", currentStatuses);
          }

          // 4. Check new DMs
          const newDMs = await prisma.directMessage.findMany({
            where: {
              receiverId: userId,
              createdAt: { gt: lastDMCheck },
            },
            include: {
              sender: { select: { id: true, username: true, avatar: true } },
            },
            orderBy: { createdAt: "asc" },
          });

          if (newDMs.length > 0) {
            lastDMCheck = new Date();
            for (const dm of newDMs) {
              send("new_dm", dm);
            }
          }
        } catch (error) {
          console.error("SSE poll error:", error);
        }
      };

      // Initial poll
      await poll();

      // Poll every 2 seconds
      const pollInterval = setInterval(poll, 2000);

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(heartbeat);
        clearInterval(pollInterval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}