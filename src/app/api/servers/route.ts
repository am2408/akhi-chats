import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const servers = await prisma.server.findMany({
      include: { channels: true },
    });
    return NextResponse.json({ servers });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ servers: [] });
  }
}

export async function POST(req: Request) {
  try {
    const { name, userId } = await req.json();
    const server = await prisma.server.create({
      data: {
        name,
        ownerId: userId,
        channels: { create: { name: "general", type: "text" } },
        members: { create: { userId, role: "owner" } },
      },
    });
    return NextResponse.json({ server }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create server" }, { status: 500 });
  }
}