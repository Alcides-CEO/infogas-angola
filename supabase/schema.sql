-- ============================================================
-- INFOGÁS ANGOLA - Supabase Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROVINCIAS
-- ============================================================
CREATE TABLE IF NOT EXISTS provincias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO provincias (nome) VALUES
  ('Luanda'), ('Huambo'), ('Benguela'), ('Huíla'), ('Cabinda'),
  ('Bié'), ('Malanje'), ('Lunda Norte'), ('Lunda Sul'), ('Moxico'),
  ('Cuando Cubango'), ('Namibe'), ('Cunene'), ('Zaire'), ('Uíge'),
  ('Cuanza Norte'), ('Cuanza Sul'), ('Bengo'), ('Kwanza Norte');

-- ============================================================
-- VENDEDORES
-- ============================================================
CREATE TABLE IF NOT EXISTS vendedores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefone TEXT NOT NULL,
  provincia_id UUID REFERENCES provincias(id),
  foto_perfil TEXT,
  foto_estabelecimento TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  endereco TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  bloqueado BOOLEAN DEFAULT FALSE,
  em_trabalho BOOLEAN DEFAULT FALSE,
  tem_gas BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STOCK DE GÁS (por tipo de botija)
-- ============================================================
CREATE TABLE IF NOT EXISTS stock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendedor_id UUID REFERENCES vendedores(id) ON DELETE CASCADE,
  tipo_botija TEXT NOT NULL CHECK (tipo_botija IN (
    'azul_grande', 'azul_media', 'azul_pequena',
    'laranja_grande', 'laranja_media', 'laranja_pequena',
    'levita'
  )),
  quantidade INTEGER DEFAULT 0,
  preco DECIMAL(10, 2),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (vendedor_id, tipo_botija)
);

-- ============================================================
-- RESERVAS
-- ============================================================
CREATE TABLE IF NOT EXISTS reservas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendedor_id UUID REFERENCES vendedores(id),
  cliente_nome TEXT NOT NULL,
  cliente_telefone TEXT NOT NULL,
  tipo_botija TEXT NOT NULL,
  quantidade INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmada', 'cancelada', 'entregue')),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ENCOMENDAS
-- ============================================================
CREATE TABLE IF NOT EXISTS encomendas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendedor_id UUID REFERENCES vendedores(id),
  cliente_nome TEXT NOT NULL,
  cliente_telefone TEXT NOT NULL,
  cliente_endereco TEXT,
  tipo_botija TEXT NOT NULL,
  quantidade INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_preparo', 'em_entrega', 'entregue', 'cancelada')),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LOGS DE ATIVIDADE (para relatórios)
-- ============================================================
CREATE TABLE IF NOT EXISTS logs_atividade (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendedor_id UUID REFERENCES vendedores(id),
  acao TEXT NOT NULL, -- 'gas_disponivel', 'gas_esgotado', 'stock_atualizado', 'venda'
  detalhes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE vendedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE encomendas ENABLE ROW LEVEL SECURITY;

-- Políticas públicas de leitura (mapa público)
CREATE POLICY "Vendedores visíveis publicamente" ON vendedores
  FOR SELECT USING (ativo = TRUE AND bloqueado = FALSE);

CREATE POLICY "Stock visível publicamente" ON stock
  FOR SELECT USING (TRUE);

-- ============================================================
-- FUNÇÕES UTILITÁRIAS
-- ============================================================

-- Relatório por província
CREATE OR REPLACE FUNCTION relatorio_por_provincia()
RETURNS TABLE (
  provincia TEXT,
  total_reservas BIGINT,
  total_encomendas BIGINT,
  total_vendedores BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.nome,
    COUNT(DISTINCT r.id),
    COUNT(DISTINCT e.id),
    COUNT(DISTINCT v.id)
  FROM provincias p
  LEFT JOIN vendedores v ON v.provincia_id = p.id
  LEFT JOIN reservas r ON r.vendedor_id = v.id
  LEFT JOIN encomendas e ON e.vendedor_id = v.id
  GROUP BY p.nome
  ORDER BY COUNT(DISTINCT r.id) DESC;
END;
$$ LANGUAGE plpgsql;
