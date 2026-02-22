import { NextResponse } from "next/server";
import { addContactToPartiful } from "@/lib/partiful-automation";
import { checkRateLimit } from "@/lib/rate-limit";

const phoneSchema = { phone: (v: unknown) => typeof v === "string" && v.length > 0 && v.length <= 30 };

export async function POST(req: Request) {
  const rate = checkRateLimit(req, "export");
  if (!rate.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: rate.status });
  }
  try {
    const body = await req.json();
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
    if (!phoneSchema.phone(phone)) {
      return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
    }
    await addContactToPartiful(phone);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Partiful automation failed";
    console.error("Add to Partiful error:", msg);
    return NextResponse.json({ error: "Partiful add failed" }, { status: 500 });
  }
}
