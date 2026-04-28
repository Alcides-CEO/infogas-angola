import { useState } from 'react';
import { BOTIJA_TYPES } from '../../data/vendors';
import { useCreateReserva } from '../../hooks/useReservas';
import './VendorModal.css';

export default function VendorModal({ vendor, onClose }) {
  const [tab, setTab]           = useState('info');
  const [reserveType, setReserveType] = useState(null);
  const [qty, setQty]           = useState(1);
  const [clientName, setClientName] = useState('');
  const [clientTel, setClientTel]   = useState('');
  const [address, setAddress]   = useState('');
  const [notes, setNotes]       = useState('');

  const { submit, submitEncomenda, loading, success, error } = useCreateReserva();

  const stock  = vendor.stock  || {};
  const prices = vendor.prices || {};
  const availableTypes = BOTIJA_TYPES.filter(b => (stock[b.id] || 0) > 0);

  const handleReservar = async () => {
    if (!reserveType || !clientName || !clientTel) return;
    const result = await submit({
      vendor_id: vendor.id,
      client_name: clientName,
      client_tel: clientTel,
      botija_type: reserveType,
      quantity: qty,
      price_total: (prices[reserveType] || 0) * qty,
    });
    if (result.ok) {
      setTab('confirmado');
    }
  };

  const handleEncomendar = async () => {
    if (!clientName || !clientTel) return;
    const result = await submitEncomenda({
      vendor_id: vendor.id,
      client_name: clientName,
      client_tel: clientTel,
      botija_type: reserveType,
      quantity: qty,
      address,
      notes,
    });
    if (result.ok) {
      setTab('confirmado');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose}>✕</button>

        {/* Header */}
        <div className="modal__header">
          <div className="modal__avatar">{vendor.avatar || '⛽'}</div>
          <div>
            <h2 className="modal__name">{vendor.name}</h2>
            <p className="modal__addr">📍 {vendor.address}</p>
            <div className="modal__meta">
              <span className={`tag ${vendor.status === 'disponivel' ? 'tag-green' : 'tag-red'}`}>
                {vendor.status === 'disponivel' ? '✅ Disponível' : '❌ Esgotado'}
              </span>
              {vendor.rating > 0 && <span className="modal__rating">⭐ {vendor.rating} ({vendor.reviews})</span>}
              {vendor.hours && <span className="modal__hours">🕐 {vendor.hours}</span>}
            </div>
          </div>
        </div>

        {/* Tabs */}
        {tab !== 'confirmado' && (
          <div className="modal__tabs">
            {['info','stock','reservar','encomendar'].map(t => (
              <button key={t} className={`modal__tab ${tab === t ? 'modal__tab--active' : ''}`}
                onClick={() => setTab(t)}>
                {{ info:'ℹ️ Info', stock:'📦 Stock', reservar:'📋 Reservar', encomendar:'🚚 Encomendar' }[t]}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="modal__body">
          {tab === 'confirmado' && (
            <div className="modal__success">
              <div className="success-icon">✅</div>
              <h3>Pedido enviado!</h3>
              <p>O vendedor foi notificado e entrará em contacto brevemente.</p>
              <a href={`https://wa.me/${vendor.tel?.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="btn-primary" style={{ justifyContent:'center' }}>
                📲 Contactar via WhatsApp
              </a>
              <button className="btn-ghost" style={{ marginTop: 8 }} onClick={onClose}>Fechar</button>
            </div>
          )}

          {tab === 'info' && (
            <div className="modal__info">
              <div className="info-row"><span>📞 Telefone</span><strong>{vendor.tel}</strong></div>
              <div className="info-row"><span>📍 Província</span><strong>{vendor.province}</strong></div>
              {vendor.hours && <div className="info-row"><span>🕐 Horário</span><strong>{vendor.hours}</strong></div>}
              {vendor.rating > 0 && <div className="info-row"><span>⭐ Avaliação</span><strong>{vendor.rating}/5 · {vendor.reviews} avaliações</strong></div>}
              <div className="modal__prices">
                <h4>Preços</h4>
                {BOTIJA_TYPES.filter(b => prices[b.id]).map(b => (
                  <div key={b.id} className="price-row">
                    <div className="price-dot" style={{ background: b.color }} />
                    <span>{b.label}</span>
                    <strong>Kz {prices[b.id]?.toLocaleString()}</strong>
                  </div>
                ))}
                {!Object.keys(prices).length && <p style={{ color:'rgba(255,255,255,0.35)',fontSize:13 }}>Preços não disponíveis</p>}
              </div>
            </div>
          )}

          {tab === 'stock' && (
            <div className="modal__stock">
              <p className="stock-note">⚡ Stock actualizado em tempo real pelo vendedor</p>
              {BOTIJA_TYPES.map(b => {
                const q = stock[b.id] || 0;
                return (
                  <div key={b.id} className="stock-row">
                    <div className="stock-dot" style={{ background: b.color }} />
                    <span className="stock-label">{b.label}</span>
                    <div className="stock-bar-wrap">
                      <div className="stock-bar" style={{ width: `${Math.min(q*4,100)}%`, background: b.color }} />
                    </div>
                    <strong className={q === 0 ? 'stock-zero' : 'stock-num'}>{q} un.</strong>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'reservar' && (
            <div className="modal__form">
              {vendor.status === 'esgotado' ? (
                <div className="form-empty">❌ Este vendedor não tem stock disponível de momento.</div>
              ) : (
                <>
                  <p>Seleccione o tipo de botija:</p>
                  <div className="form-types">
                    {availableTypes.map(b => (
                      <button key={b.id}
                        className={`type-btn ${reserveType === b.id ? 'type-btn--active' : ''}`}
                        style={{ '--tc': b.color }}
                        onClick={() => setReserveType(b.id)}>
                        <div className="type-dot" style={{ background: b.color }} />
                        <span>{b.label}</span>
                        <small>{stock[b.id]} disponíveis · Kz {prices[b.id]?.toLocaleString()}</small>
                      </button>
                    ))}
                  </div>

                  {reserveType && (
                    <>
                      <div className="qty-row">
                        <label>Quantidade:</label>
                        <div className="qty-ctrl">
                          <button onClick={() => setQty(q => Math.max(1,q-1))}>−</button>
                          <span>{qty}</span>
                          <button onClick={() => setQty(q => Math.min(stock[reserveType]||1,q+1))}>+</button>
                        </div>
                      </div>
                      <input placeholder="O seu nome *" className="form-input" value={clientName} onChange={e=>setClientName(e.target.value)} />
                      <input placeholder="O seu telefone *" className="form-input" value={clientTel} onChange={e=>setClientTel(e.target.value)} />
                      <div className="form-total">
                        Total estimado: <strong>Kz {((prices[reserveType]||0)*qty).toLocaleString()}</strong>
                      </div>
                      {error && <div className="form-error">⚠️ {error}</div>}
                      <button
                        className="btn-primary"
                        style={{ width:'100%', justifyContent:'center', opacity: loading ? 0.7 : 1 }}
                        onClick={handleReservar}
                        disabled={loading || !clientName || !clientTel}
                      >
                        {loading ? '⏳ A enviar...' : '✅ Confirmar Reserva'}
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {tab === 'encomendar' && (
            <div className="modal__form">
              <p>Faça a sua encomenda e o vendedor entrará em contacto.</p>
              <div className="form-types">
                {availableTypes.map(b => (
                  <button key={b.id}
                    className={`type-btn ${reserveType === b.id ? 'type-btn--active' : ''}`}
                    style={{ '--tc': b.color }}
                    onClick={() => setReserveType(b.id)}>
                    <div className="type-dot" style={{ background: b.color }} />
                    <span>{b.label}</span>
                    <small>Kz {prices[b.id]?.toLocaleString() || '—'}</small>
                  </button>
                ))}
              </div>
              <input placeholder="O seu nome *" className="form-input" value={clientName} onChange={e=>setClientName(e.target.value)} />
              <input placeholder="O seu telefone *" className="form-input" value={clientTel} onChange={e=>setClientTel(e.target.value)} />
              <input placeholder="Endereço de entrega (opcional)" className="form-input" value={address} onChange={e=>setAddress(e.target.value)} />
              <textarea placeholder="Observações (ex: apartamento 4B, 2.º andar)" className="form-input form-textarea" value={notes} onChange={e=>setNotes(e.target.value)} />
              {error && <div className="form-error">⚠️ {error}</div>}
              <button
                className="btn-primary"
                style={{ width:'100%', justifyContent:'center', opacity: loading ? 0.7 : 1 }}
                onClick={handleEncomendar}
                disabled={loading || !clientName || !clientTel}
              >
                {loading ? '⏳ A enviar...' : '🚚 Fazer Encomenda'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
