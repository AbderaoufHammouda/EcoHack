// ─── Types ─────────────────────────────────────────────────────────────────

export type UserRole = "admin" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  commune: string;
  skills: string[];
  createdAt: string;
}

export interface Certification {
  id: string;
  userId: string;
  name: string;
  fileUrl: string | null;
  code: string | null;
  issueDate: string | null;
  organization: string | null;
  uploadedAt: string;
}

export interface CertificationInput {
  name: string;
  code?: string;
  issueDate?: string;
  organization?: string;
  file?: File;
}

export type ApplicationStatus = "pending" | "accepted" | "declined";

export interface Application {
  id: string;
  userId: string;
  eventId: string;
  motivation: string;
  status: ApplicationStatus;
  createdAt: string;
  reviewedAt: string | null;
  // joined
  userName?: string;
  userEmail?: string;
  userCommune?: string;
  userSkills?: string[];
  eventTitle?: string;
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

// ─── Certifications ────────────────────────────────────────────────────────

export async function getUserCertifications(userId: string): Promise<Certification[]> {
  const { data, error } = await supabase
    .from("certifications")
    .select("*")
    .eq("user_id", userId)
    .order("uploaded_at", { ascending: false });
  if (error) { console.error("getUserCertifications:", error.message); return []; }
  return (data ?? []).map(mapCertification);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCertification(r: any): Certification {
  return {
    id: r.id,
    userId: r.user_id,
    name: r.name,
    fileUrl: r.file_url ?? null,
    code: r.code ?? null,
    issueDate: r.issue_date ?? null,
    organization: r.organization ?? null,
    uploadedAt: r.uploaded_at,
  };
}

/** Add a certification with optional file upload */
export async function addCertification(
  userId: string,
  input: CertificationInput
): Promise<Certification | null> {
  let fileUrl: string | null = null;

  if (input.file) {
    const ext = input.file.name.split(".").pop();
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("certifications")
      .upload(path, input.file, { upsert: false });
    if (uploadError) { console.error("addCertification storage:", uploadError.message); return null; }
    const { data: urlData } = supabase.storage.from("certifications").getPublicUrl(path);
    fileUrl = urlData.publicUrl;
  }

  const { data, error } = await supabase
    .from("certifications")
    .insert({
      user_id: userId,
      name: input.name,
      file_url: fileUrl,
      code: input.code || null,
      issue_date: input.issueDate || null,
      organization: input.organization || null,
    })
    .select()
    .single();
  if (error) { console.error("addCertification insert:", error.message); return null; }
  return mapCertification(data);
}

/** @deprecated use addCertification instead */
export async function uploadCertification(
  userId: string,
  file: File
): Promise<Certification | null> {
  return addCertification(userId, { name: file.name, file });
}

export async function deleteCertification(certId: string): Promise<boolean> {
  const { error } = await supabase.from("certifications").delete().eq("id", certId);
  if (error) { console.error("deleteCertification:", error.message); return false; }
  return true;
}

// ─── Applications ──────────────────────────────────────────────────────────

export async function submitApplication(
  userId: string,
  eventId: string,
  motivation: string
): Promise<Application | null> {
  const { data, error } = await supabase
    .from("applications")
    .upsert({ user_id: userId, event_id: eventId, motivation, status: "pending" },
            { onConflict: "user_id,event_id" })
    .select()
    .single();
  if (error) { console.error("submitApplication:", error.message); return null; }
  return mapApplication(data);
}

export async function getUserApplications(userId: string): Promise<Application[]> {
  const { data, error } = await supabase
    .from("applications")
    .select("*, events(title)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) { console.error("getUserApplications:", error.message); return []; }
  return (data ?? []).map((r: any) => ({
    ...mapApplication(r),
    eventTitle: r.events?.title ?? "",
  }));
}

export async function getAllApplications(): Promise<Application[]> {
  const { data, error } = await supabase
    .from("applications")
    .select("*, events(title), profiles(name, email, commune, skills)")
    .order("created_at", { ascending: false });
  if (error) { console.error("getAllApplications:", error.message); return []; }
  return (data ?? []).map((r: any) => ({
    ...mapApplication(r),
    userName: r.profiles?.name ?? "",
    userEmail: r.profiles?.email ?? "",
    userCommune: r.profiles?.commune ?? "",
    userSkills: r.profiles?.skills ?? [],
    eventTitle: r.events?.title ?? "",
  }));
}

export async function reviewApplication(
  appId: string,
  status: "accepted" | "declined"
): Promise<boolean> {
  const { error } = await supabase
    .from("applications")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", appId);
  if (error) { console.error("reviewApplication:", error.message); return false; }
  return true;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApplication(r: any): Application {
  return {
    id: r.id,
    userId: r.user_id,
    eventId: r.event_id,
    motivation: r.motivation,
    status: r.status,
    createdAt: r.created_at,
    reviewedAt: r.reviewed_at ?? null,
  };
}

// ─── User skills ───────────────────────────────────────────────────────────

export async function updateUserSkills(userId: string, skills: string[]): Promise<boolean> {
  const { error } = await supabase
    .from("profiles")
    .update({ skills })
    .eq("id", userId);
  if (error) { console.error("updateUserSkills:", error.message); return false; }
  return true;
}
