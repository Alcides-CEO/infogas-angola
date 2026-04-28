import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';

const particles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  size: Math.random() * 5 + 2,
  x: Math.random() * 100,
  y: Math.random() * 100,
  delay: Math.random() * 5,
  dur: Math.random() * 6 + 6,
}));

export default function Welcome() {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="welcome">
      <div className="welcome__bg">
        <div className="welcome__mesh" />
        {particles.map(p => (
          <span key={p.id} className="welcome__particle"
            style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%`,
              animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }} />
        ))}
        <div className="glow g1" /><div className="glow g2" /><div className="glow g3" />
      </div>

      <header className="welcome__logo au1">
        <div className="flame-icon">🔥</div>
        <span className="logo-name">Infogás</span>
        <span className="logo-badge">Angola</span>
      </header>

      <main className="welcome__main">
        <div className="eyebrow au2"><span className="dot" />Plataforma #1 de Gás em Angola</div>

        <h1 className="welcome__title au3">
          Gás perto de <br />
          <span className="accent">você, agora.</span>
        </h1>

        <p className="welcome__sub au4">
          Encontre pontos de venda, veja stock em tempo real,<br />
          faça reservas e encomendas — tudo numa plataforma.
        </p>

        <div className="botijas au5">
          {[
            { color: '#2563EB', label: 'Botija Azul', emoji: '🔵' },
            { color: '#FF5E00', label: 'Botija Laranja', emoji: '🟠' },
            { color: '#7C3AED', label: 'Levita', emoji: '💜' },
          ].map(b => (
            <div key={b.label} className="botija-chip">
              <div className="botija-dot" style={{ background: b.color }}>{b.emoji}</div>
              <span>{b.label}</span>
            </div>
          ))}
        </div>

        <button className="welcome__btn au6" onClick={() => navigate('/home')}>
          Entrar na Plataforma
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="18" height="18">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </main>

      <div className="welcome__stats au7">
        {[['500+','Vendedores'],['18','Províncias'],['24/7','Disponível']].map(([v,l]) => (
          <div key={l} className="stat-item">
            <strong>{v}</strong><span>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
