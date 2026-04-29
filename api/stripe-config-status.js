module.exports = async function handler(req, res) {
  return res.status(200).json({
    secretKey: Boolean(process.env.STRIPE_SECRET_KEY),
    basic: Boolean(process.env.STRIPE_PRICE_BASIC),
    care: Boolean(process.env.STRIPE_PRICE_CARE),
    master: Boolean(process.env.STRIPE_PRICE_MASTER),
    publicSiteUrl: Boolean(process.env.PUBLIC_SITE_URL)
  });
};
