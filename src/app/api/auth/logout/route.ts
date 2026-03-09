import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (sessionToken) {
      await prisma.user.update({
        where: { id: sessionToken },
        data: { status: "offline" },
      }).catch(() => {});
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete("session");
    return response;
  } catch {
    const response = NextResponse.json({ success: true });
    response.cookies.delete("session");
    return response;
  }
}