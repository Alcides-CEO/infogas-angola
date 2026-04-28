import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function VendorLogin() {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [localError, setLocalError] = useState('');

  // Nota: NÃO usamos o loading do AuthContext aqui — a página deve renderizar sempre
  const { loginVendor } = useAuth();
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
      const result = await loginVendor(email, password);
      if (result.success) {
        navigate('/vendor/dashboard');
      } else {
        setLocalError(result.error || 'Email ou palavra-passe incorrectos.');
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
        <div className="auth-glow auth-glow--1" />
        <div className="auth-glow auth-glow--2" />
      </div>

      <div className="auth-card">
        <div className="auth-logo">🔥 Infogás Angola</div>
        <h1 className="auth-title">Área do Vendedor</h1>
        <p className="auth-sub">Aceda ao painel de gestão do seu estabelecimento</p>

        {localError && (
          <div className="auth-error">⚠️ {localError}</div>
        )}

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="vendedor@email.com"
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
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading
              ? <><span className="auth-spinner" /> A verificar...</>
              : 'Entrar no Painel'}
          </button>
        </form>

        <p className="auth-note">
          A sua conta é criada pelo administrador.<br />
          Contacte o suporte se não tiver acesso.
        </p>
        <div className="auth-links">
          <a href="https://wa.me/244937999343" className="auth-wa">📲 Suporte WhatsApp</a>
          <a href="/home" className="auth-back">← Voltar ao site</a>
        </div>
      </div>
    </div>
  );
}
