import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { applicantId } = await req.json();
    if (!applicantId) {
      return NextResponse.json(
        { error: "Applicant ID required" },
        { status: 400 }
      );
    }

    const applicant = await prisma.applicant.findUnique({
      where: { id: applicantId },
    });
    if (!applicant || applicant.status !== "Accepted") {
      return NextResponse.json(
        { error: "Invalid or not accepted applicant" },
        { status: 400 }
      );
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeKey);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Mahesh College Counseling - 1:1 Mentorship",
              description: "1:1 college mentorship for essays, strategy, and planning",
              images: [],
            },
            unit_amount: 100000, // $1000 in cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/pay/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/pay`,
      client_reference_id: applicantId,
      customer_email: applicant.email,
      metadata: {
        applicantId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
