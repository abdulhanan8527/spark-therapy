# ABLLS-R Program Builder - User Stories

## Epic: Therapy Program Management

As a therapy coordinator, I want therapists to efficiently manage individualized therapy programs so that children receive consistent, targeted interventions based on their specific needs.

## Story 1: Access Program Builder from Child Profile
**As a** therapist  
**I want to** access the program builder from a child's profile  
**So that** I can manage programs in the context of the child's overall care  

### Acceptance Criteria:
- [ ] Programs tab visible in child detail view
- [ ] Tab switching between Profile and Programs
- [ ] Back navigation to main profile view
- [ ] Child name displayed in program builder header

### Technical Notes:
- Modify `ChildDetailView.tsx` to include tab navigation
- Create `ProgramBuilder.tsx` component
- Implement state management for view switching

---

## Story 2: Quick-Add ABLLS-R Programs
**As an** ABA therapist  
**I want to** quickly add multiple ABLLS-R programs using codes  
**So that** I can efficiently set up structured therapy programs  

### Acceptance Criteria:
- [ ] ABLLS-R search button visible for ABA therapists
- [ ] Text area accepts multiple space-separated codes
- [ ] Codes validated against ABLLS_SKILLS database
- [ ] Valid programs added to child's active programs
- [ ] Invalid codes ignored with no error
- [ ] Programs grouped by domain with color coding

### Technical Notes:
- Create ABLLS_SKILLS data structure with all 25 domains
- Implement domain-specific color coding
- Add validation for ABLLS-R codes
- Create program creation from ABLLS-R data

---

## Story 3: Create Custom Programs
**As a** Speech/Occupational/Physical therapist  
**I want to** create completely custom therapy programs  
**So that** I can address discipline-specific needs not covered by ABLLS-R  

### Acceptance Criteria:
- [ ] "Create Custom Program" button visible for all therapists
- [ ] Form with fields for program name, category, descriptions
- [ ] Mastery criteria and data collection method selection
- [ ] New program immediately added to child's programs
- [ ] Program categorized by user-defined category

### Technical Notes:
- Create custom program form UI
- Implement form validation
- Add program to state with unique ID
- Support all data collection methods

---

## Story 4: Program Customization
**As a** therapist  
**I want to** customize all program details  
**So that** I can tailor interventions to each child's specific needs  

### Acceptance Criteria:
- [ ] Editable program title (except ABLLS-R codes)
- [ ] Editable short and long descriptions
- [ ] Editable mastery criteria
- [ ] Selection of data collection method
- [ ] Changes saved and reflected immediately

### Technical Notes:
- Implement edit functionality for all program fields
- Add save/cancel workflow
- Update program state with changes

---

## Story 5: Target Management
**As a** therapist  
**I want to** add unlimited targets to each program  
**So that** I can break down complex skills into manageable steps  

### Acceptance Criteria:
- [ ] Add target input field on each program card
- [ ] Targets immediately added to program
- [ ] Toggle target mastery status
- [ ] Record mastery dates automatically
- [ ] Visual indication of mastered targets

### Technical Notes:
- Create target management UI
- Implement target creation and deletion
- Add mastery tracking with dates
- Support visual styling for mastered targets

---

## Story 6: Program Organization
**As a** therapist  
**I want to** see programs organized by type  
**So that** I can easily find and manage different kinds of programs  

### Acceptance Criteria:
- [ ] ABLLS-R programs grouped by domain with color coding
- [ ] Custom programs grouped by user-defined category
- [ ] Section headers showing program counts
- [ ] Programs sorted alphabetically within groups

### Technical Notes:
- Implement program grouping logic
- Create domain/category-based sorting
- Design section headers with counts

---

## Story 7: Program Search and Filtering
**As a** therapist  
**I want to** search across all programs  
**So that** I can quickly find specific programs among many  

### Acceptance Criteria:
- [ ] Search bar filters programs by title, description, domain, category
- [ ] Results update in real-time as user types
- [ ] Clear search button resets filter
- [ ] Case-insensitive matching

### Technical Notes:
- Implement search/filter functionality
- Add debouncing for performance
- Support multiple field matching

---

## Story 8: Role-Based Access Control
**As a** system administrator  
**I want to** control feature visibility by therapist role  
**So that** each discipline sees appropriate tools  

### Acceptance Criteria:
- [ ] ABLLS-R search visible only to ABA/BACB therapists
- [ ] Custom program creation visible to all therapists
- [ ] Role determined by user profile/credentials
- [ ] UI adapts based on role without page reload

### Technical Notes:
- Create therapist specialty enum
- Implement role-based UI rendering
- Add prop drilling or context for role information

---

## Story 9: Program Archiving
**As a** therapist  
**I want to** archive completed programs  
**So that** active programs remain focused while preserving history  

### Acceptance Criteria:
- [ ] Archive button on each program card
- [ ] Archived programs hidden from main view
- [ ] Archive date recorded
- [ ] Programs can be restored if needed

### Technical Notes:
- Add archive functionality to programs
- Implement archived program filtering
- Store archive timestamps

---

## Story 10: Progress Tracking
**As a** therapist  
**I want to** track target mastery over time  
**So that** I can measure child progress and adjust interventions  

### Acceptance Criteria:
- [ ] Toggle target mastery with visual feedback
- [ ] Automatic recording of mastery dates
- [ ] Strike-through styling for mastered targets
- [ ] Date display for mastered targets

### Technical Notes:
- Implement target mastery toggling
- Add date tracking for state changes
- Create visual styling for different states

---

## Technical Debt Stories

### Story 11: Data Persistence
**As a** system administrator  
**I want to** persist program data  
**So that** information survives application restarts  

### Acceptance Criteria:
- [ ] Programs saved to backend database
- [ ] Data loaded when accessing child profile
- [ ] Changes synchronized with backend
- [ ] Offline support with sync when online

### Technical Notes:
- Design program data models
- Implement API service layer
- Add data synchronization logic

---

### Story 12: ABLLS-R Database Management
**As an** administrator  
**I want to** update the ABLLS-R skills database  
**So that** the system stays current with assessment versions  

### Acceptance Criteria:
- [ ] Admin interface for importing ABLLS-R data
- [ ] Validation of imported data structure
- [ ] Backup of existing database before update
- [ ] Rollback capability if import fails

### Technical Notes:
- Create admin UI for database management
- Implement import/export functionality
- Add data validation and backup procedures

---

## Future Enhancements

### Story 13: Program Templates
**As a** therapist  
**I want to** create and reuse program templates  
**So that** I can efficiently set up similar programs for multiple children  

### Story 14: Data Collection Integration
**As a** therapist  
**I want to** collect data directly from program targets  
**So that** I can streamline session documentation  

### Story 15: Progress Reporting
**As a** therapist  
**I want to** generate progress reports from programs  
**So that** I can communicate outcomes to families and supervisors