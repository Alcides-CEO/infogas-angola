import { PROVINCES } from '../../data/vendors';
import './FilterBar.css';

export default function FilterBar({ filter, onChange, vendorCount, loading }) {
  const set = (key, val) => onChange({ ...filter, [key]: val });

  return (
    <div className="filterbar">
      <div className="filterbar__inner">
        <span className="filterbar__label">Filtrar:</span>

        {/* Província */}
        <select className="filterbar__select" value={filter.province} onChange={e => set('province', e.target.value)}>
          <option value="all">📍 Todas as Províncias</option>
          {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        {/* Cor da botija */}
        <div className="filterbar__chips">
          {[
            { val:'all',    label:'Todas',       color: null },
            { val:'azul',   label:'🔵 Azul',     color:'#2563EB' },
            { val:'lar',    label:'🟠 Laranja',  color:'#FF5E00' },
            { val:'levita', label:'💜 Levita',   color:'#7C3AED' },
          ].map(c => (
            <button key={c.val}
              className={`filter-chip ${filter.color === c.val ? 'filter-chip--active' : ''}`}
              style={filter.color === c.val && c.color ? { borderColor: c.color, color: c.color } : {}}
              onClick={() => set('color', c.val)}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Status */}
        <div className="filterbar__chips">
          {[
            { val:'all',        label:'Todos'       },
            { val:'disponivel', label:'✅ Com stock' },
            { val:'esgotado',   label:'❌ Esgotado' },
          ].map(s => (
            <button key={s.val}
              className={`filter-chip ${filter.status === s.val ? 'filter-chip--active' : ''}`}
              onClick={() => set('status', s.val)}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Realtime indicator */}
        <div className="filterbar__count">
          {loading ? (
            <span className="filterbar__loading">A carregar...</span>
          ) : (
            <>
              <span className="filterbar__dot" />
              {vendorCount !== undefined ? `${vendorCount} resultado${vendorCount !== 1 ? 's' : ''}` : 'Tempo real'}
            </>
          )}
        </div>

        {/* Reset */}
        {(filter.province !== 'all' || filter.color !== 'all' || filter.status !== 'all') && (
          <button className="filter-reset" onClick={() => onChange({ province:'all', color:'all', status:'all' })}>
            ✕ Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}
