import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const threads = await prisma.thread.findMany({
    include: {
      contact: true,
      messages: { orderBy: { sentAt: "desc" } },
    },
    orderBy: { lastActivity: "desc" },
  });

  return NextResponse.json({ data: threads }); // ✅ consistent structure
}
