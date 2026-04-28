import { useState } from 'react';
import Navbar from '../components/common/Navbar';
import MapView from '../components/home/MapView';
import VendorList from '../components/home/VendorList';
import FilterBar from '../components/home/FilterBar';
import Footer from '../components/common/Footer';
import { useVendors } from '../hooks/useVendors';
import './Home.css';

export default function Home() {
  const [filter, setFilter] = useState({ province: 'all', color: 'all', status: 'all' });
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [search, setSearch] = useState('');

  const { vendors, loading, error, lastUpdate, isLive } = useVendors(filter);

  const displayed = vendors.filter(v =>
    search === '' ||
    v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.address?.toLowerCase().includes(search.toLowerCase()) ||
    v.province?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="home">
      <Navbar />

      <section className="home__hero">
        <div className="home__hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" style={{ background: isLive ? '#22C55E' : '#F59E0B' }} />
            {loading
              ? 'A carregar vendedores...'
              : isLive
                ? `${vendors.length} vendedores em tempo real`
                : `${vendors.length} vendedores (modo demonstração)`}
            {lastUpdate && isLive && (
              <span className="hero-badge-time">
                · {lastUpdate.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </div>

          <h1 className="hero-title">
            Encontra Gás <span className="hero-accent">na sua cidade</span>
          </h1>
          <p className="hero-sub">
            Veja onde tem gás disponível agora, compare preços<br />
            e faça reservas sem sair de casa.
          </p>

          <div className="hero-search">
            <input
              placeholder="🔍  Pesquisar por bairro ou vendedor..."
              className="search-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button className="search-btn">Buscar</button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-stats-grid">
            {[
              { icon: '✅', label: 'Com stock',      value: vendors.filter(v => v.status === 'disponivel').length, color: '#22C55E' },
              { icon: '❌', label: 'Esgotados',      value: vendors.filter(v => v.status === 'esgotado').length,   color: '#EF4444' },
              { icon: '📍', label: 'Províncias',     value: [...new Set(vendors.map(v => v.province))].length,     color: '#3B82F6' },
              { icon: '🛢️', label: 'Tipos de Botija', value: 7,                                                    color: '#FF5E00' },
            ].map(s => (
              <div key={s.label} className="hero-stat-card" style={{ '--sc': s.color }}>
                <span className="hero-stat-icon">{s.icon}</span>
                <strong style={{ color: s.color }}>{loading ? '…' : s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Só mostrar erro se houve erro real do Supabase (não quando usa mock por design) */}
      {error && isLive === false && (
        <div className="home__error">
          ⚠️ {error} — A mostrar dados de demonstração.
        </div>
      )}

      <FilterBar
        filter={filter}
        onChange={setFilter}
        vendorCount={displayed.length}
        loading={loading}
      />

      <section className="home__content" id="mapa">
        <div className="home__map-wrap">
          <MapView
            vendors={displayed}
            loading={loading}
            onSelectVendor={setSelectedVendor}
            selectedVendor={selectedVendor}
          />
        </div>
        <div className="home__sidebar">
          <VendorList
            vendors={displayed}
            loading={loading}
            onSelectVendor={setSelectedVendor}
            selectedVendor={selectedVendor}
          />
        </div>
      </section>

      <Footer />

      <a href="https://wa.me/244937999343" target="_blank" rel="noreferrer" className="wa-float">
        <svg viewBox="0 0 24 24" fill="white" width="26" height="26">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  );
}
