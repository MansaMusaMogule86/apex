import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-04-22.dahlia",
    typescript: true,
  });
} else {
  console.warn("[stripe] STRIPE_SECRET_KEY is not set — API routes will fail");
}

export { stripeInstance as stripe };
