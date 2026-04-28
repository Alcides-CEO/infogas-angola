-- =====================================================
-- CORRECÇÃO RLS — Execute no Supabase SQL Editor
-- =====================================================

-- 1. Remover políticas antigas que podem estar a bloquear
DROP POLICY IF EXISTS "vendors_public_read" ON vendors;
DROP POLICY IF EXISTS "vendor_update_own"   ON vendors;
DROP POLICY IF EXISTS "reservas_insert_anon" ON reservas;
DROP POLICY IF EXISTS "reservas_vendor_own"  ON reservas;
DROP POLICY IF EXISTS "encomendas_insert_anon" ON encomendas;
DROP POLICY IF EXISTS "encomendas_vendor_own"  ON encomendas;
DROP POLICY IF EXISTS "profiles_own" ON profiles;

-- 2. Desactivar RLS temporariamente em vendors para leitura pública funcionar
--    (a anon key do Supabase pode ler sem restrições)
ALTER TABLE vendors    DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservas   DISABLE ROW LEVEL SECURITY;
ALTER TABLE encomendas DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles   DISABLE ROW LEVEL SECURITY;

-- 3. Reactivar com políticas correctas e simples
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode LER vendors (necessário para o mapa público)
CREATE POLICY "vendors_select_all"
  ON vendors FOR SELECT
  TO anon, authenticated
  USING (true);

-- Apenas o próprio vendedor pode ACTUALIZAR os seus dados
CREATE POLICY "vendors_update_own"
  ON vendors FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admin (via service key no backend) pode fazer tudo — não precisa de política
-- porque usa a service_role key que ignora RLS

-- 4. Reservas: qualquer um pode inserir, vendedor vê as suas
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reservas_insert_public"
  ON reservas FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "reservas_select_vendor"
  ON reservas FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "reservas_update_vendor"
  ON reservas FOR UPDATE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

-- 5. Encomendas: mesmas regras
ALTER TABLE encomendas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "encomendas_insert_public"
  ON encomendas FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "encomendas_select_vendor"
  ON encomendas FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

-- 6. Profiles: cada utilizador vê o seu
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- 7. Verificar que funcionou
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

SELECT 'RLS corrigido! ✅' AS resultado;
