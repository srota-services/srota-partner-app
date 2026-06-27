import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './hooks/redux';
import LoadingSpinner from './components/common/LoadingSpinner';

const Landing = lazy(() => import('./pages/landing/Landing'));
const Login = lazy(() => import('./pages/login/Login'));
const ForgotPassword = lazy(() => import('./pages/forgot-password/ForgotPassword'));
const PartnerRegister = lazy(() => import('./pages/partner/PartnerRegister'));
const Layout = lazy(() => import('./components/layout/Layout'));
const Audiobooks = lazy(() => import('./pages/audiobooks/Audiobooks'));
const AudiobookWizard = lazy(() => import('./pages/audiobooks/AudiobookWizard'));
const Chapters = lazy(() => import('./pages/chapters/Chapters'));
const ChapterWizard = lazy(() => import('./pages/chapters/ChapterWizard'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const Analytics = lazy(() => import('./pages/analytics/Analytics'));
const Management = lazy(() => import('./pages/management/Management'));
const Team = lazy(() => import('./pages/team/Team'));
const Inbox = lazy(() => import('./pages/inbox/Inbox'));
const Settings = lazy(() => import('./pages/settings/Settings'));

const AuthLoadingScreen = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
    }}
  >
    <LoadingSpinner />
  </div>
);

/**
 * Guest-only route — redirects authenticated users away from public pages
 */
const GuestRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, isInitialized } = useAppSelector(
    state => state.auth
  );

  if (!isInitialized) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/audiobooks" replace />;
  }

  return children;
};

/**
 * Protected Route component
 */
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, isInitialized } = useAppSelector(
    state => state.auth
  );

  if (!isInitialized) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '100vh',
            }}
          >
            <LoadingSpinner />
          </div>
        }
      >
        <Routes>
          <Route
            path="/"
            element={
              <GuestRoute>
                <Landing />
              </GuestRoute>
            }
          />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <GuestRoute>
                <ForgotPassword />
              </GuestRoute>
            }
          />
          <Route
            path="/partner/register"
            element={
              <GuestRoute>
                <PartnerRegister />
              </GuestRoute>
            }
          />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              path="/home"
              element={<Navigate to="/audiobooks" replace />}
            />
            <Route path="/audiobooks/create" element={<AudiobookWizard />} />
            <Route path="/audiobooks/:id/edit" element={<AudiobookWizard />} />
            <Route
              path="/audiobooks/:id/chapters/create"
              element={<ChapterWizard />}
            />
            <Route
              path="/audiobooks/:id/chapters/:chapterId/edit"
              element={<ChapterWizard />}
            />
            <Route path="/audiobooks/:id/chapters" element={<Chapters />} />
            <Route path="/audiobooks" element={<Audiobooks />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/management" element={<Management />} />
            <Route path="/team" element={<Team />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/audiobooks" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
