# SPARKTherapy Copilot Instructions

## Project Overview
SPARKTherapy is a full-stack ABA (Applied Behavior Analysis) therapy management platform with:
- **Frontend**: React Native (Expo) cross-platform mobile/web app
- **Backend**: Node.js/Express REST API with MongoDB
- **Auth Model**: JWT-based with role-based access control (Parent, Therapist, Admin)

## Critical Architecture Patterns

### Frontend Architecture (React Native + Expo)
- **Entry Point**: `App.tsx` → wraps with SafeAreaProvider, ErrorBoundary, AuthProvider
- **Navigation**: Role-based stack navigators (ParentNavigator, TherapistNavigator, AdminNavigator) based on `user.role`
- **Auth Context**: `src/contexts/AuthContext.js` manages user state, token persistence, and auto-login
- **API Communication**: Single axios client in `src/services/api.js` with interceptors for token injection and 401 handling
- **Storage**: Platform-agnostic StorageUtils wrapper (AsyncStorage for RN, localStorage for web)
- **Screen Organization**: Organized by role (`src/screens/{admin,parent,therapist,auth}/`)

### Backend Architecture (Express.js)
- **Entry**: `backend/server.js` - middleware stack includes security (helmet, CORS, rate-limit), logging, validation
- **Route → Controller → Service → Model**: Clean separation of concerns
- **Error Handling**: Custom error classes (ApiError, ValidationError, AuthenticationError) in `middleware/error.middleware.js`
- **Response Format**: All endpoints return `{ success: bool, message: string, data: any }` via `utils/responseHandler.js`
- **Validation**: Joi schemas in `helpers/validation.js`, applied via `middleware/validation.middleware.js`
- **Auth Middleware**: `protect` middleware validates JWT and attaches user to req.user

### Key Data Models
**Backend**: User, Child, Session, Program, Invoice, Notification, AbllsAssessment, Schedule, Complaint, Feedback, Video, Fee, LeaveRequest

**Frontend Display**: Models map to role-based screens with optimistic UI updates (e.g., delete session removes immediately, then API call handles actual deletion)

## Critical Developer Workflows

### Start Development
```bash
npm run dev              # Runs backend + Metro bundler (recommended)
# OR
npm run backend          # Terminal 1: Backend server (port 5000)
npm start               # Terminal 2: Expo Metro (port 8081)
```
If Metro won't start, clear cache: `npx react-native start --reset-cache`

### API URL Configuration
- **Web/Localhost**: `http://localhost:5001/api`
- **Expo Go + Real Device**: Use your machine IP from `ipconfig`: `http://192.168.x.x:5001/api`
- **Android Emulator**: `http://10.0.2.2:5001/api`
- Edit `src/config/env.js` to change base URL

### Testing
```bash
npm test                 # Frontend Jest tests
cd backend && npm test   # Backend tests
```

### Backend Environment Setup
Create `backend/.env`:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/spark_therapy
JWT_SECRET=your_dev_secret
```

## Project-Specific Conventions

### Error Handling Pattern (Critical!)
**Frontend**: API errors wrapped with descriptive messages. Always check `error?.message` for connection issues vs auth vs server errors:
```javascript
.catch(err => {
  if (err?.message?.includes('401')) { /* Handle auth */ }
  if (err?.message?.includes('500')) { /* Handle server */ }
  if (err?.message?.includes('Cannot connect')) { /* Backend offline */ }
})
```

**Backend**: Throw custom errors with appropriate status codes:
```javascript
throw new ValidationError('Invalid input', details);
throw new AuthenticationError('Token expired');
throw new NotFoundError('Session');
```

### State Management in Screens
Screens typically manage loading/submitting states separately and use Promise.all for parallel API fetches:
```javascript
const [loading, setLoading] = useState(true);    // Initial data load
const [submitting, setSubmitting] = useState(false); // Form submission
// Parallel fetches with individual error handlers returning fallback values
```

### Role-Based Access Control
- Every protected screen checks `user?.role` and alerts if not authorized
- Backend routes use `protect` middleware + role-specific checks
- Admin has access to all data; Parents/Therapists have scoped access

### API Response Standardization
All responses follow: `{ success: true/false, message: string, data: object|array }`
- Status codes: 200 (success), 400 (validation), 401 (auth), 403 (permission), 404 (not found), 500 (server)
- Frontend expects this format; always check `response.data.success` before using data

### Form Validation Pattern
- **Frontend**: TextInput placeholders show format (e.g., "YYYY-MM-DD"), with regex validators (`isValidDate`, `isValidTime`)
- **Backend**: Joi schemas validate before reaching controller logic
- **Error UX**: Alerts show user-friendly messages; complex errors logged to console

### Data Relationships
- Sessions reference childId/therapistId/parentId (objects populated from backend)
- Frontend display: `session.childId?.firstName` (safe navigation for nested objects)
- Parallel fetches preferred over dependent requests for performance

## Integration Points & Dependencies

### External Packages (Key)
- `@react-navigation/*` - Screen navigation and stack management
- `axios` - HTTP client with built-in interceptors
- `@react-native-picker/picker` - Dropdown/picker for role lists
- `mongodb + mongoose` - Persistence layer with validation
- `jsonwebtoken` - JWT generation/verification
- `joi` - Input validation schemas

### Cross-Component Communication
1. **AuthContext** → User state available to all screens via `useAuth()` hook
2. **API Services** → Single axios client shared; interceptors auto-inject auth tokens
3. **Navigation Service** → Utility for programmatic navigation (avoid direct prop passing)
4. **Storage Utilities** → Platform-agnostic abstraction for persistent data

### Common Issues & Solutions

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| `ERR_CONNECTION_REFUSED` on port 8081 | Metro bundler not running | Run `npm start --reset-cache` |
| App won't load data | Backend offline or wrong API URL | Check `src/config/env.js`, ensure backend running |
| 401 Unauthorized on API calls | Token expired or invalid | Check token format in auth context, verify JWT secret matches |
| Screens blank with no error | Missing role-based navigator | Ensure user.role is set after login |

## File Structure Reference
- **Frontend API**: `src/services/api.js` - All API methods organized by resource (authAPI, childAPI, etc.)
- **Backend Routes**: `backend/routes/*.routes.js` - RESTful endpoints per resource
- **Backend Models**: `backend/models/*.js` - Mongoose schemas with validation/hooks
- **Screens**: `src/screens/{role}/{FeatureName}.js` - Role-specific UI implementation
- **Navigation**: `src/navigation/*Navigator.js` - Tab/stack hierarchy per role

## Performance & Best Practices
- Use `Promise.all()` for parallel API requests; catch individual errors to allow partial load
- Implement optimistic UI updates (delete locally first, rollback if API fails)
- Avoid fetching same data twice; use state to gate requests (`if (!loading) fetchData()`)
- For large lists: implement pagination or virtualization (FlatList with `maxToRenderPerBatch`)
- Clear Metro cache (`--reset-cache`) when module resolution fails

## Deployment Checklist
- Backend: Set `NODE_ENV=production`, use strong JWT_SECRET, MongoDB Atlas URI, enable helmet/rate-limit
- Frontend: Update API_BASE_URL to production domain in `src/config/env.js`
- Reference: `PRODUCTION_DEPLOYMENT_GUIDE.md` for detailed steps
