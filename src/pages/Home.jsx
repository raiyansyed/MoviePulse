import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getPopularMovies, searchMovies } from "../service/api";
import getWordSuggestions from "../service/suggestions";
import { MovieCard } from "../components/index.js";

function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const query = searchParams.get("search");
    if (query) {
      setSearchQuery(query);
      const loadSearchResults = async () => {
        setLoading(true);
        try {
          const searchResults = await searchMovies(searchQuery);
          setMovies(searchResults);
        } catch (error) {
          console.error(error);
          setError("Failed to load search results...");
        } finally {
          setLoading(false);
          setSearchQuery("");
        }
      };
      loadSearchResults();
    }
  }, [searchParams]);

  useEffect(() => {
    const loadPopularMovies = async () => {
      if (!searchParams.get("search")) {
        try {
          const popMovies = await getPopularMovies();
          setMovies(popMovies);
        } catch (error) {
          console.log(error);
          setError("Failed to load movies...");
        } finally {
          setLoading(false);
        }
      }
    };
    loadPopularMovies();
  }, [searchParams]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchParams({ search: searchQuery });

    setLoading(true);
    setError(null);
    setSuggestions([]);
    try {
      const searchResults = await searchMovies(searchQuery);
      setMovies(searchResults);
      setError(null);
    } catch (error) {
      console.error(error);
      setError("Failed to search the movie...");
    } finally {
      setLoading(false);
    }
    setSearchQuery("");
  };

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value) {
      const suggestions = await getWordSuggestions(value);
      setSuggestions(suggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setSuggestions([]);
  };

  return (
    <div className="w-full">
      <div className="relative max-w-[600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter the movie name"
            value={searchQuery}
            onChange={handleInputChange}
            className="flex-1 h-12 rounded-full bg-white border-white/20 placeholder-gray-300 px-5 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-black"
          />
          <button
            type="submit"
            className="h-12 px-6 rounded-full bg-[#ce806f] hover:bg-indigo-600 text-white font-medium transition ml-1"
          >
            Search
          </button>
        </form>
        {suggestions.length > 0 && (
          <ul className="absolute left-4 right-4 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-10">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-5 py-3 text-black hover:bg-indigo-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 first:rounded-t-lg last:rounded-b-lg"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 px-4">
          {movies?.map((movie) => (
            <MovieCard movie={movie} key={movie.id} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
