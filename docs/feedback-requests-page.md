# Feedback requests page

## Purpose

Feedback Requests is the HR/Admin control center for the employee recollection workflow. It derives its queue from internal employee interviews and keeps external candidates out of the employee-feedback process.

## Current page behavior

- Shows completed interviews that are ready for a request.
- Separates past interviews that still need attendance confirmation.
- Shows received feedback and upcoming interviews without implying that an email was sent.
- Documents the approved timing policy: first request after 24 hours, one reminder two days later, and link expiry after seven days.
- Provides a branded email preview using the employee, requirement, and client context.
- Opens the connected interview record for HR follow-through.
- States the privacy boundary: employees cannot see HR notes, client decisions, requirements, or other people.

## Required delivery infrastructure

The UI is intentionally honest while `emailConfigured` is false. Production delivery requires:

1. An approved company sender and secret API credential.
2. A public, token-protected feedback form that does not expose the private HR Site.
3. A persistent outbox with idempotency, retry, cancellation, and delivery-state fields.
4. An unattended scheduler for next-day requests and reminders.
5. Bounce/failure monitoring and an HR-visible retry path.

Until those controls are connected, no page action sends an email.
