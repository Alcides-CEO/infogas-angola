-- ============================================================
-- INFOGÁS ANGOLA — SCHEMA SUPABASE COMPLETO
-- Execute no Supabase SQL Editor (Settings → SQL Editor)
-- ============================================================

-- ── 1. PROFILES (ligado a auth.users) ──────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role  TEXT NOT NULL DEFAULT 'vendor' CHECK (role IN ('vendor','admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-criar perfil ao registar novo utilizador
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role) VALUES (NEW.id, 'vendor')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ── 2. VENDORS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendors (
  id       SERIAL PRIMARY KEY,
  user_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name     TEXT NOT NULL,
  province TEXT NOT NULL,
  address  TEXT,
  tel      TEXT,
  email    TEXT,
  lat      FLOAT,
  lng      FLOAT,
  hours    TEXT DEFAULT '08:00 - 20:00',
  avatar   TEXT DEFAULT '⛽',
  avatar_url         TEXT,
  establishment_url  TEXT,

  -- Estado (actualizado em tempo real pelo vendedor)
  status  TEXT DEFAULT 'disponivel' CHECK (status IN ('disponivel','esgotado')),
  blocked BOOLEAN DEFAULT FALSE,

  -- Avaliações
  rating  FLOAT DEFAULT 0,
  reviews INT   DEFAULT 0,

  -- Stock e preços em JSONB para flexibilidade
  stock  JSONB DEFAULT '{"azul-g":0,"azul-m":0,"azul-p":0,"lar-g":0,"lar-m":0,"lar-p":0,"levita":0}'::jsonb,
  prices JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vendors_updated_at ON vendors;
CREATE TRIGGER vendors_updated_at
  BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ── 3. RESERVAS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reservas (
  id          SERIAL PRIMARY KEY,
  vendor_id   INT REFERENCES vendors(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_tel  TEXT NOT NULL,
  botija_type TEXT NOT NULL,
  quantity    INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price_total INT DEFAULT 0,
  status      TEXT DEFAULT 'pendente' CHECK (status IN ('pendente','aceite','recusado','entregue')),
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ── 4. ENCOMENDAS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS encomendas (
  id          SERIAL PRIMARY KEY,
  vendor_id   INT REFERENCES vendors(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_tel  TEXT NOT NULL,
  botija_type TEXT,
  quantity    INT DEFAULT 1,
  address     TEXT,
  notes       TEXT,
  status      TEXT DEFAULT 'pendente' CHECK (status IN ('pendente','confirmada','entregue','cancelada')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ── 5. ÍNDICES ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_vendors_province ON vendors(province);
CREATE INDEX IF NOT EXISTS idx_vendors_status   ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_blocked  ON vendors(blocked);
CREATE INDEX IF NOT EXISTS idx_reservas_vendor  ON reservas(vendor_id);
CREATE INDEX IF NOT EXISTS idx_reservas_status  ON reservas(status);
CREATE INDEX IF NOT EXISTS idx_encomendas_vendor ON encomendas(vendor_id);


-- ── 6. ROW LEVEL SECURITY ────────────────────────────────────
ALTER TABLE vendors   ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas  ENABLE ROW LEVEL SECURITY;
ALTER TABLE encomendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles  ENABLE ROW LEVEL SECURITY;

-- Profiles: cada utilizador vê apenas o seu
CREATE POLICY IF NOT EXISTS "profiles_own" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Vendors: leitura pública (apenas não bloqueados)
DROP POLICY IF EXISTS "vendors_public_read" ON vendors;
CREATE POLICY "vendors_public_read" ON vendors
  FOR SELECT USING (blocked = FALSE);

-- Vendors: vendedor actualiza o próprio
DROP POLICY IF EXISTS "vendor_update_own" ON vendors;
CREATE POLICY "vendor_update_own" ON vendors
  FOR UPDATE USING (auth.uid() = user_id);

-- Reservas: clientes podem inserir (anon)
DROP POLICY IF EXISTS "reservas_insert_anon" ON reservas;
CREATE POLICY "reservas_insert_anon" ON reservas
  FOR INSERT WITH CHECK (TRUE);

-- Reservas: vendedor vê e actualiza as suas
DROP POLICY IF EXISTS "reservas_vendor_own" ON reservas;
CREATE POLICY "reservas_vendor_own" ON reservas
  FOR ALL USING (
    vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
  );

-- Encomendas: mesmas regras
DROP POLICY IF EXISTS "encomendas_insert_anon" ON encomendas;
CREATE POLICY "encomendas_insert_anon" ON encomendas
  FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "encomendas_vendor_own" ON encomendas;
CREATE POLICY "encomendas_vendor_own" ON encomendas
  FOR ALL USING (
    vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
  );


-- ── 7. REALTIME ─────────────────────────────────────────────
-- Activar publicação em tempo real para estas tabelas
ALTER PUBLICATION supabase_realtime ADD TABLE vendors;
ALTER PUBLICATION supabase_realtime ADD TABLE reservas;
ALTER PUBLICATION supabase_realtime ADD TABLE encomendas;


-- ── 8. CRIAR UTILIZADOR ADMIN ───────────────────────────────
-- ATENÇÃO: Execute este bloco SEPARADAMENTE após configurar o projecto.
-- Substitua admin@infogas.ao e a senha pelo que quiser.
-- Depois vá ao Supabase Auth → Users → encontre o utilizador criado
-- e actualize manualmente o campo role para 'admin' na tabela profiles.
--
-- Ou use o Supabase Dashboard → Authentication → Users → Add User
-- e depois execute:
--
-- UPDATE profiles SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@infogas.ao');


-- ── 9. DADOS DE TESTE ────────────────────────────────────────
-- Execute após criar o schema para popular com dados iniciais
INSERT INTO vendors (name, province, address, tel, lat, lng, hours, avatar, status, rating, reviews, stock, prices)
VALUES
  ('Gasóleo Talatona', 'Luanda',
   'Rua da Samba, Talatona', '+244 912 345 678',
   -8.917, 13.231, '07:00 - 20:00', '⛽', 'disponivel', 4.8, 124,
   '{"azul-g":12,"azul-m":8,"lar-g":5,"levita":3}',
   '{"azul-g":8500,"azul-m":5500,"lar-g":8200,"levita":11000}'),

  ('Posto Central GLP', 'Luanda',
   'Av. 21 de Janeiro, Ingombota', '+244 923 456 789',
   -8.839, 13.234, '06:00 - 22:00', '🏪', 'disponivel', 4.5, 89,
   '{"azul-m":20,"azul-p":15,"lar-m":10}',
   '{"azul-m":5300,"azul-p":3200,"lar-m":5000}'),

  ('Gás Vivo Kikuxi', 'Luanda',
   'Bairro Kikuxi, Viana', '+244 934 567 890',
   -8.976, 13.372, '08:00 - 18:00', '🛢️', 'esgotado', 4.2, 56,
   '{}', '{"azul-g":8000,"lar-g":7800}'),

  ('Distribuidora Bengas', 'Luanda',
   'Rua Ndunduma, Sambizanga', '+244 945 678 901',
   -8.807, 13.254, '24 horas', '🔥', 'disponivel', 4.6, 201,
   '{"azul-g":30,"azul-m":25,"azul-p":40,"lar-g":18,"lar-m":22,"lar-p":35,"levita":8}',
   '{"azul-g":8300,"azul-m":5400,"azul-p":3100,"lar-g":8100,"lar-m":5200,"lar-p":3000,"levita":10500}'),

  ('Gás Huambo Center', 'Huambo',
   'Rua Comandante Valódia', '+244 956 789 012',
   -12.776, 15.739, '07:00 - 19:00', '⛽', 'disponivel', 4.3, 67,
   '{"azul-g":8,"azul-m":14,"lar-m":9}',
   '{"azul-g":8100,"azul-m":5200,"lar-m":4900}'),

  ('GLP Benguela', 'Benguela',
   'Av. Norton de Matos, Benguela', '+244 967 890 123',
   -12.578, 13.407, '08:00 - 20:00', '🏪', 'disponivel', 4.7, 143,
   '{"azul-g":15,"lar-g":12,"levita":5}',
   '{"azul-g":8400,"lar-g":8200,"levita":10800}'),

  ('GLP Lubango', 'Lubango',
   'Rua Amílcar Cabral, Lubango', '+244 978 901 234',
   -14.917, 13.5, '07:00 - 18:00', '⛽', 'disponivel', 4.4, 34,
   '{"azul-g":6,"lar-m":11}',
   '{"azul-g":8000,"lar-m":5100}')

ON CONFLICT DO NOTHING;

SELECT 'Schema Infogás Angola criado com sucesso! ✅' AS resultado;
SELECT 'Próximo passo: crie o utilizador admin em Authentication → Users' AS instrucao;
