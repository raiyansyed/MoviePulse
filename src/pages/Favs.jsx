import React from "react";
import { useFavContext } from "../context/FavContext";
import {MovieCard} from "../components/index.js"
function Favs() {
  const { favList } = useFavContext();

  if (favList.length === 0) {
    return (
      <div className="bg-black text-red-600 text-5xl shadow-2xl flex justify-center items-center font-bold min-h-screen text-center">
        No favorite movies yet..
        <br />
        Add Movies you like
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {favList?.map((movie) => (
        <MovieCard movie={movie} key={movie.id} />
      ))}
    </div>
  );
}

export default Favs;
