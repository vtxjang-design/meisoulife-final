import { buildBasicGardenCompletionPatch, matchBasicGardenProfile, type BasicGardenProfileRow } from "./basic-garden-progress";
import { normalizeLookupEmail } from "./membership";

type SupabaseMutationResult<T> = Promise<{
  data: T | null;
  error: { message: string } | null;
}>;

type BasicGardenUsersQuery = {
  select: (columns: string) => {
    eq: (column: string, value: unknown) => {
      maybeSingle: () => Promise<{
        data: BasicGardenProfileRow | null;
        error: { message: string } | null;
      }>;
    };
  };
  update: (values: Record<string, unknown>) => {
    eq: (column: string, value: unknown) => {
      select: (columns: string) => {
        maybeSingle: () => Promise<{
          data: BasicGardenProfileRow | null;
          error: { message: string } | null;
        }>;
      };
    };
  };
  upsert: (
    values: Record<string, unknown>,
    options: { onConflict: string }
  ) => {
    select: (columns: string) => {
      maybeSingle: () => Promise<{
        data: BasicGardenProfileRow | null;
        error: { message: string } | null;
      }>;
    };
  };
};

export type BasicGardenSyncClient = {
  from: (table: "users") => BasicGardenUsersQuery;
};

export type BasicGardenSyncResult = {
  ok: boolean;
  matchedBy: "auth_user_id" | "email" | "none";
  writeAction: "update" | "insert";
  profileFound: boolean;
  profileId: string | null;
  stats: {
    challengeDay: number;
    checkInCount: number;
  };
  errorMessage: string | null;
};

const PROFILE_COLUMNS = "id, auth_user_id, email, challenge_day, check_in_count";

async function getProfileByAuthUserId(client: BasicGardenSyncClient, authUserId: string) {
  return client.from("users").select(PROFILE_COLUMNS).eq("auth_user_id", authUserId).maybeSingle();
}

async function getProfileByEmail(client: BasicGardenSyncClient, email: string) {
  return client.from("users").select(PROFILE_COLUMNS).eq("email", email).maybeSingle();
}

export async function syncBasicGardenCompletion(params: {
  client: BasicGardenSyncClient;
  authUserId: string;
  email: string;
}): Promise<BasicGardenSyncResult> {
  const normalizedEmail = normalizeLookupEmail(params.email);

  if (!normalizedEmail) {
    return {
      ok: false,
      matchedBy: "none",
      writeAction: "insert",
      profileFound: false,
      profileId: null,
      stats: {
        challengeDay: 1,
        checkInCount: 0
      },
      errorMessage: "Normalized email is unavailable"
    };
  }

  const authProfileResult = await getProfileByAuthUserId(params.client, params.authUserId);

  if (authProfileResult.error) {
    return {
      ok: false,
      matchedBy: "none",
      writeAction: "insert",
      profileFound: false,
      profileId: null,
      stats: {
        challengeDay: 1,
        checkInCount: 0
      },
      errorMessage: authProfileResult.error.message
    };
  }

  let profiles: BasicGardenProfileRow[] = authProfileResult.data ? [authProfileResult.data] : [];

  if (!authProfileResult.data) {
    const emailProfileResult = await getProfileByEmail(params.client, normalizedEmail);

    if (emailProfileResult.error) {
      return {
        ok: false,
        matchedBy: "none",
        writeAction: "insert",
        profileFound: false,
        profileId: null,
        stats: {
          challengeDay: 1,
          checkInCount: 0
        },
        errorMessage: emailProfileResult.error.message
      };
    }

    if (emailProfileResult.data) {
      profiles = [emailProfileResult.data];
    }
  }

  const { profile, matchedBy } = matchBasicGardenProfile(profiles, params.authUserId, normalizedEmail);
  const patch = buildBasicGardenCompletionPatch(profile);

  if (profile?.id) {
    const updateResult = await params.client
      .from("users")
      .update({
        ...patch,
        auth_user_id: params.authUserId
      })
      .eq("id", profile.id)
      .select(PROFILE_COLUMNS)
      .maybeSingle();

    if (updateResult.error || !updateResult.data) {
      return {
        ok: false,
        matchedBy,
        writeAction: "update",
        profileFound: true,
        profileId: profile.id,
        stats: {
          challengeDay: patch.challenge_day,
          checkInCount: patch.check_in_count
        },
        errorMessage: updateResult.error?.message ?? "Garden update returned no data"
      };
    }

    return {
      ok: true,
      matchedBy,
      writeAction: "update",
      profileFound: true,
      profileId: updateResult.data.id ?? profile.id,
      stats: {
        challengeDay: typeof updateResult.data.challenge_day === "number" ? updateResult.data.challenge_day : patch.challenge_day,
        checkInCount: typeof updateResult.data.check_in_count === "number" ? updateResult.data.check_in_count : patch.check_in_count
      },
      errorMessage: null
    };
  }

  const insertResult = await params.client
    .from("users")
    .upsert(
      {
        auth_user_id: params.authUserId,
        email: normalizedEmail,
        current_plan: "basic",
        role: "basic",
        ...patch
      },
      {
        onConflict: matchedBy === "email" ? "email" : "auth_user_id"
      }
    )
    .select(PROFILE_COLUMNS)
    .maybeSingle();

  if (insertResult.error || !insertResult.data) {
    return {
      ok: false,
      matchedBy,
      writeAction: "insert",
      profileFound: false,
      profileId: null,
      stats: {
        challengeDay: patch.challenge_day,
        checkInCount: patch.check_in_count
      },
      errorMessage: insertResult.error?.message ?? "Garden insert returned no data"
    };
  }

  return {
    ok: true,
    matchedBy,
    writeAction: "insert",
    profileFound: false,
    profileId: insertResult.data.id ?? null,
    stats: {
      challengeDay: typeof insertResult.data.challenge_day === "number" ? insertResult.data.challenge_day : patch.challenge_day,
      checkInCount: typeof insertResult.data.check_in_count === "number" ? insertResult.data.check_in_count : patch.check_in_count
    },
    errorMessage: null
  };
}
