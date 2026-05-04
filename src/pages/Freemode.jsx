import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import './Freemode.css'

// Ícones SVG inline
const GasIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 22V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14"/>
    <path d="M3 22h14"/>
    <line x1="8" y1="11" x2="12" y2="11"/>
    <line x1="8" y1="15" x2="12" y2="15"/>
  </svg>
)

const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
)

const MapPinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

const ZapIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
)

const BOTIJA_COLORS = {
  'azul-g':  '#2563EB', 'azul-m':  '#3B82F6', 'azul-p':  '#60A5FA',
  'lar-g':   '#FF5E00', 'lar-m':   '#FF8C3A', 'lar-p':   '#FFB570',
  'levita':  '#7C3AED',
}
const BOTIJA_LABELS = {
  'azul-g': 'Azul Grande', 'azul-m': 'Azul Média', 'azul-p': 'Azul Pequena',
  'lar-g':  'Laranja Grande', 'lar-m': 'Laranja Média', 'lar-p': 'Laranja Pequena',
  'levita': 'Levita',
}

export default function FreeMode() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('vendors')
          .select('id, name, province, address, tel, hours, status, stock, blocked')
          .eq('blocked', false)
          .order('name')
        setVendors(data || [])
      } catch {
        setVendors([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const disponiveis = vendors.filter(v => v.status === 'disponivel').length

  return (
    <div className="free-page">

      {/* Banner de upgrade — fixo no topo abaixo da navbar */}
      <div className="free-banner">
        <div className="free-banner-inner">
          <div className="free-banner-left">
            <LockIcon />
            <span>Está no <strong>modo gratuito</strong> — mapa, filtros e reservas disponíveis no plano completo</span>
          </div>
          <button className="free-banner-btn" onClick={() => navigate('/home')}>
            <ZapIcon />
            Aceder ao plano completo
            <ArrowRightIcon />
          </button>
        </div>
      </div>

      {/* Hero simples */}
      <section className="free-hero">
        <h1 className="free-hero-title">
          Pontos de Venda <span className="free-hero-accent">de Gás em Angola</span>
        </h1>
        <p className="free-hero-sub">
          Lista completa de distribuidores. Para ver no mapa, filtrar e fazer reservas, aceda ao plano completo.
        </p>
        <div className="free-hero-stats">
          <div className="free-stat">
            <strong>{loading ? '...' : vendors.length}</strong>
            <span>Vendedores</span>
          </div>
          <div className="free-stat">
            <strong>{loading ? '...' : disponiveis}</strong>
            <span>Com stock</span>
          </div>
          <div className="free-stat">
            <strong>{loading ? '...' : [...new Set(vendors.map(v => v.province))].length}</strong>
            <span>Províncias</span>
          </div>
        </div>
      </section>

      {/* Lista de vendedores */}
      <section className="free-vendors" id="vendedores">
        <div className="free-vendors-header">
          <h2>Todos os Vendedores</h2>
          <span className="free-vendors-count">{loading ? '...' : `${vendors.length} resultados`}</span>
        </div>

        {loading ? (
          <div className="free-loading">
            <div className="free-spinner" />
            <span>A carregar vendedores...</span>
          </div>
        ) : vendors.length === 0 ? (
          <div className="free-empty">
            <GasIcon />
            <p>Nenhum vendedor encontrado de momento.</p>
          </div>
        ) : (
          <div className="free-grid">
            {vendors.map(v => (
              <VendorCard key={v.id} vendor={v} />
            ))}
          </div>
        )}
      </section>

      {/* CTA upgrade no fundo */}
      <section className="free-upgrade">
        <div className="free-upgrade-inner">
          <div className="free-upgrade-icon">
            <ZapIcon />
          </div>
          <h3>Quer mais?</h3>
          <p>
            Com o plano completo acede ao <strong>mapa interactivo</strong>,
            filtros por tipo de botija, sistema de <strong>reservas</strong>,
            encomendas e stock em <strong>tempo real</strong>.
          </p>
          <button className="free-upgrade-btn" onClick={() => navigate('/home')}>
            Ver plano completo — 200 Kz/mês
            <ArrowRightIcon />
          </button>
        </div>
      </section>

    </div>
  )
}

function VendorCard({ vendor }) {
  const stock = vendor.stock || {}
  const tiposDisponiveis = Object.entries(stock)
    .filter(([, qty]) => qty > 0)
    .map(([tipo]) => tipo)

  const isOk = vendor.status === 'disponivel' && tiposDisponiveis.length > 0

  return (
    <div className={`free-card ${isOk ? 'free-card--ok' : 'free-card--empty'}`}>
      {/* Status badge */}
      <div className={`free-card-status ${isOk ? 'status-ok' : 'status-empty'}`}>
        <span className="status-dot" />
        {isOk ? 'Disponível' : 'Esgotado'}
      </div>

      {/* Info */}
      <div className="free-card-icon">
        <GasIcon />
      </div>
      <h3 className="free-card-name">{vendor.name}</h3>

      <div className="free-card-meta">
        {vendor.province && (
          <span className="free-card-meta-item">
            <MapPinIcon />
            {vendor.province}{vendor.address ? ` · ${vendor.address}` : ''}
          </span>
        )}
        {vendor.hours && (
          <span className="free-card-meta-item">
            <ClockIcon />
            {vendor.hours}
          </span>
        )}
        {vendor.tel && (
          <a href={`tel:${vendor.tel}`} className="free-card-tel">
            <PhoneIcon />
            {vendor.tel}
          </a>
        )}
      </div>

      {/* Tipos de botija disponíveis */}
      {tiposDisponiveis.length > 0 && (
        <div className="free-card-tipos">
          {tiposDisponiveis.slice(0, 4).map(tipo => (
            <span key={tipo} className="free-card-tipo">
              <span
                className="tipo-dot"
                style={{ background: BOTIJA_COLORS[tipo] || '#999' }}
              />
              {BOTIJA_LABELS[tipo] || tipo}
            </span>
          ))}
        </div>
      )}

      {/* Botão bloqueado — mostra o que seria possível */}
      <div className="free-card-locked">
        <LockIcon />
        <span>Reservar disponível no plano completo</span>
      </div>
    </div>
  )
}