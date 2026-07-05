import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './hooks/redux';
import LoadingSpinner from './components/common/LoadingSpinner';
import ThemeRouteSync from './components/common/ThemeRouteSync';
import {
  Landing,
  Login,
  ForgotPassword,
  PartnerRegister,
  Layout,
  Audiobooks,
  AudiobookWizard,
  Chapters,
  ChapterWizard,
  Dashboard,
  Analytics,
  Discovery,
  Management,
  CollaborationCreate,
  Inbox,
  Settings,
  Editor,
} from './routes/lazyPages';

const CenteredSpinner = () => (
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

const AuthLoadingScreen = CenteredSpinner;

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
    return <Navigate to="/dashboard" replace />;
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

const AuthorRoute = ({ children }: { children: React.ReactElement }) => {
  const { appType } = useAppSelector(state => state.auth);

  if (appType !== 'author') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <ThemeRouteSync />
      <Routes>
        <Route
          path="/"
          element={
            <GuestRoute>
              <Suspense fallback={<CenteredSpinner />}>
                <Landing />
              </Suspense>
            </GuestRoute>
          }
        />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Suspense fallback={<CenteredSpinner />}>
                <Login />
              </Suspense>
            </GuestRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <GuestRoute>
              <Suspense fallback={<CenteredSpinner />}>
                <ForgotPassword />
              </Suspense>
            </GuestRoute>
          }
        />
        <Route
          path="/partner/register"
          element={
            <GuestRoute>
              <Suspense fallback={<CenteredSpinner />}>
                <PartnerRegister />
              </Suspense>
            </GuestRoute>
          }
        />
        <Route
          element={
            <ProtectedRoute>
              <Suspense fallback={<CenteredSpinner />}>
                <Layout />
              </Suspense>
            </ProtectedRoute>
          }
        >
          <Route path="/home" element={<Navigate to="/dashboard" replace />} />
          <Route path="/library/create" element={<AudiobookWizard />} />
          <Route path="/library/:id/edit" element={<AudiobookWizard />} />
          <Route
            path="/library/:id/chapters/create"
            element={<ChapterWizard />}
          />
          <Route
            path="/library/:id/chapters/:chapterId/edit"
            element={<ChapterWizard />}
          />
          <Route path="/library/:id/chapters" element={<Chapters />} />
          <Route path="/library" element={<Audiobooks />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/discovery" element={<Discovery />} />
          <Route
            path="/marketplace"
            element={<Navigate to="/discovery" replace />}
          />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/management" element={<Management />} />
          <Route
            path="/management/collaborations/create"
            element={
              <AuthorRoute>
                <CollaborationCreate />
              </AuthorRoute>
            }
          />
          <Route
            path="/team"
            element={<Navigate to="/management?tab=team" replace />}
          />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/settings" element={<Settings />} />
          <Route
            path="/editor/*"
            element={
              <AuthorRoute>
                <Editor />
              </AuthorRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
