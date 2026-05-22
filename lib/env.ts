export function getRequiredEnv(name: string) {
  return process.env[name];
}

export function hasSupabaseEnv() {
  return Boolean(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) &&
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)
  );
}

export function hasStripeEnv() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function hasOpenAiEnv() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://www.meisoulife.com";
}
