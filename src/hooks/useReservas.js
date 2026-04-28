// =====================================================
// HOOK: useReservas
// Gerir reservas com Realtime para o painel do vendedor
// =====================================================
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchReservasByVendor,
  fetchEncomendasByVendor,
  createReserva,
  createEncomenda,
  updateReservaStatus,
  subscribeToVendorReservas,
  unsubscribe,
} from '../utils/supabase';

export function useReservas(vendorId) {
  const [reservas, setReservas]     = useState([]);
  const [encomendas, setEncomendas] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [newAlert, setNewAlert]     = useState(null); // nova reserva recebida
  const channelRef = useRef(null);

  const load = useCallback(async () => {
    if (!vendorId) return;
    try {
      setLoading(true);
      const [r, e] = await Promise.all([
        fetchReservasByVendor(vendorId),
        fetchEncomendasByVendor(vendorId),
      ]);
      setReservas(r);
      setEncomendas(e);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  useEffect(() => {
    if (!vendorId) return;
    load();

    // Subscrever a novas reservas em tempo real
    channelRef.current = subscribeToVendorReservas(vendorId, (newReserva) => {
      setReservas(prev => [newReserva, ...prev]);
      // Alerta de nova reserva
      setNewAlert(newReserva);
      setTimeout(() => setNewAlert(null), 5000); // limpar após 5s
    });

    return () => unsubscribe(channelRef.current);
  }, [vendorId, load]);

  const aceitar = useCallback(async (reservaId) => {
    const data = await updateReservaStatus(reservaId, 'aceite');
    setReservas(prev => prev.map(r => r.id === reservaId ? data : r));
    return data;
  }, []);

  const recusar = useCallback(async (reservaId) => {
    const data = await updateReservaStatus(reservaId, 'recusado');
    setReservas(prev => prev.map(r => r.id === reservaId ? data : r));
    return data;
  }, []);

  const pendentes = reservas.filter(r => r.status === 'pendente');
  const historico = reservas.filter(r => r.status !== 'pendente');

  return {
    reservas, encomendas, loading, error, newAlert,
    pendentes, historico,
    aceitar, recusar,
    reload: load,
  };
}

// ── Hook público: criar reserva (para o cliente na Home) ──
export function useCreateReserva() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(false);

  const submit = useCallback(async (reservaData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const data = await createReserva(reservaData);
      setSuccess(true);
      return { ok: true, data };
    } catch (err) {
      setError(err.message);
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const submitEncomenda = useCallback(async (encomendaData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const data = await createEncomenda(encomendaData);
      setSuccess(true);
      return { ok: true, data };
    } catch (err) {
      setError(err.message);
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, success, submit, submitEncomenda };
}
