import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Welcome from './pages/Welcome';
import FreeMode from './pages/Freemode';    // NOVO
import Home from './pages/Home';
import VendorLogin from './pages/VendorLogin';
import VendorDashboard from './pages/VendorDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function ProtectedRoute({ children, requiredRole, loginPath }) {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to={loginPath} replace />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/" replace />;
  return children;
}

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#0A1628',
      flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '3px solid rgba(255,94,0,0.2)',
        borderTopColor: '#FF5E00',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// Páginas com Navbar + Footer
function WithLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Welcome — sem navbar */}
      <Route path="/" element={<Welcome />} />

      {/* Modo gratuito — com navbar e footer */}
      <Route path="/explorar" element={
        <WithLayout><FreeMode /></WithLayout>
      } />

      {/* Home completa — com navbar e footer */}
      <Route path="/home" element={
        <WithLayout><Home /></WithLayout>
      } />

      {/* Auth */}
      <Route path="/vendedor/login" element={<VendorLogin />} />
      <Route path="/admin/login"    element={<AdminLogin />} />

      {/* Protegidas */}
      <Route path="/vendedor/dashboard" element={
        <ProtectedRoute requiredRole="vendor" loginPath="/vendedor/login">
          <VendorDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/dashboard" element={
        <ProtectedRoute requiredRole="admin" loginPath="/admin/login">
          <AdminDashboard />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}