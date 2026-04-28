// Edge Function: criar-vendedor (apenas admin)
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
  const { name, tel, email, password, province, address, lat, lng, hours } = body

  // Criar utilizador no Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: password || Math.random().toString(36).slice(-10),
    email_confirm: true,
  })
  if (authError) return new Response(JSON.stringify({ error: authError.message }), {
    status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })

  // Criar registo do vendedor
  const { data, error } = await supabase.from('vendors').insert({
    user_id: authData.user.id,
    name, tel, email, province, address,
    lat: parseFloat(lat) || 0,
    lng: parseFloat(lng) || 0,
    hours: hours || '08:00 - 20:00',
    status: 'disponivel',
    blocked: false,
    rating: 0, reviews: 0,
    stock: { 'azul-g':0,'azul-m':0,'azul-p':0,'lar-g':0,'lar-m':0,'lar-p':0,'levita':0 },
    prices: {},
  }).select().single()

  if (error) return new Response(JSON.stringify({ error: error.message }), {
    status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })

  return new Response(JSON.stringify({ ok: true, data }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
})
