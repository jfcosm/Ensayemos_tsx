import { GoogleGenAI } from "@google/genai";

// Safe access to environment variable that works in standard Vite environments
// without crashing if 'process' is undefined.
const getApiKey = () => {
  try {
    // In some Vite setups, process.env is replaced at build time.
    // In others, we need import.meta.env.
    // This check prevents "ReferenceError: process is not defined"
    if (typeof process !== 'undefined' && process.env) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore error
  }
  return undefined;
};

/**
 * Uses Gemini to format raw pasted lyrics/chords into a clean, standard format.
 */
export const formatSongContent = async (rawText: string): Promise<string> => {
  const apiKey = getApiKey();

  // If no API key is set, we fail gracefully instead of crashing the app.
  if (!apiKey) {
    console.warn("Gemini API Key is missing. Skipping AI formatting.");
    return rawText;
  }

  try {
    // Lazy initialization: Only create the client when we actually need it.
    // This prevents startup crashes if the key is missing or invalid.
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        You are a professional music editor. I will provide you with raw text that contains lyrics and chords, likely copied from a website. 
        Please format this text to be clean and readable for a musician.
        
        Rules:
        1. Place chords strictly above the lyrics they correspond to.
        2. Use standard chord notation (e.g., C, Am, F#m7).
        3. If there are sections (Verse, Chorus), label them clearly in [Brackets].
        4. Remove any website UI artifacts (like "Menu", "Search", "Print", advertisements).
        5. Return ONLY the formatted plain text content. No markdown code blocks, just the text.

        Raw Text:
        ${rawText}
      `,
    });

    return response.text || rawText;
  } catch (error) {
    console.error("Error formatting song with Gemini:", error);
    // Fallback to original text if API fails
    return rawText;
  }
};

/**
 * Suggests a setlist based on a mood or genre.
 */
export const suggestSetlistIdeas = async (genre: string): Promise<string[]> => {
    const apiKey = getApiKey();
    if (!apiKey) return [];

    try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Suggest 5 popular songs for a band playing ${genre} music. Return only the song titles separated by commas.`,
        });
        const text = response.text || "";
        return text.split(',').map(s => s.trim());
    } catch (e) {
        return [];
    }
}