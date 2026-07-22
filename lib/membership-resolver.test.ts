import assert from "node:assert/strict";
import test from "node:test";
import { hasProtectedMembershipAccess } from "./membership-access.ts";
import { resolveMembershipEntitlement } from "./membership-resolver.ts";

type TableRows = Record<string, Record<string, unknown>[]>;

class MockQuery {
  private readonly rows: Record<string, unknown>[];
  private filters: Array<(row: Record<string, unknown>) => boolean> = [];
  private orderKey: string | null = null;
  private ascending = true;
  private limitCount: number | null = null;

  constructor(rows: Record<string, unknown>[]) {
    this.rows = rows;
  }

  select() {
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push((row) => row[column] === value);
    return this;
  }

  in(column: string, values: unknown[]) {
    this.filters.push((row) => values.includes(row[column]));
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderKey = column;
    this.ascending = options?.ascending !== false;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  private execute() {
    let result = [...this.rows].filter((row) => this.filters.every((filter) => filter(row)));

    if (this.orderKey) {
      const key = this.orderKey;
      const ascending = this.ascending;
      result.sort((left, right) => {
        const leftValue = left[key];
        const rightValue = right[key];

        if (leftValue === rightValue) {
          return 0;
        }

        if (leftValue == null) {
          return ascending ? -1 : 1;
        }

        if (rightValue == null) {
          return ascending ? 1 : -1;
        }

        return ascending
          ? String(leftValue).localeCompare(String(rightValue))
          : String(rightValue).localeCompare(String(leftValue));
      });
    }

    if (typeof this.limitCount === "number") {
      result = result.slice(0, this.limitCount);
    }

    return result;
  }

  async maybeSingle() {
    const result = this.execute();
    return {
      data: result[0] ?? null,
      error: null
    };
  }

  then(resolve: (value: { data: Record<string, unknown>[]; error: null }) => unknown) {
    return Promise.resolve(resolve({ data: this.execute(), error: null }));
  }
}

function createSupabase(rows: TableRows) {
  return {
    from(table: string) {
      return new MockQuery((rows[table] ?? []) as Record<string, unknown>[]);
    }
  };
}

function createSubscription(params: {
  id: string;
  customerId: string;
  plan: "basic" | "growth" | "inner_circle";
  status: "active" | "trialing" | "canceled";
  priceId?: string;
}) {
  const priceId =
    params.priceId ??
    (params.plan === "basic"
      ? "price_basic"
      : params.plan === "growth"
        ? "price_growth"
        : "price_inner");

  return {
    id: params.id,
    customer: params.customerId,
    status: params.status,
    metadata: {
      plan: params.plan
    },
    billing_cycle_anchor: 1_720_000_000,
    items: {
      data: [
        {
          current_period_start: 1_720_000_000,
          current_period_end: 1_722_592_000,
          price: {
            id: priceId
          }
        }
      ]
    }
  };
}

function createStripe(customers: Array<{ id: string; email: string }>, subscriptions: Record<string, unknown[]>) {
  return {
    customers: {
      async list({ email }: { email?: string | null }) {
        return {
          data: customers.filter((customer) => customer.email === email)
        };
      }
    },
    subscriptions: {
      async list({ customer }: { customer: string }) {
        return {
          data: (subscriptions[customer] ?? []) as unknown[]
        };
      }
    }
  };
}

test("existing authenticated customer with stored active subscription resolves paid_basic", async () => {
  const supabase = createSupabase({
    users: [{ id: "profile_1", auth_user_id: "auth_1", email: "member@example.com", current_plan: "basic" }],
    memberships: [
      {
        id: "membership_1",
        user_id: "auth_1",
        email: "member@example.com",
        plan: "basic",
        status: "active",
        stripe_customer_id: "cus_1",
        stripe_subscription_id: "sub_1",
        current_period_end: "2026-08-01T00:00:00.000Z",
        created_at: "2026-07-01T00:00:00.000Z"
      }
    ],
    subscriptions: []
  });

  const result = await resolveMembershipEntitlement({
    supabase,
    userId: "auth_1",
    email: "member@example.com",
    stripe: null
  });

  assert.equal(result.plan, "basic");
  assert.equal(result.membershipStatus, "active");
  assert.equal(result.hasActiveSubscription, true);
  assert.equal(
    hasProtectedMembershipAccess({
      plan: result.plan,
      membershipStatus: result.membershipStatus,
      requiredPlan: "basic"
    }),
    true
  );
});

test("existing authenticated customer with missing local mapping reconciles from one verified Stripe customer", async () => {
  process.env.STRIPE_PRICE_ID_BASIC = "price_basic";

  const supabase = createSupabase({
    users: [{ id: "profile_1", auth_user_id: "auth_1", email: "member@example.com", current_plan: "free" }],
    memberships: [],
    subscriptions: []
  });
  const stripe = createStripe(
    [{ id: "cus_1", email: "member@example.com" }],
    {
      cus_1: [createSubscription({ id: "sub_1", customerId: "cus_1", plan: "basic", status: "active" })]
    }
  );

  const result = await resolveMembershipEntitlement({
    supabase,
    userId: "auth_1",
    email: "member@example.com",
    stripe: stripe as never
  });

  assert.equal(result.plan, "basic");
  assert.equal(result.membershipStatus, "active");
  assert.equal(result.hasActiveSubscription, true);
});

test("no Stripe email match returns non-paid result", async () => {
  const supabase = createSupabase({
    users: [{ id: "profile_1", auth_user_id: "auth_1", email: "member@example.com", current_plan: "free" }],
    memberships: [],
    subscriptions: []
  });
  const stripe = createStripe([], {});

  const result = await resolveMembershipEntitlement({
    supabase,
    userId: "auth_1",
    email: "member@example.com",
    stripe: stripe as never
  });

  assert.equal(result.hasActiveSubscription, false);
  assert.equal(result.plan, "free");
});

test("multiple ambiguous Stripe matches do not grant automatic access", async () => {
  process.env.STRIPE_PRICE_ID_BASIC = "price_basic";

  const supabase = createSupabase({
    users: [{ id: "profile_1", auth_user_id: "auth_1", email: "member@example.com", current_plan: "free" }],
    memberships: [],
    subscriptions: []
  });
  const stripe = createStripe(
    [
      { id: "cus_1", email: "member@example.com" },
      { id: "cus_2", email: "member@example.com" }
    ],
    {
      cus_1: [createSubscription({ id: "sub_1", customerId: "cus_1", plan: "basic", status: "active" })],
      cus_2: [createSubscription({ id: "sub_2", customerId: "cus_2", plan: "basic", status: "active" })]
    }
  );

  const result = await resolveMembershipEntitlement({
    supabase,
    userId: "auth_1",
    email: "member@example.com",
    stripe: stripe as never
  });

  assert.equal(result.hasActiveSubscription, false);
  assert.equal(result.resolved, false);
  assert.match(result.errorMessage ?? "", /Multiple active Stripe customers/);
});

test("missing Stripe reconciliation service returns unresolved error instead of false free", async () => {
  const supabase = createSupabase({
    users: [{ id: "profile_1", auth_user_id: "auth_1", email: "member@example.com", current_plan: "free" }],
    memberships: [],
    subscriptions: []
  });

  const result = await resolveMembershipEntitlement({
    supabase,
    userId: "auth_1",
    email: "member@example.com",
    stripe: null
  });

  assert.equal(result.hasActiveSubscription, false);
  assert.equal(result.resolved, false);
  assert.equal(result.errorMessage, "Stripe reconciliation is unavailable");
});
