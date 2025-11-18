const API_KEY = String(import.meta.env.VITE_API_KEY);
const BASE_URL = String(import.meta.env.VITE_BASE_URL);

export async function getPopularMovies(page = 1) {
  const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`);
  const data = await response.json();
  return data.results;
}

export async function searchMovies(query, page = 1) {
  const response = await fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
      query
    )}&page=${page}`
  );
  const data = await response.json();
  return data.results;
}

export async function getMovieDetails(movieId) {
  const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits,videos`);
  const data = await response.json();
  return data;
}