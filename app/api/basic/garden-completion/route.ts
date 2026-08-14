import { NextResponse } from "next/server";
import { isEligibleBasicGardenGateKey } from "@/lib/basic-garden";
import {
  BASIC_GARDEN_MAINTENANCE_ERROR,
  BASIC_GARDEN_MAINTENANCE_MESSAGE,
  getBasicGardenMaintenanceHeaders,
  isBasicGardenWritesPaused
} from "@/lib/basic-garden-maintenance";
import { hasBasicGardenEntitlement } from "@/lib/basic-garden-entitlement";
import { syncBasicGardenCompletion } from "@/lib/basic-garden-sync";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type GardenCompletionFailureCategory =
  | "service_unavailable"
  | "authentication"
  | "authorization"
  | "validation"
  | "rpc"
  | "response_contract";

function createRequestId() {
  return crypto.randomUUID();
}

function logGardenCompletionFailure(params: {
  requestId: string;
  category: GardenCompletionFailureCategory;
  status: number;
}) {
  console.warn("[api-basic-garden-completion] failure", {
    requestId: params.requestId,
    category: params.category,
    status: params.status
  });
}

function gardenCompletionError(params: {
  requestId: string;
  category: GardenCompletionFailureCategory;
  status: number;
  message: string;
}) {
  logGardenCompletionFailure(params);

  return NextResponse.json(
    {
      ok: false,
      error: params.category,
      errorMessage: params.message,
      requestId: params.requestId
    },
    { status: params.status }
  );
}

function resolveBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return {
      token: "",
      malformed: false
    };
  }

  if (!authorization.toLowerCase().startsWith("bearer ")) {
    return {
      token: "",
      malformed: true
    };
  }

  const token = authorization.slice(7).trim();

  return {
    token,
    malformed: token.length === 0
  };
}

export async function POST(request: Request) {
  const requestId = createRequestId();
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return gardenCompletionError({
      requestId,
      category: "service_unavailable",
      status: 503,
      message: "Garden sync service is unavailable"
    });
  }

  const {
    data: { user: cookieUser },
    error: userError
  } = await supabase.auth.getUser();
  let user = cookieUser;

  if (userError) {
    logGardenCompletionFailure({ requestId, category: "authentication", status: 401 });
  }

  const bearer = resolveBearerToken(request);

  if (!user && bearer.malformed) {
    return gardenCompletionError({
      requestId,
      category: "authentication",
      status: 401,
      message: "Authentication is required"
    });
  }

  if (!user && bearer.token) {
    const {
      data: { user: bearerUser },
      error: bearerUserError
    } = await supabase.auth.getUser(bearer.token);

    if (bearerUserError) {
      logGardenCompletionFailure({ requestId, category: "authentication", status: 401 });
    }

    if (bearerUser) {
      user = bearerUser;
    } else {
      return gardenCompletionError({
        requestId,
        category: "authentication",
        status: 401,
        message: "Authentication is required"
      });
    }
  }

  if (!user?.id) {
    return gardenCompletionError({
      requestId,
      category: "authentication",
      status: 401,
      message: "Authentication is required"
    });
  }

  const hasEntitlement = await hasBasicGardenEntitlement({
    client: supabase as never,
    authUserId: user.id
  });

  if (!hasEntitlement) {
    return gardenCompletionError({
      requestId,
      category: "authorization",
      status: 403,
      message: "Access to this Garden is unavailable"
    });
  }

  if (isBasicGardenWritesPaused()) {
    return NextResponse.json(
      {
        ok: false,
        error: BASIC_GARDEN_MAINTENANCE_ERROR,
        errorMessage: BASIC_GARDEN_MAINTENANCE_MESSAGE,
        requestId
      },
      {
        status: 503,
        headers: getBasicGardenMaintenanceHeaders()
      }
    );
  }

  const admin = getSupabaseAdminClient();

  if (!admin) {
    return gardenCompletionError({
      requestId,
      category: "service_unavailable",
      status: 503,
      message: "Garden sync service is unavailable"
    });
  }

  let gateKey: unknown = null;

  try {
    const body = (await request.json()) as { gateKey?: unknown };
    gateKey = body.gateKey ?? null;
  } catch {
    gateKey = null;
  }

  if (!isEligibleBasicGardenGateKey(gateKey)) {
    return gardenCompletionError({
      requestId,
      category: "validation",
      status: 400,
      message: "Eligible gate key is required"
    });
  }

  const result = await syncBasicGardenCompletion({
    client: admin as never,
    authUserId: user.id,
    gateKey
  });

  if (!result.ok) {
    const category = result.failureCategory === "response_contract" ? "response_contract" : "rpc";
    return gardenCompletionError({
      requestId,
      category,
      status: 500,
      message: "Garden completion could not be saved"
    });
  }

  return NextResponse.json({
    ok: true,
    matchedBy: result.matchedBy,
    writeAction: result.writeAction,
    checkInCount: result.stats.checkInCount,
    challengeDay: result.stats.challengeDay,
    cumulativeVisitDays: result.stats.cumulativeVisitDays,
    cumulativeRecoveryRecords: result.stats.cumulativeRecoveryRecords,
    completionRecorded: result.recordedCompletion,
    rewardGranted: result.rewardGranted,
    distinctGateCount: result.distinctGateCount,
    activityDate: result.activityDate
  });
}
