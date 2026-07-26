import { type BasicGardenProfileRow } from "./basic-garden-progress";

type SupabaseQueryResult<T> = Promise<{
  data: T | null;
  error: { message: string } | null;
}>;

type BasicGardenProgressQuery = {
  select: (columns: string) => {
    eq: (column: string, value: unknown) => {
      maybeSingle: () => SupabaseQueryResult<BasicGardenProfileRow>;
    };
  };
};

type BasicGardenRpcRow = {
  auth_user_id: string;
  challenge_day: number;
  check_in_count: number;
  created_at: string;
  updated_at: string;
  was_created: boolean;
};

export type BasicGardenSyncClient = {
  from: (table: "basic_garden_progress") => BasicGardenProgressQuery;
  rpc: (
    fn: "upsert_basic_garden_progress",
    params: {
      p_auth_user_id: string;
      p_challenge_day: number;
    }
  ) => SupabaseQueryResult<BasicGardenRpcRow[] | BasicGardenRpcRow>;
};

export type BasicGardenSyncResult = {
  ok: boolean;
  matchedBy: "auth_user_id" | "none";
  writeAction: "update" | "insert";
  profileFound: boolean;
  profileId: string | null;
  stats: {
    challengeDay: number;
    checkInCount: number;
  };
  errorMessage: string | null;
};

const PROGRESS_COLUMNS = "auth_user_id, challenge_day, check_in_count";

export async function syncBasicGardenCompletion(params: {
  client: BasicGardenSyncClient;
  authUserId: string;
  email?: string;
}): Promise<BasicGardenSyncResult> {
  if (!params.authUserId) {
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
      errorMessage: "Authenticated user id is unavailable"
    };
  }

  const existingProgressResult = await params.client
    .from("basic_garden_progress")
    .select(PROGRESS_COLUMNS)
    .eq("auth_user_id", params.authUserId)
    .maybeSingle();

  if (existingProgressResult.error) {
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
      errorMessage: existingProgressResult.error.message
    };
  }

  const existingProgress = existingProgressResult.data;
  const rpcResult = await params.client.rpc("upsert_basic_garden_progress", {
    p_auth_user_id: params.authUserId,
    p_challenge_day: typeof existingProgress?.challenge_day === "number" ? existingProgress.challenge_day : 1
  });

  if (rpcResult.error) {
    return {
      ok: false,
      matchedBy: existingProgress ? "auth_user_id" : "none",
      writeAction: existingProgress ? "update" : "insert",
      profileFound: Boolean(existingProgress),
      profileId: existingProgress?.auth_user_id ?? null,
      stats: {
        challengeDay: typeof existingProgress?.challenge_day === "number" ? existingProgress.challenge_day : 1,
        checkInCount: typeof existingProgress?.check_in_count === "number" ? existingProgress.check_in_count : 0
      },
      errorMessage: rpcResult.error.message
    };
  }

  const rpcRow = Array.isArray(rpcResult.data) ? (rpcResult.data[0] ?? null) : rpcResult.data;

  if (!rpcRow) {
    return {
      ok: false,
      matchedBy: existingProgress ? "auth_user_id" : "none",
      writeAction: existingProgress ? "update" : "insert",
      profileFound: Boolean(existingProgress),
      profileId: null,
      stats: {
        challengeDay: typeof existingProgress?.challenge_day === "number" ? existingProgress.challenge_day : 1,
        checkInCount: typeof existingProgress?.check_in_count === "number" ? existingProgress.check_in_count : 0
      },
      errorMessage: "Garden progress update returned no data"
    };
  }

  return {
    ok: true,
    matchedBy: "auth_user_id",
    writeAction: rpcRow.was_created ? "insert" : "update",
    profileFound: !rpcRow.was_created,
    profileId: rpcRow.auth_user_id,
    stats: {
      challengeDay: rpcRow.challenge_day,
      checkInCount: rpcRow.check_in_count
    },
    errorMessage: null
  };
}
