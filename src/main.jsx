import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterCoachPage from './pages/RegisterCoachPage.jsx';
import RegisterAthletePage from './pages/RegisterAthletePage.jsx';
import PendingApprovalPage from './pages/PendingApprovalPage.jsx';
import AuthCallbackPage from './pages/AuthCallbackPage.jsx';
import { useAuthStore } from './stores/authStore.js';

// Wait for localStorage to hydrate before rendering App (prevents flash).
// No auth wall — anyone can use the app; sign-in is only required to publish.
function HydratedApp() {
  const { _hasHydrated } = useAuthStore();

  if (!_hasHydrated) {
    return (
      <div className="min-h-dvh bg-[#0B1120] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <App />;
}

// Redirect already-authed users away from auth pages
function AuthRedirect({ children }) {
  const { user, _hasHydrated } = useAuthStore();

  if (!_hasHydrated) return null;

  if (user && user.status === 'active') return <Navigate to="/" replace />;

  return children;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthRedirect><LoginPage /></AuthRedirect>} />
        <Route path="/register/coach" element={<AuthRedirect><RegisterCoachPage /></AuthRedirect>} />
        <Route path="/register/athlete" element={<AuthRedirect><RegisterAthletePage /></AuthRedirect>} />
        <Route path="/pending" element={<PendingApprovalPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/*" element={<HydratedApp />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
