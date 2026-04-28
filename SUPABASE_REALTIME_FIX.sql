-- ============================================================
-- EXECUTAR NO SUPABASE SQL EDITOR se tiver problemas
-- ============================================================

-- 1. Garantir que o Realtime está activo para a tabela vendors
-- (Supabase exige que a tabela tenha REPLICA IDENTITY FULL para UPDATE/DELETE)
ALTER TABLE vendors REPLICA IDENTITY FULL;
ALTER TABLE reservas REPLICA IDENTITY FULL;

-- 2. Verificar se a publicação existe e adicionar as tabelas
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    -- Adicionar tabelas se ainda não estiverem
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE vendors;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE reservas;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

-- 3. Verificar RLS — anon deve conseguir LER vendors não bloqueados
-- (sem isto o mapa fica vazio)
DROP POLICY IF EXISTS "vendors_public_read" ON vendors;
CREATE POLICY "vendors_public_read" ON vendors
  FOR SELECT USING (blocked = FALSE OR blocked IS NULL);

-- 4. Permitir que anon insira reservas e encomendas
DROP POLICY IF EXISTS "reservas_insert_anon" ON reservas;
CREATE POLICY "reservas_insert_anon" ON reservas
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "encomendas_insert_anon" ON encomendas;
CREATE POLICY "encomendas_insert_anon" ON encomendas
  FOR INSERT WITH CHECK (true);

SELECT 'Realtime e RLS corrigidos! ✅' AS resultado;
