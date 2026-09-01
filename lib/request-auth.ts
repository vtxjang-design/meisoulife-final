export type RequestAuthUser = {
  id: string;
  email?: string | null;
};

type AuthLookupError = {
  message?: string;
} | null;

export type RequestAuthClient = {
  auth: {
    getUser: (accessToken?: string) => Promise<{
      data: {
        user: RequestAuthUser | null;
      };
      error: AuthLookupError;
    }>;
  };
  from: (table: string) => any;
};

export type RequestAuthResolution =
  | {
      status: "authenticated";
      source: "cookie" | "bearer";
      user: RequestAuthUser;
      rlsClient: RequestAuthClient;
    }
  | {
      status: "anonymous";
    }
  | {
      status: "invalid";
    }
  | {
      status: "unavailable";
    };

type BearerCredential =
  | { status: "missing" }
  | { status: "malformed" }
  | { status: "present"; token: string };

function resolveBearerCredential(authorizationHeader: string | null): BearerCredential {
  if (authorizationHeader === null) {
    return { status: "missing" };
  }

  if (!authorizationHeader.toLowerCase().startsWith("bearer ")) {
    return { status: "malformed" };
  }

  const token = authorizationHeader.slice(7).trim();

  return token ? { status: "present", token } : { status: "malformed" };
}

/**
 * Resolves the authenticated request identity together with the exact client
 * that carries that identity into Supabase RLS reads.
 *
 * Cookie identity is canonical when a valid cookie session exists. A bearer
 * credential is considered only when there is no valid cookie user, which
 * prevents one request from authenticating as one user and querying as another.
 */
export async function resolveRequestAuthContext(params: {
  cookieClient: RequestAuthClient;
  authorizationHeader: string | null;
  createBearerClient: (accessToken: string) => RequestAuthClient | null;
}): Promise<RequestAuthResolution> {
  let cookieUser: RequestAuthUser | null = null;

  try {
    const cookieLookup = await params.cookieClient.auth.getUser();
    cookieUser = cookieLookup.error ? null : cookieLookup.data.user;
  } catch {
    cookieUser = null;
  }

  if (cookieUser) {
    return {
      status: "authenticated",
      source: "cookie",
      user: cookieUser,
      rlsClient: params.cookieClient
    };
  }

  const bearer = resolveBearerCredential(params.authorizationHeader);

  if (bearer.status === "missing") {
    return { status: "anonymous" };
  }

  if (bearer.status === "malformed") {
    return { status: "invalid" };
  }

  let bearerUser: RequestAuthUser | null = null;

  try {
    const bearerLookup = await params.cookieClient.auth.getUser(bearer.token);
    bearerUser = bearerLookup.error ? null : bearerLookup.data.user;
  } catch {
    bearerUser = null;
  }

  if (!bearerUser) {
    return { status: "invalid" };
  }

  let bearerClient: RequestAuthClient | null = null;

  try {
    bearerClient = params.createBearerClient(bearer.token);
  } catch {
    bearerClient = null;
  }

  if (!bearerClient) {
    return { status: "unavailable" };
  }

  return {
    status: "authenticated",
    source: "bearer",
    user: bearerUser,
    rlsClient: bearerClient
  };
}
