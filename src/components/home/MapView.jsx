import { useEffect, useRef, useState } from 'react';
import VendorModal from './VendorModal';
import './MapView.css';

// Ícones SVG inline (sem dependência de pasta externa)
const GasIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 22V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14"/>
    <path d="M3 22h14"/>
    <line x1="8" y1="11" x2="12" y2="11"/>
    <line x1="8" y1="15" x2="12" y2="15"/>
  </svg>
);

const MapPinIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
    stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const ANGOLA_CENTER = [-11.2, 17.8];
const PIN_OK    = '#FF5E00';
const PIN_EMPTY = '#6B7280';

export default function MapView({ vendors = [], loading, onSelectVendor, selectedVendor }) {
  const mapRef     = useRef(null);
  const leafletRef = useRef(null);
  const markersRef = useRef([]);
  const [modalVendor, setModalVendor] = useState(null);
  const [mapReady, setMapReady]       = useState(false);

  // Inicializar mapa
  useEffect(() => {
    if (leafletRef.current) return;

    import('leaflet').then((L) => {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current, {
        center: ANGOLA_CENTER,
        zoom: 5,
        zoomControl: false,
      });

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
          subdomains: 'abcd',
          maxZoom: 19,
        }
      ).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      leafletRef.current = { map, L };
      setMapReady(true);
    });

    return () => {
      if (leafletRef.current?.map) {
        leafletRef.current.map.remove();
        leafletRef.current = null;
      }
    };
  }, []);

  // Actualizar markers
  useEffect(() => {
    if (!mapReady || !leafletRef.current) return;
    const { map, L } = leafletRef.current;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    vendors.forEach(vendor => {
      if (!vendor.lat || !vendor.lng) return;

      const isOk       = vendor.status === 'disponivel';
      const isSelected = selectedVendor?.id === vendor.id;
      const color      = isOk ? PIN_OK : PIN_EMPTY;
      const size       = isSelected ? 44 : 36;

      const iconHtml = `
        <div class="lf-pin ${isOk ? 'lf-pin-ok' : 'lf-pin-empty'} ${isSelected ? 'lf-pin-selected' : ''}"
          style="width:${size}px;height:${size}px;background:${color};">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 22V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14"/>
            <path d="M3 22h14"/>
            <line x1="8" y1="11" x2="12" y2="11"/>
            <line x1="8" y1="15" x2="12" y2="15"/>
          </svg>
          ${isOk ? '<div class="lf-ring"></div>' : ''}
        </div>`;

      const icon = L.divIcon({
        html: iconHtml,
        className: '',
        iconSize:   [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor:[0, -size],
      });

      const marker = L.marker([vendor.lat, vendor.lng], { icon });

      marker.bindPopup(`
        <div class="lf-popup">
          <strong>${vendor.name}</strong>
          <span class="${isOk ? 'lf-ok' : 'lf-no'}">${isOk ? 'Disponível' : 'Esgotado'}</span>
          <small>${vendor.province || ''}</small>
        </div>`, { className: 'lf-popup-wrap', maxWidth: 200 });

      marker.on('click', () => {
        onSelectVendor(vendor);
        setModalVendor(vendor);
      });

      marker.addTo(map);
      markersRef.current.push(marker);
    });
  }, [vendors, mapReady, selectedVendor, onSelectVendor]);

  // Voar para o vendedor seleccionado
  useEffect(() => {
    if (!mapReady || !selectedVendor?.lat || !leafletRef.current) return;
    leafletRef.current.map.flyTo([selectedVendor.lat, selectedVendor.lng], 12, { duration: 0.8 });
  }, [selectedVendor, mapReady]);

  return (
    <div className="mapview">
      {loading && (
        <div className="mapview__loading">
          <div className="mapview__spinner" />
          <span>A carregar mapa...</span>
        </div>
      )}

      <div ref={mapRef} className="mapview__leaflet" />

      <div className="mapview__legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ background: PIN_OK }} />
          Disponível ({vendors.filter(v => v.status === 'disponivel').length})
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: PIN_EMPTY }} />
          Esgotado ({vendors.filter(v => v.status === 'esgotado').length})
        </div>
      </div>

      {!loading && vendors.length === 0 && (
        <div className="mapview__empty">
          <MapPinIcon />
          <p>Nenhum vendedor encontrado</p>
        </div>
      )}

      {modalVendor && (
        <VendorModal vendor={modalVendor} onClose={() => setModalVendor(null)} />
      )}
    </div>
  );
}