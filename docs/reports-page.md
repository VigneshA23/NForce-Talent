# Reports & Insights page

## Purpose

Reports gives HR Administrators and Administrators a decision-ready view of client demand, talent movement, interviews, feedback completeness, official client decisions, and historical activity. It uses existing operational records instead of asking the team to maintain a second reporting spreadsheet.

## Included capabilities

- Reporting period filter for all time, 30 days, 90 days, or the current year.
- Summary metrics for open requirements, people in pipeline, completed interviews, and client selections.
- Pipeline movement showing independently recorded role connections, resume submissions, interviews, and official client decisions without implying false conversion.
- Feedback coverage and decision-readiness indicators with explicit definitions.
- Requirement health table showing openings, pipeline coverage, interviews, and recorded decisions.
- Searchable activity history with author filtering.
- Download center for applications, interviews, employee interview history, requirements, and activity.
- Drill-down links to the connected Requirements, Talent, and Interviews pages.

## Reporting rules

- A selection is counted only when an official client result is recorded as `Selected`.
- Feedback completeness is based on a completed interview containing employee feedback, HR notes, or an internal assessment.
- Employee feedback, HR notes, interviewer assessments, and client decisions remain separate records.
- CSV exports protect spreadsheet applications from formula injection.

## Verification

- TypeScript compilation
- Production build
- Existing workflow and authorization verification
- Browser review of metrics, period filtering, requirement drill-down, activity filters, and export controls
