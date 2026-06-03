import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Connexion — YouthLink Béjaïa" },
      { name: "description", content: "Connectez-vous à votre compte YouthLink Béjaïa." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      navigate({ to: user.role === "admin" ? "/admin" : "/app" });
    }
  }, [user, isLoading, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? "Erreur de connexion.");
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[700px] bg-leaf opacity-[0.04] blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-leaf-gradient shadow-leaf">
              <span className="h-1.5 w-1.5 rounded-full bg-background" />
            </span>
            <span className="text-[15px] font-medium tracking-tight">
              YouthLink<span className="text-leaf">.</span>bejaia
            </span>
          </Link>
        </div>

        <div className="rounded-2xl border hairline bg-surface/60 backdrop-blur p-8">
          <div className="mb-6">
            <h1 className="text-[22px] font-medium tracking-tight mb-1">Connexion</h1>
            <p className="text-[13px] text-muted-foreground">
              Accédez à votre espace YouthLink Béjaïa.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-1.5">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className="w-full rounded-lg border hairline bg-background/60 px-4 py-2.5 text-[14px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-leaf/40 transition-all"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-1.5">
                Mot de passe
              </label>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border hairline bg-background/60 px-4 py-2.5 text-[14px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-leaf/40 transition-all"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-[13px] text-destructive">
                {error}
              </div>
            )}

            <button
              id="login-submit"
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-full bg-foreground text-background text-[14px] font-medium transition-opacity hover:opacity-85 disabled:opacity-50 mt-2"
            >
              {submitting ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          <div className="mt-6 text-center text-[13px] text-muted-foreground">
            Pas encore de compte?{" "}
            <Link to="/signup" className="text-leaf hover:underline font-medium">
              S'inscrire
            </Link>
          </div>

          {/* Admin hint */}
          <div className="mt-6 rounded-xl border hairline bg-surface/60 p-4">
            <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-leaf mb-2">
              Accès ODEJ Béjaïa
            </div>
            <div className="text-[12px] text-muted-foreground space-y-0.5">
              <div>Email : <span className="font-mono text-foreground/80">admin@odejbejaia-dz.com</span></div>
              <div>Mot de passe : <span className="font-mono text-foreground/80">admin2026</span></div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
