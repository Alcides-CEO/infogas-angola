// Diagnóstico — apague este ficheiro em producao
export function debugEnv() {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY

  console.group('Diagnostico Infogas — variaveis de ambiente')
  console.log('VITE_SUPABASE_URL:',      url || 'VAZIA')
  console.log('VITE_SUPABASE_ANON_KEY:', key ? key.substring(0, 20) + '...' : 'VAZIA')
  console.log('URL valida?', url && url.startsWith('https://') && url.includes('.supabase.co'))
  console.groupEnd()
}