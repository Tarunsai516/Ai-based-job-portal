import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';
import { HiMenu, HiX, HiBell, HiUser, HiChevronDown, HiLogout, HiCog } from 'react-icons/hi';
import { AnimatePresence, motion } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      notificationService.getByRole(user.role)
        .then((data) => setNotifications(data))
        .catch((err) => console.error(err));
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const markAllRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.read);
      await Promise.all(unread.map(n => notificationService.markAsRead(n.id)));
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNavLinks = () => {
    if (!user) {
      return [
        { path: '/', label: 'Home' },
        { path: '/about', label: 'About' },
        { path: '/contact', label: 'Contact' },
      ];
    }
    if (user.role === 'recruiter') {
      return [
        { path: '/recruiter', label: 'Dashboard' },
        { path: '/recruiter/post-job', label: 'Post Job' },
        { path: '/recruiter/manage-jobs', label: 'Manage Jobs' },
        { path: '/recruiter/applicants', label: 'Applicants' },
        { path: '/recruiter/analytics', label: 'Analytics' },
      ];
    }
    if (user.role === 'admin') {
      return [
        { path: '/admin', label: 'Dashboard' },
        { path: '/admin/users', label: 'Manage Users' },
        { path: '/admin/jobs', label: 'Manage Jobs' },
        { path: '/admin/applications', label: 'Manage Applications' },
      ];
    }
    return [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/jobs', label: 'Find Jobs' },
      { path: '/recommended-jobs', label: 'AI Recommended' },
      { path: '/applied-jobs', label: 'My Applications' },
    ];
  };

  const links = getNavLinks();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={user ? (user.role === 'admin' ? '/admin' : (user.role === 'recruiter' ? '/recruiter' : '/dashboard')) : '/'} className="flex items-center space-x-2">
              <span className="text-2xl">🚀</span>
              <span className="text-xl font-bold tracking-tight text-blue-600">
                TalentSync
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors duration-200 ${
                  location.pathname === link.path
                    ? 'text-blue-600 border-b-2 border-blue-600 py-5'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(!notifDropdownOpen);
                      setProfileDropdownOpen(false);
                    }}
                    className="p-1 text-gray-500 hover:text-blue-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <span className="sr-only">Notifications</span>
                    <HiBell className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-emerald-500 text-[10px] font-bold text-white text-center leading-4 ring-2 ring-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  <AnimatePresence>
                    {notifDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-50"
                      >
                        <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                          <span className="font-semibold text-sm text-gray-700">Notifications</span>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllRead}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
                          ) : (
                            notifications.map((n) => (
                              <div
                                key={n.id}
                                className={`p-3 border-b border-gray-50 text-xs transition-colors ${
                                  !n.read ? 'bg-blue-50/50' : ''
                                } hover:bg-gray-50`}
                              >
                                <div className="font-medium text-gray-800">{n.title}</div>
                                <div className="text-gray-600 mt-0.5">{n.message}</div>
                                <div className="text-gray-400 mt-1 text-[10px]">{n.time}</div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(!profileDropdownOpen);
                      setNotifDropdownOpen(false);
                    }}
                    className="flex items-center space-x-1 p-1 rounded-full text-gray-500 hover:text-blue-600 focus:outline-none"
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                      {user.name.charAt(0)}
                    </div>
                    <HiChevronDown className="h-4 w-4 text-gray-500" />
                  </button>

                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50"
                      >
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        {user.role === 'seeker' ? (
                          <>
                            <Link
                              to="/profile"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <HiUser className="mr-2 h-4 w-4 text-gray-400" /> Profile
                            </Link>
                            <Link
                              to="/settings"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <HiCog className="mr-2 h-4 w-4 text-gray-400" /> Settings
                            </Link>
                          </>
                        ) : user.role === 'admin' ? (
                          <>
                            <Link
                              to="/admin"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <HiUser className="mr-2 h-4 w-4 text-gray-400" /> Admin Panel
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link
                              to="/recruiter/company"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <HiUser className="mr-2 h-4 w-4 text-gray-400" /> Company Profile
                            </Link>
                            <Link
                              to="/recruiter/settings"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <HiCog className="mr-2 h-4 w-4 text-gray-400" /> Settings
                            </Link>
                          </>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-50"
                        >
                          <HiLogout className="mr-2 h-4 w-4 text-red-400" /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Burger Menu Button (Mobile) */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-500 hover:text-blue-600 hover:bg-gray-50 focus:outline-none"
              >
                {mobileMenuOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-150 bg-white"
          >
            <div className="px-2 pt-2 pb-4 space-y-1">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === link.path
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {!user && (
                <div className="pt-4 border-t border-gray-100 flex flex-col space-y-2 px-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-sm text-gray-600 font-medium hover:bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-sm bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
