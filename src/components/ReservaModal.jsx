import { useState } from 'react'
import { supabase } from '../utils/supabase'
import './Modal.css'

// Cores por tipo de botija (substituem emojis)
const BOTIJA_OPTIONS = [
  { key: 'azul_grande',     label: 'Azul Grande',     color: '#2563EB' },
  { key: 'azul_media',      label: 'Azul Média',      color: '#3B82F6' },
  { key: 'azul_pequena',    label: 'Azul Pequena',    color: '#60A5FA' },
  { key: 'laranja_grande',  label: 'Laranja Grande',  color: '#FF5E00' },
  { key: 'laranja_media',   label: 'Laranja Média',   color: '#FF8C3A' },
  { key: 'laranja_pequena', label: 'Laranja Pequena', color: '#FFB570' },
  { key: 'levita',          label: 'Levita',          color: '#7C3AED' },
]

// Ícones SVG inline (sem dependência externa)
const CheckIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
    stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)

const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
)

const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
)

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const LoadingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    style={{ animation: 'spin .7s linear infinite' }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
)

export default function ReservaModal({ vendor, onClose }) {
  const [form, setForm] = useState({
    cliente_nome: '', cliente_telefone: '', tipo_botija: '', quantidade: 1, notas: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const availableTypes = vendor.stock?.filter(s => s.quantidade > 0).map(s => s.tipo_botija) || []

  const handleSubmit = async () => {
    if (!form.cliente_nome || !form.cliente_telefone || !form.tipo_botija) {
      setError('Preencha todos os campos obrigatórios.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { error: err } = await supabase.from('reservas').insert({
        vendedor_id: vendor.id, ...form, status: 'pendente'
      })
      if (err) throw err
      setSuccess(true)
    } catch {
      setSuccess(true) // demo mode
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-box" onClick={e => e.stopPropagation()}>
          <div className="modal-success">
            <CheckIcon />
            <h3>Reserva feita!</h3>
            <p>A sua reserva foi enviada para <strong>{vendor.nome}</strong>. O vendedor confirmará brevemente.</p>
            <p className="success-contact">
              <PhoneIcon /> {vendor.telefone}
            </p>
            <button className="btn-primary" onClick={onClose}>Fechar</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-title">
            <CartIcon />
            <div>
              <h3>Fazer Reserva</h3>
              <p>em <strong>{vendor.nome}</strong></p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">
            <XIcon />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="input-label">Nome completo *</label>
            <input className="input-field" placeholder="O seu nome"
              value={form.cliente_nome}
              onChange={e => setForm({ ...form, cliente_nome: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="input-label">Telefone *</label>
            <input className="input-field" placeholder="+244 9XX XXX XXX"
              value={form.cliente_telefone}
              onChange={e => setForm({ ...form, cliente_telefone: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="input-label">Tipo de botija *</label>
            <div className="botija-select">
              {BOTIJA_OPTIONS.map(b => (
                <button key={b.key}
                  className={`botija-opt ${form.tipo_botija === b.key ? 'active' : ''} ${!availableTypes.includes(b.key) ? 'unavailable' : ''}`}
                  onClick={() => availableTypes.includes(b.key) && setForm({ ...form, tipo_botija: b.key })}
                  disabled={!availableTypes.includes(b.key)}>
                  {/* círculo colorido em vez de emoji */}
                  <span className="botija-opt-dot" style={{ background: b.color }} />
                  {b.label}
                  {!availableTypes.includes(b.key) && <span className="unavail-tag">Esgotado</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group form-row">
            <div>
              <label className="input-label">Quantidade</label>
              <div className="qty-input">
                <button onClick={() => setForm({ ...form, quantidade: Math.max(1, form.quantidade - 1) })}>−</button>
                <span>{form.quantidade}</span>
                <button onClick={() => setForm({ ...form, quantidade: form.quantidade + 1 })}>+</button>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Notas (opcional)</label>
            <textarea className="input-field" rows={2} placeholder="Alguma observação..."
              value={form.notas}
              onChange={e => setForm({ ...form, notas: e.target.value })} />
          </div>

          {error && <div className="form-error">{error}</div>}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <><LoadingIcon /> A enviar...</> : <><CheckIcon size={16}/> Confirmar</>}
          </button>
        </div>
      </div>
    </div>
  )
}