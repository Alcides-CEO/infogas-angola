import { PROVINCES } from '../../data/vendors';
import './FilterBar.css';

export default function FilterBar({ filter, onChange, vendorCount, loading }) {
  const set = (key, val) => onChange({ ...filter, [key]: val });
  const hasActive = filter.province !== 'all' || filter.color !== 'all' || filter.status !== 'all';

  return (
    <div className="filterbar">
      <div className="filterbar__inner">

        {/* Linha 1: Província */}
        <div className="filterbar__row">
          <span className="filterbar__label">Filtrar:</span>
          <select className="filterbar__select" value={filter.province}
            onChange={e => set('province', e.target.value)}>
            <option value="all">Todas as Províncias</option>
            {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Linha 2: Cor da botija */}
        <div className="filterbar__chips">
          {[
            { val:'all',    label:'Todas',    dot: null },
            { val:'azul',   label:'Azul',     dot: '#2563EB' },
            { val:'lar',    label:'Laranja',  dot: '#FF5E00' },
            { val:'levita', label:'Levita',   dot: '#7C3AED' },
          ].map(c => (
            <button key={c.val}
              className={`filter-chip ${filter.color === c.val ? 'filter-chip--active' : ''}`}
              onClick={() => set('color', c.val)}>
              {c.dot && <span className="chip-dot" style={{ background: c.dot }} />}
              {c.label}
            </button>
          ))}
        </div>

        {/* Linha 3: Status */}
        <div className="filterbar__chips">
          {[
            { val:'all',        label:'Todos'      },
            { val:'disponivel', label:'Com stock'  },
            { val:'esgotado',   label:'Esgotado'   },
          ].map(s => (
            <button key={s.val}
              className={`filter-chip ${filter.status === s.val ? 'filter-chip--active' : ''}`}
              onClick={() => set('status', s.val)}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Rodapé: contagem + reset */}
        <div className="filterbar__footer">
          <div className="filterbar__count">
            {loading
              ? <span className="filterbar__loading">A carregar...</span>
              : <><span className="filterbar__dot" />{vendorCount} resultado{vendorCount !== 1 ? 's' : ''}</>
            }
          </div>
          {hasActive && (
            <button className="filter-reset"
              onClick={() => onChange({ province:'all', color:'all', status:'all' })}>
              Limpar
            </button>
          )}
        </div>

      </div>
    </div>
  );
}