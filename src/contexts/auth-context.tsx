import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { type User, type UserRole } from "@/lib/store";

// ─── Types ──────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (data: { name: string; email: string; password: string; commune: string }) => Promise<{ ok: boolean; error?: string; userId?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Fetch the profile row for a given auth user id, retrying up to `tries` times
 *  (the DB trigger may lag slightly on first signup). */
async function fetchProfile(userId: string, tries = 5): Promise<User | null> {
  for (let i = 0; i < tries; i++) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, name, commune, role, skills, created_at")
      .eq("id", userId)
      .single();

    if (!error && data) {
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        commune: data.commune,
        role: data.role as UserRole,
        skills: data.skills ?? [],
        createdAt: data.created_at,
      };
    }

    // Wait 600 ms before retrying (trigger may not have fired yet)
    if (i < tries - 1) await new Promise((r) => setTimeout(r, 600));
  }
  return null;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Check existing session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
      }
      setIsLoading(false);
    });

    // 2. Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setUser(profile);
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ─── Login ────────────────────────────────────────────────────────────────

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const msg =
        error.message.includes("Invalid login credentials")
          ? "Email ou mot de passe incorrect."
          : error.message;
      return { ok: false, error: msg };
    }
    return { ok: true };
  }

  // ─── Signup ───────────────────────────────────────────────────────────────

  async function signup(data: { name: string; email: string; password: string; commune: string }) {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name, commune: data.commune, role: "user" },
      },
    });

    if (error) {
      const msg =
        error.message.includes("already registered") || error.message.includes("already exists")
          ? "Un compte existe déjà avec cet email."
          : error.message;
      return { ok: false, error: msg };
    }
    return { ok: true, userId: authData.user?.id };
  }

  // ─── Logout ───────────────────────────────────────────────────────────────

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  // ─── RefreshUser ──────────────────────────────────────────────────────────

  async function refreshUser() {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const profile = await fetchProfile(authUser.id);
      if (profile) setUser(profile);
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
