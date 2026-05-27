import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// Initialize Gemini client inside the API endpoint dynamically to handle cases 
// where the API key might be loaded or configured late, of fail gracefully.
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("La clave de API de Gemini (GEMINI_API_KEY) no está configurada.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Robust JSON parsing utility to insulate against accidental markdown block wrappers from the LLM
function safeParseJSON(text: string | undefined): any {
  if (!text) return {};
  let cleanText = text.trim();
  if (cleanText.startsWith("```")) {
    cleanText = cleanText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  }
  try {
    return JSON.parse(cleanText);
  } catch (e) {
    console.warn("Reintentando la extracción de JSON mediante coincidencia de expresión regular debido a: ", e);
    const match = cleanText.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (innerError) {
        console.error("Error crítico de análisis: tanto el análisis JSON nativo como la extracción Regex fallaron.", innerError);
      }
    }
    throw e;
  }
}

// REST route to analyze a song
app.post("/api/analyze", async (req, res) => {
  try {
    const { title, artist, userNotes, fileData, fileType, fileName, songLink } = req.body;

    if (!title && !fileData && !songLink) {
      return res.status(400).json({ error: "Debes introducir el título de la canción, subir un archivo de audio o pegar el enlace de la plataforma (Spotify, Apple Music, Deezer, YouTube, etc.) para que la IA la analice." });
    }

    const ai = getGeminiClient();

    let resolvedTitle = title;
    let resolvedArtist = artist;

    // Use Google Search Grounding to identify the genuine song behind the streaming or video link
    if (songLink) {
      try {
        console.log(`Resolviendo detalles reales de la canción en el enlace: ${songLink}`);
        const idResponse = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `You are an expert music recognition assistant. Protect against hallucinations.
Your goal is to inspect the following web link and retrieve the EXACT official song title and main artist name.
Link: "${songLink}"

CRITICAL: You MUST use the Google Search tool to search for this exact URL or its web page metadata on Google. Do not guess, and do not hallucinate under any circumstance. Look up what audio/video stream or song page this URL represents.

Responde STRICTLY en formato JSON válido con la siguiente estructura:
{
  "title": "Título real de la canción o 'Unknown'",
  "artist": "Artista real de la canción o 'Unknown'",
  "success": true
}`,
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              required: ["title", "artist", "success"],
              properties: {
                title: { type: Type.STRING },
                artist: { type: Type.STRING },
                success: { type: Type.BOOLEAN }
              }
            }
          }
        });

        if (idResponse && idResponse.text) {
          const idData = safeParseJSON(idResponse.text);
          console.log("Detalles identificados de la pista de forma segura por el enlace:", idData);
          if (idData && idData.success) {
            if (idData.title && idData.title !== "Unknown" && idData.title !== "Canción de Enlace Externo") {
              resolvedTitle = idData.title;
            }
            if (idData.artist && idData.artist !== "Unknown" && idData.artist !== "De Enlace Musical") {
              resolvedArtist = idData.artist;
            }
          }
        }
      } catch (idError) {
        console.error("Error al identificar enlace de canción secundario:", idError);
      }
    }

    if (!resolvedTitle) {
      if (fileName) {
        resolvedTitle = fileName.replace(/\.[^/.]+$/, "");
      } else if (songLink) {
        resolvedTitle = "Canción de Enlace Externo";
      } else {
        resolvedTitle = "Grabación de Audio Subida";
      }
    }
    
    if (!resolvedArtist) {
      resolvedArtist = songLink ? "De Enlace Musical" : "Deducido por Audio o Desconocido";
    }

    const basePrompt = `Analiza detallada y técnicamente la canción "${resolvedTitle}" de ${resolvedArtist}.
${userNotes ? `Contexto o notas adicionales de enfoque del usuario: "${userNotes}"` : ""}
${songLink ? `El usuario ha facilitado el siguiente enlace de streaming/video para la canción: "${songLink}". Por favor deconstruye y analiza esta obra específica de Spotify, Apple Music, Deezer o YouTube, explicando detalles correspondientes a la mezcla oficial o video musical proporcionado.` : ""}
${fileData ? "He adjuntado el archivo de audio real de la canción. Por favor, escúchalo atentamente para validar o deducir con precisión quirúrgica el tempo real, la tonalidad (key), los instrumentos verdaderos, el diseño de la voz, las técnicas de paneo stereo/reverberación y el arco dinámico real." : ""}

Por favor, utiliza la herramienta Google Search para buscar y fundamentar tu análisis en datos de producción musical REALES de esta canción exacta, incluyendo el año de lanzamiento, género, tempo real de grabación, la tonalidad (key) original, e instrumentación verídica para evitar cualquier tipo de alucinación o datos ficticios. No inventes secciones ni técnicas si no coinciden con la realidad del tema.

Deconstruye la canción en detalle abordando las siguientes dimensiones en ESPAÑOL:
1. Metadatos generales (año de lanzamiento original aproximado, género principal, tempo estimado en BPM, clave musical sugerida y duración promedio).
2. Análisis Emocional y Vibe (vibra sónica, rango de emociones, viaje emocional expresado, nivel de energía de 1 a 10, valencia o positividad de 1 a 10, y el color sinestésico asociado justificando la elección en base a armonías/tonos).
3. Instrumentación exhaustiva dividida en: sección rítmica, melodía líder/principales, acompañamiento/armonía, sintetizadores/efectos de sonido especiales y notas sobre el arreglo vocal.
4. Deconstrucción de Producción y Dinámica: estructura dinámica estimada por secciones (intro, verso, estribillo, puente, solo, outro con rangos de tiempo de referencia), técnicas de mezcla respaldadas (reverb, delay, compresión, paneo estéreo) y detalles clave/curiosidades de producción u ocultos.
5. Curiosidades sutiles e impacto cultural del tema (o de su estilo de producción si es una pieza original).
6. Un reporte completo en formato texto (Markdown) estructurado con elegancia estética, listo para ser copiado o descargado, que resuma todo el análisis técnico detalladamente.`;

    // Construct parts array for Gemini content
    const contentsParts: any[] = [];

    if (fileData && fileType) {
      // Strip base64 signature if present
      let cleanBase64 = fileData;
      if (fileData.includes(";base64,")) {
        cleanBase64 = fileData.split(";base64,").pop() || fileData;
      }
      
      contentsParts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: fileType
        }
      });
    }

    contentsParts.push({
      text: basePrompt
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: contentsParts },
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "metadata", 
            "emotionalAnalysis", 
            "instrumentation", 
            "productionDeconstruction", 
            "overallTriviaAndImpact", 
            "textReportFormatted"
          ],
          properties: {
            metadata: {
              type: Type.OBJECT,
              required: ["title", "artist", "releasedYear", "genre", "tempo", "key", "durationEstimate"],
              properties: {
                title: { type: Type.STRING, description: "Título real o corregido de la canción." },
                artist: { type: Type.STRING, description: "Artista real o proyectado de la canción." },
                releasedYear: { type: Type.STRING, description: "Año o década de lanzamiento." },
                genre: { type: Type.STRING, description: "Géneros principales agrupados." },
                tempo: { type: Type.STRING, description: "Tempo o velocidad aproximada en BPM." },
                key: { type: Type.STRING, description: "Tonalidad o clave musical de la canción (ej: Am / La menor)." },
                durationEstimate: { type: Type.STRING, description: "Duración aproximada de la canción original." }
              }
            },
            emotionalAnalysis: {
              type: Type.OBJECT,
              required: ["vibeDescription", "primaryEmotions", "emotionalJourney", "energyLevel", "positivityValence", "synesthesiaColor", "synesthesiaReasoning"],
              properties: {
                vibeDescription: { type: Type.STRING, description: "Descripción textual de la vibración o atmósfera general de la pieza." },
                primaryEmotions: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "Lista de 3 a 5 emociones principales presentes en la obra." 
                },
                emotionalJourney: { type: Type.STRING, description: "El arco de la emoción desde el inicio hasta el final de la canción." },
                energyLevel: { type: Type.INTEGER, description: "Nivel de intensidad o energía musical de 1 a 10." },
                positivityValence: { type: Type.INTEGER, description: "Grado de positividad / alegría musical (valence) de 1 a 10." },
                synesthesiaColor: { type: Type.STRING, description: "Un color o paleta cromática sinestésica que represente el sonido." },
                synesthesiaReasoning: { type: Type.STRING, description: "Justificación de la elección de dicho color o paleta en relación a los timbres y acordes." }
              }
            },
            instrumentation: {
              type: Type.OBJECT,
              required: ["rhythmSection", "leadMelodyInstruments", "harmonyAccompanying", "synthesizersAndEffects", "vocalArrangement"],
              properties: {
                rhythmSection: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["instrument", "role", "details"],
                    properties: {
                      instrument: { type: Type.STRING, description: "Nombre del instrumento de ritmo (batería, bajo, percusión, beat electrónico, etc.)." },
                      role: { type: Type.STRING, description: "Función que cumple en el ritmo." },
                      details: { type: Type.STRING, description: "Detalles del sonido o timbre (ej. batería acústica seca, bajo de sintetizador saturado)." }
                    }
                  }
                },
                leadMelodyInstruments: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["instrument", "role", "details"],
                    properties: {
                      instrument: { type: Type.STRING, description: "Instrumentos melódicos principales (voz principal, guitarra solista, sintetizador lead, etc.)." },
                      role: { type: Type.STRING },
                      details: { type: Type.STRING }
                    }
                  }
                },
                harmonyAccompanying: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["instrument", "role", "details"],
                    properties: {
                      instrument: { type: Type.STRING, description: "Instrumentos armónicos de soporte (guitarra acústica rítmica, pianos, pads de fondo, etc.)." },
                      role: { type: Type.STRING },
                      details: { type: Type.STRING }
                    }
                  }
                },
                synthesizersAndEffects: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["instrument", "role", "details"],
                    properties: {
                      instrument: { type: Type.STRING, description: "Uso de capas de sintetizadores, efectos sonoros, samplers o texturas electrónicas." },
                      role: { type: Type.STRING },
                      details: { type: Type.STRING }
                    }
                  }
                },
                vocalArrangement: { type: Type.STRING, description: "Descripción del tratamiento vocal, técnicas de dobles de voz, coros, armonías vocales y uso de efectos vocales." }
              }
            },
            productionDeconstruction: {
              type: Type.OBJECT,
              required: ["dynamicStructure", "mixingTechniques", "keyProductionDetails"],
              properties: {
                dynamicStructure: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["section", "timestampRange", "description", "productionHighlight"],
                    properties: {
                      section: { type: Type.STRING, description: "Sección de la estructura (ej: Intro, Verso 1, Estribillo, Puente, Coda)." },
                      timestampRange: { type: Type.STRING, description: "Rango de tiempo de referencia o estimado (ej: 0:00 - 0:30)." },
                      description: { type: Type.STRING, description: "Qué sucede musicalmente en esta sección." },
                      productionHighlight: { type: Type.STRING, description: "Detalle técnico de producción prominente en esta parte (ej: remate de batería con paneo extremo, filtro de paso bajo en guitarras)." }
                    }
                  }
                },
                mixingTechniques: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["aspect", "description"],
                    properties: {
                      aspect: { type: Type.STRING, description: "Aspecto de mezcla (ej: Espacio y Reverb, Paneo e Imagen Estéreo, Compresión y Dinámica)." },
                      description: { type: Type.STRING, description: "Cómo es aplicado este aspecto en la mezcla de esta canción y qué efecto causa." }
                    }
                  }
                },
                keyProductionDetails: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Lista de 3 a 5 detalles de producción fascinantes o trucos de grabación usados por su productor."
                }
              }
            },
            overallTriviaAndImpact: {
              type: Type.OBJECT,
              required: ["impactTrivia"],
              properties: {
                impactTrivia: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Curiosidades sobre la composición de la canción, samples utilizados, influencia en la industria o datos técnicos notables de su grabación."
                }
              }
            },
            textReportFormatted: {
              type: Type.STRING,
              description: "Un reporte exhaustivo y completo en formato texto (Markdown) estructurado para exportación. Debe incluir todos los detalles cubiertos anteriormente organizados estéticamente con títulos claros."
            }
          }
        }
      }
    });

    const parsedData = safeParseJSON(response.text);
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error al analizar la canción:", error);
    res.status(500).json({ error: error.message || "Error interno del servidor al procesar la solicitud con Gemini." });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
