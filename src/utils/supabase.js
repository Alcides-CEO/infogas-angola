import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
  realtime: { params: { eventsPerSecond: 10 } },
});

// ── Helpers: chamar Edge Functions ─────────────────
async function callEdgeFunction(name, body) {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) throw new Error(error.message);
  return data;
}

// ── Vendors ─────────────────────────────────────────

export async function fetchVendors({ province, color, status } = {}) {
  let query = supabase
    .from('vendors')
    .select('id,name,province,address,tel,lat,lng,status,rating,reviews,hours,stock,prices,blocked')
    .eq('blocked', false)
    .order('name');

  if (province && province !== 'all') query = query.eq('province', province);
  if (status   && status   !== 'all') query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  // Filtro de cor no cliente (JSONB não suporta filtro por prefixo de chave)
  if (color && color !== 'all') {
    return (data || []).filter(v =>
      v.stock && Object.keys(v.stock).some(k => k.startsWith(color) && v.stock[k] > 0)
    );
  }
  return data || [];
}

export async function fetchVendorById(id) {
  const { data, error } = await supabase.from('vendors').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateVendorStock(vendorId, stock) {
  const { data, error } = await supabase
    .from('vendors').update({ stock, updated_at: new Date().toISOString() })
    .eq('id', vendorId).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateVendorStatus(vendorId, status) {
  const { data, error } = await supabase
    .from('vendors').update({ status, updated_at: new Date().toISOString() })
    .eq('id', vendorId).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateVendorPrices(vendorId, prices) {
  const { data, error } = await supabase
    .from('vendors').update({ prices }).eq('id', vendorId).select().single();
  if (error) throw new Error(error.message);
  return data;
}

// ── Reservas (via Edge Function) ─────────────────────

export async function createReserva(payload) {
  return callEdgeFunction('criar-reserva', payload);
}

export async function createEncomenda(payload) {
  // Encomendas directo no Supabase — simples insert
  const { data, error } = await supabase
    .from('encomendas').insert({ ...payload, status: 'pendente' }).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchReservasByVendor(vendorId) {
  const { data, error } = await supabase
    .from('reservas').select('*').eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function fetchEncomendasByVendor(vendorId) {
  const { data, error } = await supabase
    .from('encomendas').select('*').eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function updateReservaStatus(reservaId, status) {
  const { data, error } = await supabase
    .from('reservas').update({ status }).eq('id', reservaId).select().single();
  if (error) throw new Error(error.message);
  return data;
}

// ── Admin ────────────────────────────────────────────

export async function adminFetchAllVendors({ search, province } = {}) {
  let query = supabase.from('vendors').select('*').order('name');
  if (province && province !== 'all') query = query.eq('province', province);
  if (search) query = query.ilike('name', `%${search}%`);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

export async function adminCreateVendor(payload) {
  // Usa Edge Function porque precisa de criar utilizador no Auth
  return callEdgeFunction('criar-vendedor', payload);
}

export async function adminToggleBlock(vendorId, blocked) {
  const { data, error } = await supabase
    .from('vendors').update({ blocked }).eq('id', vendorId).select().single();
  if (error) throw new Error(error.message);
  return data;
}

// ── Realtime ─────────────────────────────────────────

export function subscribeToVendors(onUpdate) {
  return supabase
    .channel('vendors-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'vendors' }, onUpdate)
    .subscribe();
}

export function subscribeToVendorReservas(vendorId, onNew) {
  return supabase
    .channel(`reservas-${vendorId}`)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'reservas', filter: `vendor_id=eq.${vendorId}` },
      (p) => onNew(p.new)
    ).subscribe();
}

export function unsubscribe(channel) {
  if (channel) supabase.removeChannel(channel);
}
