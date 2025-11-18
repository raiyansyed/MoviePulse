import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
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
  const suggestionReqId = useRef(0);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Infinite scrolling states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observer = useRef();
  const location = useLocation();
  const hasRestoredScroll = useRef(false);


  const query = searchParams.get("search") || "";

  const fetchPage = async (p) => {
    if (query) return searchMovies(query, p);
    return getPopularMovies(p);
  };

  // Load initial data, prefetch up to saved page if present
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      setLoading(true);
      setError(null);
      hasRestoredScroll.current = false;

      try {
        const targetPage = Math.max(1, Number(location.state?.page) || 1);

        // fetch page 1 first
        const first = await fetchPage(1);
        if (cancelled) return;

        let all = [...first];

        // prefetch 2..targetPage if needed
        if (targetPage > 1) {
          const pagePromises = [];
          for (let p = 2; p <= targetPage; p++) pagePromises.push(fetchPage(p));
          const rest = await Promise.all(pagePromises);
          if (cancelled) return;
          all = rest.reduce((acc, arr) => acc.concat(arr || []), all);
        }

        setMovies(all);
        setPage(targetPage);
        // crude hasMore guess: TMDB page size is 20
        setHasMore((all?.length || 0) >= targetPage * 20);
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          setError("Failed to load movies...");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    init();
    return () => {
      cancelled = true;
    };
  }, [query, location.state?.page]);

  // Restore scroll AFTER movies render
  useEffect(() => {
    if (
      !loading &&
      !hasRestoredScroll.current &&
      location.state?.scrollPosition !== undefined &&
      movies.length > 0
    ) {
      setTimeout(() => {
        window.scrollTo(0, Number(location.state.scrollPosition) || 0);
        hasRestoredScroll.current = true;
      }, 100);
    }
  }, [loading, movies.length, location.state?.scrollPosition]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const res = await fetchPage(next);
      if (!res || res.length === 0) {
        setHasMore(false);
      } else {
        setMovies((prev) => [...prev, ...res]);
        setPage(next);
      }
    } catch (e) {
      console.error(e);
      setError("Failed to load more movies...");
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, query]);

  const lastRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) loadMore();
      });
      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore, loadMore]
  );

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setShowSuggestions(false);
    setSuggestions([]);
    setSearchParams({ search: searchQuery });
    setSearchQuery("");
  };

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if(!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setShowSuggestions(true);
    const id = ++suggestionReqId.current;
    try {
      const s = await getWordSuggestions(value);
      if(suggestionReqId.current === id) {
        setSuggestions(s);
      }
    }
    catch{
      
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setSuggestions([]);
    setSearchParams({ search: suggestion });
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

      {loading && <p className="text-center">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 px-4">
            {movies.map((m, i) => {
              const isLast = i === movies.length - 1;
              const wrapper = (
                <MovieCard
                  key={m.id}
                  movie={m}
                  currentPage={page}
                  totalCount={movies.length}
                />
              );
              return isLast ? (
                <div key={m.id} ref={lastRef}>
                  {wrapper}
                </div>
              ) : (
                wrapper
              );
            })}
          </div>
          {loadingMore && <p className="text-center mt-4">Loading more...</p>}
          {!hasMore && movies.length > 0 && (
            <p className="text-center mt-4 text-gray-400">
              No more movies to load
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default Home;