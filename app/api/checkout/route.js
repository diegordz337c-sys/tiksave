import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'mxn',
        product_data: { name: 'TikSave Premium' },
        unit_amount: 9900,
        recurring: { interval: 'month' },
      },
      quantity: 1,
    }],
    mode: 'subscription',
    success_url: 'https://tiksave-theta.vercel.app/success',
    cancel_url: 'https://tiksave-theta.vercel.app',
  });

  return Response.json({ url: session.url });
}