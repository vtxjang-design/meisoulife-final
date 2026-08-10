import type { BasicGardenEligibleGateKey } from "./basic-garden";

export type BasicGardenSyncFailureCategory = "missing_auth" | "rpc" | "response_contract";

type SupabaseQueryResult<T> = Promise<{
  data: T | null;
  error: { message: string } | null;
}>;

type BasicGardenVisitRpcRow = {
  auth_user_id: string;
  visit_date: string;
  challenge_day: number;
  check_in_count: number;
  visit_recorded: boolean;
  cumulative_visit_days: number;
  cumulative_recovery_records: number;
};

type BasicGardenCompletionRpcRow = {
  auth_user_id: string;
  activity_date: string;
  gate_key: BasicGardenEligibleGateKey;
  challenge_day: number;
  check_in_count: number;
  completion_recorded: boolean;
  reward_granted: boolean;
  distinct_gate_count: number;
  cumulative_visit_days: number;
  cumulative_recovery_records: number;
};

export type BasicGardenSyncClient = {
  rpc(
    fn: "record_basic_garden_visit",
    params: {
      p_auth_user_id: string;
    }
  ): SupabaseQueryResult<BasicGardenVisitRpcRow[] | BasicGardenVisitRpcRow>;
  rpc(
    fn: "record_basic_garden_completion",
    params: {
      p_auth_user_id: string;
      p_gate_key: BasicGardenEligibleGateKey;
    }
  ): SupabaseQueryResult<BasicGardenCompletionRpcRow[] | BasicGardenCompletionRpcRow>;
};

export type BasicGardenSyncResult = {
  ok: boolean;
  matchedBy: "auth_user_id" | "none";
  writeAction: "none" | "visit" | "completion";
  activityDate: string;
  stats: {
    /** Compatibility alias for cumulativeVisitDays. */
    challengeDay: number;
    /** Compatibility alias for cumulativeRecoveryRecords. */
    checkInCount: number;
    cumulativeVisitDays: number;
    cumulativeRecoveryRecords: number;
  };
  recordedVisit: boolean;
  recordedCompletion: boolean;
  rewardGranted: boolean;
  distinctGateCount: number;
  failureCategory: BasicGardenSyncFailureCategory | null;
  errorMessage: string | null;
};

function getFallbackStats() {
  return {
    challengeDay: 0,
    checkInCount: 0,
    cumulativeVisitDays: 0,
    cumulativeRecoveryRecords: 0
  };
}

function readRpcRow<T>(data: T[] | T | null) {
  return Array.isArray(data) ? (data[0] ?? null) : data;
}

function isValidActivityDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidCount(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function isVisitRpcRow(value: unknown): value is BasicGardenVisitRpcRow {
  if (!value || typeof value !== "object") return false;

  const row = value as Partial<BasicGardenVisitRpcRow>;
  return (
    typeof row.auth_user_id === "string" &&
    isValidActivityDate(row.visit_date) &&
    isValidCount(row.challenge_day) &&
    isValidCount(row.check_in_count) &&
    isValidCount(row.cumulative_visit_days) &&
    isValidCount(row.cumulative_recovery_records) &&
    typeof row.visit_recorded === "boolean"
  );
}

function isCompletionRpcRow(value: unknown): value is BasicGardenCompletionRpcRow {
  if (!value || typeof value !== "object") return false;

  const row = value as Partial<BasicGardenCompletionRpcRow>;
  return (
    typeof row.auth_user_id === "string" &&
    isValidActivityDate(row.activity_date) &&
    typeof row.gate_key === "string" &&
    isValidCount(row.challenge_day) &&
    isValidCount(row.check_in_count) &&
    isValidCount(row.cumulative_visit_days) &&
    isValidCount(row.cumulative_recovery_records) &&
    typeof row.completion_recorded === "boolean" &&
    typeof row.reward_granted === "boolean" &&
    isValidCount(row.distinct_gate_count)
  );
}

export async function syncBasicGardenVisit(params: {
  client: BasicGardenSyncClient;
  authUserId: string;
}): Promise<BasicGardenSyncResult> {
  if (!params.authUserId) {
    return {
      ok: false,
      matchedBy: "none",
      writeAction: "none",
      activityDate: "",
      stats: getFallbackStats(),
      recordedVisit: false,
      recordedCompletion: false,
      rewardGranted: false,
      distinctGateCount: 0,
      failureCategory: "missing_auth",
      errorMessage: "Authenticated user id is unavailable"
    };
  }

  const rpcResult = await params.client.rpc("record_basic_garden_visit", {
    p_auth_user_id: params.authUserId
  });

  if (rpcResult.error) {
    return {
      ok: false,
      matchedBy: "none",
      writeAction: "none",
      activityDate: "",
      stats: getFallbackStats(),
      recordedVisit: false,
      recordedCompletion: false,
      rewardGranted: false,
      distinctGateCount: 0,
      failureCategory: "rpc",
      errorMessage: rpcResult.error.message
    };
  }

  const rpcRow = readRpcRow(rpcResult.data);

  if (!isVisitRpcRow(rpcRow)) {
    return {
      ok: false,
      matchedBy: "none",
      writeAction: "none",
      activityDate: "",
      stats: getFallbackStats(),
      recordedVisit: false,
      recordedCompletion: false,
      rewardGranted: false,
      distinctGateCount: 0,
      failureCategory: "response_contract",
      errorMessage: "Garden visit update returned invalid data"
    };
  }

  return {
    ok: true,
    matchedBy: "auth_user_id",
    writeAction: "visit",
    activityDate: rpcRow.visit_date,
    stats: {
      challengeDay: rpcRow.challenge_day,
      checkInCount: rpcRow.check_in_count,
      cumulativeVisitDays: rpcRow.cumulative_visit_days,
      cumulativeRecoveryRecords: rpcRow.cumulative_recovery_records
    },
    recordedVisit: rpcRow.visit_recorded,
    recordedCompletion: false,
    rewardGranted: false,
    distinctGateCount: 0,
    failureCategory: null,
    errorMessage: null
  };
}

export async function syncBasicGardenCompletion(params: {
  client: BasicGardenSyncClient;
  authUserId: string;
  gateKey: BasicGardenEligibleGateKey;
}): Promise<BasicGardenSyncResult> {
  if (!params.authUserId) {
    return {
      ok: false,
      matchedBy: "none",
      writeAction: "none",
      activityDate: "",
      stats: getFallbackStats(),
      recordedVisit: false,
      recordedCompletion: false,
      rewardGranted: false,
      distinctGateCount: 0,
      failureCategory: "missing_auth",
      errorMessage: "Authenticated user id is unavailable"
    };
  }

  const rpcResult = await params.client.rpc("record_basic_garden_completion", {
    p_auth_user_id: params.authUserId,
    p_gate_key: params.gateKey
  });

  if (rpcResult.error) {
    return {
      ok: false,
      matchedBy: "none",
      writeAction: "none",
      activityDate: "",
      stats: getFallbackStats(),
      recordedVisit: false,
      recordedCompletion: false,
      rewardGranted: false,
      distinctGateCount: 0,
      failureCategory: "rpc",
      errorMessage: rpcResult.error.message
    };
  }

  const rpcRow = readRpcRow(rpcResult.data);

  if (!isCompletionRpcRow(rpcRow)) {
    return {
      ok: false,
      matchedBy: "none",
      writeAction: "none",
      activityDate: "",
      stats: getFallbackStats(),
      recordedVisit: false,
      recordedCompletion: false,
      rewardGranted: false,
      distinctGateCount: 0,
      failureCategory: "response_contract",
      errorMessage: "Garden completion update returned invalid data"
    };
  }

  return {
    ok: true,
    matchedBy: "auth_user_id",
    writeAction: "completion",
    activityDate: rpcRow.activity_date,
    stats: {
      challengeDay: rpcRow.challenge_day,
      checkInCount: rpcRow.check_in_count,
      cumulativeVisitDays: rpcRow.cumulative_visit_days,
      cumulativeRecoveryRecords: rpcRow.cumulative_recovery_records
    },
    recordedVisit: false,
    recordedCompletion: rpcRow.completion_recorded,
    rewardGranted: rpcRow.reward_granted,
    distinctGateCount: rpcRow.distinct_gate_count,
    failureCategory: null,
    errorMessage: null
  };
}
