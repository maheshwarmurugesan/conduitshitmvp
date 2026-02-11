import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email required" },
        { status: 400 }
      );
    }

    const applicant = await prisma.applicant.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        status: "Accepted",
      },
    });

    if (!applicant) {
      return NextResponse.json({ applicantId: null });
    }

    return NextResponse.json({ applicantId: applicant.id });
  } catch {
    return NextResponse.json(
      { error: "Lookup failed" },
      { status: 500 }
    );
  }
}
