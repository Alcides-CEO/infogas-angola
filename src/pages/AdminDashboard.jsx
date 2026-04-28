import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../hooks/useAdmin';
import { PROVINCES, BOTIJA_TYPES } from '../data/vendors';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab]             = useState('overview');
  const [vendorSearch, setVendorSearch] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showAddVendor, setShowAddVendor]   = useState(false);

  const { vendors, loading, saving, toggleBlock, createVendor, reload } = useAdmin();

  const filtered = vendors.filter(v => {
    const matchSearch   = v.name.toLowerCase().includes(vendorSearch.toLowerCase()) ||
                          v.province.toLowerCase().includes(vendorSearch.toLowerCase());
    const matchProvince = provinceFilter === 'all' || v.province === provinceFilter;
    return matchSearch && matchProvince;
  });

  const totalStock = vendors.reduce((acc, v) =>
    acc + Object.values(v.stock || {}).reduce((a, b) => a + b, 0), 0);
  const available = vendors.filter(v => v.status === 'disponivel' && !v.blocked).length;

  if (authLoading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#070f1a', flexDirection:'column', gap:16 }}>
        <div style={{ fontSize:40 }}>🔥</div>
        <div style={{ width:32, height:32, borderRadius:'50%', border:'3px solid rgba(255,94,0,0.2)', borderTopColor:'#FF5E00', animation:'spin 0.8s linear infinite' }} />
        <span style={{ color:'rgba(255,255,255,0.5)', fontSize:14 }}>A carregar painel admin...</span>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div className="adash">
      {/* Sidebar */}
      <aside className="adash__sidebar">
        <div className="adash__logo">🔥 Infogás <span>Admin</span></div>

        <nav className="adash__nav">
          {[
            { id:'overview',   icon:'📊', label:'Dashboard'    },
            { id:'vendors',    icon:'🏪', label:'Vendedores'   },
            { id:'map',        icon:'🗺️', label:'Mapa Global'  },
            { id:'relatorios', icon:'📈', label:'Relatórios'   },
            { id:'imagens',    icon:'🖼️', label:'Banners'      },
            { id:'settings',   icon:'⚙️', label:'Configurações'},
          ].map(item => (
            <button key={item.id}
              className={`adash__nav-item ${tab === item.id ? 'adash__nav-item--active' : ''}`}
              onClick={() => setTab(item.id)}>
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>

        <div className="adash__sidebar-footer">
          <div className="adash__admin-info">
            <span className="adash__admin-avatar">🛡️</span>
            <div><strong>Administrador</strong><span>Infogás Angola</span></div>
          </div>
          <button className="adash__logout-btn" onClick={async () => { await logout(); navigate('/'); }}>
            🚪 Sair
          </button>
          <a href="/home" className="adash__exit">← Ver site</a>
        </div>
      </aside>

      {/* Main */}
      <main className="adash__main">
        <header className="adash__header">
          <div>
            <h1 className="adash__page-title">
              {{ overview:'Dashboard', vendors:'Gestão de Vendedores', map:'Mapa Global',
                 relatorios:'Relatórios & Analytics', imagens:'Banners & Imagens', settings:'Configurações' }[tab]}
            </h1>
            <p className="adash__page-sub">Controlo total · {vendors.length} vendedores · {available} activos</p>
          </div>
          <div className="adash__header-right">
            <div className="adash__live"><span className="live-dot" />Sistema Online</div>
            {tab === 'vendors' && (
              <button className="btn-primary" style={{ padding:'9px 20px', fontSize:13 }}
                onClick={() => setShowAddVendor(true)}>
                + Adicionar Vendedor
              </button>
            )}
          </div>
        </header>

        <div className="adash__content">
          {tab === 'overview' && (
            <OverviewTab vendors={vendors} totalStock={totalStock} available={available} loading={loading} />
          )}
          {tab === 'vendors' && (
            <VendorsTab
              vendors={filtered} allVendors={vendors} loading={loading} saving={saving}
              search={vendorSearch} onSearch={setVendorSearch}
              province={provinceFilter} onProvince={setProvinceFilter}
              onSelect={setSelectedVendor} onToggleBlock={toggleBlock}
            />
          )}
          {tab === 'relatorios' && <RelatoriosTab vendors={vendors} />}
          {tab === 'map'        && <MapTab vendors={vendors} />}
          {(tab === 'imagens' || tab === 'settings') && (
            <div className="coming-soon">🚧 Em desenvolvimento — disponível em breve</div>
          )}
        </div>
      </main>

      {selectedVendor && (
        <VendorDetailModal
          vendor={selectedVendor}
          onClose={() => setSelectedVendor(null)}
          onToggleBlock={(id) => { toggleBlock(id, selectedVendor.blocked); setSelectedVendor(null); }}
        />
      )}
      {showAddVendor && (
        <AddVendorModal
          onClose={() => setShowAddVendor(false)}
          onCreate={async (data) => {
            const result = await createVendor(data);
            if (result.ok) setShowAddVendor(false);
            return result;
          }}
          saving={saving}
        />
      )}
    </div>
  );
}

// ── OVERVIEW ────────────────────────────────────────
function OverviewTab({ vendors, totalStock, available, loading }) {
  const provinces = [...new Set(vendors.map(v => v.province))];
  const byProvince = provinces.map(p => ({
    name: p,
    count: vendors.filter(v => v.province === p).length,
    avail: vendors.filter(v => v.province === p && v.status === 'disponivel' && !v.blocked).length,
  }));

  const kpis = [
    { icon:'🏪', label:'Total Vendedores',  value: vendors.length,       sub:'registados',          color:'#FF5E00' },
    { icon:'✅', label:'Com Stock',          value: available,            sub:`de ${vendors.length}`, color:'#22C55E' },
    { icon:'📦', label:'Stock Total',        value: totalStock,           sub:'unidades no sistema', color:'#2563EB' },
    { icon:'🗺️', label:'Províncias',         value: provinces.length,     sub:'cobertas',            color:'#7C3AED' },
    { icon:'🔒', label:'Bloqueados',         value: vendors.filter(v=>v.blocked).length, sub:'contas suspensas', color:'#EF4444' },
    { icon:'❌', label:'Esgotados',          value: vendors.filter(v=>v.status==='esgotado'&&!v.blocked).length, sub:'sem stock', color:'#F59E0B' },
    { icon:'⭐', label:'Avaliação Média',    value: vendors.length ? (vendors.reduce((a,v)=>a+(v.rating||0),0)/vendors.length).toFixed(1) : '—', sub:'na plataforma', color:'#FFD166' },
    { icon:'💰', label:'Faturação Est.',     value: `Kz ${(vendors.reduce((acc,v)=>acc+Object.entries(v.stock||{}).reduce((a,[k,q])=>a+q*((v.prices||{})[k]||0),0),0)/1000).toFixed(0)}K`, sub:'baseado no stock', color:'#22C55E' },
  ];

  return (
    <div className="overview">
      <div className="kpi-grid">
        {kpis.map(k => <AdminKPI key={k.label} {...k} loading={loading} />)}
      </div>

      <div className="admin-section">
        <h3 className="section-title">Stock por Província</h3>
        {loading ? (
          <div style={{ color:'rgba(255,255,255,0.3)', fontSize:14 }}>A carregar...</div>
        ) : (
          <div className="province-grid">
            {byProvince.map(p => (
              <div key={p.name} className="province-card">
                <div className="province-name">📍 {p.name}</div>
                <div className="province-stats">
                  <span>{p.count} vendedores</span>
                  <span className="province-ok">{p.avail} com stock</span>
                </div>
                <div className="province-bar-wrap">
                  <div className="province-bar" style={{ width:`${p.count ? (p.avail/p.count)*100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-section">
        <h3 className="section-title">Vendedores Recentes</h3>
        <div className="quick-vendor-list">
          {vendors.slice(0, 6).map(v => {
            const ts = Object.values(v.stock||{}).reduce((a,b)=>a+b,0);
            return (
              <div key={v.id} className="quick-vendor">
                <span style={{ fontSize:22 }}>{v.avatar||'⛽'}</span>
                <div className="quick-vendor-info">
                  <strong>{v.name}</strong>
                  <span>📍 {v.province}</span>
                </div>
                <span className={`quick-status ${v.status==='disponivel'&&!v.blocked?'qs-ok':'qs-no'}`}>
                  {v.blocked ? '🔒' : v.status==='disponivel' ? '●  Disponível' : '●  Esgotado'}
                </span>
                <span className="quick-stock">{ts} un.</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AdminKPI({ icon, label, value, sub, color, loading }) {
  return (
    <div className="admin-kpi" style={{ '--kc': color }}>
      <div className="admin-kpi__top">
        <span className="admin-kpi__icon">{icon}</span>
        <span className="admin-kpi__value">{loading ? '…' : value}</span>
      </div>
      <div className="admin-kpi__label">{label}</div>
      <div className="admin-kpi__sub">{sub}</div>
    </div>
  );
}

// ── VENDORS TAB ─────────────────────────────────────
function VendorsTab({ vendors, allVendors, loading, saving, search, onSearch, province, onProvince, onSelect, onToggleBlock }) {
  return (
    <div className="vendors-tab">
      <div className="vendors-toolbar">
        <input className="vendors-search" placeholder="🔍  Pesquisar por nome ou província..."
          value={search} onChange={e => onSearch(e.target.value)} />
        <select className="vendors-filter" value={province} onChange={e => onProvince(e.target.value)}>
          <option value="all">Todas as Províncias</option>
          {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="vendors-count">
        {loading ? 'A carregar...' : `${vendors.length} de ${allVendors.length} vendedores`}
      </div>

      <div className="vendors-table">
        <div className="vtable-head">
          <span>Vendedor</span>
          <span>Província</span>
          <span>Stock Total</span>
          <span>Estado</span>
          <span>Avaliação</span>
          <span>Ações</span>
        </div>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="vtable-row vtable-row--skeleton">
              <div className="sk sk-line sk-w80" />
              <div className="sk sk-line sk-w50" />
              <div className="sk sk-line sk-w30" />
              <div className="sk sk-line sk-w40" />
              <div className="sk sk-line sk-w20" />
              <div className="sk sk-line sk-w50" />
            </div>
          ))
        ) : vendors.map(v => {
          const total = Object.values(v.stock||{}).reduce((a,b)=>a+b,0);
          return (
            <div key={v.id} className={`vtable-row ${v.blocked ? 'vtable-row--blocked' : ''}`}>
              <div className="vtable-vendor">
                <span className="vtable-avatar">{v.avatar||'⛽'}</span>
                <div>
                  <strong>{v.name}</strong>
                  <small>{v.address || v.province}</small>
                </div>
              </div>
              <span className="vtable-cell">📍 {v.province}</span>
              <span className="vtable-cell">
                <span className={`stock-badge ${total===0?'sb-red':total<10?'sb-yellow':'sb-green'}`}>{total} un.</span>
              </span>
              <span className="vtable-cell">
                {v.blocked
                  ? <span className="tag tag-red">🔒 Bloqueado</span>
                  : <span className={`tag ${v.status==='disponivel'?'tag-green':'tag-red'}`}>
                      {v.status==='disponivel'?'✅ Disponível':'❌ Esgotado'}
                    </span>
                }
              </span>
              <span className="vtable-cell">⭐ {v.rating||'—'}</span>
              <div className="vtable-actions">
                <button className="act-btn act-btn--view" onClick={() => onSelect(v)}>👁 Ver</button>
                <button
                  className={`act-btn ${v.blocked?'act-btn--unblock':'act-btn--block'}`}
                  onClick={() => onToggleBlock(v.id, v.blocked)}
                  disabled={saving}>
                  {v.blocked ? '🔓 Desbloquear' : '🔒 Bloquear'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── RELATÓRIOS TAB ───────────────────────────────────
function RelatoriosTab({ vendors }) {
  const byProv = [...new Set(vendors.map(v=>v.province))].map(p => ({
    name: p,
    count: vendors.filter(v=>v.province===p).length,
    stock: vendors.filter(v=>v.province===p).reduce((acc,v)=>acc+Object.values(v.stock||{}).reduce((a,b)=>a+b,0),0),
  })).sort((a,b)=>b.stock-a.stock);
  const maxStock = Math.max(...byProv.map(p=>p.stock), 1);

  const topVendors = [...vendors]
    .sort((a,b) => Object.values(b.stock||{}).reduce((x,y)=>x+y,0) - Object.values(a.stock||{}).reduce((x,y)=>x+y,0))
    .slice(0,5);

  const faturacaoTotal = vendors.reduce((acc,v)=>
    acc + Object.entries(v.stock||{}).reduce((a,[k,q])=>a+q*((v.prices||{})[k]||0),0), 0);

  return (
    <div className="relatorios-tab">
      <div className="relatorio-grid">
        {/* Stock por Província */}
        <div className="relatorio-card">
          <h3>📍 Stock por Província</h3>
          <p className="relatorio-sub">Onde existe mais gás disponível</p>
          {byProv.map((p,i) => (
            <div key={p.name} className="rel-row">
              <span className="rel-rank">#{i+1}</span>
              <span className="rel-name">{p.name}</span>
              <div className="rel-bar-wrap">
                <div className="rel-bar" style={{ width:`${(p.stock/maxStock)*100}%` }} />
              </div>
              <span className="rel-val">{p.stock}</span>
            </div>
          ))}
        </div>

        {/* Top Vendedores */}
        <div className="relatorio-card">
          <h3>🏆 Top Vendedores por Stock</h3>
          <p className="relatorio-sub">Quem domina as vendas</p>
          {topVendors.map((v,i) => {
            const total = Object.values(v.stock||{}).reduce((a,b)=>a+b,0);
            const est   = Object.entries(v.stock||{}).reduce((acc,[k,q])=>acc+q*((v.prices||{})[k]||0),0);
            return (
              <div key={v.id} className="top-vendor-row">
                <span className="top-rank">#{i+1}</span>
                <span style={{ fontSize:20 }}>{v.avatar||'⛽'}</span>
                <div className="top-info">
                  <strong>{v.name}</strong>
                  <span>{v.province}</span>
                </div>
                <div className="top-stats">
                  <span>{total} un.</span>
                  <span className="top-faturado">Kz {est.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Por tipo de botija */}
        <div className="relatorio-card">
          <h3>🛢️ Stock por Tipo de Botija</h3>
          <p className="relatorio-sub">Distribuição total por categoria</p>
          {BOTIJA_TYPES.map(b => {
            const total = vendors.reduce((acc,v)=>acc+(v.stock||{})[b.id]||0, 0);
            return (
              <div key={b.id} className="botija-rel-row">
                <div className="botija-rel-dot" style={{ background: b.color }} />
                <span className="botija-rel-label">{b.label}</span>
                <div className="rel-bar-wrap">
                  <div className="rel-bar" style={{ width:`${Math.min(total*2,100)}%`, background: b.color }} />
                </div>
                <span className="rel-val">{total}</span>
              </div>
            );
          })}
        </div>

        {/* Faturação */}
        <div className="relatorio-card relatorio-card--summary">
          <h3>💰 Faturação Estimada Total</h3>
          <p className="relatorio-sub">Stock actual × preços definidos</p>
          <div className="summary-big">Kz {faturacaoTotal.toLocaleString()}</div>
          <div className="summary-stats">
            <div><strong>{vendors.filter(v=>v.status==='disponivel'&&!v.blocked).length}</strong><span>Activos</span></div>
            <div><strong>{vendors.filter(v=>v.status==='esgotado').length}</strong><span>Esgotados</span></div>
            <div><strong>{vendors.filter(v=>v.blocked).length}</strong><span>Bloqueados</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAP TAB ─────────────────────────────────────────
function MapTab({ vendors }) {
  return (
    <div className="map-tab">
      <div className="map-tab-info">
        <h3>🗺️ Todos os Vendedores com Coordenadas</h3>
        <p>Listagem das coordenadas GPS de cada estabelecimento registado.</p>
      </div>
      {vendors.map(v => (
        <div key={v.id} className={`map-vendor-row ${v.blocked?'mvr--blocked':''}`}>
          <span style={{ fontSize:22 }}>{v.avatar||'⛽'}</span>
          <div className="mvr-info">
            <strong>{v.name}</strong>
            <small>📍 {v.province} · {v.address}</small>
            {v.lat && <small style={{ color:'rgba(255,255,255,0.3)' }}>
              Lat: {v.lat.toFixed(4)} · Lng: {v.lng?.toFixed(4)}
            </small>}
          </div>
          <div className="mvr-right">
            <span className={`tag ${v.blocked?'tag-red':v.status==='disponivel'?'tag-green':'tag-red'}`}>
              {v.blocked?'🔒':v.status==='disponivel'?'✅':'❌'} {v.blocked?'Bloqueado':v.status}
            </span>
            <span style={{ color:'rgba(255,255,255,0.4)', fontSize:12 }}>
              {Object.values(v.stock||{}).reduce((a,b)=>a+b,0)} un.
            </span>
          </div>
        </div>
      ))}
      <div className="map-tab__note">
        💡 Integração com Google Maps disponível após configurar a chave de API no painel de configurações.
      </div>
    </div>
  );
}

// ── VENDOR DETAIL MODAL ─────────────────────────────
function VendorDetailModal({ vendor, onClose, onToggleBlock }) {
  const total = Object.values(vendor.stock||{}).reduce((a,b)=>a+b,0);
  const est   = Object.entries(vendor.stock||{}).reduce((acc,[k,q])=>acc+q*((vendor.prices||{})[k]||0),0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={e=>e.stopPropagation()}>
        <button className="modal__close" onClick={onClose}>✕</button>

        <div className="admin-modal__header">
          <span style={{ fontSize:44 }}>{vendor.avatar||'⛽'}</span>
          <div>
            <h2>{vendor.name}</h2>
            <p>📍 {vendor.province} · {vendor.address}</p>
          </div>
          <span className={`tag ${vendor.blocked?'tag-red':vendor.status==='disponivel'?'tag-green':'tag-red'}`}>
            {vendor.blocked?'🔒 Bloqueado':vendor.status==='disponivel'?'✅ Disponível':'❌ Esgotado'}
          </span>
        </div>

        <div className="admin-modal__body">
          <div className="detail-grid">
            {[
              ['📞 Telefone', vendor.tel||'—'],
              ['✉️ Email',    vendor.email||'—'],
              ['🕐 Horário',  vendor.hours||'—'],
              ['⭐ Avaliação',`${vendor.rating||0}/5 (${vendor.reviews||0} av.)`],
              ['📦 Stock',    `${total} unidades`],
              ['💰 Faturação Est.', `Kz ${est.toLocaleString()}`],
              ['📍 Coordenadas', vendor.lat ? `${vendor.lat.toFixed(4)}, ${vendor.lng?.toFixed(4)}` : '—'],
              ['📅 Registado', vendor.created_at ? new Date(vendor.created_at).toLocaleDateString('pt-AO') : '—'],
            ].map(([label, value]) => (
              <div key={label} className="detail-item">
                <span>{label}</span><strong>{value}</strong>
              </div>
            ))}
          </div>

          <div className="detail-stock">
            <h4>Stock por tipo de botija:</h4>
            {BOTIJA_TYPES.map(b => {
              const q = (vendor.stock||{})[b.id]||0;
              const p = (vendor.prices||{})[b.id]||0;
              return (
                <div key={b.id} className="ds-row">
                  <div className="ds-dot" style={{ background:b.color }} />
                  <span>{b.label}</span>
                  <strong>{q} un.</strong>
                  <span className="ds-price">{p ? `Kz ${p.toLocaleString()}` : '—'}</span>
                </div>
              );
            })}
          </div>

          <div className="admin-modal__actions">
            <button
              className={`act-btn ${vendor.blocked?'act-btn--unblock':'act-btn--block'}`}
              style={{ padding:'10px 24px', fontSize:14 }}
              onClick={() => onToggleBlock(vendor.id)}>
              {vendor.blocked ? '🔓 Desbloquear Conta' : '🔒 Bloquear Conta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ADD VENDOR MODAL ────────────────────────────────
function AddVendorModal({ onClose, onCreate, saving }) {
  const [form, setForm] = useState({
    name:'', tel:'', email:'', province:'', address:'',
    lat:'', lng:'', hours:'08:00 - 20:00', avatar:'⛽',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    if (!form.name || !form.province || !form.tel) {
      setError('Nome, Província e Telefone são obrigatórios.');
      return;
    }
    setError('');
    const result = await onCreate({
      ...form,
      lat: parseFloat(form.lat) || 0,
      lng: parseFloat(form.lng) || 0,
    });
    if (result.ok) {
      setSuccess(true);
      setTimeout(onClose, 1500);
    } else {
      setError(result.error || 'Erro ao criar vendedor.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-modal--wide" onClick={e=>e.stopPropagation()}>
        <button className="modal__close" onClick={onClose}>✕</button>
        <h2 className="admin-modal__title">+ Adicionar Novo Vendedor</h2>

        {success ? (
          <div style={{ padding:32, textAlign:'center' }}>
            <div style={{ fontSize:52 }}>✅</div>
            <p style={{ color:'white', marginTop:16, fontSize:16 }}>Vendedor criado com sucesso!</p>
          </div>
        ) : (
          <div className="add-vendor-form">
            {error && <div className="form-error-banner">⚠️ {error}</div>}

            <div className="form-row">
              <div className="auth-field"><label>Nome do Estabelecimento *</label><input placeholder="Ex: Gasóleo Talatona" value={form.name} onChange={e=>set('name',e.target.value)} /></div>
              <div className="auth-field"><label>Telefone *</label><input placeholder="+244 912 345 678" value={form.tel} onChange={e=>set('tel',e.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="auth-field"><label>Email de Acesso</label><input type="email" placeholder="vendedor@email.com" value={form.email} onChange={e=>set('email',e.target.value)} /></div>
              <div className="auth-field"><label>Horário</label><input placeholder="07:00 - 20:00" value={form.hours} onChange={e=>set('hours',e.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="auth-field">
                <label>Província *</label>
                <select value={form.province} onChange={e=>set('province',e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {PROVINCES.map(p=><option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="auth-field"><label>Emoji / Avatar</label><input placeholder="⛽" value={form.avatar} onChange={e=>set('avatar',e.target.value)} /></div>
            </div>
            <div className="auth-field"><label>Endereço Completo</label><input placeholder="Rua, Bairro, Cidade" value={form.address} onChange={e=>set('address',e.target.value)} /></div>
            <div className="form-row">
              <div className="auth-field"><label>Latitude (GPS)</label><input placeholder="-8.9175" value={form.lat} onChange={e=>set('lat',e.target.value)} /></div>
              <div className="auth-field"><label>Longitude (GPS)</label><input placeholder="13.2312" value={form.lng} onChange={e=>set('lng',e.target.value)} /></div>
            </div>
            <div className="coords-hint">
              💡 Para obter coordenadas: abra o Google Maps, clique com o botão direito na localização e copie as coordenadas.
            </div>
            <div className="add-vendor-actions">
              <button className="btn-ghost" onClick={onClose}>Cancelar</button>
              <button className="btn-primary" onClick={handleCreate} disabled={saving} style={{ opacity:saving?0.7:1 }}>
                {saving ? '⏳ A criar...' : '✅ Criar Vendedor'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
