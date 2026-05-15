const Stripe = require("stripe");

const planConfig = {
  basic: {
    envKey: "STRIPE_PRICE_BASIC",
    name: "Basic"
  },
  care: {
    envKey: "STRIPE_PRICE_CARE",
    name: "Growth"
  },
  master: {
    envKey: "STRIPE_PRICE_MASTER",
    name: "Inner Circle"
  }
};

function getBaseUrl(req) {
  if (process.env.PUBLIC_SITE_URL) {
    return process.env.PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers.host;

  return protocol + "://" + host;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: "Missing STRIPE_SECRET_KEY" });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const plan = req.body && req.body.plan;
  const email = req.body && req.body.email;
  const config = planConfig[plan];

  if (!config) {
    return res.status(400).json({ error: "Unknown membership plan" });
  }

  const priceId = process.env[config.envKey];

  if (!priceId) {
    return res.status(500).json({ error: "Missing " + config.envKey });
  }

  const baseUrl = getBaseUrl(req);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email || undefined,
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      metadata: {
        plan: plan,
        site: "meisou-life"
      },
      subscription_data: {
        metadata: {
          plan: plan,
          site: "meisou-life"
        }
      },
      success_url: baseUrl + "/index.html?checkout=success&plan=" + encodeURIComponent(plan) + "#payment",
      cancel_url: baseUrl + "/index.html?checkout=canceled&plan=" + encodeURIComponent(plan) + "#payment"
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
