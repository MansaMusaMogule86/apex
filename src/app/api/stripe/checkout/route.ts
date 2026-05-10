import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

const Schema = z.object({
  priceId: z.string().min(4),
  customerEmail: z.string().email().optional(),
  mode: z.enum(["subscription", "payment"]).default("subscription"),
  successPath: z.string().startsWith("/").optional(),
  cancelPath: z.string().startsWith("/").optional(),
});

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const { priceId, customerEmail, mode, successPath, cancelPath } = parsed.data;
  const origin =
    req.headers.get("origin") ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  const successBase = successPath ?? "/dashboard";
  const successJoiner = successBase.includes("?") ? "&" : "?";
  const successUrl = `${origin}${successBase}${successJoiner}session_id={CHECKOUT_SESSION_ID}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: customerEmail,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      success_url: successUrl,
      cancel_url: `${origin}${cancelPath ?? "/pricing?checkout=cancelled"}`,
    });

    return NextResponse.json({ id: session.id, url: session.url });
   } catch (err) {
     const message = err instanceof Error ? err.message : "Checkout failed";
     return NextResponse.json({ error: message }, { status: 500 });
   }
 }
