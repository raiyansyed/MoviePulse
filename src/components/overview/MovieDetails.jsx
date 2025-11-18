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

  useEffect(() => {
    const fetchMovieDetails = async () => {
      setTrailerLoading(true); // start loading
      try {
        const data = await getMovieDetails(id);
        setMovie(data);

        // Prefer TMDB's YouTube trailers (free, no YouTube quota)
        const videos = data.videos?.results || [];
        const tmdbTrailer =
          videos.find(v => v.site === "YouTube" && v.type === "Trailer") ||
          videos.find(v => v.site === "YouTube" && v.type === "Teaser") ||
          videos.find(v => v.site === "YouTube");

        if (tmdbTrailer) {
          setTrailerKey(tmdbTrailer.key); // fix: was trailer.key
        } else {
          // Fallback to YouTube search (uses quota; cached in localStorage)
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
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-2xl">Loading...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-2xl text-red-500">{error || "Movie not found"}</p>
      </div>
    );
  }

  const backgroundImage = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original/${movie.backdrop_path}`
    : null;

  const posterImage = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
    : null;

  const favorite = isFav(movie.id);

  const movieCast = movie.credits.cast;
  const sortedMovieCast = movieCast.sort((a, b) => b.popularity - a.popularity);

  const relatedSiteName = movie.homepage ? movie.homepage.split(".")[1] : null;

  return (
    <div className="relative min-h-screen">
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      {/* Back button */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={handleBackClick}
          className="mb-6 px-4 py-2 rounded-lg transition bg-[#403963] hover:bg-[#524a7a] hover:cursor-pointer"
        >
          ← Back
        </button>
        <div className="flex flex-col md:flex-row gap-8">
          {/* poster card */}
          <div className="shrink-0">
            {posterImage ? (
              <img
                src={posterImage}
                alt={movie.title}
                className="w-full md:w-80 rounded-lg shadow-2xl"
              />
            ) : (
              <div className="w-full md:w-80 rounded-lg shadow-2xl aspect-2/3 bg-gray-700 flex items-center justify-center">
                <p className="text-gray-400">No Image</p>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-yellow-400 text-xl">
                ⭐ {movie.vote_average?.toFixed(1)}
              </span>
              <span className="text-gray-400">
                {movie.release_date ? movie.release_date.split("-")[0] : "N/A"}
              </span>
              <span className="text-gray-400">
                {movie.runtime ? `${movie.runtime} min` : "N/A"}
              </span>
            </div>
            {/* Fav Button */}
            <button
              onClick={() => {
                setIsClicked(true);

                if (favorite) removeFromfavs(movie.id);
                else addTofavs(movie);

                setTimeout(() => setIsClicked(false), 600);
              }}
              className={`mb-6 px-6 py-2 rounded-lg transition-colors duration-200 ${
                favorite
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gray-700 hover:bg-gray-600"
              } ${isClicked ? "animate-ripple" : ""}`}
            >
              <span
                className={
                  isClicked ? "inline-block animate-heartbeat" : "inline-block"
                }
              >
                {favorite ? "♥ Remove from Favorites" : "♡ Add to Favorites"}
              </span>
            </button>

            {/* Trailer */}
            {trailerLoading && (
              <div className="mb-6">
                <h2 className="font-semibold mb-2 text-2xl">Trailer</h2>
                <p className="text-gray-400">Loading trailer...</p>
              </div>
            )}
            {!trailerLoading && trailerKey && (
              <div className="mb-6">
                <h2 className="font-semibold mb-2 text-2xl">Trailer</h2>
                <div className="w-full aspect-video rounded-lg overflow-hidden shadow-lg">
                  <iframe
                    title={`${movie.title} Trailer`}
                    src={`https://www.youtube.com/embed/${trailerKey}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}
            {!trailerLoading && !trailerKey && (
              <div className="mb-6">
                <h2 className="font-semibold mb-2 text-2xl">Trailer</h2>
                <p className="text-gray-400">No trailer available</p>
              </div>
            )}

            {/* Related Sites */}
            {movie.homepage && relatedSiteName && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2 text-2xl">Related sites</h3>
                <a
                  href={movie.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-[#403963] rounded-full text-sm hover:bg-[#524a7a] transition"
                >
                  {relatedSiteName}
                </a>
              </div>
            )}

            {/* Genres */}
            <div className="mb-6">
              <h2 className="font-semibold mb-2 text-2xl">Genres</h2>
              <div className="flex flex-wrap gap-2">
                {movie.genres?.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-[#403963] rounded-full text-sm cursor-default"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Overview */}
            <div className="mb-6">
              <h2 className="font-semibold mb-2 text-2xl">Overview</h2>
              <p className="text-lg mb-3">{movie.overview}</p>
            </div>
            {/* Languages Spoken */}
            {movie.spoken_languages && movie.spoken_languages.length > 0 && (
              <div className="mb-6">
                <h2 className="font-semibold mb-2 text-2xl">
                  Languages Spoken in Movie
                </h2>
                <div className="flex flex-wrap gap-2">
                  {movie.spoken_languages.map((lan) => (
                    <div
                      className="px-3 py-1 text-sm rounded-full bg-[#403963] cursor-default"
                      key={lan.iso_639_1}
                    >
                      {lan.english_name}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Movie Cast */}
            {movie.credits?.cast && movie.credits.cast.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Top Cast</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  <MovieCast movieCast={sortedMovieCast} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;
