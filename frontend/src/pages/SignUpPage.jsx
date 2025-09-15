// src/pages/SignUpPage.jsx
import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase/config'; // ensure this file exists (see earlier messages)
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import ProtectedRoute from '../components/ProtectedRoute';

/**
 * SignUpPage
 *
 * - Robust handling for network / emulator issues
 * - Clearer toast messages for common Firebase errors
 * - Stores minimal user info in sessionStorage (uid only)
 *
 * Usage:
 * - Ensure `src/firebase/config.js` exists and exports { auth, app, db }.
 * - If using the Firebase Auth emulator locally set these in your .env:
 *      VITE_FIREBASE_USE_EMULATOR=true
 *      VITE_FIREBASE_AUTH_EMULATOR_URL=http://localhost:9099
 */

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Detect whether emulator mode is configured (helps debugging)
  const useEmulator = (import.meta.env.VITE_FIREBASE_USE_EMULATOR ?? 'false').toLowerCase() === 'true';
  const emulatorUrl = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_URL ?? '';

  useEffect(() => {
    if (!error) return;

    // Map common firebase codes to friendly messages (toasts shown here)
    let errorMessage = 'An error occurred during sign up.';

    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'This email is already in use. Please sign in instead.';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password should be at least 6 characters long.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address.';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'Email/password accounts are not enabled in Firebase.';
        break;
      case 'network/offline':
      case 'network/request-failed':
        errorMessage = 'Network problem — check your internet or that the Auth emulator is running.';
        break;
      default:
        // For unknown codes, if .message exists use it
        if (error?.message) {
          errorMessage = error.message;
        } else {
          console.error('Signup error (unknown):', error);
        }
    }

    toast.error('Sign Up Failed', { description: errorMessage });
    setLoading(false);
  }, [error]);

  const validateInputs = () => {
    if (!email || !password || !confirmPassword) {
      setError({ code: 'auth/missing-fields', message: 'Please fill in all fields.' });
      return false;
    }
    if (password !== confirmPassword) {
      setError({ code: 'auth/passwords-dont-match', message: 'Passwords do not match.' });
      return false;
    }
    if (password.length < 6) {
      setError({ code: 'auth/weak-password', message: 'Password should be at least 6 characters long.' });
      return false;
    }
    return true;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateInputs()) return;

    // Quick network check
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setError({ code: 'network/offline', message: 'You appear to be offline.' });
      return;
    }

    setLoading(true);
    setLocalLoading(true);

    try {
      // Attempt to create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Optionally update displayName
      if (displayName && userCredential?.user) {
        try {
          await updateProfile(userCredential.user, { displayName });
        } catch (profileErr) {
          // non-fatal: log and continue
          console.warn('Could not set display name:', profileErr);
        }
      }

      // Store minimal user info in sessionStorage (uid only)
      try {
        sessionStorage.setItem('user', JSON.stringify({ uid: userCredential.user.uid }));
      } catch (e) {
        console.warn('Could not write to sessionStorage:', e);
      }

      // Clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setDisplayName('');
      setError(null);

      toast.success('Account created successfully!', {
        description: 'Welcome to Hospital Readmissions!'
      });

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup error:', err);

      // Network-level errors sometimes don't have a Firebase code
      const msg = String(err?.message ?? err);

      if (msg.includes('network-request-failed') || msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        setError({ code: 'network/request-failed', message: 'Network request failed. Is the emulator running or are you offline?' });
        toast.error('Network error', {
          description: useEmulator
            ? `Could not reach Auth emulator at ${emulatorUrl || 'http://localhost:9099'}. Start it with: firebase emulators:start --only auth`
            : 'Could not reach Firebase Auth. Check your network.'
        });
      } else if (err && err.code) {
        // Known firebase auth errors
        switch (err.code) {
          case 'auth/email-already-in-use':
            setError(err);
            toast.error('Email already in use', { description: 'Please sign in instead.' });
            break;
          case 'auth/weak-password':
            setError(err);
            toast.error('Weak password', { description: 'Password should be at least 6 characters.' });
            break;
          case 'auth/invalid-email':
            setError(err);
            toast.error('Invalid email', { description: 'Please enter a valid email address.' });
            break;
          default:
            setError(err);
            toast.error('Sign up failed', { description: err.message || 'Please check your information and try again.' });
        }
      } else {
        // Unknown error
        setError({ code: 'unknown', message: msg });
        toast.error('Sign up failed', { description: msg });
      }
    } finally {
      setLoading(false);
      setLocalLoading(false);
    }
  };

  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full space-y-10">
          <div className="text-center">
            <div className="mx-auto h-28 w-28 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-white">
              {/* Placeholder logo — replace with your own or keep blank */}
              <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">HR</div>
            </div>
            <h2 className="mt-10 text-4xl font-bold text-gray-900">Create Account</h2>
            <p className="mt-3 text-lg text-gray-600">Join our healthcare analytics platform</p>
            {/* Emulator banner for developer convenience */}
            {useEmulator && (
              <div className="mt-3 inline-block px-3 py-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
                Dev: Auth emulator enabled at <span className="font-mono">{emulatorUrl || 'http://localhost:9099'}</span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-10">
            <form className="space-y-8" onSubmit={handleSignUp} noValidate>
              <div>
                <label htmlFor="email" className="block text-lg font-medium text-gray-700 mb-3">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 text-lg rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-3 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="displayName" className="block text-lg font-medium text-gray-700 mb-3">Display name (optional)</label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-6 py-3 text-lg rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-3 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Your name (shown in dashboard)"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-lg font-medium text-gray-700 mb-3">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 text-lg rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-3 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Create a password (min 6 characters)"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-lg font-medium text-gray-700 mb-3">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-6 py-4 text-lg rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-3 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Confirm your password"
                />
              </div>

              {/* Error Messages */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-lg text-red-800">
                        {error.code === 'auth/email-already-in-use' && 'Email already in use. Please sign in instead.'}
                        {error.code === 'auth/weak-password' && 'Password should be at least 6 characters long.'}
                        {error.code === 'auth/invalid-email' && 'Please enter a valid email address.'}
                        {error.code === 'network/offline' && 'You appear to be offline. Please check your connection.'}
                        {error.code === 'network/request-failed' && (useEmulator ? `Could not reach Auth emulator at ${emulatorUrl || 'http://localhost:9099'}. Start it with: firebase emulators:start --only auth` : 'Network request failed.')}
                        {(error.code !== 'auth/email-already-in-use' && error.code !== 'auth/weak-password' && error.code !== 'auth/invalid-email' && error.code !== 'network/offline' && error.code !== 'network/request-failed') && (error.message || 'Please check your information and try again.')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || localLoading}
                className="w-full flex justify-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:ring-3 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading || localLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-lg text-gray-600">
                Already have an account?{' '}
                <Link to="/sign-in" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SignUpPage;
