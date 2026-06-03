import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { BEJAIA_COMMUNES, updateUserSkills, addCertification, type CertificationInput } from "@/lib/store";
import { supabase } from "@/lib/supabase";

// ─── Predefined skills ────────────────────────────────────────────────────────

const SKILL_OPTIONS = [
  "Informatique", "Design graphique", "Vidéo & montage", "Photographie",
  "Musique", "Théâtre & arts", "Sport & animation", "Langues étrangères",
  "Enseignement & tutorat", "Gestion de projet", "Bénévolat communautaire",
  "Agriculture durable", "Énergies renouvelables", "Environnement",
  "Premiers secours", "Cuisine & nutrition", "Artisanat", "Robotique",
  "Sciences", "Communication & médias",
];

export const Route = createFileRoute("/signup")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) || "/app",
  }),
  head: () => ({
    meta: [
      { title: "Inscription — YouthLink Béjaïa" },
      { name: "description", content: "Créez votre compte YouthLink Béjaïa et accédez aux opportunités de la wilaya." },
    ],
  }),
  component: SignupPage,
});

// ─── Local cert draft (before saving) ────────────────────────────────────────
interface CertDraft {
  id: string;
  name: string;
  code: string;
  issueDate: string;
  organization: string;
  file: File | null;
}

function emptyDraft(): CertDraft {
  return { id: crypto.randomUUID(), name: "", code: "", issueDate: "", organization: "", file: null };
}

function SignupPage() {
  const { signup, user, isLoading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();

  const [step, setStep] = useState(1);

  // Step 1
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [commune, setCommune] = useState("");

  // Step 2
  const [skills, setSkills] = useState<string[]>([]);

  // Step 3
  const [certDrafts, setCertDrafts] = useState<CertDraft[]>([]);
  const [activeDraft, setActiveDraft] = useState<CertDraft>(emptyDraft());
  const [showCertForm, setShowCertForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [newUserId, setNewUserId] = useState<string | null>(null);

  useEffect(() => {
    // Only auto-redirect if the user was already logged in before visiting this page.
    // If newUserId is set it means we just created the account and are still on
    // steps 2 / 3 — do NOT redirect yet.
    if (!isLoading && user && !newUserId) {
      navigate({ to: user.role === "admin" ? "/admin" : (redirect as any) || "/app" });
    }
  }, [user, isLoading, navigate, redirect, newUserId]);

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!commune) { setError("Veuillez sélectionner votre commune."); return; }
    if (password.length < 6) { setError("Le mot de passe doit contenir au moins 6 caractères."); return; }
    setSubmitting(true);
    const result = await signup({ name, email, password, commune });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? "Erreur lors de l'inscription.");
    } else {
      if (result.userId) setNewUserId(result.userId);
      setStep(2);
    }
  }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    // Use newUserId first; fall back to the already-signed-in user's id
    const userId = newUserId || user?.id;
    if (userId && skills.length > 0) {
      await updateUserSkills(userId, skills);
    }
    // Refresh the auth context so user.skills is up-to-date in /app
    await refreshUser();
    setStep(3);
  }

  function toggleSkill(skill: string) {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  function openAddCert() {
    setActiveDraft(emptyDraft());
    setShowCertForm(true);
  }

  function handleCertFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setActiveDraft((d) => ({ ...d, file }));
  }

  function saveDraft(e: React.FormEvent) {
    e.preventDefault();
    if (!activeDraft.name.trim()) return;
    setCertDrafts((prev) => {
      const exists = prev.find((d) => d.id === activeDraft.id);
      return exists
        ? prev.map((d) => (d.id === activeDraft.id ? activeDraft : d))
        : [...prev, activeDraft];
    });
    setShowCertForm(false);
  }

  function removeDraft(id: string) {
    setCertDrafts((prev) => prev.filter((d) => d.id !== id));
  }

  function editDraft(draft: CertDraft) {
    setActiveDraft(draft);
    setShowCertForm(true);
  }

  async function handleStep3(e: React.FormEvent) {
    e.preventDefault();
    // Use newUserId first; fall back to the already-signed-in user's id
    const userId = newUserId || user?.id;
    if (certDrafts.length > 0 && userId) {
      setUploading(true);
      setError(null);

      // Ensure the Supabase auth session is active before inserting.
      // After signUp the session may not be fully propagated yet.
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        // Try refreshing the session once
        await supabase.auth.refreshSession();
      }

      let failCount = 0;
      for (const draft of certDrafts) {
        const input: CertificationInput = {
          name: draft.name,
          code: draft.code || undefined,
          issueDate: draft.issueDate || undefined,
          organization: draft.organization || undefined,
          file: draft.file || undefined,
        };
        const result = await addCertification(userId, input);
        if (!result) failCount++;
      }
      setUploading(false);
      if (failCount > 0) {
        setError(`${failCount} certification(s) n'ont pas pu être enregistrées. Vous pourrez les ajouter depuis votre profil.`);
        // Still allow navigation after a brief delay so the user sees the error
        setTimeout(() => navigate({ to: (redirect as any) || "/app" }), 2500);
        return;
      }
    }
    // Refresh auth context so user data is up-to-date in /app
    await refreshUser();
    navigate({ to: (redirect as any) || "/app" });
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[700px] bg-leaf opacity-[0.04] blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-md relative z-10">
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

        <div className="flex items-center gap-2 mb-8 justify-center">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-mono transition-all ${
                step === s ? "bg-foreground text-background"
                  : step > s ? "bg-leaf text-background"
                  : "border hairline text-muted-foreground"
              }`}>
                {step > s ? "✓" : s}
              </div>
              {s < 3 && <div className={`h-px w-8 transition-all ${step > s ? "bg-leaf" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border hairline bg-surface/60 backdrop-blur p-8">

          {/* ── Step 1 ── */}
          {step === 1 && (
            <>
              <div className="mb-6">
                <h1 className="text-[22px] font-medium tracking-tight mb-1">Créer un compte</h1>
                <p className="text-[13px] text-muted-foreground">Rejoignez YouthLink Béjaïa et accédez aux opportunités.</p>
              </div>
              <form onSubmit={handleStep1} className="space-y-4">
                <FieldWrap label="Nom complet">
                  <input id="signup-name" type="text" required autoComplete="name" value={name}
                    onChange={(e) => setName(e.target.value)} placeholder="Votre nom"
                    className="w-full rounded-lg border hairline bg-background/60 px-4 py-2.5 text-[14px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-leaf/40 transition-all" />
                </FieldWrap>
                <FieldWrap label="Email">
                  <input id="signup-email" type="email" required autoComplete="email" value={email}
                    onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com"
                    className="w-full rounded-lg border hairline bg-background/60 px-4 py-2.5 text-[14px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-leaf/40 transition-all" />
                </FieldWrap>
                <FieldWrap label="Commune">
                  <select id="signup-commune" required value={commune} onChange={(e) => setCommune(e.target.value)}
                    className="w-full rounded-lg border hairline bg-background/60 px-4 py-2.5 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-leaf/40 transition-all appearance-none">
                    <option value="" disabled>Choisir une commune…</option>
                    {BEJAIA_COMMUNES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FieldWrap>
                <FieldWrap label="Mot de passe">
                  <input id="signup-password" type="password" required autoComplete="new-password" value={password}
                    onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 caractères"
                    className="w-full rounded-lg border hairline bg-background/60 px-4 py-2.5 text-[14px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-leaf/40 transition-all" />
                </FieldWrap>
                {error && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-[13px] text-destructive">{error}</div>
                )}
                <button id="signup-submit" type="submit" disabled={submitting}
                  className="w-full h-11 rounded-full bg-foreground text-background text-[14px] font-medium transition-opacity hover:opacity-85 disabled:opacity-50 mt-2">
                  {submitting ? "Création…" : "Continuer →"}
                </button>
              </form>
              <div className="mt-6 text-center text-[13px] text-muted-foreground">
                Déjà un compte ?{" "}
                <Link to="/login" search={{ redirect }} className="text-leaf hover:underline font-medium">Se connecter</Link>
              </div>
            </>
          )}

          {/* ── Step 2: Skills ── */}
          {step === 2 && (
            <>
              <div className="mb-6">
                <h1 className="text-[22px] font-medium tracking-tight mb-1">Vos compétences</h1>
                <p className="text-[13px] text-muted-foreground">Sélectionnez tout ce qui vous décrit. L'ODEJ s'en servira pour vous proposer des opportunités adaptées.</p>
              </div>
              <form onSubmit={handleStep2}>
                <div className="flex flex-wrap gap-2 mb-5">
                  {SKILL_OPTIONS.map((skill) => {
                    const selected = skills.includes(skill);
                    return (
                      <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                        className={`h-8 px-3 rounded-full text-[12px] transition-all border ${
                          selected ? "bg-leaf/20 border-leaf/50 text-leaf font-medium"
                            : "hairline text-muted-foreground hover:text-foreground hover:border-foreground/30"
                        }`}>
                        {selected && <span className="mr-1">✓</span>}{skill}
                      </button>
                    );
                  })}
                </div>
                <div className="text-[12px] text-muted-foreground mb-5">
                  {skills.length === 0 ? "Aucune compétence sélectionnée"
                    : `${skills.length} compétence${skills.length > 1 ? "s" : ""} sélectionnée${skills.length > 1 ? "s" : ""}`}
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 h-11 rounded-full border hairline text-[14px] text-muted-foreground hover:text-foreground transition-colors">← Retour</button>
                  <button type="submit"
                    className="flex-1 h-11 rounded-full bg-foreground text-background text-[14px] font-medium hover:opacity-85 transition-opacity">Continuer →</button>
                </div>
                <button type="button" onClick={() => setStep(3)}
                  className="w-full mt-3 text-[12px] text-muted-foreground hover:text-foreground transition-colors">Passer cette étape</button>
              </form>
            </>
          )}

          {/* ── Step 3: Certifications ── */}
          {step === 3 && (
            <>
              <div className="mb-5">
                <h1 className="text-[22px] font-medium tracking-tight mb-1">Vos certifications</h1>
                <p className="text-[13px] text-muted-foreground">Ajoutez diplômes ou attestations. Optionnel — modifiable plus tard dans votre profil.</p>
              </div>

              {/* Inline cert form */}
              {showCertForm && (
                <form onSubmit={saveDraft} className="rounded-xl border hairline bg-background/40 p-4 mb-4 space-y-3">
                  <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-leaf">
                    {certDrafts.find((d) => d.id === activeDraft.id) ? "Modifier" : "Nouvelle certification"}
                  </div>

                  <FieldWrap label="Nom de la certification *" small>
                    <input required value={activeDraft.name}
                      onChange={(e) => setActiveDraft((d) => ({ ...d, name: e.target.value }))}
                      placeholder="ex : Diplôme en informatique"
                      className="w-full rounded-lg border hairline bg-background/60 px-3 py-2 text-[13px] placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-leaf/40" />
                  </FieldWrap>

                  <div className="grid grid-cols-2 gap-3">
                    <FieldWrap label="Code / Numéro" small>
                      <input value={activeDraft.code}
                        onChange={(e) => setActiveDraft((d) => ({ ...d, code: e.target.value }))}
                        placeholder="ex : CERT-2024-01"
                        className="w-full rounded-lg border hairline bg-background/60 px-3 py-2 text-[13px] placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-leaf/40" />
                    </FieldWrap>
                    <FieldWrap label="Date d'obtention" small>
                      <input type="date" value={activeDraft.issueDate}
                        onChange={(e) => setActiveDraft((d) => ({ ...d, issueDate: e.target.value }))}
                        className="w-full rounded-lg border hairline bg-background/60 px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-leaf/40" />
                    </FieldWrap>
                  </div>

                  <FieldWrap label="Organisme délivrant" small>
                    <input value={activeDraft.organization}
                      onChange={(e) => setActiveDraft((d) => ({ ...d, organization: e.target.value }))}
                      placeholder="ex : Université de Béjaïa, CERIST…"
                      className="w-full rounded-lg border hairline bg-background/60 px-3 py-2 text-[13px] placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-leaf/40" />
                  </FieldWrap>

                  <FieldWrap label="Fichier justificatif (optionnel)" small>
                    <div onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-3 rounded-lg border-2 border-dashed border-border hover:border-leaf/40 hover:bg-leaf/5 transition-all cursor-pointer px-3 py-2.5">
                      <span className="text-[18px]">{activeDraft.file ? (activeDraft.file.name.endsWith(".pdf") ? "📄" : "🖼️") : "📎"}</span>
                      <div className="flex-1 min-w-0">
                        {activeDraft.file ? (
                          <>
                            <div className="text-[12px] font-medium truncate">{activeDraft.file.name}</div>
                            <div className="text-[10px] text-muted-foreground">{(activeDraft.file.size / 1024).toFixed(0)} KB</div>
                          </>
                        ) : (
                          <div className="text-[12px] text-muted-foreground">Cliquer pour joindre · PDF, JPG, PNG</div>
                        )}
                      </div>
                      {activeDraft.file && (
                        <button type="button" onClick={(ev) => { ev.stopPropagation(); setActiveDraft((d) => ({ ...d, file: null })); }}
                          className="text-muted-foreground hover:text-destructive text-[16px]">×</button>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleCertFileChange} className="hidden" />
                  </FieldWrap>

                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setShowCertForm(false)}
                      className="flex-1 h-9 rounded-full border hairline text-[12px] text-muted-foreground hover:text-foreground transition-colors">Annuler</button>
                    <button type="submit"
                      className="flex-1 h-9 rounded-full bg-foreground text-background text-[12px] font-medium hover:opacity-85 transition-opacity">
                      {certDrafts.find((d) => d.id === activeDraft.id) ? "Mettre à jour" : "Ajouter ✓"}
                    </button>
                  </div>
                </form>
              )}

              {/* Saved certs list */}
              {certDrafts.length > 0 && (
                <div className="space-y-2 mb-3">
                  {certDrafts.map((draft) => (
                    <div key={draft.id} className="flex items-start gap-3 rounded-xl border hairline bg-surface/60 px-4 py-3">
                      <span className="text-[20px] mt-0.5">🏅</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium truncate">{draft.name}</div>
                        {draft.organization && <div className="text-[11px] text-muted-foreground truncate">{draft.organization}</div>}
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {draft.code && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border hairline text-muted-foreground">#{draft.code}</span>
                          )}
                          {draft.issueDate && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border hairline text-muted-foreground">
                              📅 {new Date(draft.issueDate).toLocaleDateString("fr-DZ", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          )}
                          {draft.file && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border hairline text-leaf">📎 {draft.file.name}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button type="button" onClick={() => editDraft(draft)}
                          className="h-7 w-7 rounded-full border hairline flex items-center justify-center text-[12px] text-muted-foreground hover:text-foreground transition-colors">✎</button>
                        <button type="button" onClick={() => removeDraft(draft.id)}
                          className="h-7 w-7 rounded-full border hairline flex items-center justify-center text-[12px] text-muted-foreground hover:text-destructive transition-colors">×</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add cert button */}
              {!showCertForm && (
                <button type="button" onClick={openAddCert}
                  className="w-full mb-4 h-10 rounded-xl border-2 border-dashed border-border hover:border-leaf/40 text-[13px] text-muted-foreground hover:text-leaf hover:bg-leaf/5 transition-all flex items-center justify-center gap-2">
                  <span className="text-[18px]">+</span>
                  {certDrafts.length === 0 ? "Ajouter une certification" : "Ajouter une autre certification"}
                </button>
              )}

              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-[13px] text-destructive mb-3">{error}</div>
              )}

              <form onSubmit={handleStep3}>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)}
                    className="flex-1 h-11 rounded-full border hairline text-[14px] text-muted-foreground hover:text-foreground transition-colors">← Retour</button>
                  <button type="submit" disabled={uploading}
                    className="flex-1 h-11 rounded-full bg-foreground text-background text-[14px] font-medium hover:opacity-85 disabled:opacity-50 transition-opacity">
                    {uploading ? "Envoi…" : certDrafts.length > 0 ? `Terminer (${certDrafts.length}) →` : "Terminer →"}
                  </button>
                </div>
              </form>
            </>
          )}
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

// ─── FieldWrap helper ─────────────────────────────────────────────────────────

function FieldWrap({
  label,
  small,
  children,
}: {
  label: string;
  small?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className={`block font-mono uppercase tracking-[0.14em] text-muted-foreground mb-1.5 ${
          small ? "text-[10px]" : "text-[11px]"
        }`}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
