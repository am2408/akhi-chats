import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serverId = searchParams.get("serverId");
    if (!serverId) return NextResponse.json({ error: "Missing serverId" }, { status: 400 });

    const channels = await prisma.channel.findMany({ where: { serverId } });
    return NextResponse.json({ channels });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ channels: [] });
  }
}

export async function POST(req: Request) {
  try {
    const { name, type, serverId } = await req.json();
    const channel = await prisma.channel.create({
      data: { name, type: type || "text", serverId },
    });
    return NextResponse.json({ channel }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create channel" }, { status: 500 });
  }
}