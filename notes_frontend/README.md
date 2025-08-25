# Notes Frontend (Astro)

Modern, minimalistic notes UI built with Astro. Features:
- Sidebar navigation
- Notes list with search
- Create, edit, delete, and view notes
- Floating action button to add notes
- Light theme using primary #1976d2, accent #ffc107, secondary #424242
- API service with backend integration or localStorage stub

## Quick start

1) Install
- npm install

2) Configure env (optional)
- Copy `.env.example` to `.env` and set:
  - VITE_API_BASE_URL=http://localhost:8000
  - VITE_API_KEY= (optional)

If VITE_API_BASE_URL is omitted, the app will use localStorage for CRUD.

3) Run
- npm run dev
- Open the printed URL (default http://localhost:3000)

## Structure

- src/layouts/Layout.astro: App shell with sidebar and FAB
- src/components/: UI components (Header, NotesList, NoteForm, Sidebar)
- src/pages/:
  - index.astro: notes list and search
  - new.astro: create note
  - note/[id].astro: view note
  - note/[id]/edit.astro: edit note
- src/services/api.ts: PUBLIC_INTERFACE for CRUD using fetch; uses `.env` via Vite import.meta.env

## Backend integration

Set VITE_API_BASE_URL to your backend base URL. Expected endpoints:
- GET    /api/notes?q=search
- GET    /api/notes/:id
- POST   /api/notes
- PUT    /api/notes/:id
- DELETE /api/notes/:id

Optional header: Authorization: Bearer ${VITE_API_KEY}

If backend is unavailable, the app falls back to localStorage seamlessly.

## License

MIT
