import React from "react";
import { Link } from "react-router-dom";
import { useFavContext } from "../context/FavContext";
import { MovieCard } from "../components/index.js";

function Favs() {
  const { favList } = useFavContext();

  if (favList.length === 0) {
    return (
      <section className="mt-16 surface-card border border-(--border) rounded-2xl p-8 text-center space-y-4">
        <h2 className="text-2xl font-semibold text-(--text)">No favorites yet</h2>
        <p className="text-muted">
          Save movies you like and they&apos;ll appear in this list.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-5 py-2 rounded-full border border-(--text) text-(--text) text-sm"
        >
          Browse movies
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6 mt-16">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Favorites
          </p>
          <h2 className="text-2xl font-semibold text-(--text)">
            {favList.length} saved title{favList.length > 1 ? "s" : ""}
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {favList?.map((movie) => (
          <MovieCard movie={movie} key={movie.id} />
        ))}
      </div>
    </section>
  );
}

export default Favs;
