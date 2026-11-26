# Requirements page

## Purpose

The Requirements page is the authoritative record for each client opening. It gives HR Administrators and Admins one place to capture the role, preserve job-description versions, connect candidates, schedule interviews, and record outcomes.

## Included workflows

- Create a requirement with client, optional location, skills, priority, openings, and job description.
- Search by role, client, location, or skill and filter by lifecycle or priority.
- Review open demand, openings, high-priority work, and requirements without candidates.
- Open a requirement to see its JD version, skills, pipeline counts, linked people, interviews, and client result.
- Add a person, record a resume submission, schedule an interview, or record a client decision from the requirement.
- Edit requirement details; a changed JD creates a new immutable JD-version record.
- Place a requirement on hold, reopen it, or close it.
- Export the currently filtered requirement list to CSV.

## Access

Both `hr` and `admin` roles can create and manage requirements. Other roles are denied by the API even if they attempt to call it directly.

## Verification completed

- Actual API handlers tested against SQLite for Admin creation, edit, JD versioning, status changes, and permission denial.
- Search, lifecycle filters, creation form, edit form, and requirement detail tested in the browser.
- Responsive desktop table and mobile card layout implemented.
- TypeScript, production build, workflow checks, and diff checks pass.
