const Stripe = require("stripe");

function readRawBody(req) {
  return new Promise(function (resolve, reject) {
    const chunks = [];

    req.on("data", function (chunk) {
      chunks.push(Buffer.from(chunk));
    });

    req.on("end", function () {
      resolve(Buffer.concat(chunks));
    });

    req.on("error", reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).json({ error: "Missing Stripe webhook environment variables" });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const signature = req.headers["stripe-signature"];
  let event;

  try {
    const rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return res.status(400).json({ error: "Webhook signature verification failed" });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("Paid membership completed:", {
      customer: session.customer,
      email: session.customer_details && session.customer_details.email,
      plan: session.metadata && session.metadata.plan
    });
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    console.log("Membership canceled:", {
      customer: subscription.customer,
      plan: subscription.metadata && subscription.metadata.plan
    });
  }

  return res.status(200).json({ received: true });
};

module.exports.config = {
  api: {
    bodyParser: false
  }
};
