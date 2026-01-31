# SPARK Therapy Services - Scheduling Enhancement Specification

## 1. Objective
Add a robust scheduling module controllable from the admin panel to manage monthly therapy sessions (therapist, child/student, date, time, duration, and status) with office hours, conflict-awareness, and easy visibility of available slots by therapist.

## 2. Assumptions / Scope
- Office hours default: 9:00–17:00 local time; can be overridden per therapist or per day.
- Scheduling is primarily monthly (monthly templates that can be populated and adjusted for the month).
- Conflicts may be detected and flagged but not strictly blocked by default (overlaps shown with a non-blocking indicator; allow override with confirmation).
- Data model should support multiple therapists, multiple clients per therapist, and optional session notes.
- All times should be stored in a consistent time zone (UTC) and displayed in the user's local time.

## 3. Users, Roles, and Permissions
- **Admins**: Full control over schedules, office hours, and templates.
- **Therapists**: View their own schedule; propose or edit sessions within their hours (subject to admin approval if you want that workflow).
- **Front-desk staff**: Create/edit sessions for any therapist; view availability by therapist.
- **Clients/Parents**: View own sessions (read-only) and available slots for their therapist if you expose client-facing booking.

## 4. Data Model (Core Entities)

### 4.1 Therapist
- `id`: Unique identifier
- `name`: Therapist's full name
- `email`: Contact email
- `phone`: Contact phone number
- `timezone`: Timezone for display purposes
- `default_duration`: Default session duration in minutes
- `color`: Color code for UI representation

### 4.2 Client (Student)
- `id`: Unique identifier
- `name`: Client's full name
- `DOB`: Date of birth
- `parent_contact`: Parent/guardian contact information
- `therapist_id`: Foreign key to assigned therapist (can be multiple)

### 4.3 Session
- `id`: Unique identifier
- `therapist_id`: Foreign key to therapist
- `client_id`: Foreign key to client
- `start_datetime`: Session start time (UTC)
- `end_datetime`: Session end time (UTC)
- `duration`: Duration in minutes
- `date`: Session date
- `time`: Session time
- `location_room`: Physical location of session
- `status`: Session status (scheduled, completed, cancelled, tentative)
- `type`: Session type (initial assessment, regular session, follow-up)
- `notes`: Optional session notes
- `recurrence_id`: Foreign key to recurrence pattern
- `conflict_flag`: Boolean indicating scheduling conflict

### 4.4 OfficeHours
- `id`: Unique identifier
- `therapist_id`: Foreign key to therapist
- `day_of_week`: Day of week (0-6, Sunday-Saturday)
- `start_time`: Office start time
- `end_time`: Office end time
- `is_enabled`: Boolean indicating if office hours are active
- `timezone`: Timezone for these hours

### 4.5 AvailabilitySlot (Computed)
- `date`: Date of availability
- `therapist_id`: Foreign key to therapist
- `available_start_times[]`: Array of available start times
- `available_end_times[]`: Array of available end times

### 4.6 Recurrence
- `id`: Unique identifier
- `pattern_type`: Pattern type (daily, weekly, monthly, yearly)
- `interval`: Interval between recurrences
- `end_condition`: End condition (never, after N occurrences, on specific date)
- `exceptions`: Dates to exclude from recurrence

### 4.7 ScheduleTemplate
- `id`: Unique identifier
- `month_year`: Month and year for template (YYYY-MM)
- `therapist_id`: Foreign key to therapist
- `day_of_month`: Day of month for session
- `start_time`: Template start time
- `end_time`: Template end time
- `duration`: Template duration in minutes
- `client_id`: Foreign key to client
- `status`: Template status

### 4.8 AuditLog
- `id`: Unique identifier
- `action`: Action performed (create, update, delete)
- `user`: User who performed action
- `timestamp`: Timestamp of action
- `details`: Details of changes made

## 5. Functional Requirements

### A. Admin Panel: Manage Office Hours and Monthly Scheduling

#### FR1. Office Hours Configuration
- Ability to view and edit office hours per therapist, per day_of_week.
- Ability to override specific dates (e.g., holidays or half-days).
- Validation: start_time < end_time; times within 00:00–23:59; timezone respected.

#### FR2. Monthly Schedule Templates
- Admin can create a monthly schedule template for a given therapist and month (YYYY-MM).
- Fields: date (day_of_month), start_time, end_time, duration, client selection, notes, location.
- Recurrence option: one-off vs. recurring monthly.
- Ability to copy a template row to other days of the month or to the next month.
- Validation: times within office hours; no invalid dates; duration > 0; optional conflict check.

#### FR3. Create/Edit/Delete Sessions
- Admins can create, modify, or cancel sessions: therapist, client, date, start_time, end_time, duration, notes, location.
- Auto-calc end_time from start_time + duration.
- Persist a recurrence link when applicable.

#### FR4. Conflict Handling (Soft Conflicts)
- When creating/editing a session, the system detects overlaps with existing sessions for the same therapist.
- Display a non-intrusive warning (e.g., icon, label "Conflict" or "Overlaps with another session") instead of blocking.
- Allow override with a confirmation (user can proceed or adjust).
- Do not mark conflicts as errors that block saving by default; provide an opt-in override path.

#### FR5. Availability View (See Available Slots)
- For a chosen therapist and date range (e.g., a week or month), display:
  - Therapist name
  - Free slots (dates and times)
  - Days with availability
- Include filters: therapist, date range, and minimum/maximum session duration.
- Show therapist's office hours and any existing sessions to reflect actual availability.

#### FR6. Booking Flow (Assisted Scheduling)
- User can select a slot from the therapist's availability and assign a client.
- Auto-check for conflicts; if conflict exists, highlight and require confirmation to proceed (or allow choosing a different slot).
- Save session with all required fields; support optional notes and location.

#### FR7. Editing Constraints and Audit
- All changes are versioned; log who changed what and when.
- If a session is changed, all linked recurrence instances update accordingly (if applicable) or a new instance is created depending on recurrence rules.

### B. Therapist-Facing / Client-Facing Views

#### FR8. Therapist Calendar View
- Display monthly calendar with sessions highlighted; color-code by status (e.g., scheduled, tentative, conflict).
- Click a session to edit details (if permitted).

#### FR9. Client/Parent View (Optional)
- Show upcoming sessions for a client with date, time, therapist, and location.
- Allow booking via available slots if you offer self-service scheduling.

### C. Data Validation and Integrity

#### FR10. Timezone and DST Handling
- All times stored in UTC; displayed in the user's local timezone.

#### FR11. Time Range Validation
- Start time must be within office hours for the chosen day; duration must fit within the day's office hours unless a special override is allowed.

#### FR12. Data Integrity Checks
- Prevent invalid dates (e.g., Feb 30) and ensure data types are correct.

#### FR13. Access Control
- Only authorized roles can create/edit/delete sessions; sensitive data protected according to role.

### D. Performance and Scalability

#### FR14. Caching
- Caching of availability for quick display; invalidation on schedule changes.

#### FR15. Efficient Querying
- Efficient querying for large therapist/client sets (indexes on therapist_id, date, start_time).

## 6. UI/UX Considerations
- Calendar views: monthly grid with tooltips for sessions; a side panel lists daily blocks by therapist.
- Availability panel: a clean list/table showing therapist, next available slots, and days with openings.
- Conflict indicators: non-blocking visual cue (e.g., a pale yellow badge) rather than red to align with your preference.
- Quick actions: "Add session", "Edit", "View availability" with minimal clicks.

## 7. API Design (High Level)
- `GET /therapists`
- `GET /therapists/{id}/availability?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD`
- `POST /sessions`
- `PUT /sessions/{id}`
- `DELETE /sessions/{id}`
- `GET /scheduleTemplates?month=YYYY-MM`
- `POST /scheduleTemplates`
- `POST /officeHours`
- `PUT /officeHours/{id}`
- `GET /auditLogs?entity=sessions&entity_id={id}`

## 8. Non-Functional Requirements
- **Security**: Role-based access control; encrypted storage of PII; audit logging.
- **Reliability**: 99.9% uptime for scheduling module; proper backups.
- **Accessibility**: WCAG 2.1 AA where possible; keyboard navigable.
- **Localization**: Support for multiple time zones and languages as needed.
- **Data Retention**: Define retention policy for logs and templates.

## 9. Data Migration and Rollout Plan
1. **Step 1**: Add data structures for OfficeHours and Sessions (non-destructive).
2. **Step 2**: Migrate existing schedules into new Session entities where possible.
3. **Step 3**: Enable admin-facing UI for office hours and monthly templates.
4. **Step 4**: Roll out availability view for therapists; gather feedback.

## 10. Acceptance Criteria (Sample)
- Admin can set office hours for a therapist to 9:00–17:00 on weekdays; a specific holiday date can be overridden to 12:00–15:00.
- Admin creates a monthly template: 15th of the month, 9:30–10:15, therapist T1, client C1; system saves with duration 45 minutes.
- When scheduling a 9:30–10:15 session for Therapist T1 with Client C2 on a day that already has a session, the UI shows a "Conflict" badge but allows saving with confirmation.
- Availability view for Therapist T1 shows all free slots for the current week, highlighting days with no availability.
- Scheduling a new session respects office hours and time zones; stored times display correctly in the user's locale.

## 11. Questions to Confirm
1. Should conflicts always be allowed with a user override, or would you like a separate "tentative" state that requires confirmation?
2. Do you want recurring monthly sessions (e.g., same time every month) by default, or is each month completely separate?
3. Is there a fixed maximum number of sessions per therapist per day, or should it be unlimited unless constrained by office hours?
4. Do you need a client-facing booking flow, or will scheduling always be done via admin staff?

## 12. Implementation Notes
This specification builds upon the existing SPARK Therapy Services application which currently includes:
- Role-based modules for Admin, Therapist, and Parent users
- React frontend with TypeScript
- Vite build system
- Radix UI components
- Tailwind CSS for styling

The scheduling module will be integrated into the Admin panel as a new navigation item and will leverage existing UI components where possible to maintain consistency with the current application design.