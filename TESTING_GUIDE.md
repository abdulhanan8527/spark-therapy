# SPARKTherapy Application Testing Guide

## Current Status
✅ Web server running on http://localhost:8081
✅ Backend server running on http://localhost:5001
✅ Test users created
✅ ChildrenSection dropdowns fixed

## Testing Checklist

### 1. Authentication Testing
- [ ] Login with admin@test.com / AdminPass123!
- [ ] Login with parent@test.com / ParentPass123!
- [ ] Login with therapist@test.com / TherapistPass123!
- [ ] Verify proper role-based access control

### 2. Admin Functionality Testing
- [ ] Navigate to Admin Dashboard
- [ ] Test Child Management Screen:
  - [ ] Verify parent dropdown works (should show "Test Parent")
  - [ ] Verify therapist dropdown works (should show "Test Therapist")
  - [ ] Create a new child successfully
  - [ ] Edit existing child
  - [ ] Delete child
- [ ] Test Session Scheduling Screen:
  - [ ] Verify child dropdown populates
  - [ ] Verify therapist dropdown populates
  - [ ] Schedule a new session
  - [ ] View scheduled sessions

### 3. Parent Functionality Testing
- [ ] Login as parent
- [ ] View assigned children
- [ ] View child's sessions
- [ ] Check attendance records

### 4. Therapist Functionality Testing
- [ ] Login as therapist
- [ ] View assigned children
- [ ] View assigned sessions
- [ ] Update session status

### 5. Cross-Platform Compatibility
- [ ] Test on web browser
- [ ] Test responsive design
- [ ] Verify all modals work properly

## Known Issues Being Fixed

### Fixed Issues:
✅ ChildrenSection parent/therapist dropdowns now show actual data instead of placeholders
✅ Modal components properly integrated
✅ Data fetching improved with better error handling

### Issues Still Being Addressed:
🚧 Session scheduling dropdown population
🚧 Data consistency across different screens
🚧 Proper error messaging for empty states

## Test Data
- Admin: admin@test.com / AdminPass123!
- Parent: parent@test.com / ParentPass123!
- Therapist: therapist@test.com / TherapistPass123!

## Next Steps for Full Dynamic Functionality

1. **Verify Child Creation**: 
   - Login as admin
   - Go to Child Management
   - Create a child assigned to "Test Parent" and "Test Therapist"
   - Verify the child appears in the list

2. **Test Session Scheduling**:
   - After creating a child, go to Scheduling
   - Verify the child appears in the dropdown
   - Select the child and therapist
   - Schedule a session
   - Verify it appears in the scheduled sessions list

3. **Test Role-Based Views**:
   - Login as parent - should see only their children
   - Login as therapist - should see only their assigned children
   - Login as admin - should see all children

## Expected Behavior After Fixes

### ChildrenSection:
- Parent dropdown shows actual parent users from database
- Therapist dropdown shows actual therapist users from database
- Both dropdowns are functional with proper selection
- Child creation works with proper validation

### SchedulingScreen:
- Child dropdown shows all children from database
- Therapist dropdown shows all therapists from database
- Session creation works with proper date/time validation
- Sessions display properly with child and therapist names

### Data Consistency:
- All screens show consistent data
- Updates in one screen reflect in others
- Proper loading states and error handling
- Empty states show appropriate messages

## Debugging Commands

### Check API Endpoints:
```bash
# Check if backend is running
curl http://localhost:5001/api/health

# Test authentication
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"AdminPass123!"}'

# Test children endpoint (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5001/api/children
```

### Check Frontend:
- Open browser console at http://localhost:8081
- Look for any JavaScript errors
- Check network tab for failed API requests

## Common Issues and Solutions

1. **Dropdowns showing empty**:
   - Check if API calls are successful
   - Verify user has proper permissions
   - Check browser console for errors

2. **Data not loading**:
   - Verify backend server is running
   - Check network connectivity
   - Confirm authentication tokens are valid

3. **Permission errors**:
   - Ensure logged in user has correct role
   - Check backend RBAC configuration
   - Verify route permissions

This guide will be updated as fixes are implemented and tested.