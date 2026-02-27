# Rizik V10 Route Smoke QA Signoff

Date: 2026-02-14
Scope: Major user-facing routes in `lib/routes.dart`
Method: Static + codepath QA audit (load, empty/error, recovery CTA, navigation return)

## Result
- Overall smoke QA: PASS
- Pass: 13/13 routes
- Partial: 0/13 routes

## Route Matrix
| Route | Screen | Load State | Empty/Error State | Recovery CTA | Status |
|---|---|---|---|---|---|
| `/splash` | SplashScreen | Present | N/A | Auto-route | PASS |
| `/auth` | LoginScreen | Present | Validation error inline | Submit after correction | PASS |
| `/auth/otp` | OtpScreen | Present | Pending-phone + OTP validation | Back to Login | PASS |
| `/seeker` | RizikScaffold (seeker) | Present | Fallback surfaces available | N/A | PASS |
| `/seeker/order/:id` | OrderDetailsScreen | Present | Not-found message | Back via app bar/system back | PASS |
| `/force` | RizikScaffold (force) | Present | Fallback surfaces available | N/A | PASS |
| `/force/gig/:id` | GigDetailsScreen | Present | Not-found panel | Retry + Go Back | PASS |
| `/source` | RizikScaffold (source) | Present | Fallback surfaces available | N/A | PASS |
| `/connect` | CallScreenRealtimeKit | Connecting UI present | Error text shown | Start Call retry | PASS |
| `/chat` | ChatScreen | Present | Message list fallback works | Call icon -> `/connect` | PASS |
| `/live-agent` | LiveAgentScreen | Initializing/connecting states | In-screen error card (mic/session) | Retry + Open Settings + Close/Back | PASS |
| `/squad/dashboard` | SquadDashboardScreen | Loading card present | Explicit error card | Retry button | PASS |
| `/inventory` | InventoryScreen | Present | Command failure response shown | Re-send command | PASS |
| `/alerts` | UnifiedAlertsScreen | Present | Priority/timeline empty states | Action CTAs + navigation | PASS |

## Closed Item
1. `/live-agent`
- Previous gap (resolved): missing in-screen retry/permission recovery for microphone-denied and connection failure.
- Fix now present: `Retry` button calls `_connect()`, mic-denied state shows `Open Settings`, input/send is disabled until recovery.

## Signoff Notes
1. Core navigation recovery paths are in place for authentication, gig, squad, and alerts.
2. Dynamic shell (`/seeker`, `/force`, `/source`) has fallback bundles, reducing blank-state risk.
3. Alerts center now supports operational workflow (ack, snooze, assign) and timeline persistence.

## Release Gate Recommendation
- Ready for internal beta QA.
- Before production rollout, run manual device smoke on Android+iOS for call/voice permission and reconnect flows (`/connect`, `/live-agent`).
