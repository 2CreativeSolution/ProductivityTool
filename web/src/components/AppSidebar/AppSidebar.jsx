import React, { useEffect, useMemo, useRef, useState } from 'react'

import { Link, navigate, routes, useLocation } from '@redwoodjs/router'

import { useAuth } from 'src/auth'
import { STORAGE_KEYS } from 'src/lib/storageKeys'

const AppSidebar = ({ showQuickAccess = false }) => {
  const { pathname } = useLocation()
  const { currentUser, hasRole, logOut } = useAuth()

  const [homeOpen, setHomeOpen] = useState(showQuickAccess)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileHomeOpen, setMobileHomeOpen] = useState(showQuickAccess)
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false)
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false)
  const [mobileAdminOpen, setMobileAdminOpen] = useState(false)
  const [desktopExpanded, setDesktopExpanded] = useState(true)
  const [compactDropdown, setCompactDropdown] = useState(null)
  const [pendingHomeSection, setPendingHomeSection] = useState(null)
  const compactMenuRef = useRef(null)

  const isAdmin = Boolean(hasRole && hasRole('ADMIN'))

  const homeItems = useMemo(
    () => [
      {
        key: 'bookings',
        label: 'Bookings',
        icon: 'ri-calendar-line',
        sectionId: 'bookings-section',
      },
      {
        key: 'attendance',
        label: 'Attendance',
        icon: 'ri-time-line',
        sectionId: 'attendance-section',
      },
      {
        key: 'vacation',
        label: 'Vacation',
        icon: 'ri-calendar-event-line',
        sectionId: 'vacation-section',
      },
    ],
    []
  )

  const resourceItems = useMemo(
    () => [
      {
        key: 'assets',
        label: 'Assets',
        to: routes.assetTracker(),
        icon: 'ri-computer-line',
      },
      {
        key: 'supplies',
        label: 'Office Supplies',
        to: routes.officeSupplies(),
        icon: 'ri-archive-line',
      },
      {
        key: 'supplyRequests',
        label: 'Supply Requests',
        to: routes.supplyRequests(),
        icon: 'ri-shopping-cart-line',
      },
    ],
    []
  )

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

  const resourcesActive = resourceItems.some((item) =>
    pathname.startsWith(item.to)
  )
  const settingsActive = settingsItems.some((item) => isItemActive(item))
  const adminActive = adminItems.some((item) => isItemActive(item))
  const projectsActive = pathname.startsWith('/project-tracker')
  const homeActive = pathname === '/'

  useEffect(() => {
    if (resourcesActive) {
      setResourcesOpen(true)
      setMobileResourcesOpen(true)
    }
  }, [resourcesActive])

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
    if (pathname === routes.home()) {
      setHomeOpen(true)
      setMobileHomeOpen(true)
    }
  }, [pathname])

  useEffect(() => {
    if (pathname === routes.home() && pendingHomeSection) {
      const timeoutId = setTimeout(() => {
        document
          .getElementById(pendingHomeSection)
          ?.scrollIntoView({ behavior: 'smooth' })
        setPendingHomeSection(null)
      }, 120)

      return () => clearTimeout(timeoutId)
    }
  }, [pathname, pendingHomeSection])

  useEffect(() => {
    setMobileMenuOpen(false)
    setCompactDropdown(null)
  }, [pathname])

  useEffect(() => {
    if (desktopExpanded) {
      setCompactDropdown(null)
    }
  }, [desktopExpanded])

  useEffect(() => {
    if (!compactDropdown) return

    const handleOutsideClick = (event) => {
      if (!compactMenuRef.current?.contains(event.target)) {
        setCompactDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [compactDropdown])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const storedSidebarState = window.localStorage.getItem(
      STORAGE_KEYS.sidebarExpanded
    )
    if (storedSidebarState === '0') {
      setDesktopExpanded(false)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return
    window.localStorage.setItem(
      STORAGE_KEYS.sidebarExpanded,
      desktopExpanded ? '1' : '0'
    )
    document.documentElement.style.setProperty(
      '--app-sidebar-width',
      desktopExpanded ? '22rem' : '4.75rem'
    )
  }, [desktopExpanded])

  useEffect(() => {
    return () => {
      if (typeof document === 'undefined') return
      document.documentElement.style.setProperty('--app-sidebar-width', '22rem')
    }
  }, [])

  const handleHomeSectionClick = (sectionId, closeMobile = false) => {
    if (closeMobile) {
      setMobileMenuOpen(false)
    }

    if (pathname === routes.home()) {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
      return
    }

    setPendingHomeSection(sectionId)
    navigate(routes.home())
  }

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
                  <span className="flex-1">Home</span>
                  <i
                    className={`ri-arrow-down-s-line text-base transition-transform ${
                      mobileHomeOpen ? 'rotate-180' : ''
                    }`}
                  ></i>
                </button>

                {mobileHomeOpen && (
                  <div className="mt-1 space-y-1 pl-7">
                    {homeItems.map((homeItem) => (
                      <button
                        type="button"
                        key={homeItem.key}
                        onClick={() =>
                          handleHomeSectionClick(homeItem.sectionId, true)
                        }
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                      >
                        <i className={`${homeItem.icon} text-sm`}></i>
                        <span>{homeItem.label}</span>
                      </button>
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
                        className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition ${
                          pathname.startsWith(item.to)
                            ? 'bg-gray-100 text-black'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <i className={`${item.icon} text-sm`}></i>
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                )}

                <Link
                  to={routes.projectTracker()}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    projectsActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <i className="ri-briefcase-4-line text-base"></i>
                  <span>Projects</span>
                </Link>
              </div>

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
                        className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition ${
                          isItemActive(item)
                            ? 'bg-gray-100 text-black'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
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
                          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition ${
                            isItemActive(item)
                              ? 'bg-gray-100 text-black'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <i className={`${item.icon} text-sm`}></i>
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

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
        className={`fixed left-0 top-0 z-40 hidden h-screen overflow-visible bg-gradient-to-r from-[#eee] to-[#f6f6f6] lg:flex ${
          desktopExpanded ? 'w-[22rem]' : 'w-[4.75rem]'
        }`}
      >
        <div className="flex w-full flex-col p-3">
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
                      <span className="flex-1">Home</span>
                      <i
                        className={`ri-arrow-down-s-line text-base transition-transform ${
                          homeOpen ? 'rotate-180' : ''
                        }`}
                      ></i>
                    </button>

                    {homeOpen && (
                      <div className="mt-1 space-y-1 pl-7">
                        {homeItems.map((homeItem) => (
                          <button
                            type="button"
                            key={homeItem.key}
                            onClick={() =>
                              handleHomeSectionClick(homeItem.sectionId)
                            }
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                          >
                            <i className={`${homeItem.icon} text-sm`}></i>
                            <span>{homeItem.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

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
                          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition ${
                            pathname.startsWith(item.to)
                              ? 'bg-gray-100 text-black'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <i className={`${item.icon} text-sm`}></i>
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  <Link
                    to={routes.projectTracker()}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      projectsActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <i className="ri-briefcase-4-line text-base"></i>
                    <span>Projects</span>
                  </Link>
                </div>

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
                          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition ${
                            isItemActive(item)
                              ? 'bg-gray-100 text-black'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`}
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
                            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition ${
                              isItemActive(item)
                                ? 'bg-gray-100 text-black'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                          >
                            <i className={`${item.icon} text-sm`}></i>
                            <span>{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
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
              ref={compactMenuRef}
              className={`absolute inset-0 flex flex-col items-center justify-between pb-2 transition-opacity duration-200 ${
                desktopExpanded
                  ? 'pointer-events-none opacity-0'
                  : 'pointer-events-auto opacity-100'
              }`}
            >
              <div className="flex w-full flex-1 flex-col items-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    title="Home"
                    aria-label="Home menu"
                    aria-expanded={compactDropdown === 'home'}
                    onClick={() =>
                      setCompactDropdown((current) =>
                        current === 'home' ? null : 'home'
                      )
                    }
                    className={`grid h-9 w-9 place-items-center rounded-lg transition ${
                      homeActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                  >
                    <i className="ri-home-4-line text-xl"></i>
                  </button>

                  {compactDropdown === 'home' && (
                    <div className="absolute left-full top-0 ml-2 w-48 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                      <Link
                        to={routes.home()}
                        onClick={() => setCompactDropdown(null)}
                        className="mb-1 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                      >
                        <i className="ri-home-4-line text-sm"></i>
                        <span>Home</span>
                      </Link>
                      {homeItems.map((homeItem) => (
                        <button
                          type="button"
                          key={homeItem.key}
                          onClick={() => {
                            handleHomeSectionClick(homeItem.sectionId)
                            setCompactDropdown(null)
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                        >
                          <i className={`${homeItem.icon} text-sm`}></i>
                          <span>{homeItem.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    type="button"
                    title="Resources"
                    aria-label="Resources menu"
                    aria-expanded={compactDropdown === 'resources'}
                    onClick={() =>
                      setCompactDropdown((current) =>
                        current === 'resources' ? null : 'resources'
                      )
                    }
                    className={`grid h-9 w-9 place-items-center rounded-lg transition ${
                      resourcesActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                  >
                    <i className="ri-stack-line text-xl"></i>
                  </button>

                  {compactDropdown === 'resources' && (
                    <div className="absolute left-full top-0 ml-2 w-48 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                      {resourceItems.map((item) => (
                        <Link
                          key={item.key}
                          to={item.to}
                          onClick={() => setCompactDropdown(null)}
                          className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition ${
                            pathname.startsWith(item.to)
                              ? 'bg-gray-100 text-black'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <i className={`${item.icon} text-sm`}></i>
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  to={routes.projectTracker()}
                  title="Projects"
                  className={`grid h-9 w-9 place-items-center rounded-lg transition ${
                    projectsActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  <i className="ri-briefcase-4-line text-xl"></i>
                </Link>

                <div className="my-2 h-px w-8 bg-gray-200"></div>

                {settingsItems.length > 0 && (
                  <div className="relative">
                    <button
                      type="button"
                      title="Settings"
                      aria-label="Settings menu"
                      aria-expanded={compactDropdown === 'settings'}
                      onClick={() =>
                        setCompactDropdown((current) =>
                          current === 'settings' ? null : 'settings'
                        )
                      }
                      className={`grid h-9 w-9 place-items-center rounded-lg transition ${
                        settingsActive
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                      }`}
                    >
                      <i className="ri-settings-3-line text-xl"></i>
                    </button>

                    {compactDropdown === 'settings' && (
                      <div className="absolute left-full top-0 ml-2 w-48 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                        {settingsItems.map((item) => (
                          <Link
                            key={item.key}
                            to={item.to}
                            onClick={() => setCompactDropdown(null)}
                            className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition ${
                              isItemActive(item)
                                ? 'bg-gray-100 text-black'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                          >
                            <i className={`${item.icon} text-sm`}></i>
                            <span>{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {isAdmin && (
                  <div className="relative">
                    <button
                      type="button"
                      title="Admin"
                      aria-label="Admin menu"
                      aria-expanded={compactDropdown === 'admin'}
                      onClick={() =>
                        setCompactDropdown((current) =>
                          current === 'admin' ? null : 'admin'
                        )
                      }
                      className={`grid h-9 w-9 place-items-center rounded-lg transition ${
                        adminActive
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                      }`}
                    >
                      <i className="ri-shield-user-line text-xl"></i>
                    </button>

                    {compactDropdown === 'admin' && (
                      <div className="absolute left-full top-0 ml-2 w-56 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                        {adminItems.map((item) => (
                          <Link
                            key={item.key}
                            to={item.to}
                            onClick={() => setCompactDropdown(null)}
                            className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition ${
                              isItemActive(item)
                                ? 'bg-gray-100 text-black'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                          >
                            <i className={`${item.icon} text-sm`}></i>
                            <span>{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
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
