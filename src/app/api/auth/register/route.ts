import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existing) {
      return NextResponse.json({
        error: existing.email === email ? "Email already taken" : "Username already taken",
      }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: { username, email, password, status: "online" },
    });

    const response = NextResponse.json({
      user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar },
    }, { status: 201 });

    response.cookies.set("session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("POST /api/auth/register error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}