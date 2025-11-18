import React from "react";
import { Link } from "react-router-dom";

function NavBar() {
  return (
    <nav className="font-bold text-2xl bg-[#403963] w-full h-20 flex items-center px-6">
      <Link to="/" className="shrink-0">
        Movie Pulse
      </Link>
      <div className="ml-auto flex items-center gap-8 mr-4">
        <Link to="/">Home</Link>
        <Link to="/favorites">Favorites</Link>
      </div>
    </nav>
  );
}

export default NavBar;
