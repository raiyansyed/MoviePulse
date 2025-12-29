import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useFavContext } from "../../context/FavContext";
import { getMovieDetails } from "../../service/api";
import { MovieCast } from "../index.js";
import { searchYouTubeTrailer } from "../../service/youtubeSearch.js";
import "./buttonAnimation.css";

function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addTofavs, removeFromfavs, isFav } = useFavContext();
  const [isClicked, setIsClicked] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const [trailerLoading, setTrailerLoading] = useState(false);

  const backgroundImage = movie?.backdrop_path
    ? `https://image.tmdb.org/t/p/original/${movie.backdrop_path}`
    : null;

  useEffect(() => {
    const fetchMovieDetails = async () => {
      setTrailerLoading(true);
      try {
        const data = await getMovieDetails(id);
        setMovie(data);
        const videos = data.videos?.results || [];
        const tmdbTrailer =
          videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
          videos.find((v) => v.site === "YouTube" && v.type === "Teaser") ||
          videos.find((v) => v.site === "YouTube");

        if (tmdbTrailer) {
          setTrailerKey(tmdbTrailer.key);
        } else {
          const ytKey = await searchYouTubeTrailer(data.title, data.id);
          setTrailerKey(ytKey);
        }
      } catch (error) {
        console.error("Error fetching movie details:", error);
        setError("Failed to load Movie Details...");
      } finally {
        setTrailerLoading(false);
        setLoading(false);
      }
    };
    fetchMovieDetails();
  }, [id]);

  const handleBackClick = () => {
    const from = location.state?.from || "/";
    navigate(from, { state: { ...location.state } });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-muted">
        Loading…
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-rose-500">
        {error || "Movie not found"}
      </div>
    );
  }

  const posterImage = movie?.poster_path
    ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
    : null;

  const favorite = movie ? isFav(movie.id) : false;

  const movieCast = movie?.credits?.cast ?? [];
  const sortedMovieCast = [...movieCast].sort(
    (a, b) => b.popularity - a.popularity
  );

  const relatedSiteName = movie.homepage ? movie.homepage.split(".")[1] : null;

  return (
    <div className="relative min-h-screen overflow-hidden w-screen -mx-[50vw] left-1/2">
      {backgroundImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/50 to-black/80" />
        </>
      )}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-(--text)">
        <button
          onClick={handleBackClick}
          className="inline-flex items-center gap-2 text-sm text-(--text) border border-(--border) rounded-full px-4 py-1.5 cursor-pointer hover:border-(--text)"
        >
          ← Back
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="surface-card border hover:border-(--text) transition rounded-2xl p-4">
            {posterImage ? (
              <img
                src={posterImage}
                alt={movie.title}
                className="w-full rounded-xl"
              />
            ) : (
              <div className="w-full rounded-xl border border-dashed border-(--border) aspect-2/3 flex items-center justify-center text-muted">
                No Image
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold">{movie.title}</h1>
              <p className="text-sm text-muted">
                {movie.release_date ? movie.release_date.split("-")[0] : "N/A"}{" "}
                · {movie.runtime ? `${movie.runtime} min` : "N/A"}
              </p>
            </div>

            <button
              onClick={() => {
                setIsClicked(true);
                if (favorite) removeFromfavs(movie.id);
                else addTofavs(movie);
                setTimeout(() => setIsClicked(false), 600);
              }}
              className={`inline-flex items-center gap-2 border rounded-full px-4 py-2 text-sm hover:border-(--border) hover:cursor-pointer transition ${
                favorite
                  ? "border-rose-400 text-rose-500"
                  : "border-(--text) text-(--text)"
              } ${isClicked ? "animate-ripple" : ""}`}
            >
              {favorite ? "Remove from favorites" : "Add to favorites"}
            </button>

            {movie.overview && (
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Overview</h2>
                <p className="text-muted leading-relaxed">{movie.overview}</p>
              </div>
            )}

            {movie.genres && movie.genres.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Genres</h2>
                <div className="flex flex-wrap gap-2 text-sm text-muted">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="border border-(--border) rounded-full px-3 py-1"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {movie.homepage && relatedSiteName && (
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Official site</h2>
                <a
                  href={movie.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-(--text) underline"
                >
                  {relatedSiteName}
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Trailer</h2>
          {trailerLoading && <p className="text-muted">Loading trailer…</p>}
          {!trailerLoading && trailerKey && (
            <div className="w-full aspect-video rounded-2xl overflow-hidden border border-(--border)">
              <iframe
                title={`${movie.title} Trailer`}
                src={`https://www.youtube.com/embed/${trailerKey}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          )}
          {!trailerLoading && !trailerKey && (
            <p className="text-muted">No trailer available.</p>
          )}
        </div>

        {movie.spoken_languages && movie.spoken_languages.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Languages</h2>
            <div className="flex flex-wrap gap-2 text-sm text-muted">
              {movie.spoken_languages.map((lan) => (
                <span
                  className="border border-(--border) rounded-full px-3 py-1 hover:cursor-default"
                  key={lan.iso_639_1}
                >
                  {lan.english_name}
                </span>
              ))}
            </div>
          </div>
        )}

        {movie.credits?.cast && movie.credits.cast.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Top cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <MovieCast movieCast={sortedMovieCast} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieDetails;
