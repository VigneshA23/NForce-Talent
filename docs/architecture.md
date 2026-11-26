# Architecture and delivery baseline

## Product decisions

Four account roles: Admin, HR Administrator, Recruiter, Employee. Internal interviewer permissions come from an interview assignment. External client interviewers have no accounts. Current hosting is Sites/Workers with D1. Later target may be AWS hosting with RDS PostgreSQL or Neon PostgreSQL. Keep React and TypeScript throughout.

## First vertical slice

Create requirement and versioned JD; add internal/external person; link application; record external resume submission; schedule client or internal practice interview; confirm attendance; employee records debrief; assigned assessor submits an internal assessment; recruiter releases constructive assessment; recruiter records sourced client decision; action history retains actor and timestamp.

Submissions in this slice record externally sent resume filenames. They are not yet uploaded resume versions. Official placement, offer and headcount transactions are not implemented. They must not be inferred from client selection counts.

## Data and security

D1 tables and keys are declared in db/schema.ts. Drizzle migrations own schema changes. Person/requirement applications and JD versions have unique indexes. Feedback submissions use a conditional single update to avoid an ordinary duplicate submission, with immutable feedback revision records. The owner-private workspace is the initial access boundary. No user-controlled role is accepted on business write requests. Employee and recruiter responses are filtered on the server. Closed and deactivated histories require further controls before production rollout.

## Next increments

1. Review desktop/mobile UI with the business owner and run browser accessibility/interaction QA.
2. Confirm company GitHub destination and controlled staff identity workflow.
3. Versioned private document uploads with quarantine/scanning and object-level download authorization.
4. Persistent mail outbox and next-day employee debrief request using approved Brevo sender; configure a supported unattended scheduler, retries, cancellation checks and delivery state. No browser timer as scheduler.
5. Administrative amendment, reassignment and deactivation workflows; protect the last active HR account.
6. Project/availability history, offers, transactional seat placements, retention and restoration.
7. Validated spreadsheet import and historical cohort reporting with explicit effective-time semantics.

## Release evidence

TypeScript check, production bundle build and scripts/verify-workflows.mjs. SQLite test harness mocks only the identity and D1 transport, not authorization or workflow handlers. Production D1, browser behavior, email delivery and full load/recovery verification are not covered by this harness.

## Portal passwords (October 14, 2026)

The user selected separate portal passwords. Hosted Sites identity remains an upstream access gate; these passwords do not make the owner-private site available to other employees. Each password/session belongs to an approved active member and verified hosting identity. There is no public registration. The default screen is always email/password sign-in. First-time password creation is permitted only after the server validates an HR-issued temporary password and supplies a short-lived, member-bound challenge. Subsequent recovery requires a recovery code or HR-issued reset token.

Password hashes use Node crypto scrypt with N=16384, r=8, p=5 (OWASP's documented 16 MiB alternative), random 128-bit salts, constant-time comparison, and 8–128-character passphrases. The limited local common-password check is not a comprehensive breached-password service. Do not describe this release as fully security audited or MFA-enabled.

Session secrets are random 256-bit tokens, stored only as SHA-256 digests and delivered in Secure, HttpOnly, SameSite=Strict, __Host- cookies. They expire after eight hours or thirty minutes of inactivity, are bound to hosting identity and credential version, and are checked on every workspace API access. Login rotates the active session for that identity. Logout revokes server-side sessions. Account deactivation takes effect on subsequent requests.

Same-origin JSON POSTs are required on authentication endpoints. D1-backed attempt counters allow ten attempts per fifteen-minute window per approved account. Wrong email/password responses are generic. Password reset invalidates sessions, recovery codes and outstanding reset links. Reset links expire in fifteen minutes, are delivered as URL fragments, removed from browser history before processing, and must be manually shared by HR after identity verification. No email is sent. A recovery code is displayed once at setup/reset and stored only as a digest. If the only HR owner loses both their password and recovery code, recovery needs an authorized operator/database intervention; there is no insecure owner bypass.

The application remains private and protected by hosted account access. Before employee rollout, configure Site sharing and test each real account, obtain a separate security review, benchmark concurrency/resource limits, and configure transactional email if automatic recovery delivery is desired. AWS migration will need an explicit replacement for hosted identity, in addition to moving the database/runtime.

Validation: `node scripts/verify-auth.mjs` tests actual authentication route/session code against SQLite with mocked hosting identity and request-cookie access. `node scripts/verify-workflows.mjs` tests business authorization separately with portal-session validation stubbed; it is not an authentication test. An isolated workerd/Miniflare crypto check verifies runtime support for the selected scrypt parameters. Browser interaction and responsive visual QA remain unverified when the supported browser skill is absent.

### Temporary-password correction

HR issues a random temporary password from member management. It is shown once for manual delivery, stored only as a scrypt hash, expires in 24 hours, invalidates older credentials/sessions, and never grants workspace access. Successful temporary-password login creates a ten-minute, single-use password-change challenge. Only after changing the password and signing in with it can the employee access the workspace. There is no automatic switch to password creation based on whether a credential exists. Existing permanent passwords remain valid.

The first owner HR account can explicitly initialize its temporary credential on the separate `/initial-access` route, guarded by the verified initial-owner identity and absence of credentials. This is not employee self-registration, and the initialization action is atomic and unavailable after provisioning. Email delivery remains unconfigured; no credentials are emailed automatically.

`node scripts/verify-login.mjs` checks the rendered default login for both anonymous and identified visitors to prevent regression into setup as the landing screen. `verify-auth.mjs` additionally covers required temporary-password authentication, expiry, one-time password change, and prevention of workspace access with temporary credentials.

### Graphite login and remembered sessions

Selected visual target: second displayed variation from October 14: graphite form, slate textured background, red-black glass ring hero; 60/40 desktop split. Generated asset prompts produced a text-free ring background and slate texture; live headings/logo/controls remain accessible HTML. Typography and hover/focus/success treatments apply only to the login. The primary button changes to green only after the server confirms permanent-password login, before entering the workspace; temporary credentials route to password change. Reduced-motion preferences suppress movement.

Remember me is unchecked by default. Without it, the browser receives a session cookie (no Max-Age), with an eight-hour absolute server expiry and thirty-minute inactivity limit. With it, the cookie lasts up to seven days and server idle expiry is twenty-four hours; logout/reset/deactivation revocation still applies. An authenticated remembered session can open the workspace without re-entering its password, subject to the upstream hosting identity. The application never stores plaintext passwords in localStorage or cookies.

## HR administration and independent portal accounts

The user requested a specific HR application login. A one-time D1 data migration provisions `hr@nforceone.com` with an independently salted scrypt hash of the supplied temporary password. It starts a 24-hour expiry when applied. It does not create a mailbox, send email, overwrite an existing credential, grant Site sharing, or publish the Site publicly. Plaintext initial credentials are excluded from tracked source. Test tooling can receive the initial test password through `HR_INITIAL_TEST_PASSWORD` without embedding it in test code.

Portal account email and hosted access identity are now distinct. Private Site access is still required upstream. The login verifies an active portal member's supplied email/password; its session is bound to both that member and the current verified hosting visitor ID. Workspace authorization resolves the member from that session, not from the visitor's hosting email. Thus the owner can sign out and test each of the four portal roles using separate provisioned credentials without weakening the private Site boundary. Other employees still need explicit Site access for rollout.

HR lands on People & access. It provides role counts, user search and role filters, password readiness, account creation, temporary password issuance, and active/role/profile controls. Employee accounts require an internal employee profile. Self-demotion/deactivation is blocked. Active HR count protection is enforced in the same SQL update as role changes, and access changes revoke affected sessions. The user table never receives password hashes or recovery tokens. Creating a user leads to temporary-password provisioning; credential delivery remains manual until company transactional email is connected.

Validation covers the seeded HR temporary-password first login and forced change, independent portal email login, remembered sessions, role restrictions, duplicate addresses, internal-profile linking, and self-lockout protection. Browser visual verification remains pending because the supported browser skill is unavailable.

### HR direct-login adjustment

At the user's request, a one-time migration replaces the HR credential with a permanent salted hash of the explicitly supplied password, removes the forced-change flag and expiry, and revokes older sessions and outstanding reset challenges. The password minimum is now eight characters in both browser validation and server policy; weak-pattern filtering and hashing remain. Confirm password has its own accessible visibility toggle, independent of the main password field, and both fields disable spell checking. Temporary-password onboarding for other provisioned users remains available.

Authentication regression tests verify the migrated HR credential enters the workspace directly and that an eight-character permanent password can be set through the real API. Browser-level interaction testing remains unavailable.
