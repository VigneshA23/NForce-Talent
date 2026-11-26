# Follow-ups page

## Purpose

Follow-ups is the HR/Admin action center for work that must happen after an interview, requirement update, talent conversation, or client decision. It replaces disconnected reminders with a permanent, searchable record containing one owner, one due date, and the business context needed to act.

## Included workflows

- Create and edit a follow-up with title, due date and time, time zone, owner, priority, category, context, and an optional connected record.
- Connect follow-ups to an interview, requirement, talent profile, or application.
- Separate overdue, due-today, upcoming, and completed work.
- Filter by ownership, status, category, or search terms.
- Complete and reopen follow-ups while retaining completion history.
- Export the current filtered view.
- Show reminder configuration honestly; no email reminder is sent until automation is approved and configured.

## Access

- HR Administrator and Administrator can create, edit, complete, and reopen follow-ups.
- Other authenticated roles may only see the follow-ups returned by their existing access rules.
- All writes are validated again on the server; UI visibility is not treated as authorization.

## Data and history

The `tasks` record stores priority, category, notes, related record, time zone, creator, completion time, and version. Create, edit, complete, and reopen operations are written to the permanent activity trail.

## Verification

- TypeScript compilation
- Production build
- Workflow verification for creation, ownership, connected records, editing, completion, and reopening
- Desktop browser review of the list, filters, form, responsive layout, and empty states
