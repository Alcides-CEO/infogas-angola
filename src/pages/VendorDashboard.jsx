import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useReservas } from '../hooks/useReservas';
import { useVendorActions } from '../hooks/useVendorActions';
import { BOTIJA_TYPES } from '../data/vendors';
import './VendorDashboard.css';

export default function VendorDashboard() {
  const { vendor, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab]       = useState('overview');
  const [working, setWorking] = useState(false);
  const [stock, setStock]   = useState({});
  const [prices, setPrices] = useState({});
  const [gasStatus, setGasStatus] = useState('disponivel');

  const {
    reservas, encomendas, loading: reservasLoading,
    pendentes, aceitar, recusar, newAlert,
  } = useReservas(vendor?.id);

  const { saving, saved, error: saveError, saveStock, saveStatus, savePrices } = useVendorActions();

  // Sincronizar stock/preços do vendor
  useEffect(() => {
    if (vendor) {
      setStock(vendor.stock || {});
      setPrices(vendor.prices || {});
      setGasStatus(vendor.status || 'disponivel');
    }
  }, [vendor]);

  const handleStatusChange = async (status) => {
    setGasStatus(status);
    await saveStatus(status);
  };

  const handleStockMinus = async (typeId) => {
    const newStock = { ...stock, [typeId]: Math.max(0, (stock[typeId] || 0) - 1) };
    setStock(newStock);
    await saveStock(newStock);
  };

  const handleSaveStock = async () => {
    await saveStock(stock);
  };

  const handleSavePrices = async () => {
    await savePrices(prices);
  };

  // Só mostrar spinner enquanto authLoading — depois deixa o redirect agir
  if (authLoading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#070f1a', flexDirection:'column', gap:16 }}>
        <div style={{ fontSize:40 }}>🔥</div>
        <div style={{ width:32, height:32, borderRadius:'50%', border:'3px solid rgba(255,94,0,0.2)', borderTopColor:'#FF5E00', animation:'spin 0.8s linear infinite' }} />
        <span style={{ color:'rgba(255,255,255,0.5)', fontSize:14 }}>A carregar painel...</span>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const totalStock = Object.values(stock).reduce((a, b) => a + b, 0);

  return (
    <div className="vdash">
      {/* Alerta de nova reserva */}
      {newAlert && (
        <div className="vdash__alert">
          🔔 Nova reserva recebida de <strong>{newAlert.client_name}</strong>
        </div>
      )}

      <aside className="vdash__sidebar">
        <div className="vdash__logo">🔥 Infogás</div>

        <div className="vdash__vendor-info">
          <div className="vdash__vendor-avatar">{vendor.avatar || '⛽'}</div>
          <div>
            <strong>{vendor.name}</strong>
            <span>📍 {vendor.province}</span>
          </div>
        </div>

        <nav className="vdash__nav">
          {[
            { id:'overview',   icon:'📊', label:'Visão Geral' },
            { id:'reservas',   icon:'📋', label:'Reservas', badge: pendentes.length },
            { id:'encomendas', icon:'🚚', label:'Encomendas' },
            { id:'stock',      icon:'📦', label:'Gerir Stock' },
            { id:'precos',     icon:'💰', label:'Preços' },
            { id:'relatorios', icon:'📈', label:'Relatórios' },
            { id:'suporte',    icon:'💬', label:'Suporte' },
          ].map(item => (
            <button key={item.id}
              className={`vdash__nav-item ${tab === item.id ? 'vdash__nav-item--active' : ''}`}
              onClick={() => setTab(item.id)}>
              <span>{item.icon}</span> {item.label}
              {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="vdash__sidebar-footer">
          <button className="vdash__logout" onClick={async () => { await logout(); navigate('/'); }}>
            🚪 Sair
          </button>
          <a href="/home" className="vdash__exit">← Ver site</a>
        </div>
      </aside>

      <main className="vdash__main">
        <header className="vdash__header">
          <div>
            <h1 className="vdash__page-title">
              {{ overview:'Visão Geral', reservas:'Reservas', encomendas:'Encomendas',
                 stock:'Gerir Stock', precos:'Preços', relatorios:'Relatórios', suporte:'Suporte Técnico' }[tab]}
            </h1>
            <p className="vdash__page-sub">{vendor.name} · {vendor.province}</p>
          </div>
          <div className="vdash__header-actions">
            <div className={`vdash__work-status ${working ? 'vdash__work-status--on' : ''}`}>
              <span className="work-dot" />
              {working ? 'Em Serviço' : 'Fora de Serviço'}
            </div>
          </div>
        </header>

        {/* Saved/Error feedback */}
        {saved && <div className="vdash__saved">✅ Guardado com sucesso!</div>}
        {saveError && <div className="vdash__save-error">⚠️ {saveError}</div>}

        {/* Modo trabalho */}
        {!working ? (
          <div className="vdash__start-banner">
            <div>
              <h3>Pronto para começar?</h3>
              <p>Clique em "Iniciar Trabalho" para activar o seu estabelecimento no mapa.</p>
            </div>
            <button className="btn-start" onClick={() => { setWorking(true); handleStatusChange('disponivel'); }}>
              ▶ Iniciar Trabalho
            </button>
          </div>
        ) : (
          <div className="vdash__work-mode">
            <h3>🟢 Modo Trabalho Activo</h3>
            <p>Os clientes vêem o seu stock em tempo real.</p>
            <div className="work-btns">
              <button
                className={`work-btn work-btn--gas ${gasStatus === 'disponivel' ? 'work-btn--active' : ''}`}
                onClick={() => handleStatusChange('disponivel')}>
                ✅ Temos Gás
              </button>
              <button
                className={`work-btn work-btn--empty ${gasStatus === 'esgotado' ? 'work-btn--active-red' : ''}`}
                onClick={() => handleStatusChange('esgotado')}>
                ❌ Esgotou
              </button>
              <div className="work-stock-minus">
                <span>📦 Stock −1:</span>
                {BOTIJA_TYPES.filter(b => (stock[b.id] || 0) > 0).map(b => (
                  <button key={b.id} className="stock-btn"
                    style={{ borderColor: b.color, color: b.color }}
                    onClick={() => handleStockMinus(b.id)}
                    disabled={saving}>
                    {b.label.split(' ')[0]} −1
                  </button>
                ))}
              </div>
            </div>
            <button className="btn-stop" onClick={() => { setWorking(false); handleStatusChange('esgotado'); }}>
              ⏹ Terminar Trabalho
            </button>
          </div>
        )}

        <div className="vdash__content">
          {tab === 'overview' && (
            <OverviewTab stock={stock} reservas={reservas} encomendas={encomendas} working={working} totalStock={totalStock} pendentes={pendentes} />
          )}
          {tab === 'reservas' && (
            <ReservasTab reservas={reservas} loading={reservasLoading} aceitar={aceitar} recusar={recusar} />
          )}
          {tab === 'encomendas' && (
            <EncomendasTab encomendas={encomendas} loading={reservasLoading} />
          )}
          {tab === 'stock' && (
            <StockTab stock={stock} setStock={setStock} onSave={handleSaveStock} saving={saving} />
          )}
          {tab === 'precos' && (
            <PrecosTab prices={prices} setPrices={setPrices} onSave={handleSavePrices} saving={saving} />
          )}
          {tab === 'relatorios' && (
            <RelatoriosTab reservas={reservas} encomendas={encomendas} stock={stock} prices={prices} />
          )}
          {tab === 'suporte' && <SuporteTab vendor={vendor} />}
        </div>
      </main>
    </div>
  );
}

// ── Sub-componentes ─────────────────────────────────

function OverviewTab({ stock, reservas, encomendas, working, totalStock, pendentes }) {
  return (
    <div className="overview">
      <div className="kpi-grid">
        <KPI icon="📦" label="Stock Total" value={`${totalStock} un.`} sub="unidades disponíveis" color="#FF5E00" />
        <KPI icon="📋" label="Reservas Pendentes" value={pendentes.length} sub="aguardam resposta" color="#2563EB" />
        <KPI icon="🚚" label="Total Reservas" value={reservas.length} sub="historial completo" color="#22C55E" />
        <KPI icon={working?"🟢":"🔴"} label="Estado" value={working?"Activo":"Inactivo"} sub={working?"em serviço":"fora de serviço"} color={working?"#22C55E":"#6B7280"} />
      </div>

      <div className="overview__stock">
        <h4>Stock actual por tipo</h4>
        {BOTIJA_TYPES.map(b => {
          const q = stock[b.id] || 0;
          return (
            <div key={b.id} className="stock-row">
              <div className="stock-dot" style={{ background: b.color }} />
              <span className="stock-label">{b.label}</span>
              <div className="stock-bar-wrap">
                <div className="stock-bar" style={{ width: `${Math.min(q*5,100)}%`, background: b.color }} />
              </div>
              <strong className={q===0?'stock-zero':'stock-num'}>{q} un.</strong>
            </div>
          );
        })}
      </div>

      {pendentes.length > 0 && (
        <div className="overview__alert">
          🔔 Tem <strong>{pendentes.length} reserva{pendentes.length>1?'s':''} pendente{pendentes.length>1?'s':''}</strong> a aguardar resposta!
        </div>
      )}
    </div>
  );
}

function KPI({ icon, label, value, sub, color }) {
  return (
    <div className="kpi" style={{ '--kc': color }}>
      <div className="kpi__icon">{icon}</div>
      <div className="kpi__value">{value}</div>
      <div className="kpi__label">{label}</div>
      <div className="kpi__sub">{sub}</div>
    </div>
  );
}

function ReservasTab({ reservas, loading, aceitar, recusar }) {
  const [processingId, setProcessingId] = useState(null);

  const handle = async (id, action) => {
    setProcessingId(id);
    await action(id);
    setProcessingId(null);
  };

  if (loading) return <div className="coming-soon">⏳ A carregar reservas...</div>;
  if (!reservas.length) return <div className="coming-soon">📋 Sem reservas por enquanto.</div>;

  return (
    <div className="reservas-tab">
      {reservas.map(r => (
        <div key={r.id} className={`reserva-card reserva-card--${r.status}`}>
          <div className="reserva-head">
            <span className={`tag ${r.status==='pendente'?'tag-orange':r.status==='aceite'?'tag-green':'tag-red'}`}>
              {r.status==='pendente'?'⏳ Pendente':r.status==='aceite'?'✅ Aceite':'❌ Recusado'}
            </span>
            <span style={{ color:'rgba(255,255,255,0.4)',fontSize:11 }}>
              {new Date(r.created_at).toLocaleString('pt-AO', { dateStyle:'short', timeStyle:'short' })}
            </span>
          </div>
          <p className="reserva-client">👤 {r.client_name} · {r.client_tel}</p>
          <p className="reserva-detail">📦 {r.quantity}× {BOTIJA_TYPES.find(b=>b.id===r.botija_type)?.label || r.botija_type}</p>
          {r.price_total > 0 && <p className="reserva-detail">💰 Kz {r.price_total.toLocaleString()}</p>}
          {r.status === 'pendente' && (
            <div className="reserva-actions">
              <button className="btn-primary" style={{ padding:'8px 20px',fontSize:13 }}
                disabled={processingId===r.id} onClick={() => handle(r.id, aceitar)}>
                {processingId===r.id ? '⏳' : '✅ Aceitar'}
              </button>
              <button className="btn-ghost" style={{ padding:'8px 20px',fontSize:13 }}
                disabled={processingId===r.id} onClick={() => handle(r.id, recusar)}>
                ❌ Recusar
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function EncomendasTab({ encomendas, loading }) {
  if (loading) return <div className="coming-soon">⏳ A carregar encomendas...</div>;
  if (!encomendas.length) return <div className="coming-soon">🚚 Sem encomendas por enquanto.</div>;
  return (
    <div className="reservas-tab">
      {encomendas.map(e => (
        <div key={e.id} className="reserva-card">
          <div className="reserva-head">
            <span className="tag tag-orange">🚚 {e.status}</span>
            <span style={{ color:'rgba(255,255,255,0.4)',fontSize:11 }}>
              {new Date(e.created_at).toLocaleString('pt-AO', { dateStyle:'short', timeStyle:'short' })}
            </span>
          </div>
          <p className="reserva-client">👤 {e.client_name} · {e.client_tel}</p>
          {e.botija_type && <p className="reserva-detail">📦 {e.quantity}× {BOTIJA_TYPES.find(b=>b.id===e.botija_type)?.label||e.botija_type}</p>}
          {e.address && <p className="reserva-detail">📍 {e.address}</p>}
          {e.notes && <p className="reserva-detail" style={{ color:'rgba(255,255,255,0.4)' }}>💬 {e.notes}</p>}
        </div>
      ))}
    </div>
  );
}

function StockTab({ stock, setStock, onSave, saving }) {
  return (
    <div className="stock-tab">
      <h4>Gerir Stock por Tipo de Botija</h4>
      <p className="stock-tab-note">⚡ Actualizações são visíveis para os clientes em tempo real.</p>
      <div className="stock-grid">
        {BOTIJA_TYPES.map(b => (
          <div key={b.id} className="stock-item">
            <div className="stock-item__dot" style={{ background: b.color }} />
            <div className="stock-item__label">{b.label}</div>
            <div className="stock-item__ctrl">
              <button onClick={() => setStock(s => ({ ...s, [b.id]: Math.max(0,(s[b.id]||0)-1) }))}>−</button>
              <input type="number" min="0" value={stock[b.id]||0}
                onChange={e => setStock(s => ({ ...s, [b.id]: Math.max(0,parseInt(e.target.value)||0) }))} />
              <button onClick={() => setStock(s => ({ ...s, [b.id]: (s[b.id]||0)+1 }))}>+</button>
            </div>
          </div>
        ))}
      </div>
      <button className="btn-primary" style={{ marginTop:24, opacity: saving?0.7:1 }} onClick={onSave} disabled={saving}>
        {saving ? '⏳ A guardar...' : '💾 Guardar Stock'}
      </button>
    </div>
  );
}

function PrecosTab({ prices, setPrices, onSave, saving }) {
  return (
    <div className="stock-tab">
      <h4>Definir Preços por Tipo de Botija</h4>
      <p className="stock-tab-note">Os preços são visíveis para os clientes no mapa.</p>
      <div className="stock-grid">
        {BOTIJA_TYPES.map(b => (
          <div key={b.id} className="stock-item">
            <div className="stock-item__dot" style={{ background: b.color }} />
            <div className="stock-item__label">{b.label}</div>
            <div className="price-input-wrap">
              <span className="price-currency">Kz</span>
              <input type="number" min="0" step="100"
                placeholder="0"
                value={prices[b.id]||''}
                onChange={e => setPrices(p => ({ ...p, [b.id]: parseInt(e.target.value)||0 }))}
                className="price-input"
              />
            </div>
          </div>
        ))}
      </div>
      <button className="btn-primary" style={{ marginTop:24, opacity: saving?0.7:1 }} onClick={onSave} disabled={saving}>
        {saving ? '⏳ A guardar...' : '💾 Guardar Preços'}
      </button>
    </div>
  );
}

function RelatoriosTab({ reservas, encomendas, stock, prices }) {
  const aceites  = reservas.filter(r => r.status === 'aceite');
  const faturado = aceites.reduce((acc, r) => acc + (r.price_total||0), 0);
  const totalStock = Object.values(stock).reduce((a,b)=>a+b,0);
  const stockValor = Object.entries(stock).reduce((acc,[k,q]) => acc + q*(prices[k]||0), 0);

  return (
    <div className="relatorios">
      <div className="relatorio-kpis">
        <KPI icon="💰" label="Faturação (reservas aceites)" value={`Kz ${faturado.toLocaleString()}`} sub={`${aceites.length} reservas aceites`} color="#22C55E" />
        <KPI icon="📦" label="Valor do Stock actual" value={`Kz ${stockValor.toLocaleString()}`} sub={`${totalStock} unidades`} color="#FF5E00" />
        <KPI icon="📊" label="Total de Pedidos" value={reservas.length + encomendas.length} sub="reservas + encomendas" color="#2563EB" />
      </div>
      <div className="relatorio-chart">
        <h4>Stock actual por tipo</h4>
        {BOTIJA_TYPES.map(b => {
          const q = stock[b.id]||0;
          return (
            <div key={b.id} className="chart-row">
              <div style={{ minWidth:120, display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:10,height:10,borderRadius:'50%',background:b.color,flexShrink:0 }}/>
                <span>{b.label}</span>
              </div>
              <div className="chart-bar-wrap"><div className="chart-bar" style={{ width:`${Math.min(q*5,100)}%`, background:b.color }} /></div>
              <span style={{ minWidth:40,textAlign:'right',color:'white',fontWeight:600 }}>{q}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SuporteTab({ vendor }) {
  return (
    <div className="suporte-tab">
      <div className="suporte-card">
        <h3>💬 Contactar Suporte Técnico</h3>
        <p>Está com algum problema? Fale connosco directamente pelo WhatsApp.</p>
        <a href="https://wa.me/244937999343" target="_blank" rel="noreferrer" className="btn-primary" style={{ display:'inline-flex' }}>
          📲 Abrir WhatsApp
        </a>
      </div>
      <div className="suporte-info">
        <h4>Informações da sua conta</h4>
        <div className="info-row"><span>Nome</span><strong>{vendor.name}</strong></div>
        <div className="info-row"><span>Província</span><strong>{vendor.province}</strong></div>
        <div className="info-row"><span>Telefone</span><strong>{vendor.tel}</strong></div>
        <div className="info-row"><span>Horário</span><strong>{vendor.hours}</strong></div>
        <div className="info-row"><span>Coordenadas</span><strong>{vendor.lat?.toFixed(4)}, {vendor.lng?.toFixed(4)}</strong></div>
      </div>
    </div>
  );
}
