// src/components/NavBar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { auth } from "../firebase/config";
import { signOut } from "firebase/auth";

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setMenuOpen(false);
  }, [navigate]);

  const handleSignIn = () => {
    setMenuOpen(false);
    navigate("/sign-in");
  };

  const handleSignUp = () => {
    setMenuOpen(false);
    navigate("/sign-up");
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await signOut(auth);
      navigate("/sign-in");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // When clicking Dashboard link while not logged in, redirect to sign-in
  const handleDashboardClick = () => {
    if (!user) {
      handleSignIn();
    } else {
      setMenuOpen(false);
      navigate("/dashboard");
    }
  };

  // Motion variants
  const menuVariants = {
    hidden: { opacity: 0, y: -8 },
    visible: { opacity: 1, y: 0 },
  };

  const mobilePanelVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: { when: "beforeChildren", staggerChildren: 0.04 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -6 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 group" aria-label="Home">
              <div className="w-12 h-12 rounded-lg overflow-hidden shadow-sm transform-gpu transition-transform duration-300 group-hover:scale-105">
                <img
                  src="/images/logo.jpg"
                  alt="Hospital Readmissions logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-bold text-slate-900">Hospital Readmissions</div>
                <div className="text-xs text-slate-500 -mt-0.5">Explainable ML & Dashboard</div>
              </div>
            </Link>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <AnimatedNavLink to="/" label="Home" />
            <AnimatedNavLink to="/about" label="About" />
            {/* Dashboard link always visible */}
            <motion.div
              whileHover={!reduceMotion ? { scale: 1.1, color: "#4f46e5" } : {}}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              onClick={handleDashboardClick}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleDashboardClick();
                }
              }}
              role="link"
              aria-label="Dashboard"
            >
              Dashboard
            </motion.div>
          </div>

          {/* Right actions (desktop) */}
          <div className="hidden md:flex md:items-center md:gap-3">
            {!loading && user ? (
              <>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  whileHover={!reduceMotion ? { scale: 1.02 } : {}}
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-200"
                >
                  Logout
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  whileHover={!reduceMotion ? { scale: 1.02 } : {}}
                  onClick={handleSignIn}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-200"
                >
                  Sign In
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  whileHover={!reduceMotion ? { scale: 1.02 } : {}}
                  onClick={handleSignUp}
                  className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-200"
                >
                  Sign Up
                </motion.button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center">
            <motion.button
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((s) => !s)}
              whileTap={{ scale: 0.95 }}
              whileHover={!reduceMotion ? { scale: 1.03 } : {}}
              className="p-2 rounded-md text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-200"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <motion.path
                  animate={menuOpen ? { d: "M6 18L18 6M6 6l12 12" } : { d: "M4 6h16M4 12h16M4 18h16" }}
                  transition={{ duration: 0.18 }}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile panel */}
      <AnimatePresence initial={false}>
        {menuOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={mobilePanelVariants}
            transition={{ duration: reduceMotion ? 0 : 0.32 }}
            className="md:hidden"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="px-4 pt-4 pb-6 space-y-3 bg-white border-t border-gray-100 shadow"
              variants={menuVariants}
            >
              <motion.div variants={itemVariants}>
                <MobileItem to="/" label="Home" onClick={() => setMenuOpen(false)} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <MobileItem to="/about" label="About" onClick={() => setMenuOpen(false)} />
              </motion.div>

              {/* Dashboard mobile item */}
              <motion.div variants={itemVariants}>
                <MobileDashboardItem
                  label="Dashboard"
                  onClick={() => {
                    setMenuOpen(false);
                    handleDashboardClick();
                  }}
                />
              </motion.div>

              {!loading && user ? (
                <>
                  <motion.div variants={itemVariants}>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 rounded-lg bg-slate-50 border border-slate-100 text-sm font-medium text-slate-800 hover:bg-slate-100 focus:outline-none"
                    >
                      Logout
                    </button>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div variants={itemVariants}>
                    <button
                      onClick={handleSignIn}
                      className="w-full text-left px-4 py-3 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 focus:outline-none"
                    >
                      Sign In
                    </button>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <button
                      onClick={handleSignUp}
                      className="w-full text-left px-4 py-3 rounded-lg bg-white border border-slate-100 text-sm font-medium text-slate-800 hover:bg-slate-50 focus:outline-none"
                    >
                      Sign Up
                    </button>
                  </motion.div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

/* ---------- small helper components ---------- */

function AnimatedNavLink({ to, label }) {
  const reduceMotion = useReducedMotionFlag();
  return (
    <motion.div whileHover={!reduceMotion ? { scale: 1.1, color: "#4f46e5" } : {}} whileTap={{ scale: 0.95 }}>
      <Link
        to={to}
        className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
      >
        {label}
      </Link>
    </motion.div>
  );
}

function MobileItem({ to, label, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block px-4 py-3 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors"
    >
      {label}
    </Link>
  );
}

function MobileDashboardItem({ label, onClick }) {
  const reduceMotion = useReducedMotionFlag();
  return (
    <motion.button
      onClick={onClick}
      whileHover={!reduceMotion ? { scale: 1.05, backgroundColor: "#eef2ff", color: "#4f46e5" } : {}}
      whileTap={{ scale: 0.95 }}
      className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-800 transition-colors"
    >
      {label}
    </motion.button>
  );
}

/* small hook wrapper used in helpers to respect reduced motion */
function useReducedMotionFlag() {
  try {
    return useReducedMotion();
  } catch {
    return window?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }
}