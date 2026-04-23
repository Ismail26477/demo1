// Personal Health Hub — single-user model.
// localStorage for metadata, IndexedDB for file blobs.
// Structured so a backend swap (e.g. Lovable Cloud) only changes these functions.

export interface MedicalFile {
  id: string;
  name: string;
  type: string; // mime
  category: "xray" | "report" | "prescription" | "other";
  uploadedAt: number;
  size: number;
  notes?: string;
}

export interface HealthProfile {
  fullName: string;
  dob: string;
  age: string; // numeric string, validated 0-120
  gender: "Male" | "Female" | "Other" | "";
  phone: string;
  bloodGroup: string;
  height: string; // cm, numeric string
  weight: string; // kg, numeric string
  allergies: string;
  conditions: string;
  medications: string;
  emergencyContact: string;
  address: string;
  lastCheckup: string; // YYYY-MM-DD
}

export interface ActivityEvent {
  id: string;
  at: number;
  kind:
    | "upload"
    | "delete"
    | "edit"
    | "profile"
    | "share_on"
    | "share_off"
    | "rotate"
    | "signin"
    | "medication"
    | "appointment"
    | "vital";
  message: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string; // e.g. "Twice daily"
  notes?: string;
  startedAt: number;
}

export interface Appointment {
  id: string;
  title: string;
  doctor: string;
  location?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  notes?: string;
  createdAt: number;
}

export interface VitalReading {
  id: string;
  at: number;
  bp?: string; // e.g. "120/80"
  pulse?: string;
  temperature?: string; // °C
  spo2?: string;
  glucose?: string;
  notes?: string;
}

export interface User {
  id: string;
  email: string;
  password: string; // demo only
  createdAt: number;
  profile: HealthProfile;
  files: MedicalFile[];
  medications: Medication[];
  appointments: Appointment[];
  vitals: VitalReading[];
  // Emergency QR sharing
  shareEnabled: boolean;
  shareToken: string; // current token (rotates when user revokes)
  shareExpiresAt: number | null; // epoch ms; null = no expiry
  activity: ActivityEvent[];
}

const USERS_KEY = "phv_users";
const SESSION_KEY = "phv_session";

// ---------- Helpers ----------
function readUsers(): User[] {
  if (typeof window === "undefined") return [];
  try {
    const raw: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    // Migrate older records that may lack newer fields.
    return raw.map((u) => ({
      ...u,
      activity: Array.isArray(u.activity) ? u.activity : [],
      medications: Array.isArray(u.medications) ? u.medications : [],
      appointments: Array.isArray(u.appointments) ? u.appointments : [],
      vitals: Array.isArray(u.vitals) ? u.vitals : [],
      profile: { ...emptyProfile(), ...(u.profile || {}) },
    }));
  } catch {
    return [];
  }
}
function writeUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function emptyProfile(): HealthProfile {
  return {
    fullName: "",
    dob: "",
    age: "",
    gender: "",
    phone: "",
    bloodGroup: "",
    height: "",
    weight: "",
    allergies: "",
    conditions: "",
    medications: "",
    emergencyContact: "",
    address: "",
    lastCheckup: "",
  };
}
function genToken() {
  return (
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10)
  ).toUpperCase();
}
function genId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

// ---------- Auth ----------
export function signUp(input: {
  email: string;
  password: string;
  fullName: string;
}): User {
  const users = readUsers();
  if (users.find((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error("An account with this email already exists.");
  }
  const user: User = {
    id: `u_${Date.now().toString(36)}`,
    email: input.email,
    password: input.password,
    createdAt: Date.now(),
    profile: { ...emptyProfile(), fullName: input.fullName },
    files: [],
    medications: [],
    appointments: [],
    vitals: [],
    shareEnabled: false,
    shareToken: genToken(),
    shareExpiresAt: null,
    activity: [
      {
        id: `a_${Date.now().toString(36)}`,
        at: Date.now(),
        kind: "signin",
        message: "Health hub created",
      },
    ],
  };
  users.push(user);
  writeUsers(users);
  setSession(user.id);
  return user;
}

export function signIn(email: string, password: string): User {
  const users = readUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
  );
  if (!user) throw new Error("Invalid email or password.");
  logActivity(user, "signin", "Signed in");
  saveUser(user);
  setSession(user.id);
  return user;
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY);
}

function setSession(userId: string) {
  localStorage.setItem(SESSION_KEY, userId);
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  const id = localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return readUsers().find((u) => u.id === id) || null;
}

// ---------- Profile ----------
export function updateProfile(patch: Partial<HealthProfile>): User {
  const user = requireUser();
  user.profile = { ...user.profile, ...patch };
  logActivity(user, "profile", "Updated health profile");
  saveUser(user);
  return user;
}

// ---------- Files ----------
export function addFile(file: MedicalFile) {
  const user = requireUser();
  user.files.push(file);
  logActivity(user, "upload", `Uploaded ${file.name}`);
  saveUser(user);
}

export function updateFile(fileId: string, patch: Partial<MedicalFile>) {
  const user = requireUser();
  const idx = user.files.findIndex((f) => f.id === fileId);
  if (idx === -1) return;
  user.files[idx] = { ...user.files[idx], ...patch };
  logActivity(user, "edit", `Edited ${user.files[idx].name}`);
  saveUser(user);
}

export function removeFile(fileId: string) {
  const user = requireUser();
  const removed = user.files.find((f) => f.id === fileId);
  user.files = user.files.filter((f) => f.id !== fileId);
  if (removed) logActivity(user, "delete", `Deleted ${removed.name}`);
  saveUser(user);
}

// ---------- Medications ----------
export function addMedication(input: Omit<Medication, "id" | "startedAt">): Medication {
  const user = requireUser();
  const med: Medication = { ...input, id: genId("m"), startedAt: Date.now() };
  user.medications = [med, ...(user.medications || [])];
  logActivity(user, "medication", `Added medication ${med.name}`);
  saveUser(user);
  return med;
}
export function removeMedication(id: string) {
  const user = requireUser();
  const removed = user.medications.find((m) => m.id === id);
  user.medications = user.medications.filter((m) => m.id !== id);
  if (removed) logActivity(user, "delete", `Removed medication ${removed.name}`);
  saveUser(user);
}

// ---------- Appointments ----------
export function addAppointment(
  input: Omit<Appointment, "id" | "createdAt">,
): Appointment {
  const user = requireUser();
  const appt: Appointment = { ...input, id: genId("ap"), createdAt: Date.now() };
  user.appointments = [appt, ...(user.appointments || [])];
  logActivity(user, "appointment", `Booked ${appt.title}`);
  saveUser(user);
  return appt;
}
export function removeAppointment(id: string) {
  const user = requireUser();
  const removed = user.appointments.find((a) => a.id === id);
  user.appointments = user.appointments.filter((a) => a.id !== id);
  if (removed) logActivity(user, "delete", `Removed appointment ${removed.title}`);
  saveUser(user);
}

// ---------- Vitals ----------
export function addVital(input: Omit<VitalReading, "id" | "at">): VitalReading {
  const user = requireUser();
  const v: VitalReading = { ...input, id: genId("v"), at: Date.now() };
  user.vitals = [v, ...(user.vitals || [])];
  logActivity(user, "vital", "Logged vital signs");
  saveUser(user);
  return v;
}
export function removeVital(id: string) {
  const user = requireUser();
  user.vitals = user.vitals.filter((v) => v.id !== id);
  logActivity(user, "delete", "Removed vital reading");
  saveUser(user);
}

// ---------- Activity ----------
export function getActivity(limit = 12): ActivityEvent[] {
  const u = getCurrentUser();
  if (!u) return [];
  return [...(u.activity || [])].sort((a, b) => b.at - a.at).slice(0, limit);
}

function logActivity(user: User, kind: ActivityEvent["kind"], message: string) {
  const ev: ActivityEvent = {
    id: `a_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    at: Date.now(),
    kind,
    message,
  };
  user.activity = [ev, ...(user.activity || [])].slice(0, 50);
}

// ---------- Sharing (emergency QR) ----------
export interface ShareState {
  enabled: boolean;
  token: string;
  expiresAt: number | null;
}

export function getShareState(): ShareState {
  const u = getCurrentUser();
  if (!u) return { enabled: false, token: "", expiresAt: null };
  return { enabled: u.shareEnabled, token: u.shareToken, expiresAt: u.shareExpiresAt };
}

export function enableShare(durationMs: number | null = null): ShareState {
  const user = requireUser();
  user.shareEnabled = true;
  user.shareExpiresAt = durationMs ? Date.now() + durationMs : null;
  logActivity(user, "share_on", durationMs ? "Sharing enabled with expiry" : "Sharing enabled");
  saveUser(user);
  return getShareState();
}

export function disableShare(): ShareState {
  const user = requireUser();
  user.shareEnabled = false;
  user.shareExpiresAt = null;
  logActivity(user, "share_off", "Sharing disabled");
  saveUser(user);
  return getShareState();
}

export function rotateShareToken(): ShareState {
  const user = requireUser();
  user.shareToken = genToken();
  logActivity(user, "rotate", "QR token rotated");
  saveUser(user);
  return getShareState();
}

// Look up by share token (used by /emergency view). Returns sanitized snapshot.
export interface EmergencySnapshot {
  fullName: string;
  dob: string;
  age: string;
  gender: string;
  bloodGroup: string;
  height: string;
  weight: string;
  allergies: string;
  conditions: string;
  medications: string;
  emergencyContact: string;
  fileCount: number;
}

export function lookupEmergency(token: string): EmergencySnapshot | null {
  const users = readUsers();
  const u = users.find((x) => x.shareToken === token);
  if (!u || !u.shareEnabled) return null;
  if (u.shareExpiresAt && Date.now() > u.shareExpiresAt) return null;
  const p = u.profile;
  return {
    fullName: p.fullName,
    dob: p.dob,
    age: p.age,
    gender: p.gender,
    bloodGroup: p.bloodGroup,
    height: p.height,
    weight: p.weight,
    allergies: p.allergies,
    conditions: p.conditions,
    medications: p.medications,
    emergencyContact: p.emergencyContact,
    fileCount: u.files.length,
  };
}

// ---------- Internals ----------
function requireUser(): User {
  const u = getCurrentUser();
  if (!u) throw new Error("Not signed in.");
  return u;
}

function saveUser(updated: User) {
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === updated.id);
  if (idx === -1) users.push(updated);
  else users[idx] = updated;
  writeUsers(users);
}

// ---------- IndexedDB file blobs ----------
const DB_NAME = "phv_files";
const STORE = "files";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveFileBlob(id: string, blob: Blob) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getFileBlob(id: string): Promise<Blob | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve((req.result as Blob) || null);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteFileBlob(id: string) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ---------- Shared formatters ----------
export function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

export function timeAgo(t: number): string {
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(t).toLocaleDateString();
}

export function validateAge(raw: string): string | undefined {
  if (!raw) return undefined;
  if (!/^\d{1,3}$/.test(raw)) return "Enter a whole number.";
  const n = Number(raw);
  if (!Number.isFinite(n)) return "Age must be a number.";
  if (n < 0 || n > 120) return "Age must be between 0 and 120.";
  return undefined;
}
