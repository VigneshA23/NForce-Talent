# NForce Talent

NForce One recruitment and interview workspace. This first private development release prioritizes a polished interface and persistent core workflows. It is a separate Site from the examination portal.

## Stack

React and TypeScript, Vinext/Vite, Cloudflare Workers, D1, Drizzle migrations. Private R2 binding is provisioned for later document workflows. NForce logo and red accent were recovered from the existing examination portal.

## Run and verify

Use the Sites dependency installer and build helper described in the installed Sites skill. Dependencies are project-local. Run `node node_modules/typescript/bin/tsc --noEmit`, `node scripts/verify-workflows.mjs`, and the Sites `build-site.mjs` helper before publication. The verification script executes the actual API handlers against Node SQLite with a D1 adapter and checks permission boundaries, feedback release, separate outcomes and idempotent sample loading. It does not prove Cloudflare production behavior or browser layout.

## Ownership

Site project: appgprj_6acfe5ba68808191b97a758b0c0fb0c1. This is initially owner-private. Source is synchronized with the Site repository. A company GitHub repository has not yet been connected; the currently connected GitHub account returned no organizations. Do not claim company ownership or a GitHub mirror until access and the destination are confirmed.

The first visitor behind the owner-private Sites boundary becomes the initial HR Administrator. Do not change the Site audience before bootstrapping this owner and reviewing the member allowlist. Existing approved members are matched to platform-authenticated email and stable Site identity. Unknown identities are denied. Portal membership and Site audience are separate controls.

## Roles

Admin has broad business visibility and can create follow-ups. HR Administrator manages records and approved members. Recruiters work within assigned scope. Employees see their own interviews and released assessments, plus interview materials for explicit internal assessor assignments. Interviewer is a contextual responsibility, not a fifth account role. Employee recollection cannot change a client decision; an assessment must be submitted by the assigned assessor and reviewed before employee release.

## Included in this release

- Branded welcome/login, dashboard, opportunity pipeline, requirement and talent directory views, interview list, follow-ups, reports and member administration.
- Persistent person, requirement, JD version, application, recorded submission, interview, debrief, internal assessment, client result, follow-up and activity records.
- A manually loaded fictional sample workspace. Example addresses are reserved example.com addresses. Sample entities carry a visible label; sample loading never sends email.
- Search, filters, talent cards/list, detail dialogs, scoped CSV exports, separate employee and interviewer sections.
- Platform-authenticated identity and approved-member authorization on server routes.

## Not production complete

Company email OTP, Brevo sender/credentials, automatic next-day emails, reminders, calendar invitations, document upload/scanning, bulk spreadsheet import, seat-confirmed placements, complete project allocation histories, correction/reassignment UI and final production hardening remain subsequent increments. The initial release does not send emails or meeting invitations. Do not load sensitive production records before the company deployment/access review.

No browser automation capability was available in the authoring environment. Browser layout and interaction QA must be performed with the deployed private first version; build/type/workflow checks are separate evidence.

## Migration path

See docs/architecture.md. Runtime-specific access lives in lib/workspace.ts and API transport in app/api. Keep future domain services free of Cloudflare imports. Moving D1/SQLite to PostgreSQL requires a dialect/driver and schema/query migration, export/reconciliation and cutover. Moving Workers/Vinext to Lambda/Amplify requires runtime/build adaptation. No unchanged-package or one-click migration is promised.
