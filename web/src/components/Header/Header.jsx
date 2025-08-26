import React, { useState, useRef, useEffect } from 'react'

import { Link, routes } from '@redwoodjs/router'
import { useMutation, gql } from '@redwoodjs/web'

import { useAuth } from 'src/auth'

const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($id: Int!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      email
    }
  }
`

const Header = ({ isAdmin, showQuickAccess = false }) => {
  const { isAuthenticated, currentUser, logOut, hasRole } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [resourcesDropdownOpen, setResourcesDropdownOpen] = useState(false)
  const userMenuRef = useRef(null)
  const resourcesDropdownRef = useRef(null)

  // Modal state for updating personal info
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')

  // Modal state for changing password
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
      if (
        resourcesDropdownRef.current &&
        !resourcesDropdownRef.current.contains(event.target)
      ) {
        setResourcesDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Scroll to section by id
  const handleScroll = (id) => (e) => {
    e.preventDefault()
    const section = document.getElementById(id)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const [updateUser] = useMutation(UPDATE_USER_MUTATION)

  // Handle profile update submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileError('')
    setProfileSuccess('')
    try {
      await updateUser({
        variables: {
          id: currentUser.id,
          input: {
            name: profileForm.name,
            email: profileForm.email,
          },
        },
      })
      setProfileSuccess('Profile updated!')
      setTimeout(() => {
        setShowProfileModal(false)
        window.location.reload() // Refresh the page after closing the modal
      }, 1000)
    } catch (err) {
      setProfileError('Failed to update profile.')
    } finally {
      setProfileLoading(false)
    }
  }

  return (
    <>
      {/* Profile Update Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <button
              className="absolute right-3 top-2 text-2xl text-gray-400 hover:text-gray-700"
              onClick={() => setShowProfileModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="mb-4 text-lg font-bold">Update Personal Info</h2>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full rounded border px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm((f) => ({ ...f, email: e.target.value }))
                  }
                  className="w-full rounded border px-3 py-2"
                  required
                />
              </div>
              {profileError && (
                <div className="text-red-600">{profileError}</div>
              )}
              {profileSuccess && (
                <div className="text-green-600">{profileSuccess}</div>
              )}
              <button
                type="submit"
                className="w-full rounded bg-orange-500 py-2 font-semibold text-white transition hover:bg-orange-600"
                disabled={profileLoading}
              >
                {profileLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      <header className="fixed left-0 right-0 top-0 z-50 bg-white shadow-lg">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo and Home */}
          <div className="flex items-center gap-6">
            <Link
              to={routes.home()}
              className="flex items-center gap-3 transition-opacity hover:opacity-80"
            >
              <img
                src="/logo.jpg"
                className="h-10 w-40 rounded-full object-cover"
                alt="2Creative Logo"
                loading="lazy"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Productivity Tool
                </h1>
                <p className="text-xs text-gray-500">2Creative Solutions</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center space-x-8 md:flex">
            <Link
              to={routes.home()}
              className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-gray-700 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600"
            >
              <i className="ri-home-4-line text-lg"></i>
              <span>Home</span>
            </Link>

            {/* Resources */}
            <div className="relative" ref={resourcesDropdownRef}>
              <button
                onClick={() => setResourcesDropdownOpen(!resourcesDropdownOpen)}
                className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-gray-700 transition-all duration-200 hover:bg-purple-50 hover:text-purple-600"
              >
                <i className="ri-stack-line text-lg"></i>
                <span>Resources</span>
                <i
                  className={`ri-arrow-down-s-line text-sm transition-transform duration-200 ${resourcesDropdownOpen ? 'rotate-180' : ''}`}
                ></i>
              </button>
              {resourcesDropdownOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-48 rounded-xl border border-gray-200 bg-white py-2 shadow-xl">
                  <Link
                    to={routes.assetTracker()}
                    onClick={() => setResourcesDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 transition-colors duration-200 hover:bg-purple-50 hover:text-purple-600"
                  >
                    <i className="ri-computer-line text-lg"></i>
                    <span>Assets</span>
                  </Link>
                  <Link
                    to={routes.officeSupplies()}
                    onClick={() => setResourcesDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 transition-colors duration-200 hover:bg-purple-50 hover:text-purple-600"
                  >
                    <i className="ri-archive-line text-lg"></i>
                    <span>Supplies</span>
                  </Link>
                  <Link
                    to={routes.supplyRequests()}
                    onClick={() => setResourcesDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 transition-colors duration-200 hover:bg-purple-50 hover:text-purple-600"
                  >
                    <i className="ri-shopping-cart-line text-lg"></i>
                    <span>Supply Requests</span>
                  </Link>
                </div>
              )}
            </div>

            <Link
              to={routes.projectTracker()}
              className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-gray-700 transition-all duration-200 hover:bg-orange-50 hover:text-orange-600"
            >
              <i className="ri-project-line text-lg"></i>
              <span>Projects</span>
            </Link>

            {hasRole && hasRole('ADMIN') && (
              <Link
                to={routes.adminPanel()}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-medium text-white shadow-md transition-all duration-200 hover:bg-red-700"
              >
                <i className="ri-admin-line text-lg"></i>
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* Desktop Auth/User Section */}
          <div className="relative hidden items-center gap-4 md:flex">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((open) => !open)}
                  className="flex items-center gap-3 rounded-lg bg-gray-100 px-4 py-2 transition-all duration-200 hover:bg-gray-200"
                  aria-label="Account"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                    <span className="text-sm font-bold text-white">
                      {currentUser?.name
                        ? currentUser.name.charAt(0).toUpperCase()
                        : '�'}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-800">
                      {currentUser?.name || 'User'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {hasRole && hasRole('ADMIN') ? 'Admin' : 'Employee'}
                    </div>
                  </div>
                  <i className="ri-arrow-down-s-line text-gray-400"></i>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-gray-200 bg-white shadow-xl">
                    <div className="border-b border-gray-100 px-4 py-3">
                      <div className="mb-1 text-xs text-gray-500">
                        Signed in as
                      </div>
                      <div className="truncate font-semibold text-gray-800">
                        {currentUser.email}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false)
                        setShowProfileModal(true)
                        setProfileForm({
                          name: currentUser?.name || '',
                          email: currentUser?.email || '',
                        })
                      }}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                      <i className="ri-user-settings-line"></i>
                      Update Profile
                    </button>
                    <button
                      type="button"
                      onClick={logOut}
                      className="flex w-full items-center gap-2 rounded-b-xl px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
                    >
                      <i className="ri-logout-circle-line"></i>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to={routes.login()}
                className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button - Hamburger Style */}
          <button
            className="group z-50 flex flex-col items-center justify-center rounded-lg p-3 transition-colors hover:bg-gray-100 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <div className="relative h-5 w-6">
              {/* Top line */}
              <span
                className={`absolute block h-0.5 w-6 transform bg-gray-700 transition-all duration-300 ${
                  mobileMenuOpen ? 'translate-y-2 rotate-45' : 'translate-y-0'
                }`}
              ></span>

              {/* Middle line */}
              <span
                className={`absolute block h-0.5 w-6 translate-y-2 transform bg-gray-700 transition-all duration-300 ${
                  mobileMenuOpen ? 'opacity-0' : 'opacity-100'
                }`}
              ></span>

              {/* Bottom line */}
              <span
                className={`absolute block h-0.5 w-6 transform bg-gray-700 transition-all duration-300 ${
                  mobileMenuOpen ? 'translate-y-2 -rotate-45' : 'translate-y-4'
                }`}
              ></span>
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="absolute left-0 right-0 top-full z-40 border-t border-blue-200 bg-gradient-to-br from-blue-50 via-white to-purple-50 shadow-xl backdrop-blur-md md:hidden">
            <div className="space-y-2 px-4 py-4">
              <Link
                to={routes.home()}
                className="group flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-white/70 hover:text-blue-600 hover:shadow-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 shadow-sm transition-all group-hover:from-blue-500 group-hover:to-blue-700">
                  <i className="ri-home-4-line text-lg text-white"></i>
                </div>
                <span>Home</span>
              </Link>

              <div className="space-y-2">
                <div className="flex items-center gap-3 rounded-xl bg-white/30 px-4 py-2 backdrop-blur-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-purple-400 to-purple-600 shadow-sm">
                    <i className="ri-stack-line text-lg text-white"></i>
                  </div>
                  <span className="font-semibold text-gray-800">Resources</span>
                </div>
                <div className="ml-14 space-y-1">
                  <Link
                    to={routes.assetTracker()}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 transition-all duration-200 hover:bg-white/60 hover:text-purple-600 hover:shadow-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <i className="ri-computer-line text-lg"></i>
                    <span>Assets</span>
                  </Link>
                  <Link
                    to={routes.officeSupplies()}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 transition-all duration-200 hover:bg-white/60 hover:text-purple-600 hover:shadow-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <i className="ri-archive-line text-lg"></i>
                    <span>Supplies</span>
                  </Link>
                  <Link
                    to={routes.supplyRequests()}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 transition-all duration-200 hover:bg-white/60 hover:text-purple-600 hover:shadow-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <i className="ri-shopping-cart-line text-lg"></i>
                    <span>Supply Requests</span>
                  </Link>
                </div>
              </div>

              <Link
                to={routes.projectTracker()}
                className="group flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-white/70 hover:text-orange-600 hover:shadow-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-orange-400 to-orange-600 shadow-sm transition-all group-hover:from-orange-500 group-hover:to-orange-700">
                  <i className="ri-project-line text-lg text-white"></i>
                </div>
                <span>Projects</span>
              </Link>

              {hasRole && hasRole('ADMIN') && (
                <Link
                  to={routes.adminPanel()}
                  className="group flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-white/70 hover:text-red-600 hover:shadow-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-red-400 to-red-600 shadow-sm transition-all group-hover:from-red-500 group-hover:to-red-700">
                    <i className="ri-admin-line text-lg text-white"></i>
                  </div>
                  <span>Admin Panel</span>
                </Link>
              )}

              {/* Mobile User Profile Section */}
              {isAuthenticated ? (
                <div className="mt-4 border-t border-white/30 pt-4">
                  <div className="mb-3 rounded-xl border border-white/40 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-3 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-md">
                        <span className="text-lg font-bold text-white">
                          {currentUser?.name
                            ? currentUser.name.charAt(0).toUpperCase()
                            : 'U'}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">
                          {currentUser?.name || 'User'}
                        </div>
                        <div className="text-xs text-gray-600">
                          {hasRole && hasRole('ADMIN') ? 'Admin' : 'Employee'}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {currentUser?.email}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        setShowProfileModal(true)
                        setProfileForm({
                          name: currentUser?.name || '',
                          email: currentUser?.email || '',
                        })
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-gray-700 transition-all duration-200 hover:bg-white/60 hover:shadow-sm"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-gray-400 to-gray-600 shadow-sm">
                        <i className="ri-user-settings-line text-lg text-white"></i>
                      </div>
                      <span>Update Profile</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        logOut()
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-gray-700 transition-all duration-200 hover:bg-white/60 hover:shadow-sm"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-red-400 to-red-600 shadow-sm">
                        <i className="ri-logout-circle-line text-lg text-white"></i>
                      </div>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 border-t border-white/30 pt-4">
                  <Link
                    to={routes.login()}
                    className="mx-4 flex transform items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-medium text-white shadow-md transition-all duration-200 hover:scale-105 hover:from-blue-600 hover:to-purple-700 hover:shadow-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <i className="ri-login-circle-line text-lg"></i>
                    <span>Sign In</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Access Tab Bar - Only on Dashboard */}
        {showQuickAccess && (
          <div className="border-t border-gray-200 bg-gray-50">
            <div className="flex overflow-x-auto">
              <a
                href="#bookings-section"
                onClick={handleScroll('bookings-section')}
                className="flex-shrink-0 border-b-2 border-transparent px-6 py-3 text-center text-sm font-medium text-gray-600 transition-all duration-200 hover:border-blue-600 hover:bg-white hover:text-blue-600"
              >
                <div className="flex items-center gap-2">
                  <i className="ri-calendar-line"></i>
                  <span>Bookings</span>
                </div>
              </a>
              <a
                href="#attendance-section"
                onClick={handleScroll('attendance-section')}
                className="flex-shrink-0 border-b-2 border-transparent px-6 py-3 text-center text-sm font-medium text-gray-600 transition-all duration-200 hover:border-green-600 hover:bg-white hover:text-green-600"
              >
                <div className="flex items-center gap-2">
                  <i className="ri-time-line"></i>
                  <span>Attendance</span>
                </div>
              </a>
              <a
                href="#vacation-section"
                onClick={handleScroll('vacation-section')}
                className="flex-shrink-0 border-b-2 border-transparent px-6 py-3 text-center text-sm font-medium text-gray-600 transition-all duration-200 hover:border-purple-600 hover:bg-white hover:text-purple-600"
              >
                <div className="flex items-center gap-2">
                  <i className="ri-calendar-event-line"></i>
                  <span>Vacation</span>
                </div>
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  )
}

export default Header
