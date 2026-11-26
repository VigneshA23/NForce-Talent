# Interviews page

The Interviews page is the operational record for every client interview and internal demo. It is designed for HR administrators and administrators to understand what is upcoming, what is incomplete, and what the final outcome was without combining distinct sources of feedback.

## What the page includes

- Summary metrics for upcoming, attention-needed, completed, and client interviews.
- Filters for upcoming, attention-needed, completed, client, and internal demo records.
- Search across person, email, role, client, round, and interviewer.
- CSV export of the current filtered view.
- Attention rules for past interviews awaiting attendance, internal employees awaiting feedback, and internal demos awaiting assessment.
- Interview scheduling with explicit time zone handling and optional secure meeting link.
- Rescheduling for upcoming interviews while preserving the linked person and requirement.
- Attendance outcomes for completed, cancelled, candidate no-show, and rescheduled interviews.
- Employee feedback kept separate from HR notes, internal interviewer assessment, and the official client decision.
- HR interview notes with summary, strengths, improvement opportunities, next step, overall signal, author, and timestamp.
- Internal demo readiness assessment and controlled release of coaching feedback.
- Clear disclosure that automatic next-day email requests are not active until the company sender and scheduler are configured.

## Access rules

- HR administrators and administrators can schedule and reschedule interviews, confirm attendance, record HR notes, and record the official client decision.
- Employees can see only interviews connected to their profile or assigned to them as an internal interviewer.
- Employee-facing responses never include HR interview notes.
- An employee can submit one locked reflection only after attendance is marked completed.
- Only the assigned internal interviewer can submit an internal-demo assessment, and self-assessment is blocked.

## Verification

The workflow verification script covers scheduling, rescheduling, time-zone-safe values, attendance gating, HR-only notes, employee privacy, self-assessment prevention, locked employee feedback, assessment release, and the separation of feedback from the official client decision.
