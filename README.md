# 🎬 MoviePulse

A fast movie browser built with React, Vite, and TailwindCSS. Search with suggestions, scroll infinitely, open rich movie details (cast, genres, languages), and watch trailers. Favorites and trailer lookups are cached in LocalStorage. When you return from a details page, the app restores your exact scroll position.

🌐 Demo: https://movie-info-smoky-one.vercel.app  
📦 Repo: https://github.com/raiyansyed/MovieInfo

---

## Features

### ✅ Movies (Fully Functional)
- 🔍 Search with typeahead suggestions (always visible, responsive, debounced, uses TMDB `/search/movie`)
- ♾️ Infinite scrolling (Intersection Observer)
- 📄 Movie details: overview, genres, spoken languages, and top cast
- ▶️ Trailers
  - Uses TMDB videos first (free, no extra API)
  - Fallback to YouTube search (optional) with LocalStorage caching
- ⭐ Favorites (persisted in LocalStorage)
- ↩️ Back-navigation scroll restoration
- 🏎️ Debounced and cached API requests for suggestions (prevents rate limit exhaustion)

### 🔄 Web Series (In Development)
- Web series search and filtering coming soon
- Currently working on integrating TMDB TV shows API

### General Features
- 🌙 Modern dark UI with TailwindCSS, fully responsive
- 🌓 Theme toggle (light/dark, persists in localStorage)
- 📱 Responsive NavBar: logo left, search center, links/theme right, hamburger toggles links/theme on mobile
- 🧹 No gaps for movies without posters (cards filtered out)

---

## Tech Stack

- React + Vite
- React Router
- TailwindCSS (with CSS variables for theme)
- TMDB API (primary data + videos)
- YouTube Data API v3 (optional fallback for trailers)
- LocalStorage (favorites + trailer cache)

---

## Project Structure

```bash
MoviePulse/
├─ public/
├─ src/
│  ├─ components/
│  │   ├─ NavBar.jsx         # Responsive, fixed, always-visible search bar
│  │   ├─ MovieCard.jsx      # Filters out movies without posters
│  │   ├─ Recommendations.jsx
│  │   ├─ index.js
│  │   └─ data.js
│  ├─ pages/
│  │   ├─ Home.jsx           # Infinite scroll, search, scroll restore
│  ├─ service/
│  │   ├─ api.js             # TMDB API helpers
│  │   ├─ suggestions.js     # Debounced/cached typeahead suggestions
│  │   ├─ aiRecomendations.js
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ index.css              # Tailwind + theme CSS variables
├─ .env            # your local env (not committed)
├─ .env.example    # sample env to copy from
├─ package.json
└─ README.md
```

---

## Environment Variables

Create your own `.env` (do not commit it). Copy from `.env.example` and fill in your keys:

```bash
VITE_API_KEY=YOUR_TMDB_API_KEY
VITE_BASE_URL=https://api.themoviedb.org/3

# Optional: only needed if you want YouTube fallback search.
VITE_YT_API_KEY=YOUR_YOUTUBE_DATA_API_KEY
VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

Notes:
- Do not wrap values in quotes.
- Restart the dev server after changing `.env`.

---

## Getting Started

1) Install dependencies
```bash
npm install
```

2) Create `.env` from `.env.example` and add keys (see above)

3) Start dev server
```bash
npm run dev
```

4) Build and preview
```bash
npm run build
npm run preview
```

---

## Implementation Notes

### NavBar & Search
- NavBar is fixed, always visible, and fully responsive.
- Logo left, search bar center (flex-1, min-w-0), links/theme right.
- Hamburger icon toggles links/theme on mobile; search bar remains visible.
- Search suggestions use TMDB `/search/movie`, debounced (350ms), cached, and require at least 3 characters.
- Suggestions dropdown overlays below search input, closes on outside click or navigation.

### Infinite Scrolling
- Uses an Intersection Observer on the last visible card to fetch the next page.
- Filters out movies without posters/backdrops before rendering grid (no empty gaps).

### Scroll Restoration
- When a MovieCard is clicked, the current scroll position, page, and list length are passed via `location.state`.
- Home prefetches up to the saved page before restoring scroll to ensure the DOM exists.

### Trailers & Quota
- Primary: TMDB `append_to_response=videos`. If a YouTube video is present, embed by ID.
- Fallback: YouTube search (optional). Results are cached in LocalStorage to avoid repeated quota usage.
- YouTube quota (default): 10,000 units/day. `search.list` = 100 units. Embedding/playing by ID uses 0 units.

LocalStorage trailer cache (key: `yt_trailer_cache`):
```json
{
  "634649": "mqqft2x_Aa4",
  "238": "sY1S34973zA"
}
```
Clear cache:
```js
localStorage.removeItem('yt_trailer_cache');
```

### Favorites
- Stored in LocalStorage and managed via context.

---

## Troubleshooting

- YouTube 403 Forbidden:
  - Exceeded quota or key not enabled/restricted. Prefer TMDB videos; keep YouTube as a fallback only.
- Env not applied:
  - Restart `npm run dev` after editing `.env`.
- Back button doesn’t restore position:
  - Use the app’s back button in MovieDetails (it passes state) and ensure Home waits for data to render before scrolling.
- Search suggestions not showing:
  - Ensure TMDB API key is set and not rate-limited. Suggestions require at least 3 characters.

---

## Scripts

```bash
npm run dev     # start dev server
npm run build   # production build
npm run preview # preview production build
```

---

## License

MIT