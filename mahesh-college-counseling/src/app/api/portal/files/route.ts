import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const applicantId = (session.user as { applicantId?: string }).applicantId;
  if (!applicantId) {
    return NextResponse.json({ error: "No applicant" }, { status: 403 });
  }
  const files = await prisma.clientFile.findMany({
    where: { applicantId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(files);
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
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = (formData.get("type") as string) || "other";
    if (!file) {
      return NextResponse.json(
        { error: "No file" },
        { status: 400 }
      );
    }
    const ext = path.extname(file.name) || ".bin";
    const filename = `${randomUUID()}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const filepath = path.join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);
    const url = `/uploads/${filename}`;

    const clientFile = await prisma.clientFile.create({
      data: {
        applicantId,
        filename: file.name,
        url,
        type: type === "essay" || type === "resume" ? type : "other",
      },
    });
    return NextResponse.json(clientFile);
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
