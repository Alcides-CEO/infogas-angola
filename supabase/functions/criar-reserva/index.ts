// Edge Function: criar-reserva
// Deploy: supabase functions deploy criar-reserva
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const body = await req.json()
  const { vendor_id, client_name, client_tel, botija_type, quantity, price_total } = body

  if (!vendor_id || !client_name || !client_tel || !botija_type || !quantity) {
    return new Response(JSON.stringify({ error: 'Campos obrigatórios em falta' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const { data, error } = await supabase
    .from('reservas')
    .insert({ vendor_id, client_name, client_tel, botija_type, quantity, price_total, status: 'pendente' })
    .select().single()

  if (error) return new Response(JSON.stringify({ error: error.message }), {
    status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })

  return new Response(JSON.stringify({ ok: true, data }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
})
