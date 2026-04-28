// =====================================================
// DIAGNÓSTICO — apague este ficheiro em produção
// =====================================================
export function debugEnv() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  console.group('🔍 Diagnóstico Infogás — variáveis de ambiente');
  console.log('VITE_SUPABASE_URL:',      url      || '❌ VAZIA');
  console.log('VITE_SUPABASE_ANON_KEY:', key ? key.substring(0, 20) + '...' : '❌ VAZIA');
  console.log('URL válida?', url && url.startsWith('https://') && url.includes('.supabase.co'));
  console.log('Todas as env vars do Vite:', import.meta.env);
  console.groupEnd();
}
