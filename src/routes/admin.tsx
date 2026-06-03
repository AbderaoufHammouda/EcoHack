import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getRegistrations,
  type OdejEvent,
  BEJAIA_COMMUNES,
} from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Tableau de bord ODEJ — YouthLink Béjaïa" },
      { name: "description", content: "Administration des événements et des structures ODEJ Béjaïa." },
    ],
  }),
  component: AdminDashboard,
});

type EventForm = Omit<OdejEvent, "id" | "seatsTaken">;

const EMPTY_FORM: EventForm = {
  title: "",
  type: "MJ",
  tag: "Atelier",
  facilityName: "",
  commune: "Béjaïa",
  date: "",
  time: "",
  seatsTotal: 20,
  description: "",
  accent: "leaf",
};

const TAGS = ["Atelier", "Bénévolat", "Bourse", "Événement", "Formation", "Club", "Camp", "Autre"];
const TYPES = ["AJ", "CSP", "MJ", "Camp", "SPD", "CLS"] as const;

function AdminDashboard() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<OdejEvent[]>([]);
  const [allRegs, setAllRegs] = useState<Awaited<ReturnType<typeof getRegistrations>>>([]);
  const [view, setView] = useState<"events" | "registrations">("events");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // ── Guard ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isLoading && !user) navigate({ to: "/login" });
    if (!isLoading && user?.role !== "admin") navigate({ to: "/app" });
  }, [user, isLoading, navigate]);

  // ── Load data ─────────────────────────────────────────────────────────────

  const refreshData = useCallback(async () => {
    const [evs, regs] = await Promise.all([getEvents(), getRegistrations()]);
    setEvents(evs);
    setAllRegs(regs);
  }, []);

  useEffect(() => {
    if (user?.role === "admin") refreshData();
  }, [user, refreshData]);

  // ── Form helpers ──────────────────────────────────────────────────────────

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(ev: OdejEvent) {
    setEditingId(ev.id);
    setForm({
      title: ev.title,
      type: ev.type,
      tag: ev.tag,
      facilityName: ev.facilityName,
      commune: ev.commune,
      date: ev.date,
      time: ev.time,
      seatsTotal: ev.seatsTotal,
      description: ev.description,
      accent: ev.accent,
    });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    if (editingId) {
      await updateEvent(editingId, form);
    } else {
      await createEvent(form);
    }
    await refreshData();
    setShowForm(false);
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await deleteEvent(id);
    await refreshData();
    setDeleteConfirm(null);
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 rounded-full bg-leaf-gradient animate-pulse" />
      </div>
    );
  }

  const totalSeats = events.reduce((s, e) => s + e.seatsTotal, 0);
  const takenSeats = events.reduce((s, e) => s + e.seatsTaken, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 border-b hairline bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-leaf-gradient shadow-leaf">
                <span className="h-1.5 w-1.5 rounded-full bg-background" />
              </span>
            </Link>
            <span className="text-[13px] text-muted-foreground">·</span>
            <span className="text-[13px] font-medium">Tableau de bord ODEJ</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-muted-foreground hidden sm:block">{user.name}</span>
            <button
              onClick={() => { logout(); navigate({ to: "/" }); }}
              className="h-8 px-3 rounded-full border hairline text-[12px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-6 py-8">
        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Événements", value: events.length, icon: "📅" },
            { label: "Inscriptions", value: allRegs.length, icon: "🎟️" },
            { label: "Places totales", value: totalSeats, icon: "🪑" },
            { label: "Taux remplissage", value: totalSeats ? `${Math.round((takenSeats / totalSeats) * 100)}%` : "—", icon: "📊" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="rounded-2xl border hairline bg-surface/60 p-5">
              <div className="text-[24px] mb-2">{icon}</div>
              <div className="text-[26px] font-medium tracking-tight">{value}</div>
              <div className="text-[12px] text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        {/* ── View toggle + CTA ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1 rounded-full border hairline p-1 bg-surface/40">
            {(["events", "registrations"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 rounded-full text-[13px] transition-colors ${
                  view === v ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {v === "events" ? "Événements" : "Inscriptions"}
              </button>
            ))}
          </div>
          {view === "events" && (
            <button
              id="create-event"
              onClick={openCreate}
              className="h-9 px-5 rounded-full bg-foreground text-background text-[13px] font-medium hover:opacity-85 transition-opacity"
            >
              + Créer un événement
            </button>
          )}
        </div>

        {/* ── Events table ── */}
        {view === "events" && (
          <div className="rounded-2xl border hairline bg-surface/40 overflow-hidden">
            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-[40px] mb-4">📭</div>
                <div className="text-[14px] text-muted-foreground">Aucun événement. Créez le premier !</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b hairline text-left text-muted-foreground">
                      <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-wider">Titre</th>
                      <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-wider hidden md:table-cell">Type</th>
                      <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-wider hidden sm:table-cell">Date</th>
                      <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-wider">Places</th>
                      <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-wider">Inscrits</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y hairline">
                    {events.map((ev) => {
                      const regCount = allRegs.filter((r) => r.eventId === ev.id).length;
                      const pct = Math.round((ev.seatsTaken / ev.seatsTotal) * 100);
                      return (
                        <tr key={ev.id} className="hover:bg-surface/60 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-medium">{ev.title}</div>
                            <div className="text-[11px] text-muted-foreground">{ev.commune} · {ev.tag}</div>
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border hairline">
                              {ev.type}
                            </span>
                          </td>
                          <td className="px-5 py-4 hidden sm:table-cell text-muted-foreground">
                            {ev.date} · {ev.time}
                          </td>
                          <td className="px-5 py-4">
                            <div className="text-[12px] font-mono">{ev.seatsTaken}/{ev.seatsTotal}</div>
                            <div className="mt-1 h-1 w-16 rounded-full bg-border overflow-hidden">
                              <div
                                className="h-full rounded-full bg-leaf"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </td>
                          <td className="px-5 py-4 font-mono">{regCount}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={() => openEdit(ev)}
                                className="h-7 px-3 rounded-full border hairline text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                              >
                                Modifier
                              </button>
                              <button
                                id={`delete-${ev.id}`}
                                onClick={() => setDeleteConfirm(ev.id)}
                                className="h-7 px-3 rounded-full border border-destructive/30 text-[11px] text-destructive/70 hover:text-destructive hover:border-destructive transition-colors"
                              >
                                Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Registrations table ── */}
        {view === "registrations" && (
          <div className="rounded-2xl border hairline bg-surface/40 overflow-hidden">
            {allRegs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-[40px] mb-4">📋</div>
                <div className="text-[14px] text-muted-foreground">Aucune inscription pour l'instant.</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b hairline text-left text-muted-foreground">
                      <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-wider">Participant</th>
                      <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-wider hidden md:table-cell">Événement</th>
                      <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-wider hidden sm:table-cell">Inscrit le</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y hairline">
                    {allRegs.map((reg) => {
                      const ev = events.find((e) => e.id === reg.eventId);
                      return (
                        <tr key={reg.id} className="hover:bg-surface/60 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-medium">{reg.userName}</div>
                            <div className="text-[11px] text-muted-foreground">{reg.userEmail}</div>
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            <div>{ev?.title ?? "—"}</div>
                            <div className="text-[11px] text-muted-foreground">{ev?.commune}</div>
                          </td>
                          <td className="px-5 py-4 hidden sm:table-cell text-muted-foreground text-[11px]">
                            {new Date(reg.registeredAt).toLocaleDateString("fr-DZ", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Event form modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border hairline bg-surface shadow-soft p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[18px] font-medium">
                {editingId ? "Modifier l'événement" : "Nouvel événement"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="h-8 w-8 rounded-full border hairline flex items-center justify-center text-[18px] text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <FormField label="Titre">
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-lg border hairline bg-background/60 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-leaf/40"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Type">
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as OdejEvent["type"] })}
                    className="w-full rounded-lg border hairline bg-background/60 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-leaf/40"
                  >
                    {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </FormField>
                <FormField label="Tag">
                  <select
                    value={form.tag}
                    onChange={(e) => setForm({ ...form, tag: e.target.value })}
                    className="w-full rounded-lg border hairline bg-background/60 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-leaf/40"
                  >
                    {TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </FormField>
              </div>

              <FormField label="Nom de la structure">
                <input
                  required
                  value={form.facilityName}
                  onChange={(e) => setForm({ ...form, facilityName: e.target.value })}
                  className="w-full rounded-lg border hairline bg-background/60 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-leaf/40"
                />
              </FormField>

              <FormField label="Commune">
                <select
                  value={form.commune}
                  onChange={(e) => setForm({ ...form, commune: e.target.value })}
                  className="w-full rounded-lg border hairline bg-background/60 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-leaf/40"
                >
                  {BEJAIA_COMMUNES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Date">
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full rounded-lg border hairline bg-background/60 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-leaf/40"
                  />
                </FormField>
                <FormField label="Heure">
                  <input
                    type="time"
                    required
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full rounded-lg border hairline bg-background/60 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-leaf/40"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Places totales">
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.seatsTotal}
                    onChange={(e) => setForm({ ...form, seatsTotal: Number(e.target.value) })}
                    className="w-full rounded-lg border hairline bg-background/60 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-leaf/40"
                  />
                </FormField>
                <FormField label="Couleur">
                  <select
                    value={form.accent}
                    onChange={(e) => setForm({ ...form, accent: e.target.value as "leaf" | "amber" })}
                    className="w-full rounded-lg border hairline bg-background/60 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-leaf/40"
                  >
                    <option value="leaf">Vert (leaf)</option>
                    <option value="amber">Ambre (amber)</option>
                  </select>
                </FormField>
              </div>

              <FormField label="Description">
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-lg border hairline bg-background/60 px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-leaf/40 resize-none"
                />
              </FormField>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 h-10 rounded-full border hairline text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Annuler
                </button>
                <button
                  id="save-event"
                  type="submit"
                  disabled={saving}
                  className="flex-1 h-10 rounded-full bg-foreground text-background text-[13px] font-medium hover:opacity-85 disabled:opacity-50 transition-opacity"
                >
                  {saving ? "Enregistrement…" : editingId ? "Enregistrer" : "Créer l'événement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete confirm modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border hairline bg-surface shadow-soft p-6">
            <h3 className="text-[18px] font-medium mb-2">Supprimer l'événement ?</h3>
            <p className="text-[13px] text-muted-foreground mb-6">
              Cette action est irréversible. Toutes les inscriptions liées seront aussi supprimées.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 h-10 rounded-full border hairline text-[13px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Annuler
              </button>
              <button
                id="confirm-delete"
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 h-10 rounded-full bg-destructive text-white text-[13px] font-medium hover:opacity-85 transition-opacity"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
