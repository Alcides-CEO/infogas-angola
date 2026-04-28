import './VendorCard.css'

const BOTIJA_LABELS = {
  azul_grande: { label: 'Azul Grande', emoji: '🔵' },
  azul_media: { label: 'Azul Média', emoji: '🔵' },
  azul_pequena: { label: 'Azul Pequena', emoji: '🔵' },
  laranja_grande: { label: 'Laranja Grande', emoji: '🟠' },
  laranja_media: { label: 'Laranja Média', emoji: '🟠' },
  laranja_pequena: { label: 'Laranja Pequena', emoji: '🟠' },
  levita: { label: 'Levita', emoji: '🟢' },
}

export default function VendorCard({ vendor, isSelected, onClick, onReservar, onEncomendar }) {
  const availableStock = vendor.stock?.filter(s => s.quantidade > 0) || []

  return (
    <div
      className={`vendor-card ${isSelected ? 'selected' : ''} ${!vendor.tem_gas ? 'no-gas' : ''}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="vc-header">
        <div className="vc-avatar">
          {vendor.foto_estabelecimento ? (
            <img src={vendor.foto_estabelecimento} alt={vendor.nome} />
          ) : (
            <div className="vc-avatar-placeholder">🏪</div>
          )}
        </div>
        <div className="vc-info">
          <h4 className="vc-name">{vendor.nome}</h4>
          <p className="vc-address">{vendor.endereco || vendor.provincias?.nome}</p>
          <div className={`gas-indicator ${vendor.tem_gas ? 'gas-disponivel' : 'gas-esgotado'}`}>
            {vendor.tem_gas ? 'Gás disponível' : 'Gás esgotado'}
          </div>
        </div>
      </div>

      {/* Stock chips */}
      {availableStock.length > 0 && (
        <div className="vc-stock">
          {availableStock.map(s => {
            const info = BOTIJA_LABELS[s.tipo_botija]
            return (
              <div key={s.tipo_botija} className="vc-stock-chip">
                <span>{info?.emoji}</span>
                <span>{info?.label}</span>
                <span className="vc-qty">{s.quantidade} un.</span>
                {s.preco && <span className="vc-price">{s.preco.toLocaleString()} Kz</span>}
              </div>
            )
          })}
        </div>
      )}

      {/* Contact + actions */}
      <div className="vc-footer">
        <a
          href={`tel:${vendor.telefone}`}
          className="vc-tel"
          onClick={e => e.stopPropagation()}
        >
          📞 {vendor.telefone}
        </a>
        <div className="vc-actions">
          <button
            className="vc-btn reserve"
            disabled={!vendor.tem_gas}
            onClick={e => { e.stopPropagation(); onReservar() }}
          >
            Reservar
          </button>
          <button
            className="vc-btn order"
            disabled={!vendor.tem_gas}
            onClick={e => { e.stopPropagation(); onEncomendar() }}
          >
            Encomendar
          </button>
        </div>
      </div>
    </div>
  )
}
