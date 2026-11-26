# People & Access page

## Purpose

People & Access is the HR Administrator security workspace. It manages portal sign-in accounts without mixing them with Talent profiles.

## Current account policy

- HR Administrator: manages accounts and security and can work across all operational records.
- Administrator: manages requirements, talent, interviews, follow-ups, feedback, and reports, but cannot manage account access.
- New Recruiter and Employee portal accounts are not created. Existing limited-role accounts remain visible as legacy records so they can be reviewed or migrated without losing history.
- Internal interviewers are assigned to individual interviews rather than receiving a permanent role.
- Employees and external candidates remain Talent profiles and do not require sign-in access.

## Included workflows

- Create an Administrator or HR Administrator account.
- Search and filter accounts by status and role.
- See active, setup-pending, disabled, and legacy account totals.
- Issue or reissue a one-time temporary password that expires after 24 hours.
- Reset access for an established account.
- Change a role, disable or reactivate an account, and immediately revoke existing sessions.
- Preserve at least one active HR Administrator.
- Retain disabled and legacy accounts for audit history.

## Security rules

- Account-management operations are authorized again by the server.
- New-account creation accepts only `admin` or `hr` roles.
- Temporary passwords are shown once and are not emailed automatically.
- Password and role changes revoke the affected user's active sessions.
- HR Administrators cannot remove their own HR access; another HR Administrator must make that change.

## Verification

- TypeScript compilation
- Production build
- Account-creation role restrictions
- Employee and legacy account isolation
- HR-only access management and self-lockout protection
- Browser review of status filters, account creation, access management, and temporary-password flows
