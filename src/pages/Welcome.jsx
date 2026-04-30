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

// Textos "M.A CODE" flutuando no fundo em várias posições e tamanhos
const floaters = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 28 + 14,       // 14px – 42px
  opacity: Math.random() * 0.06 + 0.02, // muito subtil: 2%–8%
  dur: Math.random() * 30 + 25,         // 25s – 55s (devagar, como à deriva)
  delay: -(Math.random() * 30),         // começar já em movimento
  rotate: Math.random() * 40 - 20,      // -20° a +20°
}));

const BOTIJA_TYPES = [
  { color: '#2563EB', label: 'Botija Azul' },
  { color: '#FF5E00', label: 'Botija Laranja' },
  { color: '#7C3AED', label: 'Levita' },
];

export default function Welcome() {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="welcome">

      {/* ── Fundo ── */}
      <div className="welcome__bg">
        <div className="welcome__mesh" />
        {particles.map(p => (
          <span key={p.id} className="welcome__particle"
            style={{
              width: p.size, height: p.size,
              left: `${p.x}%`, top: `${p.y}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
            }} />
        ))}
        <div className="glow g1" />
        <div className="glow g2" />
        <div className="glow g3" />

        {/* Textos "M.A CODE" à deriva no fundo */}
        {floaters.map(f => (
          <span
            key={f.id}
            className="macode-floater"
            style={{
              left: `${f.x}%`,
              top:  `${f.y}%`,
              fontSize: f.size,
              opacity:  f.opacity,
              transform: `rotate(${f.rotate}deg)`,
              animationDuration:  `${f.dur}s`,
              animationDelay:     `${f.delay}s`,
            }}
          >
            M.A CODE
          </span>
        ))}
      </div>

      {/* ── Logo ── */}
      <header className="welcome__logo au1">
        <div className="flame-icon-wrap">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#FF5E00"
            style={{ filter: 'drop-shadow(0 0 10px rgba(255,94,0,0.8))' }}>
            <path d="M12 2C10 5 8 7 8 11c0 2.2 1.8 4 4 4-1-2-1-4 1-6 0 2 1 4 3 5 0-3 1-6-1-9 2 1 4 4 4 7 0 3.3-2.7 6-6 6S4 15.3 4 12c0-4.5 3.5-8.5 8-10z"/>
          </svg>
        </div>
        <span className="logo-name">Infogás</span>
        <span className="logo-badge">Angola</span>
      </header>

      {/* ── Conteúdo principal ── */}
      <main className="welcome__main">
        <div className="eyebrow au2">
          <span className="dot" />
          Plataforma #1 de Gás em Angola
        </div>

        <h1 className="welcome__title au3">
          Gás perto de <br />
          <span className="accent">você, agora.</span>
        </h1>

        <p className="welcome__sub au4">
          Encontre pontos de venda, veja stock em tempo real,<br />
          faça reservas e encomendas — tudo numa plataforma.
        </p>

        <div className="botijas au5">
          {BOTIJA_TYPES.map(b => (
            <div key={b.label} className="botija-chip">
              <span className="botija-dot" style={{ background: b.color }} />
              <span>{b.label}</span>
            </div>
          ))}
        </div>

        <button className="welcome__btn au6" onClick={() => navigate('/home')}>
          Entrar na Plataforma
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>

        {/* Stats ficam DENTRO do main, abaixo do botão, sempre centralizados */}
        <div className="welcome__stats au7">
          {[['+200','Vendedores'],['11','Provincias'],['24/7','Disponivel']].map(([v, l]) => (
            <div key={l} className="stat-item">
              <strong>{v}</strong>
              <span>{l}</span>
            </div>
          ))}
        </div>
      </main>

    </div>
  );
}