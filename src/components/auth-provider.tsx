import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "auditiq-user";

function deriveName(email: string) {
  const local = email.split("@")[0] ?? "Auditor";
  return local
    .split(/[._-]/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(" ");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as AuthUser);
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const persist = (u: AuthUser | null) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const signIn = useCallback(async (email: string, password: string) => {
    if (!email || password.length < 6) {
      throw new Error("Enter a valid email and a password of at least 6 characters.");
    }
    await new Promise((r) => setTimeout(r, 600));
    persist({ id: crypto.randomUUID(), email, name: deriveName(email) });
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    if (!name || !email || password.length < 6) {
      throw new Error("Fill all fields. Password must be at least 6 characters.");
    }
    await new Promise((r) => setTimeout(r, 700));
    persist({ id: crypto.randomUUID(), email, name });
  }, []);

  const signOut = useCallback(() => persist(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, signIn, signUp, signOut }),
    [user, loading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
