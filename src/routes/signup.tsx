import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { BEJAIA_COMMUNES } from "@/lib/store";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Inscription — YouthLink Béjaïa" },
      { name: "description", content: "Créez votre compte YouthLink Béjaïa et accédez aux opportunités de la wilaya." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { signup, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [commune, setCommune] = useState("");
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
    if (!commune) { setError("Veuillez sélectionner votre commune."); return; }
    if (password.length < 6) { setError("Le mot de passe doit contenir au moins 6 caractères."); return; }
    setSubmitting(true);
    const result = await signup({ name, email, password, commune });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? "Erreur lors de l'inscription.");
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
            <h1 className="text-[22px] font-medium tracking-tight mb-1">Créer un compte</h1>
            <p className="text-[13px] text-muted-foreground">
              Rejoignez YouthLink Béjaïa et accédez aux opportunités.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="signup-name" className="block text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-1.5">
                Nom complet
              </label>
              <input
                id="signup-name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre nom"
                className="w-full rounded-lg border hairline bg-background/60 px-4 py-2.5 text-[14px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-leaf/40 transition-all"
              />
            </div>

            <div>
              <label htmlFor="signup-email" className="block text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-1.5">
                Email
              </label>
              <input
                id="signup-email"
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
              <label htmlFor="signup-commune" className="block text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-1.5">
                Commune
              </label>
              <select
                id="signup-commune"
                required
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
                className="w-full rounded-lg border hairline bg-background/60 px-4 py-2.5 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-leaf/40 transition-all appearance-none"
              >
                <option value="" disabled>Choisir une commune…</option>
                {BEJAIA_COMMUNES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-1.5">
                Mot de passe
              </label>
              <input
                id="signup-password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 caractères"
                className="w-full rounded-lg border hairline bg-background/60 px-4 py-2.5 text-[14px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-leaf/40 transition-all"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-[13px] text-destructive">
                {error}
              </div>
            )}

            <button
              id="signup-submit"
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-full bg-foreground text-background text-[14px] font-medium transition-opacity hover:opacity-85 disabled:opacity-50 mt-2"
            >
              {submitting ? "Inscription…" : "Créer mon compte"}
            </button>
          </form>

          <div className="mt-6 text-center text-[13px] text-muted-foreground">
            Déjà un compte ?{" "}
            <Link to="/login" className="text-leaf hover:underline font-medium">
              Se connecter
            </Link>
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
