import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const statuses = ["Applied", "Waitlist", "Accepted", "Rejected", "Paid", "Active"];

const updateSchema = z.object({
  status: z.enum(["Applied", "Waitlist", "Accepted", "Rejected", "Paid", "Active"]).optional(),
  score: z.number().optional(),
  adminNotes: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    const { status, score, adminNotes } = parsed.data;

    if (status === "Accepted" || status === "Paid" || status === "Active") {
      const paidOrActive = await prisma.applicant.count({
        where: {
          status: { in: ["Paid", "Active"] },
          id: { not: id },
        },
      });
      const cohort = await prisma.cohort.findFirst({
        where: { name: "Current Cohort" },
      });
      const maxSeats = cohort?.maxSeats ?? 20;
      if (paidOrActive >= maxSeats) {
        return NextResponse.json(
          { error: `Cohort is full (${maxSeats}/${maxSeats})` },
          { status: 400 }
        );
      }
    }

    const applicant = await prisma.applicant.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(score !== undefined && { score }),
        ...(adminNotes !== undefined && { adminNotes }),
      },
    });
    return NextResponse.json(applicant);
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
