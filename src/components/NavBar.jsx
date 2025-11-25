import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import getWordSuggestions from "../service/suggestions";

function NavBar() {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((prev) => !prev);
  const close = () => setOpen(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionReqId = useRef(0);
  const debounceRef = useRef(null);

  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("moviepulse-theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("moviepulse-theme", theme);
  }, [theme]);

  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate({
      pathname: "/",
      search: `?search=${encodeURIComponent(searchQuery.trim())}`,
    });
    setShowSuggestions(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    const query = value.trim();

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setShowSuggestions(true);
    const id = ++suggestionReqId.current;

    debounceRef.current = setTimeout(async () => {
      try {
        const s = await getWordSuggestions(query);
        if (suggestionReqId.current === id) setSuggestions(s);
      } catch {}
    }, 350);
  };

  const handleSuggestionClick = (value) => {
    setSearchQuery(value);
    navigate({
      pathname: "/",
      search: `?search=${encodeURIComponent(value)}`,
    });
    setShowSuggestions(false);
    setSuggestions([]);
    close();
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const links = [
    { to: "/", label: "Home" },
    { to: "/recommendations", label: "Recommendations" },
    { to: "/favorites", label: "Favorites" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-(--border) bg-(--card) text-(--text) mx-2 my-1 rounded-2xl">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-8 flex items-center gap-6">
        {/* Left: Logo */}
        <Link
          to="/"
          onClick={close}
          className="text-lg font-semibold tracking-tight shrink-0"
        >
          MoviePulse
        </Link>

        {/* Center: Search (desktop) */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 text-sm text-(--muted) border border-(--border) rounded-full px-4 py-2 flex-1 sm:px-4 relative"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Search movies"
            className="flex-1 bg-transparent outline-none text-(--text) placeholder:text-(--muted)"
          />
          <button
            type="submit"
            className="text-(--text) font-medium cursor-pointer"
          >
            Search
          </button>
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute top-full left-0 right-0 mt-2 bg-(--card) border border-(--border) rounded-lg shadow max-h-60 overflow-y-auto text-(--text)">
              {suggestions.map((s, i) => (
                <li key={i}>
                  <button
                    onClick={() => handleSuggestionClick(s)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-(--border)/40 transition-colors"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </form>

        {/* Right: Links + Theme */}
        <nav className="hidden lg:flex items-center gap-6 text-sm text-(--muted)">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={close}
              className="hover:text-(--text) transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center">
          <input
            id="theme-toggle"
            type="checkbox"
            className="peer sr-only"
            checked={theme === "dark"}
            onChange={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
            aria-label="Toggle dark mode"
          />
          <label
            htmlFor="theme-toggle"
            className="relative flex h-6 w-11 cursor-pointer items-center rounded-full bg-gray-400 px-0.5 transition-colors before:absolute before:left-0.5 before:h-5 before:w-5 before:rounded-full before:bg-white before:shadow before:transition-transform peer-checked:bg-green-500 peer-checked:before:translate-x-5"
          >
            <span className="sr-only">Toggle theme</span>
          </label>
        </div>

        {/* Mobile hamburger */}
        <button
          aria-label="Toggle menu"
          className="md:hidden ml-auto border border-(--border) rounded-full w-10 h-10 flex items-center justify-center"
          onClick={toggle}
        >
          <div className="w-5 space-y-1.5">
            <span className="block h-0.5 bg-(--text)"></span>
            <span className="block h-0.5 bg-(--text)"></span>
            <span className="block h-0.5 bg-(--text)"></span>
          </div>
        </button>
      </div>

      {/* Mobile dropdown (includes search) */}
      <div
        className={`md:hidden border-t border-(--border) bg-(--card) transition-[max-height] duration-200 overflow-hidden ${
          open ? "max-h-112" : "max-h-0"
        }`}
      >
        <div className="px-4 sm:px-8 py-4 flex flex-row gap-4">
          <nav className="flex flex-col gap-3 text-sm text-(--muted)">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => {
                  close();
                  setShowSuggestions(false);
                }}
                className="hover:text-(--text) transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex gap-1.5 items-center justify-center flex-col ml-auto">
            <span className="ml-3 text-sm text-(--muted)">
              {theme === "light" ? "Light" : "Dark"} mode
            </span>
            <input
              id="theme-toggle-mobile"
              type="checkbox"
              className="peer sr-only"
              checked={theme === "dark"}
              onChange={() =>
                setTheme((t) => (t === "light" ? "dark" : "light"))
              }
              onClick={close}
              aria-label="Toggle dark mode"
            />
            <label
              htmlFor="theme-toggle-mobile"
              className="relative flex h-6 w-11 cursor-pointer items-center rounded-full bg-gray-400 px-0.5 transition-colors before:absolute before:left-0.5 before:h-5 before:w-5 before:rounded-full before:bg-white before:shadow before:transition-transform peer-checked:bg-green-500 peer-checked:before:translate-x-5"
            >
              <span className="sr-only">Toggle theme</span>
            </label>
          </div>
        </div>
      </div>
    </header>
  );
}

export default NavBar;
