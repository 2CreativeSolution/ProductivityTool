# App Overview

Short, route-first map of what the app does today (based on `web/src/Routes.jsx` and page/components).

## Public (no auth)
- `/signin` <kbd>PUBLIC</kbd> — Login form for DbAuth users. (evidence: web/src/Routes.jsx, web/src/pages/LoginPage/LoginPage.jsx)
- `/signup` <kbd>PUBLIC</kbd> — Create an account for DbAuth. (evidence: web/src/Routes.jsx, web/src/pages/SignupPage/SignupPage.jsx)
- `/forgot-password` <kbd>PUBLIC</kbd> — Request a reset email. (evidence: web/src/Routes.jsx, web/src/pages/ForgotPasswordPage/ForgotPasswordPage.jsx)
- `/reset-password` <kbd>PUBLIC</kbd> — Set a new password from reset token flow. (evidence: web/src/Routes.jsx, web/src/pages/ResetPasswordPage/ResetPasswordPage.jsx)

## Authenticated
- `/` (Dashboard) <kbd>EMP</kbd><kbd>ADMIN</kbd> — Daily overview with attendance, bookings, vacation, and quick actions. (evidence: web/src/Routes.jsx, web/src/pages/DashboardPage/DashboardPage.jsx)
- `/form` <kbd>EMP</kbd><kbd>ADMIN</kbd> — Internal form page (generic form placeholder). (evidence: web/src/Routes.jsx, web/src/pages/FormPage/FormPage.jsx)
- `/asset-tracker` <kbd>EMP</kbd><kbd>ADMIN</kbd> — Asset inventory, assignments, and reports; admin sees more controls. (evidence: web/src/Routes.jsx, web/src/pages/AssetTrackerPage/AssetTrackerPage.jsx)
- `/project-tracker` <kbd>EMP</kbd><kbd>ADMIN</kbd> — Project list, resource allocation, and daily updates. (evidence: web/src/Routes.jsx, web/src/pages/ProjectTrackerPage/ProjectTrackerPage.jsx)

### Office Supplies (user)
- `/office-supplies` <kbd>EMP</kbd><kbd>ADMIN</kbd> — View office supply inventory. (evidence: web/src/Routes.jsx, web/src/pages/OfficeSupply/OfficeSupplyInventoryPage/OfficeSupplyInventoryPage.jsx)
- `/supply-requests` <kbd>EMP</kbd><kbd>ADMIN</kbd> — Request supplies and view request status. (evidence: web/src/Routes.jsx, web/src/pages/OfficeSupply/SupplyRequestsPage/SupplyRequestsPage.jsx)
- `/supply-categories` <kbd>EMP</kbd><kbd>ADMIN</kbd> — Manage supply categories (shared page for admin + user). (evidence: web/src/Routes.jsx, web/src/pages/OfficeSupply/SupplyCategoriesPage/SupplyCategoriesPage.jsx)

### Bookings (CRUD, scaffolded)
- `/bookings` <kbd>EMP</kbd><kbd>ADMIN</kbd> — List bookings. (evidence: web/src/Routes.jsx, web/src/pages/Booking/BookingsPage/BookingsPage.jsx)
- `/bookings/{id}` <kbd>EMP</kbd><kbd>ADMIN</kbd> — Booking detail view. (evidence: web/src/Routes.jsx, web/src/pages/Booking/BookingPage/BookingPage.jsx)
- `/bookings/{id}/edit` <kbd>EMP</kbd><kbd>ADMIN</kbd> — Edit booking. (evidence: web/src/Routes.jsx, web/src/pages/Booking/EditBookingPage/EditBookingPage.jsx)
- `/bookings/new` <kbd>EMP</kbd><kbd>ADMIN</kbd> — Create booking. (evidence: web/src/Routes.jsx, web/src/pages/Booking/NewBookingPage/NewBookingPage.jsx)

### Users (CRUD, scaffolded)
- `/users` <kbd>EMP</kbd><kbd>ADMIN</kbd> — List users. (evidence: web/src/Routes.jsx, web/src/pages/User/UsersPage/UsersPage.jsx)
- `/users/{id}` <kbd>EMP</kbd><kbd>ADMIN</kbd> — User detail view. (evidence: web/src/Routes.jsx, web/src/pages/User/UserPage/UserPage.jsx)
- `/users/{id}/edit` <kbd>EMP</kbd><kbd>ADMIN</kbd> — Edit user. (evidence: web/src/Routes.jsx, web/src/pages/User/EditUserPage/EditUserPage.jsx)
- `/users/new` <kbd>EMP</kbd><kbd>ADMIN</kbd> — Create user. (evidence: web/src/Routes.jsx, web/src/pages/User/NewUserPage/NewUserPage.jsx)

## Admin (role: ADMIN)
- `/admin-panel` <kbd>ADMIN</kbd> — Admin console for exceptions, office hours, meeting rooms, and user roles. (evidence: web/src/Routes.jsx, web/src/pages/AdminPanelPage/AdminPanelPage.jsx)
- `/admin/supply-requests` <kbd>ADMIN</kbd> — Approve/reject supply requests. (evidence: web/src/Routes.jsx, web/src/pages/OfficeSupply/AdminSupplyRequestsPage/AdminSupplyRequestsPage.jsx)
- `/admin/supply-categories` <kbd>ADMIN</kbd> — Manage supply categories (admin view). (evidence: web/src/Routes.jsx, web/src/pages/OfficeSupply/SupplyCategoriesPage/SupplyCategoriesPage.jsx)

## Pages Present but Not Routed (current)
- `AuthRedirectPage` <kbd>REDUNDANT</kbd> — Auth redirect helper, not wired in routes. (evidence: web/src/pages/AuthRedirectPage/AuthRedirectPage.jsx)
- `EmailTestPage` <kbd>REDUNDANT</kbd> — Email test UI, not wired in routes. (evidence: web/src/pages/EmailTestPage/EmailTestPage.jsx)
- `RoleTestPage` <kbd>REDUNDANT</kbd> — Role test UI, not wired in routes. (evidence: web/src/pages/RoleTestPage/RoleTestPage.jsx)
- `HRPanelPage` <kbd>REDUNDANT</kbd> — HR panel UI, not wired in routes. (evidence: web/src/pages/HRPanelPage/HRPanelPage.jsx)
- `ManagerPanelPage` <kbd>REDUNDANT</kbd> — Manager panel UI, not wired in routes. (evidence: web/src/pages/ManagerPanelPage/ManagerPanelPage.jsx)

## Shared UI/Infrastructure (used across routes)
- `Header` — Top navigation, user menu, and responsive nav. (evidence: web/src/components/Header/Header.jsx)
- DbAuth provider — Authentication is DbAuth (API handler + web client). (evidence: api/src/functions/auth.js, web/src/auth.js)
