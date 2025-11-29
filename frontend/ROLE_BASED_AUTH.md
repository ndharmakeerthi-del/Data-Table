# Role-Based Authentication System

This application now includes a comprehensive role-based authentication system with the following features:

## Overview
The system supports two roles:
- **Admin**: Full access to all features including user management
- **User**: Limited access to products and dashboard (no user management)

## Backend Implementation

### 1. Role-Based Middleware (`backend/src/middleware/roleAuth.ts`)
```typescript
- requireRole(roles: string[]): Middleware for checking if user has required roles
- requireAdmin(): Convenience middleware for admin-only routes
- requireUser(): Convenience middleware for user-level access
```

### 2. Protected Routes
- **User Routes** (`/api/user/*`): Admin-only access
- **Product Routes** (`/api/products/*`): Authenticated users (admin and user)
- **Auth Routes** (`/api/login`, `/api/register`): Public access

### 3. JWT Token Enhancement
- JWT tokens now include user role information
- Role is fetched from database during login
- New registrations default to 'user' role

## Frontend Implementation

### 1. Role Management Hooks (`src/hooks/useRole.ts`)
```typescript
- useRole(): Get current user role and permission checks
- usePermissions(): Granular permission checking
- hasAnyRole(roles): Check if user has any of the specified roles
```

### 2. Route Protection Components
```typescript
// Route-level protection
<AdminOnlyRoute>: Protects entire routes for admin-only access
<UserAndAdminRoute>: Allows both user and admin access

// Conditional UI components
<AdminOnly>: Shows content only to admins
<UserAccess>: Shows content to authenticated users (both roles)
<RoleGuard>: Custom role-based conditional rendering
```

### 3. Navigation Updates
- **Admin Users See**:
  - Dashboard (with full metrics)
  - Users (user management)
  - Products
  - Local Products

- **Regular Users See**:
  - Dashboard (limited metrics)
  - Products
  - Local Products
  - *No access to user management*

### 4. Dashboard Role Differentiation
- **Admin Dashboard**: Full metrics including user count, recent users, admin controls
- **User Dashboard**: Product-focused metrics, no user management features

## Testing the System

### 1. Create Admin User
1. Register a new user through the registration form
2. Update their role in the database to 'admin':
```javascript
// In MongoDB
db.admins.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### 2. Test Role-Based Access
1. **Login as Admin**:
   - Should see all navigation items
   - Can access `/user` route
   - Dashboard shows user metrics and admin controls

2. **Login as Regular User**:
   - Should not see "Users" in navigation
   - Accessing `/user` redirects to dashboard
   - Dashboard shows product-focused metrics only

### 3. API Testing
```bash
# Admin-only endpoint (requires admin role)
curl -X GET http://localhost:5000/api/user \
  -H "Cookie: token=<jwt_token>"

# User-accessible endpoint (requires any authenticated user)
curl -X GET http://localhost:5000/api/products \
  -H "Cookie: token=<jwt_token>"
```

## Security Features

### 1. Backend Protection
- All sensitive routes protected with authentication middleware
- Role-based access control prevents unauthorized access
- JWT tokens expire and require re-authentication

### 2. Frontend Protection
- Route-level protection prevents navigation to unauthorized pages
- Conditional UI components hide sensitive information
- Automatic redirect for insufficient permissions

### 3. Database Security
- User roles stored securely in database
- Role verification on every protected request
- Default role assignment for new users

## Role Assignment

### Default Behavior
- New registrations automatically get 'user' role
- First registered user can be manually promoted to admin

### Manual Role Assignment (Admin Only)
```javascript
// Future enhancement: Admin panel for role management
const promoteUser = async (userId, newRole) => {
  // Only admins can change user roles
  await updateUserRole(userId, newRole);
};
```

## Implementation Files

### Backend Files
- `backend/src/middleware/auth.ts`: JWT authentication
- `backend/src/middleware/roleAuth.ts`: Role-based access control
- `backend/src/routes/loginRoutes.ts`: Enhanced with role information
- `backend/src/routes/userRoutes.ts`: Admin-only protection
- `backend/src/routes/productRoutes.ts`: Authenticated user protection

### Frontend Files
- `src/hooks/useRole.ts`: Role management hooks
- `src/components/auth/RoleProtectedRoute.tsx`: Route protection
- `src/components/auth/RoleGuard.tsx`: Conditional UI components
- `src/store/authStore.ts`: Enhanced with role state
- `src/pages/dashboard/index.tsx`: Role-based navigation
- `src/pages/dashboard/home.tsx`: Role-based dashboard content
- `src/App.tsx`: Role-based route configuration

## Next Steps

1. **Admin Panel**: Create dedicated admin interface for user management
2. **Permission System**: Implement granular permissions beyond basic roles
3. **Audit Logging**: Track role-based actions and access attempts
4. **Role Management UI**: Allow admins to assign roles through the interface
5. **Advanced Roles**: Add more specific roles (moderator, viewer, etc.)

The role-based authentication system is now fully functional and provides secure, scalable access control throughout the application.