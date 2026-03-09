import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const currentUserId = searchParams.get("userId");

    if (!query && !currentUserId) {
      return NextResponse.json({ users: [] });
    }

    // If query is empty but userId is provided, return all users (for friend lookup)
    const whereClause: Record<string, unknown> = {};

    if (currentUserId) {
      whereClause.id = { not: currentUserId };
    }

    if (query.length >= 2) {
      whereClause.OR = [
        { username: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ];
    } else if (!query) {
      // No search query — return empty unless looking up specific users
      return NextResponse.json({ users: [] });
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        avatar: true,
        status: true,
      },
      take: 20,
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ users: [] });
  }
}