/// PUBLIC_INTERFACE
/**
 * Notes API service. Provides CRUD operations. Will call backend if VITE_API_BASE_URL is set,
 * otherwise uses localStorage as a stubbed datastore.
 *
 * Env:
 *  - import.meta.env.VITE_API_BASE_URL
 *  - import.meta.env.VITE_API_KEY (optional)
 */
export type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: string; // ISO
  createdAt: string; // ISO
};

const BASE_URL = import.meta.env?.VITE_API_BASE_URL || '';
const API_KEY = import.meta.env?.VITE_API_KEY || '';

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function nowISO() {
  return new Date().toISOString();
}

const STORAGE_KEY = 'notes_stub_v1';

function loadLocal(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Note[];
    return [];
  } catch {
    return [];
  }
}

function saveLocal(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (API_KEY) headers['Authorization'] = `Bearer ${API_KEY}`;
  const res = await fetch(url, { ...init, headers: { ...headers, ...(init?.headers || {}) } });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

/// PUBLIC_INTERFACE
/**
 * Get all notes, optionally filtered by a search query.
 */
export async function getNotes(query?: string): Promise<Note[]> {
  if (BASE_URL) {
    const q = query ? `?q=${encodeURIComponent(query)}` : '';
    return request<Note[]>(`/api/notes${q}`, { method: 'GET' });
  }
  const all = loadLocal().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  if (!query) return all;
  const ql = query.toLowerCase();
  return all.filter(
    (n) => n.title.toLowerCase().includes(ql) || n.content.toLowerCase().includes(ql),
  );
}

/// PUBLIC_INTERFACE
/**
 * Get a single note by id.
 */
export async function getNote(id: string): Promise<Note | null> {
  if (BASE_URL) {
    return request<Note>(`/api/notes/${encodeURIComponent(id)}`, { method: 'GET' }).catch(() => null);
  }
  return loadLocal().find((n) => n.id === id) || null;
}

/// PUBLIC_INTERFACE
/**
 * Create a new note.
 */
export async function createNote(data: { title: string; content: string }): Promise<Note> {
  if (BASE_URL) {
    return request<Note>(`/api/notes`, { method: 'POST', body: JSON.stringify(data) });
  }
  const notes = loadLocal();
  const n: Note = {
    id: uid(),
    title: data.title || 'Untitled',
    content: data.content || '',
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  notes.unshift(n);
  saveLocal(notes);
  return n;
}

/// PUBLIC_INTERFACE
/**
 * Update an existing note by id.
 */
export async function updateNote(
  id: string,
  data: { title: string; content: string },
): Promise<Note> {
  if (BASE_URL) {
    return request<Note>(`/api/notes/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  const notes = loadLocal();
  const idx = notes.findIndex((n) => n.id === id);
  if (idx === -1) throw new Error('Note not found');
  const updated: Note = {
    ...notes[idx],
    title: data.title,
    content: data.content,
    updatedAt: nowISO(),
  };
  notes[idx] = updated;
  saveLocal(notes);
  return updated;
}

/// PUBLIC_INTERFACE
/**
 * Delete a note by id.
 */
export async function deleteNote(id: string): Promise<{ success: boolean }> {
  if (BASE_URL) {
    await request<void>(`/api/notes/${encodeURIComponent(id)}`, { method: 'DELETE' });
    return { success: true };
  }
  const notes = loadLocal();
  const next = notes.filter((n) => n.id !== id);
  saveLocal(next);
  return { success: true };
}
