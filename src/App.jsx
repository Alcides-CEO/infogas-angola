import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import VendorLogin from './pages/VendorLogin';
import VendorDashboard from './pages/VendorDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// ── Rota protegida: só redireciona SE o auth já terminou de carregar ──
function ProtectedRoute({ children, requiredRole, loginPath }) {
  const { isAuthenticated, role, loading } = useAuth();

  // Enquanto o Supabase verifica a sessão, mostra loading APENAS nestas rotas protegidas
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0A1628',
        flexDirection: 'column',
        gap: 16,
      }}>
        <div style={{ fontSize: 48 }}>🔥</div>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '3px solid rgba(255,94,0,0.2)',
          borderTopColor: '#FF5E00',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>A verificar sessão...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={loginPath} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* ── Páginas PÚBLICAS — nunca bloqueadas pelo loading ── */}
      <Route path="/"      element={<Welcome />} />
      <Route path="/home"  element={<Home />} />

      {/* ── Páginas de login — públicas ── */}
      <Route path="/vendor/login" element={<VendorLogin />} />
      <Route path="/admin/login"  element={<AdminLogin />} />

      {/* ── Páginas protegidas ── */}
      <Route path="/vendor/dashboard" element={
        <ProtectedRoute requiredRole="vendor" loginPath="/vendor/login">
          <VendorDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/dashboard" element={
        <ProtectedRoute requiredRole="admin" loginPath="/admin/login">
          <AdminDashboard />
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
