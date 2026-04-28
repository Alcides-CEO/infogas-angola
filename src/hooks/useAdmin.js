// =====================================================
// HOOK: useAdmin
// Operações de administração via Supabase
// =====================================================
import { useState, useEffect, useCallback } from 'react';
import {
  adminFetchAllVendors,
  adminToggleBlock,
  adminCreateVendor,
} from '../utils/supabase';
import { MOCK_VENDORS } from '../data/vendors';

const IS_SUPABASE_CONFIGURED =
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://SEU_PROJETO.supabase.co';

export function useAdmin() {
  const [vendors, setVendors]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async (filters = {}) => {
    if (!IS_SUPABASE_CONFIGURED) {
      // Modo demo
      setVendors(MOCK_VENDORS.map(v => ({ ...v, blocked: false, email: `${v.name.toLowerCase().replace(/\s/g,'')}@email.com` })));
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await adminFetchAllVendors(filters);
      setVendors(data);
    } catch (err) {
      setError(err.message);
      setVendors(MOCK_VENDORS.map(v => ({ ...v, blocked: false })));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleBlock = useCallback(async (vendorId, currentBlocked) => {
    setSaving(true);
    try {
      if (IS_SUPABASE_CONFIGURED) {
        await adminToggleBlock(vendorId, !currentBlocked);
      }
      setVendors(vs => vs.map(v => v.id === vendorId ? { ...v, blocked: !currentBlocked } : v));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }, []);

  const createVendor = useCallback(async (vendorData) => {
    setSaving(true);
    try {
      if (!IS_SUPABASE_CONFIGURED) {
        // Demo: adicionar localmente
        const newV = { ...vendorData, id: Date.now(), status: 'disponivel', blocked: false, rating: 0, reviews: 0, stock: {}, prices: {} };
        setVendors(vs => [...vs, newV]);
        return { ok: true };
      }
      const newV = await adminCreateVendor(vendorData);
      setVendors(vs => [...vs, newV]);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    } finally {
      setSaving(false);
    }
  }, []);

  return { vendors, loading, error, saving, toggleBlock, createVendor, reload: load };
}
