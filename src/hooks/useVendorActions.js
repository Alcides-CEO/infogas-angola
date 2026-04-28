// =====================================================
// HOOK: useVendorActions
// Acções do vendedor autenticado (stock, status)
// =====================================================
import { useState, useCallback } from 'react';
import { updateVendorStock, updateVendorStatus, updateVendorPrices } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

export function useVendorActions() {
  const { vendor, refreshVendor } = useAuth();
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState(null);
  const [saved, setSaved]     = useState(false);

  const flash = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Actualizar stock
  const saveStock = useCallback(async (stock) => {
    if (!vendor?.id) return;
    setSaving(true);
    setError(null);
    try {
      await updateVendorStock(vendor.id, stock);
      await refreshVendor();
      flash();
      return { ok: true };
    } catch (err) {
      setError(err.message);
      return { ok: false };
    } finally {
      setSaving(false);
    }
  }, [vendor, refreshVendor]);

  // Actualizar estado (disponivel / esgotado)
  const saveStatus = useCallback(async (status) => {
    if (!vendor?.id) return;
    setSaving(true);
    setError(null);
    try {
      await updateVendorStatus(vendor.id, status);
      await refreshVendor();
      return { ok: true };
    } catch (err) {
      setError(err.message);
      return { ok: false };
    } finally {
      setSaving(false);
    }
  }, [vendor, refreshVendor]);

  // Actualizar preços
  const savePrices = useCallback(async (prices) => {
    if (!vendor?.id) return;
    setSaving(true);
    setError(null);
    try {
      await updateVendorPrices(vendor.id, prices);
      await refreshVendor();
      flash();
      return { ok: true };
    } catch (err) {
      setError(err.message);
      return { ok: false };
    } finally {
      setSaving(false);
    }
  }, [vendor, refreshVendor]);

  return { saving, error, saved, saveStock, saveStatus, savePrices };
}
