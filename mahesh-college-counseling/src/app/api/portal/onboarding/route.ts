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
    return NextResponse.json({
      uploadedEssay: false,
      uploadedResume: false,
      bookedCall: false,
    });
  }

  const files = await prisma.clientFile.findMany({
    where: { applicantId },
  });

  return NextResponse.json({
    uploadedEssay: files.some((f) => f.type === "essay"),
    uploadedResume: files.some((f) => f.type === "resume"),
    bookedCall: false, // TODO: integrate with Calendly or similar
  });
}
