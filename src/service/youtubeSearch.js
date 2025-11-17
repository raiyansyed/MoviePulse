const YT_API_KEY = String(import.meta.env.VITE_YT_API_KEY);

export async function searchYouTubeTrailer(movieTitle) {
  if(!YT_API_KEY) {
    console.error("YouTube API key not found");
    return null;
  }

  try {
    const query = encodeURIComponent(`${movieTitle} official trailer`);
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&maxResults=${1}&type=${'video'}&key=${YT_API_KEY}`)

    const data = await response.json();
    
    if(data.items && data.items.length > 0) {
      return data.items[0].id.videoId;
    }

    return null;
  }
  catch(err) {
    console.error("Failed to fetch YouTube trailer:", err);
    return null;
  }
}