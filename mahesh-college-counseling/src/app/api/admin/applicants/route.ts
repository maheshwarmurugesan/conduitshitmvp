import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const applicants = await prisma.applicant.findMany({
    orderBy: { createdAt: "desc" },
    include: { cohort: true },
  });
  const cohort = await prisma.cohort.findFirst({
    where: { name: "Current Cohort" },
    include: { applicants: true },
  });
  const paidOrActive = applicants.filter(
    (a) => a.status === "Paid" || a.status === "Active"
  ).length;
  const maxSeats = cohort?.maxSeats ?? 20;
  return NextResponse.json({
    applicants,
    cohortFilled: `${paidOrActive}/${maxSeats}`,
    maxSeats,
  });
}
