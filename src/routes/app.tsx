import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  getEvents,
  getUserRegistrations,
  registerForEvent,
  cancelRegistration,
  type OdejEvent,
} from "@/lib/store";
import {
  getGameProfile,
  processLoginStreak,
  getLevel,
  getNextLevel,
  getXpProgress,
  checkAndAwardBadges,
  completeTask,
  isTaskDoneToday,
  getLeaderboard,
  BADGES,
  DAILY_TASKS,
  LEVELS,
  type GameProfile,
  type LeaderboardEntry,
} from "@/lib/gamification";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Mon Espace — YouthLink Béjaïa" },
      { name: "description", content: "Opportunités, progression XP, classement et tâches quotidiennes." },
    ],
  }),
  component: AppPage,
});

const TYPE_LABELS: Record<string, string> = {
  AJ: "Beit Ech-Chabab",
  CSP: "Centre Sportif",
  MJ: "Maison de Jeunes",
  Camp: "Camp",
  SPD: "Services",
  CLS: "Centre Scientifique",
};

// Use LEVELS directly as the levels list
const LEVELS_LIST = LEVELS;

type View = "explorer" | "progression" | "classement" | "taches";

// ── Heatmap data derived from events ────────────────────────────────────────
type CenterActivity = {
  name: string;
  commune: string;
  type: string;
  eventCount: number;
  seatsTaken: number;
  seatsTotal: number;
  level: "active" | "moderate" | "low";
};

function computeCenterActivity(events: OdejEvent[]): CenterActivity[] {
  const map = new Map<string, CenterActivity>();
  for (const ev of events) {
    const key = ev.facilityName;
    if (!map.has(key)) {
      map.set(key, {
        name: ev.facilityName,
        commune: ev.commune,
        type: ev.type,
        eventCount: 0,
        seatsTaken: 0,
        seatsTotal: 0,
        level: "low",
      });
    }
    const c = map.get(key)!;
    c.eventCount++;
    c.seatsTaken += ev.seatsTaken;
    c.seatsTotal += ev.seatsTotal;
  }
  const centers = Array.from(map.values()).map((c) => ({
    ...c,
    level: c.eventCount >= 3 ? "active" : c.eventCount === 2 ? "moderate" : "low",
  } as CenterActivity));
  return centers.sort((a, b) => b.eventCount - a.eventCount);
}

function AppPage() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState<OdejEvent[]>([]);
  const [myRegs, setMyRegs] = useState<string[]>([]);
  const [filter, setFilter] = useState("Tous");
  const [view, setView] = useState<View>("explorer");

  const [profile, setProfile] = useState<GameProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [toasts, setToasts] = useState<{ id: number; msg: string; xp?: number }[]>([]);
  const toastId = useRef(0);

  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [badgeModal, setBadgeModal] = useState<string | null>(null);

  // ── Guard ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isLoading && !user) navigate({ to: "/login" });
    if (!isLoading && user?.role === "admin") navigate({ to: "/admin" });
  }, [user, isLoading, navigate]);

  // ── Refresh all async data ────────────────────────────────────────────────

  const refreshAll = useCallback(async () => {
    if (!user) return;
    const [evs, regs, prof, lb] = await Promise.all([
      getEvents(),
      getUserRegistrations(user.id),
      getGameProfile(user.id),
      getLeaderboard(),
    ]);
    setEvents(evs);
    setMyRegs(regs.map((r) => r.eventId));
    setProfile(prof);
    setLeaderboard(lb);
  }, [user]);

  // ── Process login streak once on mount ───────────────────────────────────

  useEffect(() => {
    if (!user || user.role === "admin") return;

    async function boot() {
      const { xpGained, streakUpdated } = await processLoginStreak(user!.id);
      if (streakUpdated && xpGained > 0) {
        addToast(`Connexion quotidienne`, xpGained);
      }

      const regs = await getUserRegistrations(user!.id);
      const awarded = await checkAndAwardBadges(user!.id, regs.length);
      if (awarded.length > 0) {
        setNewBadges(awarded);
        setBadgeModal(awarded[0]);
      }

      await refreshAll();
    }

    boot();
  }, [user]); // eslint-disable-line

  // ── Toast helpers ────────────────────────────────────────────────────────

  function addToast(msg: string, xp?: number) {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, msg, xp }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }

  // ── Register ─────────────────────────────────────────────────────────────

  async function handleRegister(ev: OdejEvent) {
    if (!user) return;
    if (myRegs.includes(ev.id)) {
      await cancelRegistration(user.id, ev.id);
      addToast("Inscription annulée.");
    } else {
      const ok = await registerForEvent(user.id, ev.id);
      if (ok) {
        const xpGained = await completeTask(user.id, "register-event");
        addToast("Inscription confirmée ✓", xpGained > 0 ? xpGained : 50);
        await completeTask(user.id, "explore-event");

        const regs = await getUserRegistrations(user.id);
        const awarded = await checkAndAwardBadges(user.id, regs.length);
        if (awarded.length > 0) {
          setNewBadges((b) => [...b, ...awarded]);
          setBadgeModal(awarded[0]);
        }
      } else {
        addToast("Plus de places disponibles.");
      }
    }
    await refreshAll();
  }

  // ── Task completion ────────────────────────────────────────────────────────

  async function handleCompleteTask(taskId: string) {
    if (!user || !profile) return;
    if (isTaskDoneToday(profile, taskId)) return;
    const xp = await completeTask(user.id, taskId);
    if (xp > 0) addToast("Tâche accomplie !", xp);
    await refreshAll();
  }

  // ── Leaderboard view task ────────────────────────────────────────────────

  function handleViewLeaderboard() {
    setView("classement");
    handleCompleteTask("check-leaderboard");
  }

  // ── Derived ──────────────────────────────────────────────────────────────

  const tags = ["Tous", ...Array.from(new Set(events.map((e) => e.tag)))];
  const displayedEvents =
    filter === "Tous" ? events : events.filter((e) => e.tag === filter);
  const myEvents = events.filter((e) => myRegs.includes(e.id));

  const level = profile ? getLevel(profile.xp) : null;
  const nextLevel = profile ? getNextLevel(profile.xp) : null;
  const xpProgress = profile ? getXpProgress(profile.xp) : 0;

  const myRank = leaderboard.findIndex((e) => e.userId === user?.id) + 1;

  if (isLoading || !user || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-leaf-gradient animate-pulse" />
          <div className="text-[13px] text-muted-foreground">Chargement…</div>
        </div>
      </div>
    );
  }

  const navItems: { id: View; label: string; icon: string }[] = [
    { id: "explorer",    label: "Explorer",    icon: "🔍" },
    { id: "taches",      label: "Tâches",      icon: "✅" },
    { id: "classement",  label: "Classement",  icon: "🏆" },
    { id: "progression", label: "Progression", icon: "⭐" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ── Toasts ── */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 rounded-xl border hairline bg-surface/95 backdrop-blur px-5 py-3 text-[13px] shadow-soft animate-in slide-in-from-top-2 pointer-events-auto"
          >
            <span>{t.msg}</span>
            {t.xp && (
              <span className="inline-flex items-center gap-1 rounded-full bg-leaf/20 border border-leaf/30 px-2.5 py-0.5 text-[11px] font-mono text-leaf">
                +{t.xp} XP
              </span>
            )}
          </div>
        ))}
      </div>

      {/* ── Badge earned modal ── */}
      {badgeModal && (() => {
        const badge = BADGES.find((b) => b.id === badgeModal);
        if (!badge) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <div className="w-full max-w-sm rounded-2xl border hairline bg-surface shadow-soft p-8 text-center">
              <div className="text-[56px] mb-4">{badge.icon}</div>
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-leaf mb-2">Badge débloqué !</div>
              <div className="text-[22px] font-medium mb-2">{badge.name}</div>
              <div className="text-[14px] text-muted-foreground mb-8">{badge.description}</div>
              <button
                onClick={() => {
                  const remaining = newBadges.filter((id) => id !== badgeModal);
                  setNewBadges(remaining);
                  setBadgeModal(remaining[0] ?? null);
                }}
                className="h-11 w-full rounded-full bg-foreground text-background text-[14px] font-medium hover:opacity-85 transition-opacity"
              >
                Super ! →
              </button>
            </div>
          </div>
        );
      })()}

      {/* ── Top nav ── */}
      <header className="sticky top-0 z-40 border-b hairline bg-background/80 backdrop-blur-xl shrink-0">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-leaf-gradient shadow-leaf">
              <span className="h-1.5 w-1.5 rounded-full bg-background" />
            </span>
            <span className="text-[14px] font-medium tracking-tight hidden sm:block">
              YouthLink<span className="text-leaf">.</span>bejaia
            </span>
          </Link>

          {/* Desktop nav pills */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => item.id === "classement" ? handleViewLeaderboard() : setView(item.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] transition-colors ${
                  view === item.id ? "bg-surface text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
                {item.id === "taches" && (() => {
                  const done = DAILY_TASKS.filter((t) => isTaskDoneToday(profile, t.id)).length;
                  const total = DAILY_TASKS.length;
                  return done < total ? (
                    <span className="ml-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber text-background text-[9px] font-mono px-1">
                      {total - done}
                    </span>
                  ) : null;
                })()}
              </button>
            ))}
          </nav>

          {/* XP pill + user */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full border hairline bg-surface/60 px-3 py-1.5">
              <span className="text-[11px] font-mono text-leaf">{level?.title}</span>
              <span className="h-3.5 w-px bg-border" />
              <span className="text-[11px] font-mono text-amber">🔥 {profile.streak}</span>
              <span className="h-3.5 w-px bg-border" />
              <span className="text-[11px] font-mono text-foreground/70">{profile.xp} XP</span>
            </div>
            <button
              id="app-logout"
              onClick={() => { logout(); navigate({ to: "/" }); }}
              className="h-8 px-3 rounded-full border hairline text-[12px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Sortir
            </button>
          </div>
        </div>
      </header>

      {/* ── Body: sidebar + main ── */}
      <div className="flex flex-1 mx-auto w-full max-w-[1400px]">

        {/* ── Left sidebar ── */}
        <aside className="hidden lg:flex flex-col w-[280px] shrink-0 border-r hairline p-6 sticky top-16 self-start max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* User card */}
          <div className="rounded-2xl border hairline bg-surface/60 p-5 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-leaf-gradient flex items-center justify-center text-background text-[18px] font-semibold shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-[15px] font-medium truncate">{user.name}</div>
                <div className="text-[12px] text-muted-foreground">{user.commune}</div>
              </div>
            </div>

            {/* Level badge */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-medium" style={{ color: level?.color }}>{level?.title}</span>
                <span className="text-[11px] font-mono text-muted-foreground">Niv. {level?.level}</span>
              </div>
              <div className="text-[11px] font-mono text-muted-foreground">{profile.xp} XP</div>
            </div>

            {/* XP bar */}
            <div className="h-1.5 w-full rounded-full bg-border overflow-hidden mb-1.5">
              <div
                className="h-full rounded-full bg-leaf-gradient transition-all duration-700"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>{level?.minXp} XP</span>
              <span>{nextLevel ? `${nextLevel.minXp} XP` : "MAX"}</span>
            </div>
          </div>

          {/* Streak */}
          <div className="rounded-2xl border hairline bg-surface/60 p-4 mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Streak</span>
              <span className="text-[20px]">🔥</span>
            </div>
            <div className="text-[32px] font-medium tracking-tight text-amber">{profile.streak}</div>
            <div className="text-[12px] text-muted-foreground">
              {profile.streak === 1 ? "jour consécutif" : "jours consécutifs"}
            </div>
            <div className="flex gap-1.5 mt-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${i < Math.min(profile.streak, 7) ? "bg-amber" : "bg-border"}`}
                />
              ))}
            </div>
          </div>

          {/* Rank */}
          {myRank > 0 && (
            <div className="rounded-2xl border hairline bg-surface/60 p-4 mb-4">
              <div className="text-[12px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-1">Mon classement</div>
              <div className="text-[28px] font-medium tracking-tight">
                #{myRank}
                <span className="text-[13px] text-muted-foreground font-normal"> / {leaderboard.length}</span>
              </div>
            </div>
          )}

          {/* Mini nav */}
          <nav className="space-y-1 mt-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => item.id === "classement" ? handleViewLeaderboard() : setView(item.id)}
                className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] transition-colors text-left ${
                  view === item.id ? "bg-surface text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-surface/50"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 px-6 py-8">

          {/* ══ EXPLORER VIEW ══════════════════════════════════════════════ */}
          {view === "explorer" && (
            <>
              <div className="mb-8">
                <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-leaf mb-2">Opportunités · Béjaïa</div>
                <h1 className="text-[28px] md:text-[36px] tracking-[-0.02em]">
                  Bonjour,{" "}
                  <span className="font-serif italic text-leaf-soft">{user.name.split(" ")[0]}</span> 👋
                </h1>
                <p className="mt-1.5 text-[14px] text-muted-foreground">
                  {events.length} opportunités disponibles · {myRegs.length} inscriptions actives
                </p>
              </div>

              {/* ── Two-column dashboard widgets ── */}
              <div className="grid gap-4 lg:grid-cols-2 mb-8">
                <OpportunityRadar events={events} userCommune={user.commune} />
                <CommunityHeatmap events={events} />
              </div>

              {/* Filter pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    id={`filter-${tag}`}
                    onClick={() => setFilter(tag)}
                    className={`h-8 px-4 rounded-full text-[12px] font-mono uppercase tracking-[0.12em] transition-colors ${
                      filter === tag
                        ? "bg-foreground text-background"
                        : "border hairline text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Events grid */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {displayedEvents.map((ev) => {
                  const registered = myRegs.includes(ev.id);
                  const full = ev.seatsTaken >= ev.seatsTotal;
                  const pct = Math.round((ev.seatsTaken / ev.seatsTotal) * 100);
                  return (
                    <EventCard
                      key={ev.id}
                      ev={ev}
                      registered={registered}
                      full={full}
                      pct={pct}
                      onRegister={() => handleRegister(ev)}
                    />
                  );
                })}
              </div>

              {displayedEvents.length === 0 && (
                <EmptyState message="Aucun événement dans cette catégorie." />
              )}
            </>
          )}

          {/* ══ PROGRESSION VIEW ════════════════════════════════════════════ */}
          {view === "progression" && (
            <>
              <div className="mb-8">
                <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-leaf mb-2">Votre parcours</div>
                <h1 className="text-[28px] md:text-[36px] tracking-[-0.02em]">Progression & Badges</h1>
              </div>

              {/* Level & XP card */}
              <div className="rounded-2xl border hairline bg-surface/60 p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  {/* Level circle */}
                  <div className="relative shrink-0">
                    <svg width="100" height="100" viewBox="0 0 100 100" className="rotate-[-90deg]">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="oklch(1 0 0 / 0.08)" strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r="42" fill="none"
                        stroke="oklch(0.78 0.14 155)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 42}`}
                        strokeDashoffset={`${2 * Math.PI * 42 * (1 - xpProgress / 100)}`}
                        style={{ transition: "stroke-dashoffset 1s ease" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-[22px] font-bold" style={{ color: level?.color }}>{level?.level}</div>
                      <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">NIVEAU</div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-[26px] font-medium tracking-tight" style={{ color: level?.color }}>
                        {level?.title}
                      </span>
                    </div>
                    <div className="text-[13px] text-muted-foreground mb-4">
                      {profile.xp} XP accumulés
                      {nextLevel && ` · encore ${nextLevel.minXp - profile.xp} XP pour ${nextLevel.title}`}
                      {!nextLevel && " · Niveau maximum atteint !"}
                    </div>

                    {/* XP bar */}
                    <div className="h-2 w-full rounded-full bg-border overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full bg-leaf-gradient transition-all duration-700"
                        style={{ width: `${xpProgress}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {[
                        ["🔥", "Streak", `${profile.streak}j`],
                        ["🏅", "Badges", profile.earnedBadgeIds.length],
                        ["🎟️", "Inscrits", myRegs.length],
                      ].map(([icon, label, val]) => (
                        <div key={label as string} className="text-center rounded-xl border hairline bg-background/40 p-3">
                          <div className="text-[18px]">{icon}</div>
                          <div className="text-[18px] font-medium mt-1">{val}</div>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* All levels roadmap */}
              <div className="rounded-2xl border hairline bg-surface/40 p-6 mb-6">
                <div className="text-[12px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-4">Parcours des niveaux</div>
                <div className="space-y-2">
                  {LEVELS_LIST.map((lvl) => {
                    const reached = profile.xp >= lvl.minXp;
                    const isCurrent = level?.level === lvl.level;
                    return (
                      <div
                        key={lvl.level}
                        className={`flex items-center gap-4 rounded-xl px-4 py-3 transition-colors ${
                          isCurrent ? "border hairline bg-surface" : "border border-transparent"
                        }`}
                      >
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[13px] font-mono shrink-0 ${
                          reached ? "bg-leaf text-background" : "border hairline text-muted-foreground"
                        }`}>
                          {reached ? "✓" : lvl.level}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-[14px] font-medium ${reached ? "" : "text-muted-foreground"}`}
                               style={{ color: reached ? lvl.color : undefined }}>
                            {lvl.title}
                          </div>
                          <div className="text-[11px] text-muted-foreground">{lvl.minXp} XP requis</div>
                        </div>
                        {isCurrent && (
                          <span className="text-[10px] font-mono uppercase tracking-wider text-leaf border border-leaf/30 rounded-full px-2 py-0.5">
                            Actuel
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Badges grid */}
              <div className="text-[12px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-4">Badges</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {BADGES.map((badge) => {
                  const earned = profile.earnedBadgeIds.includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`rounded-2xl border p-4 text-center transition-all ${
                        earned
                          ? "hairline bg-surface/60 hover:bg-surface"
                          : "border-dashed border-border/50 bg-surface/20 opacity-50"
                      }`}
                    >
                      <div className={`text-[36px] mb-2 ${earned ? "" : "grayscale opacity-40"}`}>
                        {badge.icon}
                      </div>
                      <div className={`text-[13px] font-medium mb-1 ${earned ? "" : "text-muted-foreground"}`}>
                        {badge.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground leading-snug">
                        {badge.description}
                      </div>
                      {earned && (
                        <div className="mt-2 text-[10px] font-mono text-leaf uppercase tracking-wider">Obtenu ✓</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ══ CLASSEMENT VIEW ════════════════════════════════════════════ */}
          {view === "classement" && (
            <>
              <div className="mb-8">
                <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-leaf mb-2">Wilaya de Béjaïa</div>
                <h1 className="text-[28px] md:text-[36px] tracking-[-0.02em]">Classement</h1>
                <p className="mt-1.5 text-[14px] text-muted-foreground">
                  {leaderboard.length} participant{leaderboard.length > 1 ? "s" : ""} · mis à jour en temps réel
                </p>
              </div>

              {/* Top 3 podium */}
              {leaderboard.length >= 3 && (
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {[1, 0, 2].map((rankIdx) => {
                    const entry = leaderboard[rankIdx];
                    if (!entry) return null;
                    const isMe = entry.userId === user.id;
                    const medals = ["🥇", "🥈", "🥉"];
                    const sizes = ["order-2", "order-1 scale-105", "order-3"];
                    return (
                      <div
                        key={entry.userId}
                        className={`${sizes[rankIdx]} flex flex-col items-center rounded-2xl border hairline p-4 text-center ${
                          isMe ? "border-leaf/40 bg-leaf/5" : "bg-surface/40"
                        }`}
                      >
                        <div className="text-[32px] mb-1">{medals[rankIdx]}</div>
                        <div className="h-12 w-12 rounded-full bg-leaf-gradient flex items-center justify-center text-background text-[16px] font-semibold mb-2">
                          {entry.name.charAt(0)}
                        </div>
                        <div className="text-[13px] font-medium truncate w-full">{entry.name}</div>
                        <div className="text-[11px] text-muted-foreground mb-2">{entry.commune}</div>
                        <div className="text-[15px] font-mono text-leaf">{entry.xp} XP</div>
                        <div className="text-[10px] text-muted-foreground">🔥 {entry.streak}j</div>
                        {isMe && <div className="mt-1 text-[9px] font-mono text-leaf uppercase tracking-wider">Vous</div>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Full list */}
              <div className="space-y-2">
                {leaderboard.map((entry, idx) => {
                  const rank = idx + 1;
                  const isMe = entry.userId === user.id;
                  const medals: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
                  return (
                    <div
                      key={entry.userId}
                      className={`flex items-center gap-4 rounded-xl px-5 py-4 border transition-all ${
                        isMe ? "border-leaf/30 bg-leaf/5" : "hairline bg-surface/50 hover:bg-surface"
                      }`}
                    >
                      <div className="w-8 text-center text-[14px] font-mono shrink-0">
                        {medals[rank] ?? <span className="text-muted-foreground">{rank}</span>}
                      </div>
                      <div className="h-10 w-10 rounded-full bg-leaf-gradient flex items-center justify-center text-background text-[14px] font-semibold shrink-0">
                        {entry.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-medium truncate">{entry.name}</span>
                          {isMe && (
                            <span className="text-[9px] font-mono text-leaf border border-leaf/30 rounded-full px-1.5 py-0.5 uppercase tracking-wider shrink-0">
                              Vous
                            </span>
                          )}
                        </div>
                        <div className="text-[12px] text-muted-foreground">{entry.commune}</div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="text-[11px] text-muted-foreground">Streak</div>
                          <div className="text-[13px] font-mono text-amber">🔥 {entry.streak}j</div>
                        </div>
                        <div className="text-right hidden sm:block">
                          <div className="text-[11px] text-muted-foreground">Badges</div>
                          <div className="text-[13px] font-mono">🏅 {entry.badgeCount}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] text-muted-foreground">{entry.levelTitle}</div>
                          <div className="text-[15px] font-mono text-leaf">{entry.xp} XP</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {leaderboard.length === 0 && (
                  <EmptyState message="Aucun participant pour l'instant. Créez un compte et commencez !" />
                )}
              </div>
            </>
          )}

          {/* ══ TÂCHES VIEW ════════════════════════════════════════════════ */}
          {view === "taches" && (
            <>
              <div className="mb-8">
                <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-leaf mb-2">Gagner de l'XP</div>
                <h1 className="text-[28px] md:text-[36px] tracking-[-0.02em]">Tâches & Défis</h1>
                <p className="mt-1.5 text-[14px] text-muted-foreground">
                  Complétez des tâches pour gagner de l'XP et monter en niveau.
                </p>
              </div>

              {/* Progress summary */}
              <div className="rounded-2xl border hairline bg-surface/60 p-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[13px] font-medium">Tâches aujourd'hui</div>
                  <div className="text-[12px] font-mono text-muted-foreground">
                    {DAILY_TASKS.filter((t) => t.category === "daily" && isTaskDoneToday(profile, t.id)).length}
                    {" / "}
                    {DAILY_TASKS.filter((t) => t.category === "daily").length} complétées
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber transition-all"
                    style={{
                      width: `${Math.round(
                        (DAILY_TASKS.filter((t) => t.category === "daily" && isTaskDoneToday(profile, t.id)).length /
                          DAILY_TASKS.filter((t) => t.category === "daily").length) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Daily tasks */}
              <div className="text-[12px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-3">
                Tâches quotidiennes
              </div>
              <div className="space-y-2 mb-8">
                {DAILY_TASKS.filter((t) => t.category === "daily").map((task) => {
                  const done = isTaskDoneToday(profile, task.id);
                  return (
                    <TaskCard
                      key={task.id}
                      task={task}
                      done={done}
                      onComplete={() => {
                        if (task.action === "explore") { setView("explorer"); handleCompleteTask(task.id); }
                        else if (task.action === "leaderboard") { handleViewLeaderboard(); }
                        else handleCompleteTask(task.id);
                      }}
                    />
                  );
                })}
              </div>

              {/* Weekly tasks */}
              <div className="text-[12px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-3">
                Défis hebdomadaires
              </div>
              <div className="space-y-2 mb-8">
                {DAILY_TASKS.filter((t) => t.category === "weekly").map((task) => {
                  const done = isTaskDoneToday(profile, task.id);
                  return (
                    <TaskCard
                      key={task.id}
                      task={task}
                      done={done}
                      onComplete={() => {
                        if (task.action === "register") { setView("explorer"); handleCompleteTask(task.id); }
                        else handleCompleteTask(task.id);
                      }}
                    />
                  );
                })}
              </div>

              {/* XP source legend */}
              <div className="rounded-2xl border hairline bg-surface/40 p-5">
                <div className="text-[12px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-4">
                  Comment gagner de l'XP
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    ["☀️", "Connexion quotidienne", "+10 XP"],
                    ["🔥", "Bonus streak (×3 jours)", "+5 à +50 XP"],
                    ["🎟️", "S'inscrire à un événement", "+50 XP"],
                    ["🔍", "Explorer des événements", "+15 XP"],
                    ["🏆", "Voir le classement", "+5 XP"],
                    ["✅", "Compléter des tâches", "+5 à +25 XP"],
                  ].map(([icon, label, reward]) => (
                    <div key={label as string} className="flex items-center gap-3 rounded-xl border hairline bg-background/30 px-4 py-3">
                      <span className="text-[20px]">{icon}</span>
                      <div className="flex-1">
                        <div className="text-[13px]">{label}</div>
                      </div>
                      <div className="text-[12px] font-mono text-leaf shrink-0">{reward}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </main>

        {/* ── Right sidebar (desktop) ── */}
        <aside className="hidden xl:flex flex-col w-[260px] shrink-0 border-l hairline p-6 sticky top-16 self-start max-h-[calc(100vh-4rem)] overflow-y-auto gap-4">
          {/* My registered events */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-3">
              Mes inscriptions ({myEvents.length})
            </div>
            {myEvents.length === 0 ? (
              <div className="text-[12px] text-muted-foreground">
                Pas encore d'inscription. Explorez les événements !
              </div>
            ) : (
              <div className="space-y-2">
                {myEvents.map((ev) => (
                  <div key={ev.id} className="rounded-xl border hairline bg-surface/60 p-3">
                    <div className="text-[12px] font-medium leading-snug mb-1">{ev.title}</div>
                    <div className="text-[11px] text-muted-foreground">{ev.commune} · {ev.date}</div>
                    <div className="mt-2">
                      <span className="inline-block text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-leaf/15 text-leaf">
                        {ev.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick stats */}
          <div className="rounded-2xl border hairline bg-surface/40 p-4">
            <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-3">Stats rapides</div>
            <div className="space-y-2">
              {[
                ["Total XP", `${profile.xp} XP`],
                ["Badges", `${profile.earnedBadgeIds.length} / ${BADGES.length}`],
                ["Streak max", `${profile.streak}j`],
                ["Inscrits", `${myRegs.length} événements`],
              ].map(([label, val]) => (
                <div key={label as string} className="flex justify-between text-[12px]">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-mono">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t hairline bg-background/95 backdrop-blur flex">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => item.id === "classement" ? handleViewLeaderboard() : setView(item.id)}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-[10px] transition-colors ${
              view === item.id ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            <span className="text-[18px] leading-none">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-[40px] mb-4">🌿</div>
      <div className="text-[14px] text-muted-foreground max-w-xs">{message}</div>
    </div>
  );
}

function EventCard({
  ev,
  registered,
  full,
  pct,
  onRegister,
}: {
  ev: OdejEvent;
  registered: boolean;
  full: boolean;
  pct: number;
  onRegister: () => void;
}) {
  const accentColor = ev.accent === "leaf" ? "text-leaf" : "text-amber";
  const accentBg = ev.accent === "leaf" ? "bg-leaf/10 border-leaf/20" : "bg-amber/10 border-amber/20";

  return (
    <div className="rounded-2xl border hairline bg-surface/60 p-5 flex flex-col gap-3 hover:bg-surface transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className={`text-[10px] font-mono uppercase tracking-[0.16em] ${accentColor} mb-1`}>
            {ev.tag} · {TYPE_LABELS[ev.type] ?? ev.type}
          </div>
          <div className="text-[15px] font-medium leading-snug">{ev.title}</div>
        </div>
        {registered && (
          <span className="shrink-0 text-[9px] font-mono uppercase tracking-wider px-2 py-1 rounded-full bg-leaf/15 border border-leaf/20 text-leaf">
            Inscrit ✓
          </span>
        )}
      </div>

      <div className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">{ev.description}</div>

      <div className="text-[11px] text-muted-foreground space-y-0.5">
        <div>📍 {ev.facilityName}, {ev.commune}</div>
        <div>📅 {ev.date} · {ev.time}</div>
      </div>

      {/* Seat progress */}
      <div>
        <div className="flex justify-between text-[10px] font-mono text-muted-foreground mb-1">
          <span>{ev.seatsTaken} / {ev.seatsTotal} places</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1 w-full rounded-full bg-border overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${ev.accent === "leaf" ? "bg-leaf" : "bg-amber"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <button
        onClick={onRegister}
        disabled={full && !registered}
        className={`mt-1 h-9 w-full rounded-full text-[12px] font-medium transition-all ${
          registered
            ? "border hairline text-muted-foreground hover:text-destructive hover:border-destructive/40"
            : full
            ? "border hairline text-muted-foreground opacity-50 cursor-not-allowed"
            : `${accentBg} border ${accentColor} hover:opacity-80`
        }`}
      >
        {registered ? "Annuler l'inscription" : full ? "Complet" : "S'inscrire"}
      </button>
    </div>
  );
}

function TaskCard({
  task,
  done,
  onComplete,
}: {
  task: { id: string; title: string; description: string; xpReward: number; icon: string };
  done: boolean;
  onComplete: () => void;
}) {
  return (
    <div className={`flex items-center gap-4 rounded-xl border px-5 py-4 transition-all ${
      done ? "hairline bg-surface/40 opacity-60" : "hairline bg-surface/60 hover:bg-surface"
    }`}>
      <div className="text-[24px] shrink-0">{task.icon}</div>
      <div className="flex-1 min-w-0">
        <div className={`text-[14px] font-medium ${done ? "line-through text-muted-foreground" : ""}`}>
          {task.title}
        </div>
        <div className="text-[12px] text-muted-foreground">{task.description}</div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-[11px] font-mono text-leaf">+{task.xpReward} XP</span>
        {done ? (
          <span className="text-[18px]">✅</span>
        ) : (
          <button
            onClick={onComplete}
            className="h-8 px-3 rounded-full border hairline text-[11px] font-mono hover:bg-surface transition-colors"
          >
            Faire
          </button>
        )}
      </div>
    </div>
  );
}

function OpportunityRadar({ events, userCommune }: { events: OdejEvent[]; userCommune: string }) {
  const nearby = events.filter((e) => e.commune === userCommune);
  const typeCount = Object.entries(
    events.reduce((acc, e) => ({ ...acc, [e.type]: (acc[e.type as keyof typeof acc] ?? 0) + 1 }), {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]);

  return (
    <div className="rounded-2xl border hairline bg-surface/40 p-5">
      <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-1">Radar local</div>
      <div className="text-[18px] font-medium mb-4">
        {nearby.length} event{nearby.length !== 1 ? "s" : ""} près de vous
        <span className="text-[13px] font-normal text-muted-foreground ml-2">({userCommune})</span>
      </div>
      <div className="space-y-2">
        {typeCount.slice(0, 5).map(([type, count]) => (
          <div key={type} className="flex items-center gap-3">
            <div className="text-[11px] font-mono w-20 shrink-0 text-muted-foreground">{TYPE_LABELS[type] ?? type}</div>
            <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full bg-leaf-gradient"
                style={{ width: `${(count / events.length) * 100}%` }}
              />
            </div>
            <div className="text-[11px] font-mono text-muted-foreground w-4 text-right">{count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommunityHeatmap({ events }: { events: OdejEvent[] }) {
  const [openCenter, setOpenCenter] = useState<string | null>(null);
  const centers = computeCenterActivity(events);

  const cfg: Record<string, { color: string; label: string }> = {
    active:   { color: "#78bf76", label: "Très actif" },
    moderate: { color: "#f59e0b", label: "Modéré" },
    low:      { color: "#6b7280", label: "Faible" },
  };

  return (
    <div className="rounded-2xl border hairline bg-surface/40 p-5">
      <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-1">Activité par centre</div>
      <div className="text-[18px] font-medium mb-4">{centers.length} centres actifs</div>
      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
        {centers.map((c) => {
          const isOpen = openCenter === c.name;
          const occPct = c.seatsTotal > 0 ? Math.round((c.seatsTaken / c.seatsTotal) * 100) : 0;
          const fillPct = Math.min(100, (c.eventCount / Math.max(...centers.map((x) => x.eventCount))) * 100);
          return (
            <button
              key={c.name}
              onClick={() => setOpenCenter(isOpen ? null : c.name)}
              className="w-full text-left rounded-xl border hairline px-4 py-3 hover:bg-surface/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: cfg[c.level].color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium truncate">{c.name}</div>
                  <div className="text-[10px] text-muted-foreground">{c.commune}</div>
                </div>
                <div
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                  style={{ color: cfg[c.level].color, borderColor: cfg[c.level].color + "40", backgroundColor: cfg[c.level].color + "15" }}
                >
                  {c.eventCount} év.
                </div>
              </div>

              {/* Activity bar */}
              <div className="mt-2.5 h-1 w-full rounded-full bg-border overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${fillPct}%`, backgroundColor: cfg[c.level].color }}
                />
              </div>

              {/* Expanded details */}
              {isOpen && (
                <div className="mt-3 pt-3 border-t hairline grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-background/30 px-3 py-2">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-0.5">Taux d'occupation</div>
                    <div className="text-[16px] font-medium" style={{ color: cfg[c.level].color }}>{occPct}%</div>
                    <div className="text-[10px] text-muted-foreground">{c.seatsTaken}/{c.seatsTotal} places</div>
                  </div>
                  <div className="rounded-lg bg-background/30 px-3 py-2">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-0.5">Statut</div>
                    <div className="text-[13px] font-medium" style={{ color: cfg[c.level].color }}>{cfg[c.level].label}</div>
                    <div className="text-[10px] text-muted-foreground">{TYPE_LABELS[c.type] ?? c.type}</div>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
