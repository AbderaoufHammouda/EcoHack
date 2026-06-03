import { supabase } from "@/lib/supabase";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface GameProfile {
  userId: string;
  xp: number;
  streak: number;
  lastActiveDateStr: string; // "YYYY-MM-DD"
  earnedBadgeIds: string[];
  completedTaskKeys: string[]; // "YYYY-MM-DD:taskId"
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: "leaf" | "amber" | "blue" | "purple";
  condition: (profile: GameProfile, regsCount: number) => boolean;
}

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  icon: string;
  category: "daily" | "weekly";
  action?: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────

export const LEVELS = [
  { level: 1, title: "Explorateur",  minXp: 0,    color: "#6b7280" },
  { level: 2, title: "Participant",  minXp: 100,  color: "#78bf76" },
  { level: 3, title: "Actif",        minXp: 250,  color: "#5aab6b" },
  { level: 4, title: "Engagé",       minXp: 500,  color: "#f59e0b" },
  { level: 5, title: "Leader",       minXp: 1000, color: "#a855f7" },
  { level: 6, title: "Champion",     minXp: 2000, color: "#ec4899" },
  { level: 7, title: "Ambassadeur",  minXp: 4000, color: "#f43f5e" },
] as const;

export const BADGES: Badge[] = [
  {
    id: "bienvenue",
    name: "Bienvenue !",
    description: "Vous avez rejoint YouthLink Béjaïa",
    icon: "🌿",
    color: "leaf",
    condition: () => true,
  },
  {
    id: "premier-pas",
    name: "Premier pas",
    description: "Vous vous êtes inscrit à votre premier événement",
    icon: "🚀",
    color: "leaf",
    condition: (_p, regs) => regs >= 1,
  },
  {
    id: "trois-events",
    name: "Trio",
    description: "Inscrit à 3 événements",
    icon: "🎯",
    color: "amber",
    condition: (_p, regs) => regs >= 3,
  },
  {
    id: "cinq-events",
    name: "Hyperactif",
    description: "Inscrit à 5 événements",
    icon: "⚡",
    color: "amber",
    condition: (_p, regs) => regs >= 5,
  },
  {
    id: "streak-3",
    name: "En feu",
    description: "3 jours d'activité consécutifs",
    icon: "🔥",
    color: "amber",
    condition: (p) => p.streak >= 3,
  },
  {
    id: "streak-7",
    name: "Régulier",
    description: "7 jours d'activité consécutifs",
    icon: "🗓️",
    color: "amber",
    condition: (p) => p.streak >= 7,
  },
  {
    id: "streak-30",
    name: "Fidèle",
    description: "30 jours d'activité consécutifs",
    icon: "💎",
    color: "purple",
    condition: (p) => p.streak >= 30,
  },
  {
    id: "xp-100",
    name: "Apprenti",
    description: "100 XP gagnés",
    icon: "⭐",
    color: "leaf",
    condition: (p) => p.xp >= 100,
  },
  {
    id: "xp-500",
    name: "Confirmé",
    description: "500 XP gagnés",
    icon: "🌟",
    color: "amber",
    condition: (p) => p.xp >= 500,
  },
  {
    id: "xp-1000",
    name: "Expert",
    description: "1 000 XP gagnés",
    icon: "👑",
    color: "purple",
    condition: (p) => p.xp >= 1000,
  },
  {
    id: "taches-5",
    name: "Discipliné",
    description: "5 tâches quotidiennes complétées",
    icon: "✅",
    color: "leaf",
    condition: (p) => p.completedTaskKeys.length >= 5,
  },
];

export const DAILY_TASKS: DailyTask[] = [
  {
    id: "login",
    title: "Connexion du jour",
    description: "Se connecter à l'application",
    xpReward: 10,
    icon: "☀️",
    category: "daily",
  },
  {
    id: "explore-event",
    title: "Explorer un événement",
    description: "Voir les détails d'un événement disponible",
    xpReward: 15,
    icon: "🔍",
    category: "daily",
    action: "explore",
  },
  {
    id: "register-event",
    title: "S'inscrire à un événement",
    description: "Confirmer une inscription à une activité",
    xpReward: 50,
    icon: "🎟️",
    category: "weekly",
    action: "register",
  },
  {
    id: "check-leaderboard",
    title: "Voir le classement",
    description: "Consulter le classement des participants",
    xpReward: 5,
    icon: "🏆",
    category: "daily",
    action: "leaderboard",
  },
  {
    id: "complete-profile",
    title: "Profil actif",
    description: "Avoir un profil avec commune renseignée",
    xpReward: 20,
    icon: "👤",
    category: "weekly",
  },
  {
    id: "streak-bonus",
    title: "Bonus streak",
    description: "Maintenir une série de jours actifs",
    xpReward: 25,
    icon: "🔥",
    category: "daily",
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function makeEmpty(userId: string): GameProfile {
  return {
    userId,
    xp: 0,
    streak: 0,
    lastActiveDateStr: "",
    earnedBadgeIds: [],
    completedTaskKeys: [],
  };
}

// ─── Profile CRUD ──────────────────────────────────────────────────────────

export async function getGameProfile(userId: string): Promise<GameProfile> {
  const { data, error } = await supabase
    .from("game_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) return makeEmpty(userId);

  return {
    userId: data.user_id,
    xp: data.xp ?? 0,
    streak: data.streak ?? 0,
    lastActiveDateStr: data.last_active_date ?? "",
    earnedBadgeIds: data.earned_badge_ids ?? [],
    completedTaskKeys: data.completed_task_keys ?? [],
  };
}

async function saveProfile(profile: GameProfile): Promise<void> {
  const { error } = await supabase.from("game_profiles").upsert(
    {
      user_id: profile.userId,
      xp: profile.xp,
      streak: profile.streak,
      last_active_date: profile.lastActiveDateStr || "",
      earned_badge_ids: profile.earnedBadgeIds,
      completed_task_keys: profile.completedTaskKeys,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
  if (error) console.error("saveProfile:", error.message);
}

// ─── Streak & Login ────────────────────────────────────────────────────────

/** Call once per session. Returns XP gained from streak/login. */
export async function processLoginStreak(
  userId: string
): Promise<{ xpGained: number; streakUpdated: boolean }> {
  const profile = await getGameProfile(userId);
  const today = todayStr();

  if (profile.lastActiveDateStr === today) {
    return { xpGained: 0, streakUpdated: false };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const newStreak =
    profile.lastActiveDateStr === yesterdayStr ? profile.streak + 1 : 1;
  let xpGained = 10; // base login XP

  if (newStreak % 7 === 0) xpGained += 50;
  else if (newStreak % 3 === 0) xpGained += 20;
  else if (newStreak > 1) xpGained += 5;

  const updated: GameProfile = {
    ...profile,
    streak: newStreak,
    lastActiveDateStr: today,
    xp: profile.xp + xpGained,
  };

  markTaskDoneLocal(updated, "login");
  if (newStreak > 1) markTaskDoneLocal(updated, "streak-bonus");

  await saveProfile(updated);
  await checkAndAwardBadges(userId, 0);
  return { xpGained, streakUpdated: true };
}

// ─── Level helpers (pure, synchronous) ────────────────────────────────────

export function getLevel(xp: number): (typeof LEVELS)[number] {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.minXp) current = lvl;
  }
  return current;
}

export function getNextLevel(xp: number): (typeof LEVELS)[number] | null {
  const idx = LEVELS.findIndex((l) => l.minXp > xp);
  return idx === -1 ? null : LEVELS[idx];
}

export function getXpProgress(xp: number): number {
  const current = getLevel(xp);
  const next = getNextLevel(xp);
  if (!next) return 100;
  const range = next.minXp - current.minXp;
  const progress = xp - current.minXp;
  return Math.min(100, Math.round((progress / range) * 100));
}

// ─── Tasks ─────────────────────────────────────────────────────────────────

export function getTaskKey(taskId: string, date?: string): string {
  return `${date ?? todayStr()}:${taskId}`;
}

export function isTaskDoneToday(profile: GameProfile, taskId: string): boolean {
  const task = DAILY_TASKS.find((t) => t.id === taskId);
  if (!task) return false;

  if (task.category === "weekly") {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const mondayStr = monday.toISOString().slice(0, 10);
    return profile.completedTaskKeys.some((k) => {
      const [dateStr, id] = k.split(":");
      return id === taskId && dateStr >= mondayStr;
    });
  }

  return profile.completedTaskKeys.includes(getTaskKey(taskId));
}

/** In-memory mutation only (used before a save) */
function markTaskDoneLocal(profile: GameProfile, taskId: string): boolean {
  if (isTaskDoneToday(profile, taskId)) return false;
  const task = DAILY_TASKS.find((t) => t.id === taskId);
  if (!task) return false;
  profile.completedTaskKeys.push(getTaskKey(taskId));
  profile.xp += task.xpReward;
  return true;
}

/** Complete a task, persist to Supabase. Returns XP gained (0 if already done). */
export async function completeTask(userId: string, taskId: string): Promise<number> {
  const profile = await getGameProfile(userId);
  const task = DAILY_TASKS.find((t) => t.id === taskId);
  if (!task) return 0;
  if (isTaskDoneToday(profile, taskId)) return 0;
  markTaskDoneLocal(profile, taskId);
  await saveProfile(profile);
  await checkAndAwardBadges(userId, 0);
  return task.xpReward;
}

// ─── Badges ────────────────────────────────────────────────────────────────

export async function checkAndAwardBadges(
  userId: string,
  regsCount: number
): Promise<string[]> {
  const profile = await getGameProfile(userId);
  const newBadges: string[] = [];

  for (const badge of BADGES) {
    if (
      !profile.earnedBadgeIds.includes(badge.id) &&
      badge.condition(profile, regsCount)
    ) {
      profile.earnedBadgeIds.push(badge.id);
      newBadges.push(badge.id);
    }
  }

  if (newBadges.length > 0) await saveProfile(profile);
  return newBadges;
}

// ─── Leaderboard ────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  userId: string;
  name: string;
  commune: string;
  xp: number;
  level: number;
  levelTitle: string;
  streak: number;
  badgeCount: number;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, commune, game_profiles(xp, streak, earned_badge_ids)")
    .neq("role", "admin");

  if (error) { console.error("getLeaderboard:", error.message); return []; }

  return (data ?? [])
    .map((p) => {
      // Supabase returns the joined table as object (1-to-1 FK)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const gp: any = Array.isArray(p.game_profiles)
        ? p.game_profiles[0]
        : p.game_profiles;
      const xp = gp?.xp ?? 0;
      const streak = gp?.streak ?? 0;
      const badgeCount = gp?.earned_badge_ids?.length ?? 0;
      const lvl = getLevel(xp);
      return {
        userId: p.id,
        name: p.name,
        commune: p.commune,
        xp,
        level: lvl.level,
        levelTitle: lvl.title,
        streak,
        badgeCount,
      };
    })
    .sort((a, b) => b.xp - a.xp || b.streak - a.streak);
}
