import { GoogleGenAI } from "@google/genai";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.

const apiKey = String(import.meta.env.VITE_GEMINI_API_KEY);

const ai = new GoogleGenAI({ apiKey });

export async function aiRecommendations({
  typeOfMovie = "action",
  description = null,
  language = "English",
  genres = "Any",
  count = 8,
  excludeIds = [],
  minRating = 7.0,
  yearRange = "Any",
} = {}) {
  const prompt = `
You are an AI assistant that recommends movies.

TASK:
Recommend exactly ${count} movies (or fewer only if absolutely impossible) based on the user's preferences.

USER PREFERENCES:
- Type of movie: "${typeOfMovie}"
${description ? `- The Movie Should be like ${description}` : ""}
- Language required: "${language}"
  (Include only if realistically available; otherwise choose closest and specify it.)
- Genres: "${genres}"
- Excluded movie IDs: ${excludeIds.length ? excludeIds.join(", ") : "None"}
- Minimum rating: ${minRating}
- Release year range: "${yearRange}"

STRICT RULES:
1. Output a STRICT JSON array of objects. **No commentary.**

2. Each object must be:
   {
     "id": TMDB_ID,
     "type": "movie" or "collection"
   }

3. If the movie belongs to a TMDB collection:
   - Return the TMDB **collection ID**
   - Set "type": "collection"
   - Count the entire collection as **ONE** recommendation

4. If it's a standalone movie:
   - Return the TMDB **movie ID**
   - Set "type": "movie"

5. Do NOT include any other fields (no title, year, rating, genres, etc).

6. Avoid excluded IDs strictly. No duplicates.

7. Prefer at least 30% lesser-known movies unless impossible.

8. If description is given then strictly recommend the movies which match the description 

9. If constraints cannot be fully met, relax minimally but still return the closest valid recommendations.

OUTPUT FORMAT EXAMPLE:
[
  { "id": 27205, "type": "movie" },
  { "id": 2344,  "type": "collection" },
  { "id": 603,   "type": "movie" }
]
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const text = response.text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  // Attempt parse; fall back to raw text
  try {
    return JSON.parse(text);
  } catch {
    console.error("Json parse Error");
    return null;
  }
}
