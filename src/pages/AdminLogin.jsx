import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function AdminLogin() {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [localError, setLocalError] = useState('');

  // Nota: NÃO usamos o loading do AuthContext aqui
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError('Preencha o email e a palavra-passe.');
      return;
    }
    setLoading(true);
    setLocalError('');

    try {
      const result = await loginAdmin(email, password);
      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setLocalError(result.error || 'Acesso negado.');
      }
    } catch (err) {
      setLocalError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-glow auth-glow--1" style={{ background: 'rgba(37,99,235,0.25)' }} />
        <div className="auth-glow auth-glow--2" />
      </div>

      <div className="auth-card auth-card--admin">
        <div className="auth-logo">🔥 Infogás Angola</div>
        <div className="auth-admin-badge">🛡️ Painel Administrativo</div>
        <h1 className="auth-title">Acesso Restrito</h1>
        <p className="auth-sub">Apenas administradores autorizados podem aceder.</p>

        {localError && (
          <div className="auth-error">⚠️ {localError}</div>
        )}

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="auth-field">
            <label>Email de Administrador</label>
            <input
              type="email"
              placeholder="admin@infogas.ao"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
          </div>
          <div className="auth-field">
            <label>Palavra-passe</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="btn-primary btn-admin"
            style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading
              ? <><span className="auth-spinner" /> A verificar...</>
              : '🛡️ Entrar como Admin'}
          </button>
        </form>

        <a href="/home" className="auth-back" style={{ textAlign: 'center', display: 'block', marginTop: 20 }}>
          ← Voltar ao site
        </a>
      </div>
    </div>
  );
}
