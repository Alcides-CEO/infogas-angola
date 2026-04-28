# Infogás Angola

Plataforma para encontrar gás em Angola — estrutura unificada (uma só pasta).

## Estrutura
```
infogas-angola/
├── src/                  ← React (frontend)
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   └── utils/supabase.js ← Liga directamente ao Supabase
├── supabase/
│   └── functions/        ← Edge Functions (substituem o backend)
│       ├── criar-reserva/
│       └── criar-vendedor/
├── index.html
├── vite.config.js
├── package.json
└── vercel.json           ← Deploy no Vercel com um clique
```

## Sem backend separado
O Supabase funciona como backend completo:
- **Auth** → login/registo de vendedores e admin
- **Database** → PostgreSQL com RLS
- **Realtime** → actualizações ao vivo no mapa
- **Edge Functions** → lógica mais complexa (criar vendedor, reservas)

## Iniciar
```bash
cp .env.example .env   # preencher com chaves do Supabase
npm install
npm run dev            # http://localhost:3000
```

## Deploy (Vercel — gratuito)
```bash
npm install -g vercel
vercel --prod
# Adicionar variáveis de ambiente no painel do Vercel
```
