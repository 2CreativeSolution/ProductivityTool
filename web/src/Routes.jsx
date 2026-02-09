// In this file, all Page components from 'src/pages` are auto-imported. Nested
// directories are supported, and should be uppercase. Each subdirectory will be
// prepended onto the component name.
//
// Examples:
//
// 'src/pages/HomePage/HomePage.js'         -> HomePage
// 'src/pages/Admin/BooksPage/BooksPage.js' -> AdminBooksPage

import { Router, Route, Set, PrivateSet } from '@redwoodjs/router'

import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import AdminDiagnosticsToolsPage from 'src/pages/AdminDiagnosticsToolsPage/AdminDiagnosticsToolsPage'
import AssetsAssignmentsPage from 'src/pages/AssetsAssignmentsPage/AssetsAssignmentsPage'
import AssetsIndexPage from 'src/pages/AssetsIndexPage/AssetsIndexPage'
import AssetsInventoryPage from 'src/pages/AssetsInventoryPage/AssetsInventoryPage'
import AssetsManagementPage from 'src/pages/AssetsManagementPage/AssetsManagementPage'
import AssetsReportsDepartmentDetailPage from 'src/pages/AssetsReportsDepartmentDetailPage/AssetsReportsDepartmentDetailPage'
import AssetsReportsDepartmentsPage from 'src/pages/AssetsReportsDepartmentsPage/AssetsReportsDepartmentsPage'
import AssetsReportsEmployeeDetailPage from 'src/pages/AssetsReportsEmployeeDetailPage/AssetsReportsEmployeeDetailPage'
import AssetsReportsEmployeesPage from 'src/pages/AssetsReportsEmployeesPage/AssetsReportsEmployeesPage'
import AssetsReportsIndexPage from 'src/pages/AssetsReportsIndexPage/AssetsReportsIndexPage'
import AssetsReportsMyPage from 'src/pages/AssetsReportsMyPage/AssetsReportsMyPage'
import AssetsReportsOverviewPage from 'src/pages/AssetsReportsOverviewPage/AssetsReportsOverviewPage'
import AssetsRequestsPage from 'src/pages/AssetsRequestsPage/AssetsRequestsPage'
import AssetTrackerLegacyPage from 'src/pages/AssetTrackerLegacyPage/AssetTrackerLegacyPage'
import MeAttendancePage from 'src/pages/MeAttendancePage/MeAttendancePage'
import MeBookingsPage from 'src/pages/MeBookingsPage/MeBookingsPage'
import MeVacationPage from 'src/pages/MeVacationPage/MeVacationPage'
import ProjectTrackerEmployeesPage from 'src/pages/ProjectTrackerEmployeesPage/ProjectTrackerEmployeesPage'
import ProjectTrackerManagementPage from 'src/pages/ProjectTrackerManagementPage/ProjectTrackerManagementPage'
import ProjectTrackerReportsPage from 'src/pages/ProjectTrackerReportsPage/ProjectTrackerReportsPage'

import { useAuth } from './auth'

const Routes = () => {
  return (
    <Router useAuth={useAuth}>
      <Route path="/signin" page={LoginPage} name="login" />
      <Route path="/signup" page={SignupPage} name="signup" />
      <Route path="/forgot-password" page={ForgotPasswordPage} name="forgotPassword" />
      <Route path="/reset-password" page={ResetPasswordPage} name="resetPassword" />

      <PrivateSet unauthenticated="login">
        <Route path="/me" page={DashboardPage} name="home" />
        <Route path="/" page={DashboardPage} name="legacyHome" />
        <Route path="/me/bookings" page={MeBookingsPage} name="meBookings" />
        <Route path="/me/attendance" page={MeAttendancePage} name="meAttendance" />
        <Route path="/me/vacation" page={MeVacationPage} name="meVacation" />
        <Route path="/form" page={FormPage} name="form" />
        <Route path="/asset-tracker" page={AssetTrackerLegacyPage} name="assetTracker" />
        <Route path="/assets" page={AssetsIndexPage} name="assets" />
        <Route path="/assets/assignments" page={AssetsAssignmentsPage} name="assetsAssignments" />
        <Route path="/assets/requests" page={AssetsRequestsPage} name="assetsRequests" />
        <Route path="/assets/reports" page={AssetsReportsIndexPage} name="assetsReports" />
        <Route path="/assets/reports/my" page={AssetsReportsMyPage} name="assetsReportsMy" />
        <Route path="/project" page={ProjectTrackerPage} name="projectTracker" />

        {/* Office Supplies Management */}
        <Route path="/supply-requests" page={OfficeSupplySupplyRequestsPage} name="supplyRequests" />

        <Set wrap={ScaffoldLayout} title="Bookings" titleTo="bookings" buttonLabel="New Booking" buttonTo="newBooking">
          <Route path="/bookings/new" page={BookingNewBookingPage} name="newBooking" />
          <Route path="/bookings/{id:Int}/edit" page={BookingEditBookingPage} name="editBooking" />
          <Route path="/bookings/{id:Int}" page={BookingBookingPage} name="booking" />
          <Route path="/bookings" page={BookingBookingsPage} name="bookings" />
        </Set>

        <Route path="/settings/account" page={UserEditUserPage} name="accountSettings" />
        <Route path="/settings/change-password" page={UserChangePasswordPage} name="changePassword" />
      </PrivateSet>

      <PrivateSet unauthenticated="login" roles={['ADMIN']}>
        <Route path="/admin" page={AdminPanelPage} name="adminPanel" />
        <Route path="/admin/diagnostics-tools" page={AdminDiagnosticsToolsPage} name="adminDiagnosticsTools" />
        <Route path="/admin/users/new" page={UserNewUserPage} name="newUser" />
        <Route path="/admin/users/{id:Int}/edit" page={UserEditUserPage} name="editUser" />
        <Route path="/admin/users/{id:Int}" page={UserEditUserPage} name="user" />
        <Route path="/admin/users" page={UserUsersPage} name="users" />
        <Route path="/admin/vacation-requests" page={AdminVacationRequestsPage} name="adminVacationRequests" />
        <Route path="/admin/supply-requests" page={OfficeSupplyAdminSupplyRequestsPage} name="adminSupplyRequests" />
        <Route path="/admin/supply-categories" page={OfficeSupplySupplyCategoriesPage} name="adminSupplyCategories" />
        <Route path="/assets/inventory" page={AssetsInventoryPage} name="assetsInventory" />
        <Route path="/assets/management" page={AssetsManagementPage} name="assetsManagement" />
        <Route path="/assets/reports/overview" page={AssetsReportsOverviewPage} name="assetsReportsOverview" />
        <Route path="/assets/reports/employees" page={AssetsReportsEmployeesPage} name="assetsReportsEmployees" />
        <Route path="/assets/reports/employees/{userId:Int}" page={AssetsReportsEmployeeDetailPage} name="assetsReportsEmployee" />
        <Route path="/assets/reports/departments" page={AssetsReportsDepartmentsPage} name="assetsReportsDepartments" />
        <Route path="/assets/reports/departments/{department}" page={AssetsReportsDepartmentDetailPage} name="assetsReportsDepartment" />
        <Route path="/project/reports" page={ProjectTrackerReportsPage} name="projectTrackerReports" />
        <Route path="/office-supplies" page={OfficeSupplyOfficeSupplyInventoryPage} name="officeSupplies" />
        <Route path="/project/management" page={ProjectTrackerManagementPage} name="projectTrackerManagement" />
        <Route path="/project/employees" page={ProjectTrackerEmployeesPage} name="projectTrackerEmployees" />
      </PrivateSet>

      <Route notfound page={NotFoundPage} />
    </Router>
  )
}

export default Routes
