import React, { useState } from "react";
import { SongInputForm } from "./components/SongInputForm";
import { MetadataHeader } from "./components/MetadataHeader";
import { EmotionalMetrics } from "./components/EmotionalMetrics";
import { InstrumentationRack } from "./components/InstrumentationRack";
import { ProductionConsoles } from "./components/ProductionConsoles";
import { ExportPanel } from "./components/ExportPanel";
import { AudioPlayerController } from "./components/AudioPlayerController";
import { SongAnalysisResponse } from "./types";
import { Disc, Sparkles, Loader2, RefreshCw, Layers, Sliders, Cpu, Heart, CheckCircle, Info } from "lucide-react";

export default function App() {
  const [analysis, setAnalysis] = useState<SongAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeMedia, setActiveMedia] = useState<{
    title: string;
    artist?: string;
    audioUrl?: string;
    songLink?: string;
  } | null>(null);

  const handleAnalyze = async (
    title: string,
    artist: string,
    notes: string,
    fileData?: string,
    fileType?: string,
    fileName?: string,
    songLink?: string
  ) => {
    setIsLoading(true);
    setError(null);
    
    // Guardar los recursos de audio/pista para que la interfaz pueda desplegar el reproductor interactivo
    setActiveMedia({
      title: title || fileName?.replace(/\.[^/.]+$/, "") || "Obra Sónica de Audio",
      artist: artist || "Canal de Audio Local",
      audioUrl: fileData,
      songLink: songLink
    });

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          artist,
          userNotes: notes,
          fileData,
          fileType,
          fileName,
          songLink
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Algo salió mal procesando el análisis de sonido.");
      }

      const data: SongAnalysisResponse = await res.json();
      setAnalysis(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "No se pudo completar la deconstrucción de la canción. Por favor, reintenta.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setError(null);
    setActiveMedia(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a16] via-[#0b0c1b] to-[#05050f] text-slate-100 flex flex-col justify-between relative overflow-x-hidden font-sans select-none" id="app-frosted-glass-frame">
      {/* Immersive VisionOS-style Mesh Gradient Blur Orbs */}
      <div className="absolute top-[-15%] left-[-15%] w-[600px] h-[600px] md:w-[850px] md:h-[850px] bg-gradient-to-tr from-indigo-600/20 to-purple-500/10 rounded-full blur-[160px] pointer-events-none animate-[pulse_10s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] md:w-[750px] md:h-[750px] bg-gradient-to-tl from-amber-500/15 to-rose-500/5 rounded-full blur-[140px] pointer-events-none animate-[pulse_8s_ease-in-out_infinite_1s]"></div>
      <div className="absolute top-[35%] left-[25%] w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[130px] pointer-events-none"></div>

      {/* Main Content Layout */}
      <div className="relative z-10 flex-grow max-w-7xl w-full mx-auto p-4 md:p-8 space-y-8 flex flex-col h-full">
        {/* Upper Brand Nav Block - Sleek Apple Glass design */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 backdrop-blur-2xl border border-white/10 p-5 rounded-[28px] shadow-[0_12px_40px_0_rgba(0,0,0,0.3)] hover:border-white/15 transition-all duration-300" id="main-app-header">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-600 text-slate-950 rounded-2xl flex items-center justify-center shadow-[0_0_20px_0_rgba(245,158,11,0.25)] shrink-0">
              <Disc className="w-6 h-6 animate-[spin_6s_linear_infinite]" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-1.5 font-mono">
                DECONSTRUCTOR<span className="text-amber-400 font-light tracking-[0.05em]">AI</span>
              </h1>
              <p className="text-[9px] text-slate-350 tracking-widest uppercase font-bold bg-white/5 py-0.5 px-2 rounded-full border border-white/5">Análisis Espectral & Timbres</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {analysis && (
              <button
                onClick={handleReset}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-amber-400/40 text-[11px] font-mono font-bold py-2.5 px-5 rounded-full transition-all duration-200 text-slate-100 hover:shadow-[0_0_15px_rgba(251,191,36,0.15)] focus:outline-none"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin-[12s]" />
                <span>Analizar Otra</span>
              </button>
            )}
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-300 font-mono bg-white/5 border border-white/10 px-4 py-2 rounded-full">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-450 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.7)]"></span>
              <span>VISION GLASSTECH PRO</span>
            </div>
          </div>
        </header>

        {/* Dashboard Panels */}
        <main className="flex-grow space-y-8">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-[24px] backdrop-blur-xl shadow-lg" id="error-banner">
              <div className="flex items-start gap-3">
                <span className="text-rose-450 font-bold font-mono text-sm uppercase px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 select-none">⚠️ Alerta:</span>
                <div>
                  <h4 className="text-sm font-bold text-slate-100 mb-1">Error de Procesamiento de Audio</h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!analysis && !isLoading && (
            <div className="space-y-6">
              {/* Splash Welcome Promo */}
              <div className="bg-gradient-to-tr from-white/10 to-white/0 backdrop-blur-2xl border border-white/10 rounded-[36px] p-6 md:p-10 relative overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]" id="splash-welcome">
                {/* Visual Glass Accent Reflector Ring */}
                <div className="absolute top-[-50px] right-[-50px] w-48 h-48 rounded-full bg-white/5 border border-white/10 blur-[2px] pointer-events-none"></div>
                
                <div className="max-w-2xl relative z-10 space-y-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-mono border border-amber-550/20 uppercase tracking-widest font-semibold">
                    <Sparkles className="w-3 h-3 text-amber-400" /> Deconstrucción Espectral Inteligente
                  </span>
                  <h2 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-350 tracking-tight leading-none md:leading-tight">
                    Comprende la Ciencia, Emoción e Ingeniería de tu Música
                  </h2>
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed md:font-light">
                    Introduce cualquier título, sube archivos de producción o comparte un enlace sónico. Nuestro motor con IA deconstruirá de inmediato la firma espectral de tus canciones favoritas.
                  </p>
                </div>
                {/* Wave Decorative Canvas */}
                <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-20 pointer-events-none hidden lg:flex items-center justify-center">
                  <div className="flex items-end gap-1.5 h-1/2">
                    {[35, 75, 55, 95, 40, 20, 65, 85, 30, 48, 92, 72, 25, 55, 80].map((h, i) => (
                      <div key={i} className="w-2.5 bg-gradient-to-t from-amber-500/90 to-amber-300 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.3)]" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Selection Form */}
              <SongInputForm onAnalyze={handleAnalyze} isLoading={isLoading} />
            </div>
          )}

          {isLoading && (
            <div className="bg-white/5 backdrop-blur-2xl border border-white/15 rounded-[36px] p-12 text-center flex flex-col items-center justify-center space-y-8 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.7)]" id="loading-panel">
              <div className="relative">
                {/* Holographic Glowing Pulse */}
                <div className="absolute inset-[-15px] rounded-full bg-amber-500/10 blur-xl animate-pulse"></div>
                <div className="w-24 h-24 rounded-full border-4 border-white/10 border-t-amber-400 animate-spin flex items-center justify-center relative z-10 shadow-[inner_0_4px_12px_rgba(255,255,255,0.05)] bg-slate-950/60 backdrop-blur-sm">
                  <Disc className="w-10 h-10 text-amber-450 animate-pulse" />
                </div>
                <span className="absolute bottom-[-6px] right-[-4px] bg-slate-900 px-2.5 py-0.5 rounded text-[8px] font-mono border border-white/10 text-amber-305 font-bold tracking-widest uppercase shadow-md z-20">
                  DSP CORE L3
                </span>
              </div>

              <div className="space-y-3 max-w-lg relative z-10">
                <h3 className="text-xl font-bold text-slate-100 tracking-tight">Deconstruyendo pistas y espectro armónico...</h3>
                <p className="text-xs text-slate-350 leading-relaxed font-mono">
                  Escuchando capas de reverberación, osciladores, ecualizaciones estéreo y extrayendo claves tonales. El proceso de computación cuántica de Gemini finaliza en un instante.
                </p>
              </div>

              {/* Liquid audio loader indicator */}
              <div className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-950/80 rounded-full border border-white/10 max-w-xs w-full select-none justify-center shadow-lg relative z-10">
                <span className="w-1.5 h-4 bg-amber-400/80 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                <span className="w-1.5 h-7 bg-amber-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-3 bg-amber-400/60 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                <span className="w-1.5 h-8 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                <span className="w-1.5 h-5 bg-amber-500/80 rounded-full animate-bounce [animation-delay:0.5s]"></span>
              </div>
            </div>
          )}

          {analysis && !isLoading && (
            <div className="space-y-10 animate-fade-in" id="analysis-results">
              {/* 1. Header Information & BPM */}
              <MetadataHeader metadata={analysis.metadata} />

              {/* 1.5. Consola de Escucha Interactiva Estilo Apple VisionOS */}
              {activeMedia && (
                <AudioPlayerController
                  title={activeMedia.title || analysis.metadata.title}
                  artist={activeMedia.artist !== "Canal de Audio Local" ? (activeMedia.artist || analysis.metadata.artist) : analysis.metadata.artist}
                  audioUrl={activeMedia.audioUrl}
                  songLink={activeMedia.songLink}
                />
              )}

              {/* 2. Emotional Specs and Synesthesia Color Aura */}
              <EmotionalMetrics emotions={analysis.emotionalAnalysis} />

              {/* 3. Instrument cap/layer rack */}
              <InstrumentationRack instrumentation={analysis.instrumentation} />

              {/* 4. Production, DAW Timeline, EQ & FX */}
              <ProductionConsoles production={analysis.productionDeconstruction} />

              {/* 5. Overall Impact Trivia & Trivia */}
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[28px] p-6 md:p-8 shadow-[0_20px_40px_rgba(0,0,0,0.5)]" id="trivia-panel">
                <div className="flex items-center gap-2.5 mb-5 border-b border-white/10 pb-4">
                  <div className="p-2 bg-amber-500/10 text-amber-300 border border-amber-550/20 rounded-xl">
                    <Info className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest font-mono">Curiosidades de Estudio & Impacto</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                  {analysis.overallTriviaAndImpact.impactTrivia.map((item, idx) => (
                    <div key={idx} className="bg-slate-950/50 border border-white/5 p-4 rounded-xl flex gap-3 hover:border-white/10 transition-colors">
                      <span className="text-amber-400 text-xs mt-0.5 font-bold font-mono">✦</span>
                      <p className="text-slate-350 leading-relaxed font-light text-xs md:text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. Text report export & file downloading options */}
              <ExportPanel 
                title={analysis.metadata.title} 
                artist={analysis.metadata.artist} 
                reportMarkdown={analysis.textReportFormatted} 
              />
            </div>
          )}
        </main>
      </div>

      {/* Styled Footer status board */}
      <footer className="relative z-10 py-5 border-t border-white/10 mt-12 bg-slate-950/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-2.5 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-mono">
          <div>Engine: Deconstructor AI v3.5 • Analizador Sónico de Espectro</div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Procesado con persistencia de canal híbrido y Gemini
          </div>
        </div>
      </footer>
    </div>
  );
}
