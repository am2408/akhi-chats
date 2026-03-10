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

      const heartbeat = setInterval(() => {
        send("heartbeat", { time: Date.now() });
      }, 15000);

      let lastNotifCheck = new Date();
      let lastDMCheck = new Date();
      let lastFriendStatuses: Record<string, string> = {};
      let lastFriendshipIds: string[] = [];
      let lastCallId: string | null = null;

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
          const allFriendships = await prisma.friendship.findMany({
            where: {
              OR: [{ userId }, { friendId: userId }],
            },
            include: {
              user: { select: { id: true, username: true, avatar: true, status: true } },
              friend: { select: { id: true, username: true, avatar: true, status: true } },
            },
          });

          const currentFriendshipIds = allFriendships.map((f) => `${f.id}-${f.status}`).sort();
          const prevIds = lastFriendshipIds.sort();

          if (JSON.stringify(currentFriendshipIds) !== JSON.stringify(prevIds)) {
            lastFriendshipIds = currentFriendshipIds;
            send("friends_update", { friendships: allFriendships });
          }

          // 3. Check friend online status changes
          const acceptedFriendships = allFriendships.filter((f) => f.status === "accepted");

          const currentStatuses: Record<string, string> = {};
          for (const f of acceptedFriendships) {
            const other = f.userId === userId ? f.friend : f.user;
            currentStatuses[other.id] = other.status;
          }

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

          // 5. Check incoming calls
          const incomingCall = await prisma.call.findFirst({
            where: {
              receiverId: userId,
              status: "ringing",
            },
            include: {
              caller: { select: { id: true, username: true, avatar: true } },
            },
            orderBy: { createdAt: "desc" },
          });

          if (incomingCall && incomingCall.id !== lastCallId) {
            lastCallId = incomingCall.id;
            send("incoming_call", {
              callId: incomingCall.id,
              roomId: incomingCall.roomId,
              type: incomingCall.type,
              caller: incomingCall.caller,
            });
          }

          if (!incomingCall && lastCallId) {
            lastCallId = null;
            send("call_ended", {});
          }

        } catch (error) {
          console.error("SSE poll error:", error);
        }
      };

      await poll();
      const pollInterval = setInterval(poll, 2000);

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