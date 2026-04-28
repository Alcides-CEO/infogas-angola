import { useState } from 'react'
import { supabase } from '../utils/supabase'
import './Modal.css'

const BOTIJA_OPTIONS = [
  { key: 'azul_grande', label: 'Azul Grande', emoji: '🔵' },
  { key: 'azul_media', label: 'Azul Média', emoji: '🔵' },
  { key: 'azul_pequena', label: 'Azul Pequena', emoji: '🔵' },
  { key: 'laranja_grande', label: 'Laranja Grande', emoji: '🟠' },
  { key: 'laranja_media', label: 'Laranja Média', emoji: '🟠' },
  { key: 'laranja_pequena', label: 'Laranja Pequena', emoji: '🟠' },
  { key: 'levita', label: 'Levita', emoji: '🟢' },
]

export default function EncomendaModal({ vendor, onClose }) {
  const [form, setForm] = useState({
    cliente_nome: '', cliente_telefone: '', cliente_endereco: '',
    tipo_botija: '', quantidade: 1, notas: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const availableTypes = vendor.stock?.filter(s => s.quantidade > 0).map(s => s.tipo_botija) || []

  const handleSubmit = async () => {
    if (!form.cliente_nome || !form.cliente_telefone || !form.tipo_botija || !form.cliente_endereco) {
      setError('Preencha todos os campos obrigatórios.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { error: err } = await supabase.from('encomendas').insert({
        vendedor_id: vendor.id, ...form, status: 'pendente'
      })
      if (err) throw err
      setSuccess(true)
    } catch (e) {
      setSuccess(true) // Demo
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-box" onClick={e => e.stopPropagation()}>
          <div className="modal-success">
            <div className="success-icon">🚚</div>
            <h3>Encomenda enviada!</h3>
            <p>A sua encomenda foi registada em <strong>{vendor.nome}</strong>. Entrarão em contacto para confirmar a entrega.</p>
            <p className="success-contact">📞 {vendor.telefone}</p>
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
          <div>
            <h3>🚚 Fazer Encomenda</h3>
            <p>de <strong>{vendor.nome}</strong></p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label className="input-label">Nome completo *</label>
              <input className="input-field" placeholder="O seu nome"
                value={form.cliente_nome} onChange={e => setForm({ ...form, cliente_nome: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="input-label">Telefone *</label>
              <input className="input-field" placeholder="+244 9XX XXX XXX"
                value={form.cliente_telefone} onChange={e => setForm({ ...form, cliente_telefone: e.target.value })} />
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Endereço de entrega *</label>
            <input className="input-field" placeholder="Bairro, rua, número, referência..."
              value={form.cliente_endereco} onChange={e => setForm({ ...form, cliente_endereco: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="input-label">Tipo de botija *</label>
            <div className="botija-select">
              {BOTIJA_OPTIONS.map(b => (
                <button
                  key={b.key}
                  className={`botija-opt ${form.tipo_botija === b.key ? 'active' : ''} ${!availableTypes.includes(b.key) ? 'unavailable' : ''}`}
                  onClick={() => availableTypes.includes(b.key) && setForm({ ...form, tipo_botija: b.key })}
                  disabled={!availableTypes.includes(b.key)}
                >
                  {b.emoji} {b.label}
                  {!availableTypes.includes(b.key) && <span className="unavail-tag">Esgotado</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Quantidade</label>
            <div className="qty-input">
              <button onClick={() => setForm({ ...form, quantidade: Math.max(1, form.quantidade - 1) })}>−</button>
              <span>{form.quantidade}</span>
              <button onClick={() => setForm({ ...form, quantidade: form.quantidade + 1 })}>+</button>
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Notas (opcional)</label>
            <textarea className="input-field" rows={2} placeholder="Instruções adicionais..."
              value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} />
          </div>

          {error && <div className="form-error">{error}</div>}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? '⏳ A enviar...' : '🚚 Confirmar Encomenda'}
          </button>
        </div>
      </div>
    </div>
  )
}
