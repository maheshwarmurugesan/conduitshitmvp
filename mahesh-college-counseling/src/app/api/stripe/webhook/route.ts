import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const sig = headersList.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (!webhookSecret || !sig || !stripeKey) {
      return NextResponse.json(
        { error: "Stripe webhook not configured" },
        { status: 400 }
      );
    }

    const stripe = new Stripe(stripeKey);
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const applicantId = session.metadata?.applicantId || session.client_reference_id;
      if (!applicantId) return NextResponse.json({ received: true });

      const applicant = await prisma.applicant.findUnique({
        where: { id: applicantId },
      });
      if (!applicant) return NextResponse.json({ received: true });

      // Create user account if not exists
      let user = await prisma.user.findUnique({
        where: { email: applicant.email },
      });
      if (!user) {
        const tempPassword = Math.random().toString(36).slice(-12);
        const hash = await bcrypt.hash(tempPassword, 12);
        user = await prisma.user.create({
          data: {
            email: applicant.email,
            passwordHash: hash,
            name: applicant.fullName,
            role: "client",
            applicantId: applicant.id,
          },
        });
        // TODO: Email user with temp password via Resend
      }

      await prisma.applicant.update({
        where: { id: applicantId },
        data: { status: "Paid" },
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: "Webhook failed" },
      { status: 500 }
    );
  }
}
