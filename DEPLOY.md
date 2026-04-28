# 🚀 Guia de Deploy — Infogás Angola

Deploy gratuito: **Frontend → Vercel** | **Backend → Railway**

---

## Frontend — Vercel (GRATUITO)

### Opção A: Via GitHub (recomendado)
1. Faça push do projecto para GitHub
2. Aceda a [vercel.com](https://vercel.com) → New Project
3. Importe o repositório
4. Configure:
   - **Root Directory:** `frontend`
   - **Framework:** Vite
5. Em **Environment Variables**, adicione:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
6. Clique **Deploy** ✅

### Opção B: Via CLI
```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

---

## Backend — Railway (GRATUITO até 500h/mês)

1. Aceda a [railway.app](https://railway.app) → New Project
2. Seleccione **Deploy from GitHub repo**
3. Escolha a pasta `backend` como root
4. Em **Variables**, adicione:
   ```
   PORT=4000
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_KEY=eyJ...
   ```
5. Railway detecta automaticamente Node.js e faz deploy ✅

---

## Alternativa Backend — Supabase Edge Functions

Para não precisar de backend separado, pode usar Supabase Edge Functions:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Criar edge function
supabase functions new reservas
supabase functions deploy reservas
```

---

## Variáveis de Ambiente — Resumo

| Variável | Onde usar | Como obter |
|----------|-----------|-----------|
| `VITE_SUPABASE_URL` | Frontend | Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Supabase → Settings → API → anon key |
| `SUPABASE_URL` | Backend | Igual ao anterior |
| `SUPABASE_SERVICE_KEY` | Backend APENAS | Supabase → Settings → API → service_role key |

⚠️ **NUNCA** exponha a `service_role key` no frontend!

---

## Domínio Personalizado

### Vercel
1. Vá a **Settings → Domains**
2. Adicione `infogas.ao` (ou o seu domínio)
3. Configure o DNS no seu registador de domínio

---

## Verificar Deploy

Após deploy, teste:
- `https://seu-app.vercel.app/` — Welcome screen
- `https://seu-app.vercel.app/home` — Mapa com vendedores
- `https://seu-app.vercel.app/vendor/login` — Login vendedor
- `https://seu-app.vercel.app/admin/login` — Login admin
