# DEPLOY CHECKLIST

## Build

- Run `npm run build`
- Confirm no TypeScript errors
- Confirm no App Router build regressions

## Auth Tests

- Login test
- Logout test
- Refresh session test
- Member page access test

## Membership Tests

- Membership plan display test
- Paid user shows correct plan badge
- Free user shows Free only when no membership exists
- Protected paid content access test

## Header Tests

- Desktop header auth state test
- Mobile header auth state test
- Logout button visibility test
- Member badge visibility test

## Language Tests

- JP language switch test
- KR language switch test
- EN language switch test
- Confirm auth state does not reset after language switch

## Platform Logs

- Vercel logs check
- Stripe webhook log check
- Supabase auth-related error check
- Membership fetch error check

## Final Sanity

- Success page still works
- Stripe checkout still works
- Dashboard still works
- No broken mobile buttons
- No mixed-language regressions in auth/member surfaces
