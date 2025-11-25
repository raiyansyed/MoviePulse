import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import getWordSuggestions from "../service/suggestions";

function NavBar() {
  const [open, setOpen] = useState(false);
  const toggleMenu = () => setOpen(o => !o);
  const closeMenu = () => setOpen(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionReqId = useRef(0);
  const debounceRef = useRef(null);

  const [theme, setTheme] = useState(() =>
    typeof window === "undefined"
      ? "light"
      : localStorage.getItem("moviepulse-theme") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("moviepulse-theme", theme);
  }, [theme]);

  // Close mobile menu when route changes
  useEffect(() => {
    closeMenu();
    setShowSuggestions(false);
  }, [location.pathname]);

  // Sync search input with URL
  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate({ pathname: "/", search: `?search=${encodeURIComponent(q)}` });
    setShowSuggestions(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    const q = value.trim();

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (q.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setShowSuggestions(true);
    const id = ++suggestionReqId.current;

    debounceRef.current = setTimeout(async () => {
      try {
        const s = await getWordSuggestions(q);
        if (suggestionReqId.current === id) setSuggestions(s);
      } catch {}
    }, 350);
  };

  const handleSuggestionClick = (val) => {
    setSearchQuery(val);
    navigate({ pathname: "/", search: `?search=${encodeURIComponent(val)}` });
    setShowSuggestions(false);
    setSuggestions([]);
  };

  useEffect(() => () => debounceRef.current && clearTimeout(debounceRef.current), []);

  // Outside click closes suggestions
  const rootRef = useRef(null);
  useEffect(() => {
    function onDoc(e) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setShowSuggestions(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const links = [
    { to: "/recommendations", label: "Recommendations" },
    { to: "/favorites", label: "Favorites" },
    { to: "/", label: "Home" }
  ];

  return (
    <header
      ref={rootRef}
      className="fixed top-0 left-0 right-0 z-50 border-b border(--border) bg-(--card) text-(--text) mx-2 my-1 rounded-2xl backdrop-blur supports-backdrop-filter:bg-(--card)/90"
    >
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-8 flex items-center">
        {/* Left */}
        <div className="shrink-0">
          <Link
            to="/"
            className="font-semibold tracking-tight text-base sm:text-lg md:text-xl xl:text-2xl hover:opacity-90 transition-opacity"
          >
            MoviePulse
          </Link>
        </div>

        {/* Center (search) */}
        <div className="flex-1 min-w-0 mx-3 md:mx-6">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 text-xs sm:text-sm text-(--muted)border border-(--border) rounded-full px-3 sm:px-4 py-2 w-full"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              placeholder="Search movies"
              className="flex-1 min-w-0 bg-transparent outline-none text-(--text)placeholder:text-(--muted)"
              aria-label="Search movies"
            />
            <button
              type="submit"
              className="text-(--text) font-medium cursor-pointer hover:opacity-80 transition-opacity"
            >
              Search
            </button>
          </form>

          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 mt-2 bg-(--card) border border-(--border) rounded-lg shadow max-h-60 overflow-y-auto text-(--text) text-sm animate-fade">
              {suggestions.map(s => (
                <li key={s}>
                  <button
                    onClick={() => handleSuggestionClick(s)}
                    className="w-full text-left px-4 py-2 hover:bg-(--border)/40 transition-colors"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right group */}
        <div className="flex items-center gap-4 ml-auto">
          <nav className="hidden lg:flex items-center gap-6 text-sm text-(--muted)">
            {links.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className="hover:text-(--text) transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center shrink-0">
            <input
              id="theme-toggle"
              type="checkbox"
              className="peer sr-only"
              checked={theme === 'dark'}
              onChange={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
              aria-label="Toggle dark mode"
            />
            <label
              htmlFor="theme-toggle"
              className="relative flex h-6 w-11 cursor-pointer items-center rounded-full bg-gray-400 px-0.5 transition-colors before:absolute before:left-0.5 before:h-5 before:w-5 before:rounded-full before:bg-white before:shadow before:transition-transform peer-checked:bg-green-500 peer-checked:before:translate-x-5"
            >
              <span className="sr-only">Toggle theme</span>
            </label>
          </div>

          <button
            aria-label="Toggle menu"
            aria-expanded={open}
            className="md:hidden border border-(--border) rounded-full w-10 h-10 flex items-center justify-center hover:bg-(--border)/30 transition-colors"
            onClick={toggleMenu}
          >
            <div className="w-5 space-y-1.5">
              <span className="block h-0.5 bg-(--text)"></span>
              <span className="block h-0.5 bg-(--text)"></span>
              <span className="block h-0.5 bg-(--text)"></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile slide-down */}
      <div
        className={`md:hidden border-t border-(--border) bg-(--card) transition-[max-height] duration-300 overflow-hidden ${
          open ? 'max-h-72' : 'max-h-0'
        }`}
      >
        <div className="px-4 sm:px-8 py-4 flex flex-col gap-4">
          <div className="flex items-center">
            <input
              id="theme-toggle-mobile"
              type="checkbox"
              className="peer sr-only"
              checked={theme === 'dark'}
              onChange={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
              aria-label="Toggle dark mode"
            />
            <label
              htmlFor="theme-toggle-mobile"
              className="relative flex h-6 w-11 cursor-pointer items-center rounded-full bg-gray-400 px-0.5 transition-colors before:absolute before:left-0.5 before:h-5 before:w-5 before:rounded-full before:bg-white before:shadow before:transition-transform peer-checked:bg-green-500 peer-checked:before:translate-x-5"
            >
              <span className="sr-only">Toggle theme</span>
            </label>
            <span className="ml-3 text-sm text-(--muted)">
              {theme === 'light' ? 'Light' : 'Dark'} mode
            </span>
          </div>

          <nav className="flex flex-col gap-3 text-sm text--muted)">
            {links.map(l => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => {
                  closeMenu();
                  setShowSuggestions(false);
                }}
                className="hover:text(--text) transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default NavBar;