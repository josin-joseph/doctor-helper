import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Spinner      from './components/common/Spinner';

// Lazy page imports
import { lazy, Suspense } from 'react';
const DashboardPage  = lazy(() => import('./pages/DashboardPage'));
const PatientsPage   = lazy(() => import('./pages/PatientsPage'));
const EMRPage        = lazy(() => import('./pages/EMRPage'));
const PredictionPage = lazy(() => import('./pages/PredictionPage'));
const LabReportPage  = lazy(() => import('./pages/LabReportPage'));
const AssistantPage  = lazy(() => import('./pages/AssistantPage'));
const DischargePage  = lazy(() => import('./pages/DischargePage'));
const ProfilePage    = lazy(() => import('./pages/ProfilePage'));

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

const AppRoutes = () => (
  <Suspense fallback={
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  }>
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={
        <PrivateRoute>
          <MainLayout><DashboardPage /></MainLayout>
        </PrivateRoute>
      }/>
      <Route path="/patients" element={
        <PrivateRoute>
          <MainLayout><PatientsPage /></MainLayout>
        </PrivateRoute>
      }/>
      <Route path="/emr" element={
        <PrivateRoute>
          <MainLayout><EMRPage /></MainLayout>
        </PrivateRoute>
      }/>
      <Route path="/predictions" element={
        <PrivateRoute>
          <MainLayout><PredictionPage /></MainLayout>
        </PrivateRoute>
      }/>
      <Route path="/lab-reports" element={
        <PrivateRoute>
          <MainLayout><LabReportPage /></MainLayout>
        </PrivateRoute>
      }/>
      <Route path="/assistant" element={
        <PrivateRoute>
          <MainLayout><AssistantPage /></MainLayout>
        </PrivateRoute>
      }/>
      <Route path="/discharge" element={
        <PrivateRoute>
          <MainLayout><DischargePage /></MainLayout>
        </PrivateRoute>
      }/>
      <Route path="/profile" element={
        <PrivateRoute>
          <MainLayout><ProfilePage /></MainLayout>
        </PrivateRoute>
      }/>
    </Routes>
  </Suspense>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;