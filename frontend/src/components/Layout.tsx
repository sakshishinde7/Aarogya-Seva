import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Heart,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Users,
  Syringe,
  FileText,
  CalendarCheck,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

const publicNavLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/services', label: 'Healthcare Services' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/mission', label: 'Our Mission' },
];

const staffNavLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/patients', label: 'Patients', icon: Users },
  { to: '/vaccinations', label: 'Vaccinations', icon: Syringe },
  { to: '/diseases', label: 'Disease Records', icon: ShieldCheck },
  { to: '/followups', label: 'Follow-ups', icon: CalendarCheck },
  { to: '/reports', label: 'Reports', icon: FileText },
];

export default function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [staffDropdownOpen, setStaffDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const isStaffArea = user && ['/dashboard', '/patients', '/vaccinations', '/diseases', '/followups', '/reports'].some(
    (p) => location.pathname.startsWith(p),
  );

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-primary-text">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border-subtle shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-sage rounded-lg flex items-center justify-center group-hover:bg-sage-dark transition-colors">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-primary-text tracking-tight">
                Aarogya Seva
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {publicNavLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? 'bg-mint text-primary-text'
                      : 'text-secondary-text hover:bg-mint-light hover:text-primary-text'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {user ? (
                <div className="relative ml-2">
                  <button
                    onClick={() => setStaffDropdownOpen(!staffDropdownOpen)}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-sage text-white hover:bg-sage-dark transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Staff Portal
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {staffDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setStaffDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-border-subtle py-2 z-20">
                        <div className="px-4 py-2 border-b border-border-subtle">
                          <p className="text-sm font-medium text-primary-text truncate">
                            {user.full_name}
                          </p>
                          <p className="text-xs text-secondary-text truncate">
                            {user.email}
                          </p>
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-lavender text-primary-text capitalize">
                            {user.role}
                          </span>
                        </div>
                        {staffNavLinks.map((link) => (
                          <Link
                            key={link.to}
                            to={link.to}
                            onClick={() => setStaffDropdownOpen(false)}
                            className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                              isActive(link.to)
                                ? 'bg-mint-light text-primary-text font-medium'
                                : 'text-secondary-text hover:bg-ivory hover:text-primary-text'
                            }`}
                          >
                            <link.icon className="w-4 h-4" />
                            {link.label}
                          </Link>
                        ))}
                        <div className="border-t border-border-subtle mt-1 pt-1">
                          <button
                            onClick={() => {
                              setStaffDropdownOpen(false);
                              handleLogout();
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="ml-2 px-4 py-2 rounded-lg text-sm font-medium bg-sage text-white hover:bg-sage-dark transition-colors"
                >
                  Staff Login
                </Link>
              )}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-mint-light transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border-subtle py-3 space-y-1">
              {publicNavLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? 'bg-mint text-primary-text'
                      : 'text-secondary-text hover:bg-mint-light'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <div className="border-t border-border-subtle pt-2 mt-2">
                    <p className="px-3 py-1 text-xs font-semibold text-secondary-text uppercase tracking-wide">
                      Staff Portal
                    </p>
                  </div>
                  {staffNavLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive(link.to)
                          ? 'bg-mint text-primary-text'
                          : 'text-secondary-text hover:bg-mint-light'
                      }`}
                    >
                      <link.icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium bg-sage text-white text-center hover:bg-sage-dark transition-colors"
                >
                  Staff Login
                </Link>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Secondary Staff Navigation Bar (visible when in staff area) */}
      {isStaffArea && (
        <div className="bg-white border-b border-border-subtle hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 h-11 overflow-x-auto">
              {staffNavLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                    location.pathname.startsWith(link.to)
                      ? 'bg-sage text-white'
                      : 'text-secondary-text hover:bg-mint-light hover:text-primary-text'
                  }`}
                >
                  <link.icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary-text text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-sage rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold">Aarogya Seva</span>
              </div>
              <p className="text-sm text-gray-300 max-w-md">
                Connected Healthcare. Healthier Communities. A demonstration
                platform for coordinating rural healthcare records and
                workflows.
              </p>
              <p className="text-xs text-gray-400 mt-3">
                This is a prototype for demonstration purposes only. Not a
                certified clinical system. Uses fictional patient data.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-200">
                Quick Links
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="hover:text-white transition-colors">
                    Services
                  </Link>
                </li>
                <li>
                  <Link to="/how-it-works" className="hover:text-white transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link to="/mission" className="hover:text-white transition-colors">
                    Our Mission
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-200">
                For Staff
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Staff Login
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-white transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/patients" className="hover:text-white transition-colors">
                    Patient Registry
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-xs text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} Aarogya Seva &mdash; Seva First
              Innovation Challenge, Maharashtra. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
