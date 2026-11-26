# Overview: HR daily priorities

This pass changes Overview and the shared header only. Requirements, Talent, and other detailed pages keep their existing workflows for later review.

## Information hierarchy

1. Greeting, one clear date in India Standard Time, and direct actions to schedule an interview or create a requirement.
2. Four neutral, readable summary cards: open requirements, internal employees marked available now, interviews scheduled within seven days, and completed interviews awaiting employee/internal-interviewer feedback.
3. A priority queue for missing employee/internal-interviewer feedback and past scheduled interviews needing attendance confirmation. External candidates are not treated as employees owing portal feedback.
4. Upcoming interviews in chronological order, with candidate, requirement/client, date/time, interview type, and a link to the record.
5. Open requirements, available internal employees, and open follow-ups ordered by due date. Overdue tasks receive a restrained text indication, not a saturated card background.

## Shared experience corrections

HR and other non-employee accounts enter Overview. Employee accounts retain their own interview landing page. The header stays sticky while the page scrolls. The header removes the duplicate section label, decorative dot, and duplicate interview-date shortcut. The profile button opens account details and an explicit Sign out action. The existing left navigation remains.

Visible copy uses NForce Talent, Overview, interview feedback, requirements, candidates, and follow-ups. The data adapter omits tagged fictional people/requirements and dependent applications/interviews/submissions, sample tasks, and sample activity from all visible pages without deleting D1 records.

## Readability and accessibility

Panels use light surfaces with explicit dark foreground colors and a restrained NForce red accent. Controls have keyboard focus indicators. The attention anchor accounts for the sticky header and honors reduced-motion settings. Mobile layouts stack panels and retain usable tap targets. A single date card and a computed focus summary replace duplicate dates without inventing metrics.

## Verification

`node scripts/verify-overview.mjs` checks sample exclusion, actual upcoming dates, seven-day counts, attendance updates, internal versus external feedback assumptions, overdue/open follow-ups, non-mutation, and empty data. TypeScript and build checks validate the integrated components. Browser visual and scroll interaction checks remain unverified because the supported browser tool is unavailable; no pixel-perfect or full accessibility claim is made.
