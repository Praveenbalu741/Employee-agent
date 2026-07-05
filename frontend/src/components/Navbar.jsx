/**
 * components/Navbar.jsx — Top navigation bar for authenticated pages
 */

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// SVG "listening wave" mascot icon
const WaveIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="15" stroke="#F4A261" strokeWidth="1.5" opacity="0.3"/>
    <path d="M10 16 Q13 10 16 16 Q19 22 22 16" stroke="#F4A261" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M7  16 Q11 7  16 16 Q21 25 25 16" stroke="#2EC4B6" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
    <circle cx="16" cy="16" r="2" fill="#F4A261"/>
  </svg>
);

const navLinks = {
  manager: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Feedback',  href: '/feedback-list' },
    { label: 'Settings',  href: '/settings' },
  ],
  employee: [
    { label: 'Share Feedback', href: '/chat' },
  ],
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const location         = useLocation();
  const navigate         = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const links = user ? (navLinks[user.role] || []) : [];

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0,   opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50"
      aria-label="Main navigation"
    >
      <div className="glass-card rounded-none border-x-0 border-t-0 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="Employee Feedback Agent home">
            <WaveIcon />
            <span className="font-heading font-bold text-lg text-gradient-amber">
              EchoAgent
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1" role="menubar">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                role="menuitem"
                className={`px-4 py-2 rounded-xl text-sm font-medium font-body transition-all duration-200 ${
                  location.pathname === link.href
                    ? 'bg-teal-400/10 text-teal-400 border border-teal-400/20'
                    : 'text-slate-300 hover:text-teal-400 hover:bg-teal-400/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User section */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-medium text-slate-100 font-heading">{user.name}</span>
                  <span className={`text-xs capitalize px-2 py-0.5 rounded-full font-body ${
                    user.role === 'manager'
                      ? 'text-amber-400 bg-amber-400/10'
                      : 'text-teal-400 bg-teal-400/10'
                  }`}>{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-outline text-sm px-3 py-1.5"
                  aria-label="Log out"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-amber text-sm px-4 py-2">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
