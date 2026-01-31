# SPARK Therapy Services - Scheduling User Stories

## Epic: Scheduling Management System

As an admin, I want to manage therapist schedules so that I can efficiently coordinate therapy sessions for children.

### Story 1: Configure Office Hours
**As an** admin  
**I want to** configure office hours for each therapist  
**So that** I can ensure sessions are scheduled within appropriate time frames  

#### Acceptance Criteria:
- [ ] Admin can view current office hours for all therapists
- [ ] Admin can edit office hours for each day of the week (Monday-Sunday)
- [ ] Admin can set specific overrides for holidays or special dates
- [ ] Validation prevents start time from being after end time
- [ ] Times must be within 00:00-23:59 range
- [ ] Changes are saved and reflected in availability calculations

#### Technical Notes:
- Create OfficeHours CRUD operations
- Implement date override functionality
- Add validation for time ranges

---

### Story 2: Create Monthly Schedule Templates
**As an** admin  
**I want to** create monthly schedule templates  
**So that** I can establish recurring session patterns  

#### Acceptance Criteria:
- [ ] Admin can create a template for a specific therapist and month
- [ ] Template includes day of month, start time, end time, duration, and client
- [ ] Option to make template recurring or one-off
- [ ] Ability to copy template rows to other days or months
- [ ] Validation ensures times are within office hours
- [ ] Validation prevents invalid dates
- [ ] Duration must be greater than 0

#### Technical Notes:
- Create ScheduleTemplate entity
- Implement template copying functionality
- Add validation for office hours compliance

---

### Story 3: Manage Individual Sessions
**As an** admin  
**I want to** create, edit, and delete individual sessions  
**So that** I can handle ad-hoc scheduling needs  

#### Acceptance Criteria:
- [ ] Admin can create new sessions with therapist, client, date, time, and duration
- [ ] End time auto-calculated from start time + duration
- [ ] Admin can edit existing sessions
- [ ] Admin can delete sessions
- [ ] Recurrence links maintained when applicable
- [ ] All changes logged in audit trail

#### Technical Notes:
- Create Session CRUD operations
- Implement auto-calculation for end time
- Add audit logging functionality

---

### Story 4: Conflict Detection and Handling
**As an** admin  
**I want to** see scheduling conflicts but still be able to proceed  
**So that** I can make informed decisions about overlapping sessions  

#### Acceptance Criteria:
- [ ] System detects overlaps with existing sessions for same therapist
- [ ] Non-intrusive warning displayed (icon or "Conflict" label)
- [ ] User can proceed with conflicting session after confirmation
- [ ] Conflicts do not block saving by default
- [ ] Conflict flag stored with session data

#### Technical Notes:
- Implement conflict detection algorithm
- Create non-blocking UI warnings
- Add conflict flag to Session entity

---

### Story 5: View Therapist Availability
**As an** admin  
**I want to** view available slots for therapists  
**So that** I can efficiently schedule new sessions  

#### Acceptance Criteria:
- [ ] View shows therapist name and available slots for selected date range
- [ ] Filters available for therapist, date range, and session duration
- [ ] Office hours displayed alongside existing sessions
- [ ] Actual availability calculated based on office hours and existing sessions
- [ ] Visual indication of days with no availability

#### Technical Notes:
- Create availability calculation service
- Implement filtering functionality
- Design responsive availability display

---

### Story 6: Assisted Session Booking
**As an** admin  
**I want to** book sessions using therapist availability  
**So that** I can reduce scheduling conflicts and save time  

#### Acceptance Criteria:
- [ ] User can select available slot from therapist's availability
- [ ] Client can be assigned to selected slot
- [ ] Auto-conflict check performed
- [ ] Confirmation required if conflict detected
- [ ] Alternative slot selection offered if conflict exists
- [ ] Session saved with all required fields

#### Technical Notes:
- Create booking workflow
- Integrate conflict checking into booking flow
- Implement alternative slot suggestions

---

### Story 7: Therapist Calendar View
**As a** therapist  
**I want to** view my schedule in a calendar format  
**So that** I can easily see my upcoming sessions  

#### Acceptance Criteria:
- [ ] Monthly calendar view displays therapist's sessions
- [ ] Sessions color-coded by status (scheduled, tentative, conflict)
- [ ] Clicking session allows viewing details
- [ ] Edit permissions based on role settings
- [ ] Responsive design for mobile devices

#### Technical Notes:
- Create therapist-facing calendar component
- Implement color-coding based on session status
- Ensure mobile responsiveness

---

### Story 8: Client Session View
**As a** parent  
**I want to** view my child's upcoming sessions  
**So that** I can plan accordingly  

#### Acceptance Criteria:
- [ ] Parent can view child's upcoming sessions
- [ ] Display includes date, time, therapist, and location
- [ ] Read-only access to session information
- [ ] Optional self-service booking if enabled
- [ ] Timezone-appropriate display of session times

#### Technical Notes:
- Create parent-facing session view
- Implement read-only restrictions
- Add timezone conversion for display

---

### Story 9: Timezone and Localization Support
**As a** user  
**I want to** see times in my local timezone  
**So that** I can accurately plan sessions  

#### Acceptance Criteria:
- [ ] All times stored in UTC in database
- [ ] Times displayed in user's local timezone
- [ ] Proper handling of daylight saving time transitions
- [ ] Therapist timezone settings respected
- [ ] Consistent timezone handling across all views

#### Technical Notes:
- Implement UTC storage with local display
- Add timezone conversion utilities
- Test DST transitions

---

### Story 10: Audit Trail and Change Logging
**As an** admin  
**I want to** track all schedule changes  
**So that** I can maintain accountability and troubleshoot issues  

#### Acceptance Criteria:
- [ ] All session changes logged with user, action, and timestamp
- [ ] Details of changes captured (before/after values)
- [ ] Logs retained according to data retention policy
- [ ] Easy access to audit information for specific sessions
- [ ] Export capability for audit logs

#### Technical Notes:
- Create AuditLog entity
- Implement automatic logging on session changes
- Add audit log viewing functionality

---

## Technical Debt Stories

### Story 11: Performance Optimization
**As a** system administrator  
**I want to** ensure the scheduling system performs well  
**So that** users have a responsive experience  

#### Acceptance Criteria:
- [ ] Availability calculations cached for improved performance
- [ ] Cache invalidated appropriately on schedule changes
- [ ] Database indexes on frequently queried fields
- [ ] Efficient querying for large datasets
- [ ] Performance testing with realistic data volumes

#### Technical Notes:
- Implement caching strategy
- Add database indexes
- Conduct performance testing

---

### Story 12: Data Migration
**As a** system administrator  
**I want to** migrate existing schedule data  
**So that** historical information is preserved in the new system  

#### Acceptance Criteria:
- [ ] Existing schedule data migrated to new Session entities
- [ ] Data validation during migration process
- [ ] Rollback capability if migration fails
- [ ] Verification of migrated data accuracy
- [ ] Minimal downtime during migration

#### Technical Notes:
- Create data migration scripts
- Implement validation checks
- Plan rollback procedures

---

## Future Enhancements (Out of Scope for MVP)

### Story 13: Client Self-Service Booking
**As a** parent  
**I want to** book sessions myself  
**So that** I can schedule appointments at my convenience  

### Story 14: Automated Conflict Resolution
**As an** admin  
**I want to** have suggested alternatives for conflicts  
**So that** I can resolve scheduling issues more efficiently  

### Story 15: Integration with Calendar Applications
**As a** therapist  
**I want to** sync my schedule with external calendars  
**So that** I can manage all my commitments in one place