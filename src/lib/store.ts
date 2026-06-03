// ─── Types ─────────────────────────────────────────────────────────────────

export type UserRole = "admin" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  commune: string;
  createdAt: string;
}

export interface OdejEvent {
  id: string;
  title: string;
  type: "AJ" | "CSP" | "MJ" | "Camp" | "SPD" | "CLS";
  tag: string;
  facilityName: string;
  commune: string;
  date: string;
  time: string;
  seatsTotal: number;
  seatsTaken: number;
  description: string;
  accent: "leaf" | "amber";
}

export interface Registration {
  id: string;
  userId: string;
  eventId: string;
  userName: string;
  userEmail: string;
  registeredAt: string;
}

// ─── Béjaïa communes ───────────────────────────────────────────────────────

export const BEJAIA_COMMUNES = [
  "Béjaïa", "Akbou", "Amizour", "Aokas", "Barbache", "Beni Maouche",
  "Chemini", "Darguina", "Djebla", "El Kseur", "Fenaia", "Feraoune",
  "Guendouza", "Ighil Ali", "Ighzer Amokrane", "Kherrata", "Mcisna",
  "Melbou", "Oued Ghir", "Ouzellaguen", "Seddouk", "Sidi Aich",
  "Sidi Ayad", "Souk El Tenine", "Tazmalt", "Tichy", "Tifra",
  "Timezrit", "Tizi El Oued", "Tizi Nberber", "Adekar", "Aït Rzine",
  "Boujellil", "Draa El Kaid",
];

// ─── Mappers (snake_case DB → camelCase TS) ────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEvent(row: any): OdejEvent {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    tag: row.tag,
    facilityName: row.facility_name,
    commune: row.commune,
    date: row.date,
    time: row.time,
    seatsTotal: row.seats_total,
    seatsTaken: row.seats_taken,
    description: row.description,
    accent: row.accent,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRegistration(row: any): Registration {
  return {
    id: row.id,
    userId: row.user_id,
    eventId: row.event_id,
    userName: row.profiles?.name ?? "",
    userEmail: row.profiles?.email ?? "",
    registeredAt: row.registered_at,
  };
}

// ─── Supabase import (lazy to keep this file importable in SSR) ─────────────

import { supabase } from "@/lib/supabase";

// ─── initStore: no-op (kept for import compatibility) ─────────────────────

export function initStore() {
  // No-op — Supabase handles everything
}

// ─── Events ────────────────────────────────────────────────────────────────

export async function getEvents(): Promise<OdejEvent[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: true });
  if (error) { console.error("getEvents:", error.message); return []; }
  return (data ?? []).map(mapEvent);
}

export async function createEvent(
  data: Omit<OdejEvent, "id" | "seatsTaken">
): Promise<OdejEvent | null> {
  const { data: row, error } = await supabase
    .from("events")
    .insert({
      title: data.title,
      type: data.type,
      tag: data.tag,
      facility_name: data.facilityName,
      commune: data.commune,
      date: data.date,
      time: data.time,
      seats_total: data.seatsTotal,
      seats_taken: 0,
      description: data.description,
      accent: data.accent,
    })
    .select()
    .single();
  if (error) { console.error("createEvent:", error.message); return null; }
  return mapEvent(row);
}

export async function updateEvent(
  id: string,
  data: Partial<OdejEvent>
): Promise<boolean> {
  // Build snake_case update payload
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: Record<string, any> = {};
  if (data.title        !== undefined) payload.title         = data.title;
  if (data.type         !== undefined) payload.type          = data.type;
  if (data.tag          !== undefined) payload.tag           = data.tag;
  if (data.facilityName !== undefined) payload.facility_name = data.facilityName;
  if (data.commune      !== undefined) payload.commune       = data.commune;
  if (data.date         !== undefined) payload.date          = data.date;
  if (data.time         !== undefined) payload.time          = data.time;
  if (data.seatsTotal   !== undefined) payload.seats_total   = data.seatsTotal;
  if (data.seatsTaken   !== undefined) payload.seats_taken   = data.seatsTaken;
  if (data.description  !== undefined) payload.description   = data.description;
  if (data.accent       !== undefined) payload.accent        = data.accent;

  const { error } = await supabase.from("events").update(payload).eq("id", id);
  if (error) { console.error("updateEvent:", error.message); return false; }
  return true;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) { console.error("deleteEvent:", error.message); return false; }
  return true;
}

// ─── Registrations ─────────────────────────────────────────────────────────

/** All registrations (admin use) — joined with profiles for name/email */
export async function getRegistrations(): Promise<Registration[]> {
  const { data, error } = await supabase
    .from("registrations")
    .select("*, profiles(name, email)")
    .order("registered_at", { ascending: false });
  if (error) { console.error("getRegistrations:", error.message); return []; }
  return (data ?? []).map(mapRegistration);
}

/** Registrations for a specific user */
export async function getUserRegistrations(userId: string): Promise<Registration[]> {
  const { data, error } = await supabase
    .from("registrations")
    .select("*, profiles(name, email)")
    .eq("user_id", userId);
  if (error) { console.error("getUserRegistrations:", error.message); return []; }
  return (data ?? []).map(mapRegistration);
}

/** Registrations count for a specific event */
export async function getEventRegistrations(eventId: string): Promise<Registration[]> {
  const { data, error } = await supabase
    .from("registrations")
    .select("*, profiles(name, email)")
    .eq("event_id", eventId);
  if (error) { console.error("getEventRegistrations:", error.message); return []; }
  return (data ?? []).map(mapRegistration);
}

/** Atomic register via SQL function — handles seat check + increment */
export async function registerForEvent(
  userId: string,
  eventId: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc("register_for_event", {
    p_user_id: userId,
    p_event_id: eventId,
  });
  if (error) { console.error("registerForEvent:", error.message); return false; }
  return data === true;
}

/** Atomic cancel via SQL function — handles decrement */
export async function cancelRegistration(
  userId: string,
  eventId: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc("cancel_registration", {
    p_user_id: userId,
    p_event_id: eventId,
  });
  if (error) { console.error("cancelRegistration:", error.message); return false; }
  return data === true;
}
