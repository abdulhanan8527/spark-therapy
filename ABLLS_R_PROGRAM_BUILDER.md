# SPARK Therapy Services - ABLLS-R Program Builder

## Overview

The ABLLS-R Program Builder is a comprehensive therapy program management system that combines the structured approach of the ABLLS-R assessment tool with flexible custom program creation capabilities. This feature enables therapists to quickly build and manage individualized therapy programs for children while maintaining consistency with the ABLLS-R framework.

## Key Features

### 1. Dual Program Management Approach

#### Structured ABLLS-R Programs (For ABA/BACB Therapists)
- Quick-add functionality using ABLLS-R codes (e.g., "A15", "C15", "G10")
- Pre-loaded ABLLS-R database with 25 domains (A-Z) and all official skills
- Color-coded domain visualization for easy identification
- Lightning-fast program selection (add 10-20 programs in <20 seconds)

#### Flexible Custom Programs (For Speech, OT, PT Therapists)
- Completely free-form program creation
- Custom categories (e.g., "Expressive Language", "Articulation", "Fine Motor")
- Unlimited target creation per program
- No pre-made templates or forced checklists

### 2. Program Customization

All programs (both ABLLS-R and custom) include:
- **Program title/code**: Auto-filled for ABLLS-R, user-defined for custom programs
- **Short description**: Auto-filled for ABLLS-R, editable
- **Long description/teaching procedures**: Fully editable
- **Mastery criteria**: Customizable for each program
- **Data collection method**: Frequency, duration, trial-by-trial, rubric, or prompt level
- **Unlimited targets/steps**: Add as many specific targets as needed
- **Progress tracking**: Baseline date, teaching date, mastery date

### 3. User Role-Based Access

- **BCBA/ABA Therapists**: 
  - Access to ABLLS-R quick-add search
  - Ability to create custom programs
  - Full program management capabilities

- **Speech, OT, PT Therapists**: 
  - "Create Custom Program" button prominently displayed
  - ABLLS-R search hidden by default (can be enabled if needed)
  - Full custom program creation capabilities

- **All Therapists**: 
  - View and collect data on any program assigned to the child
  - Access to program details and progress tracking

## Implementation Details

### Data Model

#### ABLLS-R Skills Database
- Contains all 25 domains (A-Z) with official skill codes and descriptions
- Domain-specific color coding for visual grouping
- Hidden from regular view to avoid overwhelming users
- Future-proof design allows for database updates/imports

#### Program Structure
Each program includes:
- Unique identifier
- Child and therapist associations
- Title and categorization (domain for ABLLS-R, category for custom)
- Descriptions and criteria
- Data collection preferences
- Target/steps with progress tracking
- Status management (active, archived)

### User Interface

#### Program Builder View
- Tabbed interface within child profile (Profile/Programs)
- Search functionality across all programs
- Role-based button visibility (ABLLS-R search for ABA, Custom creation for all)
- Color-coded program cards by domain/category

#### ABLLS-R Quick Add
- Autocomplete search bar understanding ABLLS-R codes
- Instant program information display on code entry
- One-tap addition to child's active programs
- Multi-code entry support (e.g., "A15 C15 G10 Y8")

#### Custom Program Creation
- Simple form-based interface
- Fields for all program attributes
- Immediate addition to child's program list

#### Program Management
- Grouped display (ABA/ABLLS-R programs by domain, custom by category)
- Target management with mastery tracking
- Archive/delete capabilities
- Progress visualization

## Integration Points

### Child Profile Integration
- Programs tab added to child detail view
- Seamless navigation between profile and programs
- Contextual program management within child context

### Session Integration
- Active programs automatically available during sessions
- Discipline-specific program filtering
- Direct data collection from program targets
- Progress updates synced to program records

### Data Export
- Full Individualized Program Plan (IPP) export capability
- Combined view of ABLLS-R codes and custom programs
- Progress tracking and mastery reports

## Technical Architecture

### Frontend Components
- `ProgramBuilder.tsx`: Main program management interface
- `ProgramBuilderTypes.ts`: Data models and type definitions
- Integration with existing `ChildDetailView.tsx`

### Data Flow
- Programs stored locally for demonstration
- Designed for backend persistence integration
- Real-time updates through React state management
- Search and filtering capabilities

### UI/UX Design
- Mobile-first responsive design
- Consistent with existing application styling
- Domain-specific color coding
- Intuitive navigation and workflows

## Future Enhancements

### Administrative Features
- Super-user ABLLS-R database import/update functionality
- Program template creation and sharing
- Cross-child program comparison
- Advanced reporting and analytics

### Therapist Productivity
- Program duplication and cloning
- Batch target creation
- Progress note integration
- Collaboration tools for multi-disciplinary teams

### Client Engagement
- Parent-facing program view
- Progress sharing capabilities
- Home practice program generation
- Achievement celebration features

## Benefits

### For ABA Therapists
- Rapid program setup using familiar ABLLS-R codes
- Structured approach aligned with assessment framework
- Efficient target management for multiple children
- Progress tracking integrated with data collection

### For Speech, OT, PT Therapists
- Complete flexibility in program design
- No constraints from predefined frameworks
- Easy target creation and management
- Discipline-specific program organization

### For All Users
- Unified interface for all therapy program types
- Consistent progress tracking methodology
- Streamlined data collection during sessions
- Comprehensive program history and reporting

## Usage Examples

### ABA Therapist Workflow
1. Navigate to child's profile → Programs tab
2. Type "A15 C15 G10 Y8" in ABLLS-R search
3. Add all 4 programs with one click
4. Customize targets for each program
5. Begin collecting data during sessions

### Speech Therapist Workflow
1. Navigate to child's profile → Programs tab
2. Click "+ Create Custom Program"
3. Enter "k sound in initial position" as program name
4. Select "Articulation" as category
5. Add 20 specific targets
6. Begin collecting frequency data during sessions

### OT Therapist Workflow
1. Navigate to child's profile → Programs tab
2. Click "+ Create Custom Program"
3. Create "Scissor Skills – Stage 2" program
4. Add detailed steps as targets
5. Set mastery criteria
6. Collect trial-by-trial data during sessions

## Conclusion

The ABLLS-R Program Builder strikes the perfect balance between structured assessment-based programming for ABA therapists and complete flexibility for speech, occupational, and physical therapists. By integrating both approaches within a unified interface, the system supports collaborative, individualized care while maintaining the efficiency and consistency needed in therapy environments.