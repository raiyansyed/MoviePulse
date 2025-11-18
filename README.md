# 🎬 MovieInfo

A fast movie browser built with React, Vite, and TailwindCSS. Search with suggestions, scroll infinitely, open rich movie details (cast, genres, languages), and watch trailers. Favorites and trailer lookups are cached in LocalStorage. When you return from a details page, the app restores your exact scroll position.

🌐 Demo: https://movie-info-smoky-one.vercel.app  
📦 Repo: https://github.com/raiyansyed/MovieInfo

---

## Features

- 🔍 Search with typeahead suggestions
- ♾️ Infinite scrolling (Intersection Observer)
- 📄 Movie details: overview, genres, spoken languages, and top cast
- ▶️ Trailers
  - Uses TMDB videos first (free, no extra API)
  - Fallback to YouTube search (optional) with LocalStorage caching
- ⭐ Favorites (persisted in LocalStorage)
- ↩️ Back-navigation scroll restoration
- 🌙 Modern dark UI with TailwindCSS, fully responsive

---

## Tech Stack

- React + Vite
- React Router
- TailwindCSS
- TMDB API (primary data + videos)
- YouTube Data API v3 (optional fallback for trailers)
- LocalStorage (favorites + trailer cache)

---

## Project Structure

```bash
movieInfo/
├─ public/
├─ src/
│  ├─ components/
│  │   ├─ NavBar.jsx
│  │   ├─ MovieCard.jsx
│  │   ├─ index.js
│  │   └─ overview/
│  │        ├─ MovieDetails.jsx
│  │        ├─ MovieCast.jsx
│  │        └─ buttonAnimation.css
│  ├─ context/
│  │   └─ FavContext.jsx
│  ├─ pages/
│  │   ├─ Home.jsx
│  │   └─ Favs.jsx
│  ├─ service/
│  │   ├─ api.js             # TMDB API helpers
│  │   ├─ suggestions.js     # typeahead suggestions
│  │   └─ youtubeSearch.js   # YouTube fallback + LocalStorage cache
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ index.css
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
# Playing an embed by ID does not use quota; only API search does.
VITE_YT_API_KEY=YOUR_YOUTUBE_DATA_API_KEY
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

### Infinite Scrolling
- Uses an Intersection Observer on the last card to fetch the next page.
- Appends new results to the existing list.
- Works for both “Popular” and “Search” paths.

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
- Stored in LocalStorage and managed via context (`FavContext`).

---

## Troubleshooting

- YouTube 403 Forbidden:
  - Exceeded quota or key not enabled/restricted. Prefer TMDB videos; keep YouTube as a fallback only.
- Env not applied:
  - Restart `npm run dev` after editing `.env`.
- Back button doesn’t restore position:
  - Use the app’s back button in MovieDetails (it passes state) and ensure Home waits for data to render before scrolling.

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