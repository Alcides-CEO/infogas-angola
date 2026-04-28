import { useState } from 'react';
import VendorModal from './VendorModal';
import './MapView.css';

const MAP_BOUNDS = { latMin: -18.1, latMax: -4.4, lngMin: 11.5, lngMax: 24.2 };

function toPercent(lat, lng) {
  const x = ((lng - MAP_BOUNDS.lngMin) / (MAP_BOUNDS.lngMax - MAP_BOUNDS.lngMin)) * 100;
  const y = ((MAP_BOUNDS.latMax - lat) / (MAP_BOUNDS.latMax - MAP_BOUNDS.latMin)) * 100;
  return { x, y };
}

export default function MapView({ vendors = [], loading, onSelectVendor, selectedVendor }) {
  const [modalVendor, setModalVendor] = useState(null);

  const handlePinClick = (vendor) => {
    onSelectVendor(vendor);
    setModalVendor(vendor);
  };

  return (
    <div className="mapview">
      <div className="mapview__container">
        {/* Angola SVG Map */}
        <svg className="mapview__angola" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="mapGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1a2e50" />
              <stop offset="100%" stopColor="#0d1b2a" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <path
            d="M80,60 L120,40 L180,38 L240,50 L290,70 L320,100 L340,140 L350,180 L330,240 L300,280 L260,310 L220,330 L180,340 L150,320 L130,290 L110,310 L90,330 L70,290 L60,250 L50,200 L55,160 L70,120 L80,60Z"
            fill="url(#mapGrad)" stroke="rgba(37,99,235,0.3)" strokeWidth="1.5" filter="url(#glow)"
          />
          {[1,2,3,4,5].map(i => (
            <line key={`h${i}`} x1="50" y1={60+i*50} x2="360" y2={60+i*50} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          ))}
          {[1,2,3,4,5,6].map(i => (
            <line key={`v${i}`} x1={50+i*50} y1="38" x2={50+i*50} y2="340" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          ))}
          <text x="200" y="115" textAnchor="middle" fill="rgba(255,255,255,0.12)" fontSize="8" fontFamily="DM Sans">LUANDA</text>
          <text x="185" y="230" textAnchor="middle" fill="rgba(255,255,255,0.12)" fontSize="8" fontFamily="DM Sans">HUAMBO</text>
          <text x="130" y="265" textAnchor="middle" fill="rgba(255,255,255,0.12)" fontSize="8" fontFamily="DM Sans">BENGUELA</text>
          <text x="180" y="310" textAnchor="middle" fill="rgba(255,255,255,0.12)" fontSize="8" fontFamily="DM Sans">LUBANGO</text>
        </svg>

        {/* Loading overlay */}
        {loading && (
          <div className="mapview__loading">
            <div className="mapview__loading-spinner" />
            <span>A carregar mapa...</span>
          </div>
        )}

        {/* Vendor Pins */}
        {!loading && vendors.map(vendor => {
          if (!vendor.lat || !vendor.lng) return null;
          const { x, y } = toPercent(vendor.lat, vendor.lng);
          const isSelected  = selectedVendor?.id === vendor.id;
          const isAvailable = vendor.status === 'disponivel';

          return (
            <button
              key={vendor.id}
              className={`mapview__pin ${isAvailable ? 'mapview__pin--available' : 'mapview__pin--empty'} ${isSelected ? 'mapview__pin--selected' : ''}`}
              style={{ left: `${x}%`, top: `${y}%` }}
              onClick={() => handlePinClick(vendor)}
              title={vendor.name}
            >
              <div className="mapview__pin-inner">
                <span className="mapview__pin-emoji">{vendor.avatar || '⛽'}</span>
              </div>
              {isAvailable && <span className="mapview__pin-ring" />}

              <div className="mapview__pin-tooltip">
                <strong>{vendor.name}</strong>
                <span className={isAvailable ? 'tip-ok' : 'tip-no'}>
                  {isAvailable ? '✅ Disponível' : '❌ Esgotado'}
                </span>
                <small>📍 {vendor.province}</small>
              </div>
            </button>
          );
        })}

        {/* Sem resultados */}
        {!loading && vendors.length === 0 && (
          <div className="mapview__empty">
            <span>🔍</span>
            <p>Nenhum vendedor encontrado com estes filtros</p>
          </div>
        )}

        {/* Legend */}
        <div className="mapview__legend">
          <div className="legend-item"><span className="legend-dot legend-dot--green" />Disponível ({vendors.filter(v=>v.status==='disponivel').length})</div>
          <div className="legend-item"><span className="legend-dot legend-dot--red" />Esgotado ({vendors.filter(v=>v.status==='esgotado').length})</div>
        </div>

        {/* Controls */}
        <div className="mapview__controls">
          <button className="map-ctrl" title="Zoom +">+</button>
          <button className="map-ctrl" title="Zoom −">−</button>
          <button className="map-ctrl" title="A minha localização">📍</button>
        </div>
      </div>

      {modalVendor && (
        <VendorModal vendor={modalVendor} onClose={() => setModalVendor(null)} />
      )}
    </div>
  );
}
