import { GoogleGenAI } from "@google/genai";

// Safe access to environment variable that works in standard Vite environments
// without crashing if 'process' is undefined.
const getApiKey = () => {
  try {
    // 1. Check standard Vite environment variables (Preferred)
    // @ts-ignore
    if (import.meta && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }

    // 2. Check for process.env (Vercel/Node compat)
    if (typeof process !== 'undefined' && process.env) {
      // Vercel sometimes injects VITE_ prefixed vars into process.env too
      return process.env.VITE_API_KEY || process.env.API_KEY || process.env.REACT_APP_API_KEY;
    }
  } catch (e) {
    console.warn("Error accessing environment variables:", e);
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

/**
 * Generates a full song composition based on user parameters.
 */
export const generateSongFromParams = async (params: {
    key: string;
    scale: string;
    style: string;
    mood: string;
    speed: string;
    complexity: string;
    topics: string;
}): Promise<string> => {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.error("API Key not found in environment variables.");
        return "Error: API Key Missing. Please ensure VITE_API_KEY is set in your Vercel project settings.";
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `
            Act as a professional songwriter and composer. I need you to compose a complete song.
            
            Parameters:
            - Key: ${params.key} ${params.scale}
            - Style/Genre: ${params.style}
            - Mood: ${params.mood}
            - Tempo: ${params.speed}
            - Harmonic Complexity: ${params.complexity}
            - Lyrical Themes/Keywords: ${params.topics}

            Instructions:
            1. Create a full song structure (Intro, Verse 1, Chorus, Verse 2, Bridge, Chorus, Outro).
            2. Write original lyrics based on the themes provided.
            3. Provide the Chords above the lyrics.
            4. Include performance notes for each section (e.g., "Drums enter here", "Soft piano only").
            5. Return the result in plain text format suitable for a chord sheet.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text || "";
    } catch (error) {
        console.error("Error composing song:", error);
        return "Error creating composition. Please check your API Quota or Connection.";
    }
};