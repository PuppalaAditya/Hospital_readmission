// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase/config';
import ErrorBoundary from './components/ErrorBoundary';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import ToastProvider from './components/ToastProvider';
import LoadingSpinner from './components/LoadingSpinner';
import HomePage from './pages/HomePage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import DashPage from './pages/DashPage'; // <-- Management / DashPage
import AboutPage from './pages/AboutPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import FirebaseTest from './components/FirebaseTest';
import './index.css';

function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <LoadingSpinner size="xl" text="Loading application..." />
      </div>
    );
  }

  return (
    <Router>
      <ErrorBoundary>
        <div className="min-h-screen flex flex-col bg-white">
          <ToastProvider />
          <NavBar />
          <main className="flex-1 pt-16 pb-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/sign-in" element={<SignInPage />} />
              <Route path="/sign-up" element={<SignUpPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/test-firebase" element={<FirebaseTest />} />

              {/* Public pages */}
              <Route path="/about" element={<AboutPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* Management (DashPage) - route used by NavBar Management link */}
              <Route path="/management" element={<DashPage />} />

              {/* fallback */}
              <Route path="*" element={<div className="p-8">404 - Page Not Found</div>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
