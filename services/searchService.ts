import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ContentType, Certification, type SearchResult, type Flashcard } from '../types';

// Se inicializa el cliente de la API de Gemini.
// La API Key se obtiene de forma segura desde las variables de entorno.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const performSearch = async (query: string): Promise<SearchResult[]> => {
    console.log(`Performing live Gemini search for: ${query}`);

    // Definimos un esquema estricto para la respuesta de la IA.
    // Esto asegura que los datos siempre tendrán el formato que nuestra app espera.
    const responseSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'Un identificador único para el resultado, ej: doc1' },
          title: { type: Type.STRING, description: 'El título principal del recurso encontrado.' },
          source: { type: Type.STRING, description: 'La fuente del contenido (ej: Universidad, Canal de YouTube, DOI, ISSN).' },
          type: { type: Type.STRING, description: 'El tipo de contenido.', enum: Object.values(ContentType) },
          certification: { type: Type.STRING, description: 'El nivel de certificación de la fuente.', enum: Object.values(Certification) },
          snippet: { type: Type.STRING, description: 'Un resumen corto y atractivo (máx. 200 caracteres) sobre el contenido.' },
          content: {
            type: Type.OBJECT,
            properties: {
              data: { type: Type.STRING, description: 'Contenido principal en modo "datos": texto estructurado, transcripción, o respuesta aceptada.' },
              image: { type: Type.STRING, description: 'Una URL a una imagen DIRECTAMENTE RELEVANTE para el contenido. Evita placeholders genéricos como picsum.photos y busca una imagen real que represente el tema.' },
              full: { type: Type.STRING, description: 'Contenido completo. Para videos, usa una URL de *embed* de YouTube (ej: https://www.youtube.com/embed/VIDEO_ID). Para documentos, usa una URL a un PDF online (ej: un paper de arXiv).' },
            }
          }
        }
      }
    };
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Basado en la siguiente consulta del usuario, encuentra 10 fuentes de información diversas y de alta calidad. Actúa como un motor de búsqueda semántica. Devuelve los resultados en español. Consulta: "${query}"`,
            config: {
                systemInstruction: `Eres un motor de búsqueda semántica de clase mundial. Tu tarea es indexar y devolver una lista de 10 fuentes certificadas y variadas (documentos, videos, foros, noticias) que respondan a la consulta del usuario. Proporciona URLs de imágenes y contenido realistas y directamente renderizables. Sigue el esquema JSON estrictamente.`,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonText = response.text.trim();
        const results = JSON.parse(jsonText) as SearchResult[];
        return results;

    } catch (error) {
        console.error("Error during Gemini API call for search:", error);
        throw new Error("La búsqueda con IA falló. Por favor, verifica la consulta o intenta de nuevo.");
    }
};

export const performTranslation = async (text: string, lang: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Traduce el siguiente texto al idioma con código "${lang}". Responde únicamente con el texto traducido, sin preámbulos. Texto: "${text}"`,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error during Gemini API call for translation:", error);
        return `[NO SE PUDO TRADUCIR] ${text}`;
    }
};

export const generateFlashcardFromText = async (text: string, image: string): Promise<Flashcard> => {
    const flashcardSchema = {
        type: Type.OBJECT,
        properties: {
            front: { type: Type.STRING, description: 'Una pregunta concisa y clara basada en el texto para el anverso de la tarjeta.' },
            back: { type: Type.STRING, description: 'La respuesta directa y precisa a la pregunta, extraída o inferida del texto, para el reverso.' },
        }
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `A partir del siguiente fragmento de texto, crea el contenido para una flashcard de estudio. Texto: "${text}"`,
            config: {
                systemInstruction: "Tu rol es crear material de estudio. Genera una pregunta (front) y una respuesta (back) basadas en el texto proporcionado. Sigue el esquema JSON.",
                responseMimeType: "application/json",
                responseSchema: flashcardSchema,
            }
        });

        const jsonText = response.text.trim();
        const flashcardContent = JSON.parse(jsonText);

        return {
            front: flashcardContent.front,
            back: flashcardContent.back,
            thumbnail: image
        };
    } catch (error) {
        console.error("Error during Gemini API call for flashcard generation:", error);
        // Fallback en caso de error de la API
        return {
            front: `¿Qué se puede inferir de este fragmento?: "${text.substring(0, 50)}..."`,
            back: text,
            thumbnail: image
        };
    }
};

export const generateImageFromPrompt = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                return imageUrl;
            }
        }
        throw new Error("No se encontró contenido de imagen en la respuesta de la API.");

    } catch (error) {
        console.error("Error during Gemini API call for image generation:", error);
        throw new Error("La generación de imagen con IA falló.");
    }
};