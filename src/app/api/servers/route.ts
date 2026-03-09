import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ servers: [] });
    }

    const memberships = await prisma.serverMember.findMany({
      where: { userId },
      include: {
        server: { select: { id: true, name: true, icon: true } },
      },
    });

    const servers = memberships.map((m) => m.server);

    return NextResponse.json({ servers });
  } catch (error) {
    console.error("GET /api/servers error:", error);
    return NextResponse.json({ servers: [] });
  }
}

export async function POST(req: Request) {
  try {
    const { name, ownerId } = await req.json();

    if (!name || !ownerId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const server = await prisma.server.create({
      data: {
        name,
        ownerId,
        channels: {
          create: { name: "general", type: "text" },
        },
        members: {
          create: { userId: ownerId, role: "owner" },
        },
      },
    });

    return NextResponse.json({ server }, { status: 201 });
  } catch (error) {
    console.error("POST /api/servers error:", error);
    return NextResponse.json({ error: "Failed to create server" }, { status: 500 });
  }
}