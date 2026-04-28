import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchVendors, subscribeToVendors, unsubscribe, fetchVendorById, supabase } from '../utils/supabase';
import { MOCK_VENDORS } from '../data/vendors';

const RAW_URL = import.meta.env.VITE_SUPABASE_URL || '';
const RAW_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const IS_CONFIGURED = (
  RAW_URL.startsWith('https://') &&
  RAW_URL.includes('.supabase.co') &&
  RAW_KEY.length > 50
);

function applyLocalFilter(list, filter) {
  return list.filter(v => {
    if (filter.province && filter.province !== 'all' && v.province !== filter.province) return false;
    if (filter.status   && filter.status   !== 'all' && v.status   !== filter.status)   return false;
    if (filter.color    && filter.color    !== 'all') {
      const has = v.stock && Object.keys(v.stock).some(k => k.startsWith(filter.color) && v.stock[k] > 0);
      if (!has) return false;
    }
    return true;
  });
}

export function useVendors(filter = {}) {
  const [vendors, setVendors]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [isLive, setIsLive]         = useState(false); // true = dados reais do Supabase
  const [lastUpdate, setLastUpdate] = useState(null);
  const channelRef = useRef(null);

  const load = useCallback(async () => {
    // Sem Supabase configurado → mock directo, sem mensagem de erro
    if (!IS_CONFIGURED) {
      setVendors(applyLocalFilter(MOCK_VENDORS, filter));
      setIsLive(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchVendors(filter);
      setVendors(data);
      setIsLive(true);
      setError(null);
    } catch (err) {
      console.error('[useVendors] Erro Supabase:', err.message);
      // Falhou → usar mock mas guardar o erro para diagnóstico
      setVendors(applyLocalFilter(MOCK_VENDORS, filter));
      setIsLive(false);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter.province, filter.color, filter.status]); // eslint-disable-line

  useEffect(() => {
    load();

    if (!IS_CONFIGURED) return;

    channelRef.current = subscribeToVendors((payload) => {
      const { eventType, new: newR, old: oldR } = payload;
      setVendors(prev => {
        if (eventType === 'INSERT') return [...prev, newR];
        if (eventType === 'UPDATE') return prev.map(v => v.id === newR.id ? { ...v, ...newR } : v);
        if (eventType === 'DELETE') return prev.filter(v => v.id !== oldR.id);
        return prev;
      });
      setLastUpdate(new Date());
    });

    return () => unsubscribe(channelRef.current);
  }, [load]);

  return { vendors, loading, error, isLive, reload: load, lastUpdate };
}

export function useVendor(vendorId) {
  const [vendor, setVendor]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const channelRef = useRef(null);

  useEffect(() => {
    if (!vendorId) { setLoading(false); return; }

    async function load() {
      if (!IS_CONFIGURED) {
        setVendor(MOCK_VENDORS.find(v => v.id === vendorId) || null);
        setLoading(false);
        return;
      }
      try {
        const data = await fetchVendorById(vendorId);
        setVendor(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();

    if (!IS_CONFIGURED) return;

    channelRef.current = supabase
      .channel(`vendor-single-${vendorId}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'vendors', filter: `id=eq.${vendorId}` },
        (payload) => setVendor(prev => ({ ...prev, ...payload.new }))
      )
      .subscribe();

    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, [vendorId]);

  return { vendor, loading, error };
}
