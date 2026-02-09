import React, { useEffect, useMemo, useState } from 'react'

import { Link, navigate, routes, useLocation } from '@redwoodjs/router'

import { useAuth } from 'src/auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu'
import { STORAGE_KEYS } from 'src/lib/storageKeys'

const AppSidebar = ({ showQuickAccess = false }) => {
  const { pathname } = useLocation()
  const { currentUser, hasRole, logOut } = useAuth()

  const [homeOpen, setHomeOpen] = useState(showQuickAccess)
  const [assetsOpen, setAssetsOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const [projectsOpen, setProjectsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileHomeOpen, setMobileHomeOpen] = useState(showQuickAccess)
  const [mobileAssetsOpen, setMobileAssetsOpen] = useState(false)
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false)
  const [mobileProjectsOpen, setMobileProjectsOpen] = useState(false)
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false)
  const [mobileAdminOpen, setMobileAdminOpen] = useState(false)
  const [desktopExpanded, setDesktopExpanded] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.localStorage.getItem(STORAGE_KEYS.sidebarExpanded) !== '0'
  })

  const isAdmin = Boolean(hasRole && hasRole('ADMIN'))

  const homeItems = useMemo(
    () => [
      {
        key: 'overview',
        label: 'Overview',
        icon: 'ri-dashboard-line',
        to: routes.home(),
        matchPrefix: '/me',
        exact: true,
      },
      {
        key: 'bookings',
        label: 'Bookings',
        icon: 'ri-calendar-line',
        to: routes.meBookings(),
        matchPrefix: '/me/bookings',
      },
      {
        key: 'attendance',
        label: 'Attendance',
        icon: 'ri-time-line',
        to: routes.meAttendance(),
        matchPrefix: '/me/attendance',
      },
      {
        key: 'vacation',
        label: 'Vacation',
        icon: 'ri-calendar-event-line',
        to: routes.meVacation(),
        matchPrefix: '/me/vacation',
      },
    ],
    []
  )

  const assetItems = useMemo(() => {
    const items = [
      {
        key: 'assetsAssignments',
        label: isAdmin ? 'Active Assignments' : 'My Assignments',
        to: routes.assetsAssignments(),
        icon: 'ri-briefcase-4-line',
        matchPrefix: '/assets/assignments',
      },
      {
        key: 'assetsRequests',
        label: isAdmin ? 'All Requests' : 'My Requests',
        to: routes.assetsRequests(),
        icon: 'ri-file-list-3-line',
        matchPrefix: '/assets/requests',
      },
    ]

    if (!isAdmin) {
      items.push({
        key: 'assetsReportsMy',
        label: 'My Reports',
        to: routes.assetsReportsMy(),
        icon: 'ri-bar-chart-line',
        matchPrefix: '/assets/reports/my',
      })
    }

    if (isAdmin) {
      items.push(
        {
          key: 'assetsInventory',
          label: 'Inventory',
          to: routes.assetsInventory(),
          icon: 'ri-computer-line',
          matchPrefix: '/assets/inventory',
        },
        {
          key: 'assetsReportsOverview',
          label: 'Overview Reports',
          to: routes.assetsReportsOverview(),
          icon: 'ri-pie-chart-line',
          matchPrefix: '/assets/reports/overview',
        },
        {
          key: 'assetsReportsEmployees',
          label: 'Employee Reports',
          to: routes.assetsReportsEmployees(),
          icon: 'ri-group-line',
          matchPrefix: '/assets/reports/employees',
        },
        {
          key: 'assetsReportsDepartments',
          label: 'Department Reports',
          to: routes.assetsReportsDepartments(),
          icon: 'ri-building-line',
          matchPrefix: '/assets/reports/departments',
        }
      )
    }

    return items
  }, [isAdmin])

  const resourceItems = useMemo(() => {
    const items = [
      {
        key: 'supplyRequests',
        label: 'Supply Requests',
        to: routes.supplyRequests(),
        icon: 'ri-shopping-cart-line',
      },
    ]

    if (isAdmin) {
      items.unshift({
        key: 'supplies',
        label: 'Office Supplies',
        to: routes.officeSupplies(),
        icon: 'ri-archive-line',
      })
    }

    return items
  }, [isAdmin])

  const projectItems = useMemo(() => {
    const items = [
      {
        key: 'projectTrackerDaily',
        label: 'Daily Tracker',
        to: routes.projectTracker(),
        icon: 'ri-calendar-check-line',
        matchPrefix: '/project',
        exact: true,
      },
      {
        key: 'projectTrackerMyReports',
        label: 'My Reports',
        to: routes.projectTrackerMyReports(),
        icon: 'ri-bar-chart-line',
        matchPrefix: '/project/my-reports',
      },
    ]

    if (isAdmin) {
      items.push(
        {
          key: 'projectTrackerReports',
          label: 'Team Reports',
          to: routes.projectTrackerReports(),
          icon: 'ri-bar-chart-box-line',
          matchPrefix: '/project/reports',
        },
        {
          key: 'projectTrackerEmployees',
          label: 'Team Members',
          to: routes.projectTrackerEmployees(),
          icon: 'ri-group-line',
          matchPrefix: '/project/employees',
        },
        {
          key: 'projectTrackerManagement',
          label: 'Settings',
          to: routes.projectTrackerManagement(),
          icon: 'ri-settings-5-line',
          matchPrefix: '/project/management',
        }
      )
    }

    return items
  }, [isAdmin])

  const settingsItems = useMemo(() => {
    if (!currentUser?.id) return []

    return [
      {
        key: 'accountSettings',
        label: 'Account Settings',
        to: routes.accountSettings(),
        icon: 'ri-user-settings-line',
        matchPrefix: '/settings/account',
      },
      {
        key: 'changePassword',
        label: 'Change Password',
        to: routes.changePassword(),
        icon: 'ri-lock-password-line',
        matchPrefix: '/settings/change-password',
      },
    ]
  }, [currentUser?.id])

  const adminItems = useMemo(() => {
    if (!isAdmin) return []
    return [
      {
        key: 'adminPanel',
        label: 'Overview',
        to: routes.adminPanel(),
        icon: 'ri-shield-user-line',
        matchPrefix: '/admin',
        exact: true,
      },
      {
        key: 'users',
        label: 'Manage Users',
        to: routes.users(),
        icon: 'ri-group-line',
        matchPrefix: '/admin/users',
      },
      {
        key: 'adminVacationRequests',
        label: 'Vacation Requests',
        to: routes.adminVacationRequests(),
        icon: 'ri-calendar-check-line',
        matchPrefix: '/admin/vacation-requests',
      },
      {
        key: 'adminSupplyRequests',
        label: 'Manage Supply Requests',
        to: routes.adminSupplyRequests(),
        icon: 'ri-file-list-3-line',
        matchPrefix: '/admin/supply-requests',
      },
      {
        key: 'adminSupplyCategories',
        label: 'Manage Supply Categories',
        to: routes.adminSupplyCategories(),
        icon: 'ri-price-tag-3-line',
        matchPrefix: '/admin/supply-categories',
      },
      {
        key: 'adminMeetingRooms',
        label: 'Manage Meeting Rooms',
        to: routes.adminMeetingRooms(),
        icon: 'ri-building-2-line',
        matchPrefix: '/admin/meeting-rooms',
      },
      {
        key: 'diagnosticsTools',
        label: 'Diagnostics Tools',
        to: routes.adminDiagnosticsTools(),
        icon: 'ri-stethoscope-line',
        matchPrefix: '/admin/diagnostics-tools',
      },
    ]
  }, [isAdmin])

  const isItemActive = (item) => {
    const targetPath = item.matchPrefix || item.to
    if (!targetPath) return false

    if (item.exact) {
      return pathname === targetPath
    }

    return pathname.startsWith(targetPath)
  }

  const nestedNavItemClass = (isActive) =>
    `relative flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition ${
      isActive
        ? 'bg-white text-[#322e85]'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`

  const compactDropdownItemClass = (isActive) =>
    `relative flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition ${
      isActive
        ? 'bg-white text-[#322e85]'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`
  const compactTriggerClass = (isActive) =>
    `grid h-9 w-9 place-items-center rounded-lg transition ${
      isActive
        ? 'bg-gray-900 text-white'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
    }`

  const assetsActive = assetItems.some((item) => isItemActive(item))
  const resourcesActive = resourceItems.some((item) =>
    pathname.startsWith(item.to)
  )
  const settingsActive = settingsItems.some((item) => isItemActive(item))
  const adminActive = adminItems.some((item) => isItemActive(item))
  const projectsActive = pathname.startsWith('/project')
  const homeActive =
    pathname === '/' || pathname === '/me' || pathname.startsWith('/me/')

  useEffect(() => {
    if (assetsActive) {
      setAssetsOpen(true)
      setMobileAssetsOpen(true)
    }
  }, [assetsActive])

  useEffect(() => {
    if (resourcesActive) {
      setResourcesOpen(true)
      setMobileResourcesOpen(true)
    }
  }, [resourcesActive])

  useEffect(() => {
    if (projectsActive) {
      setProjectsOpen(true)
      setMobileProjectsOpen(true)
    }
  }, [projectsActive])

  useEffect(() => {
    if (settingsActive) {
      setSettingsOpen(true)
      setMobileSettingsOpen(true)
    }
  }, [settingsActive])

  useEffect(() => {
    if (adminActive) {
      setAdminOpen(true)
      setMobileAdminOpen(true)
    }
  }, [adminActive])

  useEffect(() => {
    if (homeActive) {
      setHomeOpen(true)
      setMobileHomeOpen(true)
    }
  }, [homeActive])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return
    window.localStorage.setItem(
      STORAGE_KEYS.sidebarExpanded,
      desktopExpanded ? '1' : '0'
    )
    const sidebarWidthVar = desktopExpanded
      ? 'var(--app-sidebar-width-expanded)'
      : 'var(--app-sidebar-width-minimized)'
    const shellLeftGap = desktopExpanded ? '1rem' : '0rem'
    document.documentElement.style.setProperty(
      '--app-sidebar-width',
      sidebarWidthVar
    )
    document.documentElement.style.setProperty(
      '--app-shell-left-gap',
      shellLeftGap
    )
  }, [desktopExpanded])

  useEffect(() => {
    return () => {
      if (typeof document === 'undefined') return
      document.documentElement.style.setProperty(
        '--app-sidebar-width',
        'var(--app-sidebar-width-expanded)'
      )
      document.documentElement.style.setProperty('--app-shell-left-gap', '1rem')
    }
  }, [])

  const renderCompactDropdownMenu = ({
    title,
    ariaLabel,
    iconClassName,
    isActive,
    items,
    menuWidthClass = 'w-48',
    itemIsActive = isItemActive,
  }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title={title}
          aria-label={ariaLabel}
          className={compactTriggerClass(isActive)}
        >
          <i className={`${iconClassName} text-xl`}></i>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="right"
        align="start"
        sideOffset={8}
        className={`${menuWidthClass} rounded-lg border border-gray-200 bg-white p-2 shadow-lg`}
      >
        {items.map((item) => (
          <DropdownMenuItem
            key={item.key}
            onSelect={() => navigate(item.to)}
            className={compactDropdownItemClass(itemIsActive(item))}
          >
            <i className={`${item.icon} text-sm`}></i>
            <span>{item.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm lg:hidden">
        <Link to={routes.home()} className="flex items-center gap-2">
          <img
            src="/logo.jpg"
            alt="2Creative logo"
            className="h-8 w-8 rounded-md object-cover"
            loading="lazy"
          />
          <span className="text-sm font-semibold text-gray-900">
            Productivity Tool
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="grid h-9 w-9 place-items-center rounded-lg text-gray-700 transition hover:bg-gray-100"
          aria-label="Toggle navigation menu"
        >
          <i
            className={
              mobileMenuOpen ? 'ri-close-line text-lg' : 'ri-menu-line text-lg'
            }
          ></i>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            className="absolute inset-0 bg-black/35"
            onClick={() => setMobileMenuOpen(false)}
          ></button>

          <aside className="relative ml-auto h-full w-80 max-w-[88%] bg-gradient-to-r from-[#eee] to-[#f6f6f6] p-4">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
              <p className="text-sm font-semibold text-gray-900">Main Menu</p>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-gray-600 transition hover:bg-gray-100"
                aria-label="Close menu"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>

            <div className="h-[calc(100%-2.5rem)] overflow-y-auto">
              <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Workspace
              </p>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setMobileHomeOpen((open) => !open)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                    homeActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <i className="ri-home-4-line text-base"></i>
                  <span className="flex-1">Dashboard</span>
                  <i
                    className={`ri-arrow-down-s-line text-base transition-transform ${
                      mobileHomeOpen ? 'rotate-180' : ''
                    }`}
                  ></i>
                </button>

                {mobileHomeOpen && (
                  <div className="mt-1 space-y-1 pl-7">
                    {homeItems.map((homeItem) => (
                      <Link
                        key={homeItem.key}
                        to={homeItem.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`${nestedNavItemClass(
                          isItemActive(homeItem)
                        )} w-full text-left`}
                      >
                        <i className={`${homeItem.icon} text-sm`}></i>
                        <span>{homeItem.label}</span>
                      </Link>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setMobileAssetsOpen((open) => !open)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                    assetsActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <i className="ri-folder-chart-line text-base"></i>
                  <span className="flex-1">Assets</span>
                  <i
                    className={`ri-arrow-down-s-line text-base transition-transform ${
                      mobileAssetsOpen ? 'rotate-180' : ''
                    }`}
                  ></i>
                </button>

                {mobileAssetsOpen && (
                  <div className="mt-1 space-y-1 pl-7">
                    {assetItems.map((item) => (
                      <Link
                        key={item.key}
                        to={item.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={nestedNavItemClass(isItemActive(item))}
                      >
                        <i className={`${item.icon} text-sm`}></i>
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setMobileResourcesOpen((open) => !open)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                    resourcesActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <i className="ri-stack-line text-base"></i>
                  <span className="flex-1">Resources</span>
                  <i
                    className={`ri-arrow-down-s-line text-base transition-transform ${
                      mobileResourcesOpen ? 'rotate-180' : ''
                    }`}
                  ></i>
                </button>

                {mobileResourcesOpen && (
                  <div className="mt-1 space-y-1 pl-7">
                    {resourceItems.map((item) => (
                      <Link
                        key={item.key}
                        to={item.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={nestedNavItemClass(
                          pathname.startsWith(item.to)
                        )}
                      >
                        <i className={`${item.icon} text-sm`}></i>
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setMobileProjectsOpen((open) => !open)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                    projectsActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <i className="ri-briefcase-4-line text-base"></i>
                  <span className="flex-1">Projects</span>
                  <i
                    className={`ri-arrow-down-s-line text-base transition-transform ${
                      mobileProjectsOpen ? 'rotate-180' : ''
                    }`}
                  ></i>
                </button>

                {mobileProjectsOpen && (
                  <div className="mt-1 space-y-1 pl-7">
                    {projectItems.map((item) => (
                      <Link
                        key={item.key}
                        to={item.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={nestedNavItemClass(isItemActive(item))}
                      >
                        <i className={`${item.icon} text-sm`}></i>
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {isAdmin && (
                <div className="mt-6">
                  <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Admin
                  </p>
                  <button
                    type="button"
                    onClick={() => setMobileAdminOpen((open) => !open)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                      adminActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <i className="ri-shield-user-line text-base"></i>
                    <span className="flex-1">Admin</span>
                    <i
                      className={`ri-arrow-down-s-line text-base transition-transform ${
                        mobileAdminOpen ? 'rotate-180' : ''
                      }`}
                    ></i>
                  </button>

                  {mobileAdminOpen && adminItems.length > 0 && (
                    <div className="mt-1 space-y-1 pl-7">
                      {adminItems.map((item) => (
                        <Link
                          key={item.key}
                          to={item.to}
                          onClick={() => setMobileMenuOpen(false)}
                          className={nestedNavItemClass(isItemActive(item))}
                        >
                          <i className={`${item.icon} text-sm`}></i>
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6">
                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Settings
                </p>
                <button
                  type="button"
                  onClick={() => setMobileSettingsOpen((open) => !open)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                    settingsActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <i className="ri-settings-3-line text-base"></i>
                  <span className="flex-1">Settings</span>
                  <i
                    className={`ri-arrow-down-s-line text-base transition-transform ${
                      mobileSettingsOpen ? 'rotate-180' : ''
                    }`}
                  ></i>
                </button>

                {mobileSettingsOpen && settingsItems.length > 0 && (
                  <div className="mt-1 space-y-1 pl-7">
                    {settingsItems.map((item) => (
                      <Link
                        key={item.key}
                        to={item.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={nestedNavItemClass(isItemActive(item))}
                      >
                        <i className={`${item.icon} text-sm`}></i>
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 border-t border-gray-100 pt-4">
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                    {(currentUser?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {currentUser?.name || 'User'}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {currentUser?.email || 'No email'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={logOut}
                  className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                >
                  <i className="ri-logout-circle-line text-sm"></i>
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      <aside
        className="fixed left-0 top-0 z-40 hidden h-screen overflow-visible bg-gradient-to-r from-[#eee] to-[#f6f6f6] lg:flex"
        style={{ width: 'var(--app-sidebar-width)' }}
      >
        <div className="flex w-full flex-col p-3 pb-8">
          <div
            className={`mb-4 flex items-center border-b border-gray-100 pb-4 ${
              desktopExpanded ? 'justify-between gap-2' : 'justify-center'
            }`}
          >
            <div
              className={`flex min-w-0 items-center ${
                desktopExpanded ? 'gap-3' : 'justify-center'
              }`}
            >
              <div className="group/logo relative h-8 w-8 shrink-0">
                <Link
                  to={routes.home()}
                  className="block h-8 w-8 rounded-md"
                  title="2Creative Productivity Tool"
                >
                  <img
                    src="/logo.jpg"
                    alt="2Creative logo"
                    className="h-8 w-8 rounded-md object-cover"
                    loading="lazy"
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => setDesktopExpanded((open) => !open)}
                  className="pointer-events-none absolute inset-0 hidden place-items-center rounded-md bg-white text-[#7c3aed] group-hover/logo:pointer-events-auto group-hover/logo:grid"
                  aria-label={
                    desktopExpanded ? 'Collapse sidebar' : 'Expand sidebar'
                  }
                  title={
                    desktopExpanded ? 'Collapse sidebar' : 'Expand sidebar'
                  }
                >
                  <i
                    className={`text-base ${
                      desktopExpanded
                        ? 'ri-sidebar-fold-line'
                        : 'ri-sidebar-unfold-line'
                    }`}
                  ></i>
                </button>
              </div>

              {desktopExpanded && (
                <Link to={routes.home()} className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    Productivity Tool
                  </p>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Main Menu
                  </p>
                </Link>
              )}
            </div>
          </div>

          <div className="relative flex-1 overflow-visible">
            <div
              className={`absolute inset-0 flex flex-col transition-opacity duration-200 ${
                desktopExpanded
                  ? 'pointer-events-auto opacity-100'
                  : 'pointer-events-none opacity-0'
              }`}
              style={{ overflow: desktopExpanded ? 'hidden' : 'visible' }}
            >
              <div className="flex-1 overflow-y-auto">
                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Workspace
                </p>

                <div className="space-y-1">
                  <div>
                    <button
                      type="button"
                      onClick={() => setHomeOpen((open) => !open)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                        homeActive
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <i className="ri-home-4-line text-base"></i>
                      <span className="flex-1">Dashboard</span>
                      <i
                        className={`ri-arrow-down-s-line text-base transition-transform ${
                          homeOpen ? 'rotate-180' : ''
                        }`}
                      ></i>
                    </button>

                    {homeOpen && (
                      <div className="mt-1 space-y-1 pl-7">
                        {homeItems.map((homeItem) => (
                          <Link
                            key={homeItem.key}
                            to={homeItem.to}
                            className={`${nestedNavItemClass(
                              isItemActive(homeItem)
                            )} w-full text-left`}
                          >
                            <i className={`${homeItem.icon} text-sm`}></i>
                            <span>{homeItem.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setAssetsOpen((open) => !open)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                      assetsActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <i className="ri-folder-chart-line text-base"></i>
                    <span className="flex-1">Assets</span>
                    <i
                      className={`ri-arrow-down-s-line text-base transition-transform ${
                        assetsOpen ? 'rotate-180' : ''
                      }`}
                    ></i>
                  </button>

                  {assetsOpen && assetItems.length > 0 && (
                    <div className="mt-1 space-y-1 pl-7">
                      {assetItems.map((item) => (
                        <Link
                          key={item.key}
                          to={item.to}
                          className={nestedNavItemClass(isItemActive(item))}
                        >
                          <i className={`${item.icon} text-sm`}></i>
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setResourcesOpen((open) => !open)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                      resourcesActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <i className="ri-stack-line text-base"></i>
                    <span className="flex-1">Resources</span>
                    <i
                      className={`ri-arrow-down-s-line text-base transition-transform ${
                        resourcesOpen ? 'rotate-180' : ''
                      }`}
                    ></i>
                  </button>

                  {resourcesOpen && (
                    <div className="space-y-1 pl-7">
                      {resourceItems.map((item) => (
                        <Link
                          key={item.key}
                          to={item.to}
                          className={nestedNavItemClass(
                            pathname.startsWith(item.to)
                          )}
                        >
                          <i className={`${item.icon} text-sm`}></i>
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setProjectsOpen((open) => !open)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                      projectsActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <i className="ri-briefcase-4-line text-base"></i>
                    <span className="flex-1">Projects</span>
                    <i
                      className={`ri-arrow-down-s-line text-base transition-transform ${
                        projectsOpen ? 'rotate-180' : ''
                      }`}
                    ></i>
                  </button>

                  {projectsOpen && projectItems.length > 0 && (
                    <div className="mt-1 space-y-1 pl-7">
                      {projectItems.map((item) => (
                        <Link
                          key={item.key}
                          to={item.to}
                          className={nestedNavItemClass(isItemActive(item))}
                        >
                          <i className={`${item.icon} text-sm`}></i>
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <div className="mt-6">
                    <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Admin
                    </p>
                    <button
                      type="button"
                      onClick={() => setAdminOpen((open) => !open)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                        adminActive
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <i className="ri-shield-user-line text-base"></i>
                      <span className="flex-1">Admin</span>
                      <i
                        className={`ri-arrow-down-s-line text-base transition-transform ${
                          adminOpen ? 'rotate-180' : ''
                        }`}
                      ></i>
                    </button>

                    {adminOpen && adminItems.length > 0 && (
                      <div className="mt-1 space-y-1 pl-7">
                        {adminItems.map((item) => (
                          <Link
                            key={item.key}
                            to={item.to}
                            className={nestedNavItemClass(isItemActive(item))}
                          >
                            <i className={`${item.icon} text-sm`}></i>
                            <span>{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-6">
                  <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Settings
                  </p>
                  <button
                    type="button"
                    onClick={() => setSettingsOpen((open) => !open)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                      settingsActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <i className="ri-settings-3-line text-base"></i>
                    <span className="flex-1">Settings</span>
                    <i
                      className={`ri-arrow-down-s-line text-base transition-transform ${
                        settingsOpen ? 'rotate-180' : ''
                      }`}
                    ></i>
                  </button>

                  {settingsOpen && settingsItems.length > 0 && (
                    <div className="mt-1 space-y-1 pl-7">
                      {settingsItems.map((item) => (
                        <Link
                          key={item.key}
                          to={item.to}
                          className={nestedNavItemClass(isItemActive(item))}
                        >
                          <i className={`${item.icon} text-sm`}></i>
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 border-t border-gray-100 pt-4">
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                    {(currentUser?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {currentUser?.name || 'User'}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {currentUser?.email || 'No email'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={logOut}
                  className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                >
                  <i className="ri-logout-circle-line text-sm"></i>
                  <span>Sign out</span>
                </button>
              </div>
            </div>

            <div
              className={`absolute inset-0 flex flex-col items-center justify-between pb-2 transition-opacity duration-200 ${
                desktopExpanded
                  ? 'pointer-events-none opacity-0'
                  : 'pointer-events-auto opacity-100'
              }`}
            >
              <div className="flex w-full flex-1 flex-col items-center gap-2">
                {renderCompactDropdownMenu({
                  title: 'Dashboard',
                  ariaLabel: 'Dashboard menu',
                  iconClassName: 'ri-home-4-line',
                  isActive: homeActive,
                  items: homeItems,
                })}

                {renderCompactDropdownMenu({
                  title: 'Assets',
                  ariaLabel: 'Assets menu',
                  iconClassName: 'ri-folder-chart-line',
                  isActive: assetsActive,
                  items: assetItems,
                  menuWidthClass: 'w-56',
                })}

                {renderCompactDropdownMenu({
                  title: 'Resources',
                  ariaLabel: 'Resources menu',
                  iconClassName: 'ri-stack-line',
                  isActive: resourcesActive,
                  items: resourceItems,
                  itemIsActive: (item) => pathname.startsWith(item.to),
                })}

                {renderCompactDropdownMenu({
                  title: 'Projects',
                  ariaLabel: 'Projects menu',
                  iconClassName: 'ri-briefcase-4-line',
                  isActive: projectsActive,
                  items: projectItems,
                  menuWidthClass: 'w-56',
                })}

                <div className="my-2 h-px w-8 bg-gray-200"></div>

                {isAdmin &&
                  renderCompactDropdownMenu({
                    title: 'Admin',
                    ariaLabel: 'Admin menu',
                    iconClassName: 'ri-shield-user-line',
                    isActive: adminActive,
                    items: adminItems,
                    menuWidthClass: 'w-56',
                  })}

                {settingsItems.length > 0 &&
                  renderCompactDropdownMenu({
                    title: 'Settings',
                    ariaLabel: 'Settings menu',
                    iconClassName: 'ri-settings-3-line',
                    isActive: settingsActive,
                    items: settingsItems,
                  })}
              </div>

              <div className="flex flex-col items-center gap-2 border-t border-gray-100 pt-3">
                <button
                  type="button"
                  onClick={logOut}
                  title="Sign out"
                  className="grid h-9 w-9 place-items-center rounded-lg text-red-600 transition hover:bg-red-50"
                >
                  <i className="ri-logout-circle-line text-xl"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default AppSidebar
