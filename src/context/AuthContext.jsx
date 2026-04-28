import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../utils/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [role, setRole]       = useState(null);   // 'admin' | 'vendor' | null
  const [vendor, setVendor]   = useState(null);
  const [loading, setLoading] = useState(true);   // começa true, passa a false assim que o Supabase responde
  const [error, setError]     = useState(null);

  // ── Carregar role + perfil do vendor ────────────
  const loadProfile = useCallback(async (userId) => {
    try {
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (profileErr || !profile) {
        // Tabela profiles não existe ou utilizador sem registo → assume vendor
        setRole('vendor');
        return;
      }

      if (profile.role === 'admin') {
        setRole('admin');
        setVendor(null);
      } else {
        setRole('vendor');
        const { data: vendorData } = await supabase
          .from('vendors')
          .select('*')
          .eq('user_id', userId)
          .single();
        setVendor(vendorData || null);
      }
    } catch {
      // Qualquer erro: não bloquear — assume vendor sem perfil
      setRole('vendor');
    }
  }, []);

  // ── Inicialização ────────────────────────────────
  useEffect(() => {
    let mounted = true;

    // Garantia absoluta: ao fim de 3s o loading passa sempre a false
    const safetyTimer = setTimeout(() => {
      if (mounted) {
        setLoading(false);
      }
    }, 3000);

    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          await loadProfile(session.user.id);
        }
      } catch {
        // Erro de rede / Supabase offline — não bloquear
      } finally {
        if (mounted) {
          setLoading(false);
          clearTimeout(safetyTimer);
        }
      }
    }

    init();

    // Ouvir mudanças de auth (login, logout, refresh de token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          setLoading(true);
          await loadProfile(session.user.id);
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setRole(null);
          setVendor(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Login do Vendedor ────────────────────────────
  const loginVendor = useCallback(async (email, password) => {
    setError(null);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        const msg = 'Email ou palavra-passe incorrectos.';
        setError(msg);
        return { success: false, error: msg };
      }

      // Verificar se está bloqueado
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('blocked, id')
        .eq('user_id', data.user.id)
        .single();

      if (vendorData?.blocked) {
        await supabase.auth.signOut();
        const msg = 'Esta conta está bloqueada. Contacte o administrador.';
        setError(msg);
        return { success: false, error: msg };
      }

      return { success: true };
    } catch (err) {
      const msg = 'Erro inesperado. Verifique a sua ligação.';
      setError(msg);
      return { success: false, error: msg };
    }
  }, []);

  // ── Login do Admin ───────────────────────────────
  const loginAdmin = useCallback(async (email, password) => {
    setError(null);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        const msg = 'Email ou palavra-passe incorrectos.';
        setError(msg);
        return { success: false, error: msg };
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profile?.role !== 'admin') {
        await supabase.auth.signOut();
        const msg = 'Acesso negado. Esta conta não é de administrador.';
        setError(msg);
        return { success: false, error: msg };
      }

      return { success: true };
    } catch (err) {
      const msg = 'Erro inesperado. Verifique a sua ligação.';
      setError(msg);
      return { success: false, error: msg };
    }
  }, []);

  // ── Logout ───────────────────────────────────────
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setVendor(null);
  }, []);

  // ── Refrescar dados do vendor ────────────────────
  const refreshVendor = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('vendors')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (data) setVendor(data);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      role,
      vendor,
      loading,
      error,
      loginVendor,
      loginAdmin,
      logout,
      refreshVendor,
      isAdmin:         role === 'admin',
      isVendor:        role === 'vendor',
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
};
