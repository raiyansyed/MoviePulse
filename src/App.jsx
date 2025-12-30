import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Favs from "./pages/Favs";
import { FavProvider } from "./context/FavContext";
import { MovieDetails, NavBar, Recommendations } from "./components/index.js";
import { Analytics } from "@vercel/analytics/react";

function App() {
  return (
    <FavProvider>
      <div className="min-h-screen bg-(--bg) text-(--text)">
        <NavBar />
        <main className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
          <Routes>
            <Route index element={<Home />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/favorites" element={<Favs />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
          </Routes>
        </main>
      </div>
    </FavProvider>
  );
}

export default App;
