import React from "react";
import { EmotionalAnalysis } from "../types";
import { Smile, Zap, Eye, Sparkles, Heart } from "lucide-react";

interface EmotionalMetricsProps {
  emotions: EmotionalAnalysis;
}

export const EmotionalMetrics: React.FC<EmotionalMetricsProps> = ({ emotions }) => {
  // Utility to map 1-10 scores to LED bars
  const renderVUMeter = (score: number, activeColorClass: string) => {
    return (
      <div className="flex items-center gap-1.5 h-10 w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-1 font-mono shadow-[inner_0_2px_6px_rgba(0,0,0,0.5)]">
        {[...Array(10)].map((_, i) => {
          const isActive = i < score;
          const barColor = i < 6 ? "bg-emerald-500/85" : i < 8 ? "bg-amber-500/85" : "bg-rose-500/85";
          return (
            <div
              key={i}
              className={`flex-1 h-5 rounded-sm transition-all duration-300 ${
                isActive ? barColor : "bg-slate-800/40"
              }`}
            />
          );
        })}
        <span className="text-xs font-bold text-slate-300 ml-2">{score}/10</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="emotional-metrics-grid">
      {/* Vibe and Journey Breakdown (left) */}
      <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 lg:col-span-7 flex flex-col justify-between space-y-6 shadow-[0_20px_40px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded border border-rose-500/20">
              <Heart className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">Vibración y Psicología de la Canción</h2>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed mb-5 italic border-l-2 border-amber-500/50 pl-4">
            "{emotions.vibeDescription}"
          </p>

          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Emociones Predominantes</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {emotions.primaryEmotions.map((emotion, index) => (
              <span
                key={index}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-100 text-xs font-semibold flex items-center gap-1.5 hover:bg-white/10 hover:border-white/20 transition-all duration-150 cursor-default"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                {emotion}
              </span>
            ))}
          </div>

          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Viaje y Arco Emocional</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            {emotions.emotionalJourney}
          </p>
        </div>

        {/* Meters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider mb-2 font-mono">
              <span className="flex items-center gap-1 font-semibold"><Zap className="w-3.5 h-3.5 text-amber-400" /> Energía Musical</span>
            </div>
            {renderVUMeter(emotions.energyLevel, "bg-amber-500")}
            <p className="text-[10px] text-slate-500 font-mono mt-1">
              {emotions.energyLevel >= 8 ? "Baja distorsión - Alta intensidad" : emotions.energyLevel >= 5 ? "Rítmica moderada - Dinámica media" : "Introspectiva - Acústica y sutil"}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider mb-2 font-mono">
              <span className="flex items-center gap-1 font-semibold"><Smile className="w-3.5 h-3.5 text-emerald-400" /> Valencia / Positividad</span>
            </div>
            {renderVUMeter(emotions.positivityValence, "bg-emerald-500")}
            <p className="text-[10px] text-slate-500 font-mono mt-1">
              {emotions.positivityValence >= 7 ? "Tono esperanzador / Mayoritario" : emotions.positivityValence >= 4 ? "Tono neutro / Melancolía moderada" : "Tono oscuro / Menor trágico"}
            </p>
          </div>
        </div>
      </div>

      {/* Synesthesia Corner (right) */}
      <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 lg:col-span-5 flex flex-col justify-between shadow-[0_20px_40px_rgba(0,0,0,0.4)] backdrop-blur-2xl" id="synesthesia-card">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-1.5 bg-purple-500/10 text-purple-350 rounded-xl border border-purple-500/20">
              <Eye className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">Asociación Sinestésica Visual</h2>
          </div>

          <p className="text-xs text-slate-350 mb-4 font-light">
            La sinestesia traduce las frecuencias de sonido, acordes y timbres armónicos en matices y paletas de color.
          </p>

          {/* Color box display */}
          <div className="relative rounded-2xl h-36 flex items-center justify-center overflow-hidden border border-white/15 group shadow-lg">
            {/* Ambient animated aura background */}
            <div 
              className="absolute inset-0 opacity-80 mix-blend-screen transition-all duration-1000 group-hover:scale-110"
              style={{
                background: `radial-gradient(circle at center, ${emotions.synesthesiaColor || '#3b82f6'}, #05060f_90%)`
              }}
            />
            {/* Glassmorphism panel */}
            <div className="z-10 bg-slate-950/85 border border-white/10 px-5 py-3.5 rounded-2xl text-center max-w-[85%] backdrop-blur-md shadow-lg">
              <p className="text-xs uppercase font-mono tracking-widest text-slate-400 font-semibold">Tono Cromático Asignado</p>
              <h4 className="text-sm font-bold text-amber-400 tracking-tight mt-1 capitalize leading-tight">
                {emotions.synesthesiaColor}
              </h4>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
            ¿Por qué este espectro cromático?
          </h4>
          <p className="text-slate-400 text-sm leading-relaxed">
            {emotions.synesthesiaReasoning}
          </p>
        </div>
      </div>
    </div>
  );
};
