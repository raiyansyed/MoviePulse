import { useFavContext } from "../context/FavContext";
import { useLocation, useNavigate } from "react-router-dom";

function MovieCard({ movie, currentPage, totalCount }) {
  const { addTofavs, removeFromfavs, isFav } = useFavContext();
  const navigate = useNavigate();
  const location = useLocation();

  const release = movie.release_date;
  const image = `https://image.tmdb.org/t/p/w500/${movie.poster_path}`;
  const fav = isFav(movie.id);

  const handleCardClick = () => {
    const scrollPosition = window.scrollY;
    navigate(`/movie/${movie.id}`, {
      state: {
        from: location.pathname + location.search,
        scrollPosition,
        page: currentPage,
        totalCount
      }
    });
  };

  return (
    <div onClick={handleCardClick}>
      <div className="relative rounded-lg overflow-hidden shadow-lg bg-[#201f1f] transition-transform duration-300 hover:scale-110 cursor-pointer p-2">
        <div className="relative group">
          {image ? (
            <img
              className="block w-full h-auto rounded-tl-lg rounded-tr-lg"
              src={image}
              alt={movie?.title || movie?.original_title || "Movie"}
            />
          ) : (
            <div className="w-full aspect-2/3 flex items-center justify-center bg-gray-700 text-gray-400">
              No Image
            </div>
          )}
          <div>
            {/* fav button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (fav) removeFromfavs(movie.id);
                else addTofavs(movie);
              }}
              className={`border border-gray-600 rounded-full w-8 h-8 absolute top-2 right-2 flex items-center justify-center opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 group-hover:pointer-events-auto ${
                fav ? "bg-red-600" : "bg-gray-800"
              } z-10`}
              aria-label={fav ? "Remove from favorites" : "Add to favorites"}
            >
              ♥
            </button>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-white text-lg font-semibold mb-1 truncate">
            {movie.title}
          </h3>
          <p>{release ? new Date(movie.release_date).getFullYear() : "N/A"}</p>
        </div>
      </div>
    </div>
  );
}

export default MovieCard;