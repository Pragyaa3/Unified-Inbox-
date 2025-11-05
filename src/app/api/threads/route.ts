import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const threads = await prisma.thread.findMany({
      include: {
        contact: true,
        messages: { 
          orderBy: { createdAt: 'desc' },
          take: 1 
        },
      },
      orderBy: { lastActivity: 'desc' },
    });

    return NextResponse.json({ data: threads });
  } catch (error) {
    console.error('[API] Get threads error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threads' },
      { status: 500 }
    );
  }
}