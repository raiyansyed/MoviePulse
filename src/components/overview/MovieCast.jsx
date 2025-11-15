import React from "react";

function MovieCast({ movieCast }) {
  return (
    <>
      {movieCast.slice(0, 8).map((actor) => (
        <div className="text-center" key={actor.id}>
          {actor.profile_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w200/${actor.profile_path}`}
              alt={actor.name}
              className="w-full rounded-lg mb-2"
            />
          ) : (
            <div className="w-full aspect-2/3 bg-gray-700 rounded-lg mb-2 flex justify-center items-center">
              <span className="text-4xl">👤</span>
            </div>
          )}
          <p className="font-semibold text-sm">{actor.name}</p>
          <p className="text-xs text-gray-400">{actor.character}</p>
          <p className="text-xs text-gray-400">{actor.gender === 1 ? 'Female' : 'Male'}</p>
        </div>
      ))}
    </>
  );
}

export default MovieCast;
