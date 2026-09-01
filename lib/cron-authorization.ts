export type CronAuthorizationDecision =
  | {
      ok: true;
    }
  | {
      ok: false;
      status: 401 | 503;
      error: "Unauthorized" | "Cron service unavailable";
    };

export function resolveCronAuthorization(input: {
  configuredSecret: string | null | undefined;
  authorizationHeader: string | null;
}): CronAuthorizationDecision {
  const configuredSecret = input.configuredSecret?.trim();

  if (!configuredSecret) {
    return {
      ok: false,
      status: 503,
      error: "Cron service unavailable"
    };
  }

  if (input.authorizationHeader !== `Bearer ${configuredSecret}`) {
    return {
      ok: false,
      status: 401,
      error: "Unauthorized"
    };
  }

  return {
    ok: true
  };
}
