const YT_API_KEY = String(import.meta.env.VITE_YT_API_KEY);
const CACHE_KEY = 'yt_trailer_cache';

export async function searchYouTubeTrailer(movieTitle, movieId) {
  const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
  if(cache[movieId]) {
    console.log('Using cached trailer for:', movieTitle);
    return cache[movieId];
  }

  if(!YT_API_KEY) {
    console.error("YouTube API key not found");
    return null;
  };


  try {
    const query = encodeURIComponent(`${movieTitle} trailer`);
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&maxResults=${1}&type=${'video'}&key=${YT_API_KEY}`)

    const data = await response.json();
    
    if(data.items && data.items.length > 0) {
      const videoId = data.items[0].id.videoId;
      cache[movieId] = videoId;
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache))

      return videoId;
    }

    return null;
  }
  catch(err) {
    console.error("Failed to fetch YouTube trailer:", err);
    return null;
  }
}