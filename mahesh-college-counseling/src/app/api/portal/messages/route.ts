import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const applicantId = (session.user as { applicantId?: string }).applicantId;
  if (!applicantId) {
    return NextResponse.json({ error: "No applicant" }, { status: 403 });
  }
  const messages = await prisma.message.findMany({
    where: { applicantId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(messages);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const applicantId = (session.user as { applicantId?: string }).applicantId;
  if (!applicantId) {
    return NextResponse.json({ error: "No applicant" }, { status: 403 });
  }
  try {
    const { content } = await req.json();
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content required" },
        { status: 400 }
      );
    }
    const message = await prisma.message.create({
      data: {
        applicantId,
        content: content.trim(),
        fromAdmin: false,
      },
    });
    return NextResponse.json(message);
  } catch {
    return NextResponse.json(
      { error: "Failed to send" },
      { status: 500 }
    );
  }
}
