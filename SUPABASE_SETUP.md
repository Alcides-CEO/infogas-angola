# 🗄️ Guia de Integração Supabase — Infogás Angola

Passo a passo completo para ligar o projecto ao Supabase.

---

## 1. Criar Projecto no Supabase

1. Aceda a [supabase.com](https://supabase.com) e crie uma conta
2. Clique em **New Project**
3. Escolha um nome (ex: `infogas-angola`) e região (recomendado: Europa)
4. Anote a **senha da base de dados** — vai precisar dela

---

## 2. Executar o Schema SQL

1. No painel Supabase, vá a **SQL Editor** (menu lateral)
2. Clique em **+ New query**
3. Copie e cole todo o conteúdo de `supabase_schema.sql`
4. Clique em **Run** (ou Ctrl+Enter)
5. Deve ver: `Schema Infogás Angola criado com sucesso! ✅`

---

## 3. Obter as Chaves da API

1. Vá a **Settings → API** no menu lateral
2. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public** key → `VITE_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_KEY` (só no backend)

---

## 4. Configurar Variáveis de Ambiente

### Frontend (`frontend/.env`)
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Backend (`backend/.env`)
```env
PORT=4000
SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 5. Criar o Utilizador Admin

1. No Supabase, vá a **Authentication → Users**
2. Clique em **+ Add user → Create new user**
3. Preencha:
   - **Email:** `admin@infogas.ao` (ou o que quiser)
   - **Password:** uma senha forte
4. Após criar, execute no SQL Editor:
```sql
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'admin@infogas.ao'
);
```
5. Confirme: `SELECT * FROM profiles WHERE role = 'admin';`

---

## 6. Criar Vendedores (via Admin ou SQL)

### Via Painel Admin (recomendado):
1. Entre em `/admin/dashboard` com o utilizador admin
2. Vá a **Gestão de Vendedores → + Adicionar Vendedor**
3. Preencha todos os dados, incluindo as coordenadas GPS

### Via SQL (para testes):
Os dados de teste já foram inseridos pelo schema (`supabase_schema.sql` — passo 9).

Para criar um vendedor com acesso ao painel:
```sql
-- 1. Crie o utilizador em Authentication → Users primeiro
-- 2. Depois associe ao vendor:
UPDATE vendors
SET user_id = (SELECT id FROM auth.users WHERE email = 'vendedor@email.com')
WHERE name = 'Nome do Vendedor';
```

---

## 7. Activar o Realtime

O schema já activa o Realtime para as tabelas `vendors` e `reservas`.

Para verificar:
1. Vá a **Database → Replication**
2. Confirme que `vendors`, `reservas` e `encomendas` estão marcadas

---

## 8. Testar a Integração

```bash
cd frontend
npm install
npm run dev
```

Aceda a `http://localhost:3000`:
- Se o badge no topo da Home mostrar o número real de vendedores → ✅ Conectado
- Se mostrar dados de demonstração → verifique o `.env`

---

## 9. Verificar Realtime

1. Abra a Home em dois separadores do browser
2. No Supabase SQL Editor, execute:
```sql
UPDATE vendors SET status = 'esgotado' WHERE id = 1;
```
3. Ambos os separadores devem actualizar automaticamente ⚡

---

## 🔒 Segurança

- A `anon key` é segura para expor no frontend (Row Level Security controla o acesso)
- A `service_role key` só deve estar no backend — **NUNCA no frontend**
- Certifique-se que o ficheiro `.env` está no `.gitignore`

---

## ❓ Problemas Comuns

| Problema | Solução |
|----------|---------|
| "Supabase não configurado" | Verifique se o `.env` existe e tem os valores correctos |
| Login falha | Confirme que o utilizador existe em Authentication → Users |
| Admin não consegue entrar | Execute o UPDATE profiles SET role='admin' |
| Realtime não funciona | Confirme em Database → Replication que as tabelas estão activas |
| Dados não aparecem | Execute o schema SQL completo de novo |
