import React, { useState } from "react";
import { MovieCard } from "./index.js";
import { languages, tmdbGenres, typeOfMovie } from "./data.js";
import { fetchByIds, fetchByCollectionIds } from "../service/api.js";
import { aiRecommendations } from "../service/aiRecomendations.js";
import { useLocation } from "react-router-dom";

function Recommendations() {
  const moodLimit = 3,
    genreLimit = 5,
    languagesLimit = 3;

  const [genreSelected, setGenreSelected] = useState([]);
  const [movieTypeSelected, setMovieTypeSelected] = useState([]);
  const [languagesSelected, setLanguagesSelected] = useState([]);
  const [description, setDescription] = useState("");
  const descriptionLimit = 300;

  const [selection, setSelection] = useState(true);

  const [individualMovies, setIndividualMovies] = useState([]);
  const [collectionMovies, setCollectionMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();

  const Result_key = "ai_results";

  React.useEffect(() => {
    if (location.state?.recommendationsSelection === false) {
      setSelection(false);
    }
    const saved = sessionStorage.getItem(Result_key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.individual?.length || parsed.collections?.length) {
          setIndividualMovies(parsed.individual || []);
          setCollectionMovies(parsed.collections || []);
          setSelection(false);
        }
      } catch {}
    }
  }, [location.state]);

  function toggleGenre(id) {
    setGenreSelected((prev) =>
      prev.includes(id)
        ? prev.filter((g) => g !== id)
        : prev.length < genreLimit
        ? [...prev, id]
        : prev
    );
  }

  function toggleLanguages(lang) {
    setLanguagesSelected((prev) =>
      prev.includes(lang)
        ? prev.filter((lan) => lan !== lang)
        : prev.length < languagesLimit
        ? [...prev, lang]
        : prev
    );
  }

  function toggleMovieTypes(type) {
    setMovieTypeSelected((prev) =>
      prev.includes(type)
        ? prev.filter((mt) => mt !== type)
        : prev.length < moodLimit
        ? [...prev, type]
        : prev
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSelection(false);
    setLoading(true);
    setError(null);
    try {
      const data = await aiRecommendations({
        typeOfMovie: movieTypeSelected.join(", "),
        description,
        language: languagesSelected.join(", "),
        genres: genreSelected.join(", "),
        count: 8,
        excludeIds: [],
        minRating: 7.0,
        yearRange: "Any",
      });
      if (Array.isArray(data)) {
        const movieIds = data
          .filter((item) => item.type?.toLowerCase() === "movie")
          .map((item) => item.id)
          .filter(Boolean);

        const collectionIds = data
          .filter((item) => item.type?.toLowerCase() === "collection")
          .map((item) => item.id)
          .filter(Boolean);

        let moviesFetched = [];
        let collectionsFetched = [];

        if (movieIds.length) {
          moviesFetched = await fetchByIds(movieIds);
          setIndividualMovies(moviesFetched || []);
        }

        if (collectionIds.length) {
          collectionsFetched = await fetchByCollectionIds(collectionIds);
          setCollectionMovies(collectionsFetched || []);
        }

        sessionStorage.setItem(
          Result_key,
          JSON.stringify({
            individual: moviesFetched,
            collections: collectionsFetched,
          })
        );
      } else {
        throw new Error("AI response not an array");
      }
    } catch (err) {
      setError(err);
      console.error("Ai Error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    setSelection(true);
    setIndividualMovies([]);
    setCollectionMovies([]);
    sessionStorage.removeItem(Result_key);
  };

  const results = [
    ...individualMovies,
    ...collectionMovies.flatMap((c) => (Array.isArray(c.parts) ? c.parts : [])),
  ];

  return !selection ? (
    <div className="space-y-6 mt-16">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            AI results
          </p>
          <h2 className="text-2xl font-semibold text-(--text)">Suggested titles</h2>
        </div>
        <button
          onClick={handleBackClick}
          className="inline-flex items-center rounded-full border border-(--border) px-4 py-2 text-sm text-(--text)"
        >
          Adjust filters
        </button>
      </div>
      {loading && <p className="text-muted">Loading…</p>}
      {error && (
        <p className="text-rose-500 border border-rose-200 bg-rose-50 rounded-xl p-3">
          {error.message || String(error)}
        </p>
      )}
      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {results.map((m, i) => (
            <MovieCard key={m.id || i} movie={m} />
          ))}
        </div>
      )}
    </div>
  ) : (
    <div className="mt-16 surface-card border border-(--border) rounded-2xl p-6 sm:p-8">
      <form className="space-y-8" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-(--text)">
            Tell us what you&apos;re in the mood for
          </h2>
          <p className="text-sm text-muted">
            Combine up to {genreLimit} genres, {moodLimit} moods, and {languagesLimit}
            {" "}
            languages. Add a short description if needed.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <p className="font-medium text-(--text)">Moods</p>
            <span className="text-muted">
              {movieTypeSelected.length}/{moodLimit}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            {typeOfMovie.map((type) => {
              const active = movieTypeSelected.includes(type);
              return (
                <button
                  type="button"
                  key={type}
                  onClick={() => toggleMovieTypes(type)}
                  className={`px-3 py-1.5 rounded-full border text-sm ${
                    active
                      ? "border-(--text) text-(--text)"
                      : "border-(--border) text-muted"
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <p className="font-medium text-(--text)">Languages</p>
            <span className="text-muted">
              {languagesSelected.length}/{languagesLimit}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            {languages.map((lang) => {
              const active = languagesSelected.includes(lang);
              return (
                <button
                  type="button"
                  key={lang}
                  onClick={() => toggleLanguages(lang)}
                  className={`px-3 py-1.5 rounded-full border ${
                    active
                      ? "border-(--text) text-(--text)"
                      : "border-(--border) text-muted"
                  }`}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <p className="font-medium text-(--text)">Genres</p>
            <span className="text-muted">
              {genreSelected.length}/{genreLimit}
            </span>
          </div>
          <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(150px,1fr))] text-sm">
            {tmdbGenres.map((g) => (
              <label
                key={g.value}
                className="flex items-center gap-2 border border-(--border) rounded-xl px-3 py-2"
              >
                <input
                  type="checkbox"
                  className="accent-black"
                  value={g.value}
                  checked={genreSelected.includes(g.value)}
                  onChange={() => toggleGenre(g.value)}
                />
                {g.label}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="font-medium text-(--text)">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) =>
              setDescription(e.target.value.slice(0, descriptionLimit))
            }
            className="w-full min-h-[120px] border border-(--border) rounded-xl p-3 text-sm bg-transparent text-(--text)"
            placeholder="Mention tone, pace, era, cast, or any specific prompt."
          ></textarea>
          <p className="text-right text-xs text-muted">
            {description.length}/{descriptionLimit}
          </p>
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2 rounded-full border border-(--text) text-(--text) text-sm font-medium"
        >
          Generate suggestions
        </button>
      </form>
    </div>
  );
}

export default Recommendations;
