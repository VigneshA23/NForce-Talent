# Talent directory

## Purpose

The Talent directory gives HR Administrators and Admins one durable record for every internal employee and external candidate. It replaces scattered employee profiles and spreadsheets with a searchable history of requirements, submissions, interviews, feedback, and official client outcomes.

## Included workflows

- View summary counts for internal employees, external candidates, confirmed availability, and completed interviews awaiting feedback; select any summary card to filter the directory immediately.
- Search by name, email, title, skill, location, or current project.
- Filter the directory by internal, external, available now, or feedback needed.
- Export the currently filtered directory to CSV.
- Add an internal employee or external candidate without granting portal access.
- Edit contact details, skills, location, availability, profile type, title, and current project.
- Open a person to review every linked requirement, JD version, resume submission, interview, feedback state, and official client decision.
- Link a person to a requirement and start submission, interview, or result workflows from the same history view.
- Keep employee recollections, internal interviewer assessments, and official client decisions as separate records.

## Access

Both `hr` and `admin` roles can view and manage the directory. An external candidate record never creates a portal account. Employee email feedback will be collected from the interview workflow rather than requiring employee portal access.

## Verification completed

- Actual API handlers tested against SQLite for profile editing and duplicate-email protection.
- Directory summary, filters, search, add-person form, profile edit form, and complete history view tested in the browser.
- Responsive desktop table and mobile card layout implemented.
- TypeScript, production build, workflow checks, overview checks, and diff checks pass.
