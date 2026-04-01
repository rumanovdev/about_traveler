import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type AppRole = "admin" | "visitor" | "partner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: AppRole[];
  hasRole: (role: AppRole) => boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  roles: [],
  hasRole: () => false,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);

  const syncSession = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession);
    setUser(nextSession?.user ?? null);

    if (!nextSession?.user) {
      setRoles([]);
      return;
    }

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", nextSession.user.id);

    if (error) {
      setRoles([]);
      return;
    }

    setRoles((data ?? []).map((r) => r.role as AppRole));
  }, []);

  useEffect(() => {
    let isMounted = true;

    const applySession = (nextSession: Session | null) => {
      void syncSession(nextSession)
        .catch(() => {
          if (!isMounted) return;
          setSession(nextSession);
          setUser(nextSession?.user ?? null);
          setRoles([]);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    };

    // IMPORTANT: keep callback sync to avoid Supabase auth deadlocks
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;
      queueMicrotask(() => {
        if (!isMounted) return;
        applySession(nextSession);
      });
    });

    // Then get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!isMounted) return;
      applySession(initialSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [syncSession]);

  const hasRole = useCallback((role: AppRole) => roles.includes(role), [roles]);

  const signOut = async () => {
    setUser(null);
    setSession(null);
    setRoles([]);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, roles, hasRole, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
