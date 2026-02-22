import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const schema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  instagram: z.string().optional(),
  school: z.string().optional(),
  classYear: z.enum(["2027", "2028", "2029", "2030+"]),
  gpa: z.string().optional(),
  activities: z.string().min(1, "Activities are required"),
  whatMakesUnique: z.string().min(1, "Required"),
  whyMentorship: z.string().min(1, "Required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues?.[0]?.message || "Invalid data";
      return NextResponse.json(
        { error: msg },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const applicant = await prisma.applicant.create({
      data: {
        fullName: data.fullName,
        email: data.email.trim().toLowerCase(),
        instagram: data.instagram || null,
        school: data.school || null,
        classYear: data.classYear,
        gpa: data.gpa || null,
        activities: data.activities,
        whatMakesUnique: data.whatMakesUnique,
        whyMentorship: data.whyMentorship,
        status: "Applied",
      },
    });

    // Email spreadsheet to admin only (non-blocking; do not fail if email fails)
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;
    const adminEmail = process.env.ADMIN_EMAIL || "admin@maheshcollegecounseling.com";
    if (apiKey && fromEmail && adminEmail) {
      try {
        const resend = new Resend(apiKey);
      const csvHeaders = "Full Name,Email,Instagram,School,Class Year,GPA,Activities,What Makes Unique,Why Mentorship,Status,Submitted At";
      const csvRow = [
        `"${(data.fullName || "").replace(/"/g, '""')}"`,
        `"${(data.email || "").replace(/"/g, '""')}"`,
        `"${(data.instagram || "").replace(/"/g, '""')}"`,
        `"${(data.school || "").replace(/"/g, '""')}"`,
        `"${data.classYear}"`,
        `"${(data.gpa || "").replace(/"/g, '""')}"`,
        `"${(data.activities || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
        `"${(data.whatMakesUnique || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
        `"${(data.whyMentorship || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
        "Applied",
        new Date().toISOString(),
      ].join(",");
      const csv = `${csvHeaders}\n${csvRow}`;
      const csvBase64 = Buffer.from(csv, "utf-8").toString("base64");

      const html = `
        <h2>New Application</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px; font-family: sans-serif;">
          <tr style="background: #f3f4f6;"><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 600;">Full Name</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${(data.fullName || "").replace(/</g, "&lt;")}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 600;">Email</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${(data.email || "").replace(/</g, "&lt;")}</td></tr>
          <tr style="background: #f3f4f6;"><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 600;">Instagram</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${(data.instagram || "—").replace(/</g, "&lt;")}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 600;">School</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${(data.school || "—").replace(/</g, "&lt;")}</td></tr>
          <tr style="background: #f3f4f6;"><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 600;">Class Year</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${data.classYear}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 600;">GPA</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${(data.gpa || "—").replace(/</g, "&lt;")}</td></tr>
          <tr style="background: #f3f4f6;"><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 600;">Activities</td><td style="padding: 8px; border: 1px solid #e5e7eb; white-space: pre-wrap;">${(data.activities || "").replace(/</g, "&lt;").replace(/\n/g, "<br>")}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 600;">What Makes Unique</td><td style="padding: 8px; border: 1px solid #e5e7eb; white-space: pre-wrap;">${(data.whatMakesUnique || "").replace(/</g, "&lt;").replace(/\n/g, "<br>")}</td></tr>
          <tr style="background: #f3f4f6;"><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 600;">Why Mentorship</td><td style="padding: 8px; border: 1px solid #e5e7eb; white-space: pre-wrap;">${(data.whyMentorship || "").replace(/</g, "&lt;").replace(/\n/g, "<br>")}</td></tr>
        </table>
        <p style="margin-top: 16px; color: #6b7280; font-size: 12px;">CSV attachment included for spreadsheet import.</p>
      `;

        await resend.emails.send({
          from: fromEmail,
          to: adminEmail,
          subject: `New Application: ${data.fullName} (Class of ${data.classYear})`,
          html,
          attachments: [
            {
              filename: `application-${applicant.id}-${new Date().toISOString().slice(0, 10)}.csv`,
              content: csvBase64,
            },
          ],
        });
      } catch (emailErr) {
        console.error("Email send failed (application saved):", emailErr);
      }
    }

    return NextResponse.json({ id: applicant.id });
  } catch (err) {
    console.error("Application error:", err);
    const debugMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Failed to submit application", debug: debugMsg },
      { status: 500 }
    );
  }
}
