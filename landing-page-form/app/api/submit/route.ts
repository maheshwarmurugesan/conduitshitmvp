import { NextResponse } from "next/server";
import { submitSchema } from "@/lib/validation";
import { appendRow } from "@/lib/google-sheets";
import { addContactToPartiful } from "@/lib/partiful-automation";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const rate = checkRateLimit(req, "submit");
  if (!rate.ok) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: rate.status });
  }
  try {
    const body = await req.json();
    const parsed = submitSchema.safeParse({
      ...body,
      isBuilding: body.isBuilding === "yes" ? "yes" : "no",
    });
    if (!parsed.success) {
      const msg = parsed.error.issues?.[0]?.message ?? "Invalid data";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    const data = parsed.data;

    const normalizedLinkedIn =
      data.linkedin.startsWith("http") ? data.linkedin : `https://${data.linkedin}`;

    await appendRow([
      data.firstName.trim(),
      data.lastName.trim(),
      normalizedLinkedIn,
      data.email.trim().toLowerCase(),
      data.phone.trim(),
      data.intro.trim(),
      data.isBuilding,
      data.whatBuilding?.trim() ?? "",
      new Date().toISOString(),
    ]);

    if (process.env.PARTIFUL_EMAIL && process.env.PARTIFUL_PASSWORD && process.env.PARTIFUL_EVENT_ID) {
      addContactToPartiful(data.phone.trim()).catch((err) => {
        console.error("Partiful automation failed (non-blocking):", err instanceof Error ? err.message : err);
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Submit error:", msg);
    // Show real error so you can fix it - remove this block and use generic message once fixed
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
