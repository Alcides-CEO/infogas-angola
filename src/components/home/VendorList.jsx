import { BOTIJA_TYPES } from '../../data/vendors';
import VendorModal from './VendorModal';
import { useState } from 'react';
import './VendorList.css';

export default function VendorList({ vendors = [], loading, onSelectVendor, selectedVendor }) {
  const [modalVendor, setModalVendor] = useState(null);

  const handleSelect = (v) => {
    onSelectVendor(v);
    setModalVendor(v);
  };

  return (
    <div className="vlist">
      <div className="vlist__header">
        <h3>Vendedores</h3>
        <span className="vlist__count">
          {loading ? '…' : `${vendors.length} encontrados`}
        </span>
      </div>

      {loading ? (
        <div className="vlist__loading">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : vendors.length === 0 ? (
        <div className="vlist__empty">
          <div className="vlist__empty-icon">🔍</div>
          <p>Nenhum vendedor encontrado<br />com esses filtros.</p>
        </div>
      ) : (
        <div className="vlist__items">
          {vendors.map(v => (
            <VendorCard
              key={v.id}
              vendor={v}
              selected={selectedVendor?.id === v.id}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      {modalVendor && (
        <VendorModal vendor={modalVendor} onClose={() => setModalVendor(null)} />
      )}
    </div>
  );
}

function VendorCard({ vendor, selected, onSelect }) {
  const stock = vendor.stock || {};
  const availableTypes = BOTIJA_TYPES.filter(b => (stock[b.id] || 0) > 0);
  const isAvailable = vendor.status === 'disponivel' && availableTypes.length > 0;

  return (
    <button className={`vcard ${selected ? 'vcard--selected' : ''}`} onClick={() => onSelect(vendor)}>
      <div className="vcard__top">
        <div className="vcard__avatar">{vendor.avatar || '⛽'}</div>
        <div className="vcard__info">
          <h4 className="vcard__name">{vendor.name}</h4>
          <p className="vcard__location">📍 {vendor.province}{vendor.address ? ` · ${vendor.address.split(',')[0]}` : ''}</p>
        </div>
        <span className={`vcard__status ${isAvailable ? 'vcard__status--ok' : 'vcard__status--no'}`}>●</span>
      </div>

      <div className="vcard__types">
        {availableTypes.length > 0 ? (
          availableTypes.slice(0, 5).map(b => (
            <div key={b.id} className="vcard__type-dot" style={{ background: b.color }} title={b.label} />
          ))
        ) : (
          <span className="vcard__no-stock">Sem stock disponível</span>
        )}
      </div>

      <div className="vcard__bottom">
        {vendor.rating > 0 && <span className="vcard__rating">⭐ {vendor.rating}</span>}
        {vendor.hours && <span className="vcard__hours">🕐 {vendor.hours}</span>}
        <span className="vcard__view">Ver detalhes →</span>
      </div>
    </button>
  );
}

function SkeletonCard() {
  return (
    <div className="vcard vcard--skeleton">
      <div className="vcard__top">
        <div className="sk sk-avatar" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="sk sk-line sk-w80" />
          <div className="sk sk-line sk-w50" />
        </div>
      </div>
      <div className="vcard__types">
        {[1,2,3].map(i => <div key={i} className="sk sk-dot" />)}
      </div>
    </div>
  );
}
