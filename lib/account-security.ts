import { getSiteUrl } from "@/lib/env";

export const ACCOUNT_SECURITY_PATH = "/account/security";
export const PASSWORD_UPDATE_PATH = "/auth/update-password";

/** Uses the configured official site URL, never the browser's current origin. */
export function buildOfficialPasswordChangeCallbackUrl() {
  const officialSiteUrl = getSiteUrl().replace(/\/$/, "");
  return `${officialSiteUrl}/auth/callback?next=${encodeURIComponent(PASSWORD_UPDATE_PATH)}`;
}
