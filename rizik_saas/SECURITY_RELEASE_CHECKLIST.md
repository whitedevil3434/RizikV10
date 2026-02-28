# Security Release Checklist (Rizik SaaS)

## Identity and Access
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is server-only and never exposed to client bundle.
- [ ] `/admin` and `/portal` are role-gated server-side.
- [ ] Unauthorized control-plane requests redirect safely.
- [ ] Default signup role remains `CUSTOMER`.
- [ ] Privileged role changes are restricted to admin flows only.

## Secrets and Configuration
- [ ] Production secrets are injected via environment, not committed in code.
- [ ] `NEXT_PUBLIC_*` variables contain only safe public values.
- [ ] Firebase OAuth values are complete before enabling Google Sign-In.
- [ ] Key rotation dates are tracked and documented.

## API and Data Security
- [ ] RLS policies are active for all customer and business data tables.
- [ ] Sensitive endpoints are authenticated and authorization-checked.
- [ ] Input validation exists for auth, checkout, and admin mutation paths.
- [ ] Error responses avoid secret leakage.

## Web Security
- [ ] No internal-only copy, credentials, or operator names in public UI.
- [ ] Content security headers and secure cookie flags verified in deployment.
- [ ] CSRF and replay risk addressed for payment and account actions.
- [ ] Dependency audit reviewed and high vulnerabilities triaged before release.

## Operations and Monitoring
- [ ] Audit trail exists for admin actions and role changes.
- [ ] Alerting configured for auth failures, 5xx spikes, and unusual access patterns.
- [ ] Backup and restore procedure tested.
- [ ] Incident owner and escalation contacts documented.

## Final Go/No-Go
- [ ] CTO sign-off
- [ ] Product sign-off
- [ ] Security sign-off
- [ ] Rollback plan prepared
