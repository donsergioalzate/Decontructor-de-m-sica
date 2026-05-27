import React from "react";
import { ProductionDeconstruction } from "../types";
import { SlidersHorizontal, Layers, Radio, Compass, Lightbulb, PlayCircle, EyeOff } from "lucide-react";

interface ProductionConsolesProps {
  production: ProductionDeconstruction;
}

export const ProductionConsoles: React.FC<ProductionConsolesProps> = ({ production }) => {
  return (
    <div className="space-y-8" id="production-consoles">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="p-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg">
          <SlidersHorizontal className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100 tracking-tight">Deconstrucción de Producción & Mezcla</h2>
          <p className="text-xs text-slate-400">Análisis detallado de la ingeniería de sonido y la estructura dinámica</p>
        </div>
      </div>

      {/* 1. Dynamic Song Structure Track Timeline (DAW style) */}
      <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-300" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest font-mono">Línea de Tiempo Multicanal (DAW Blocks)</h3>
          </div>
          <span className="text-[10px] bg-slate-950/80 text-amber-300 border border-white/10 px-2.5 py-1 rounded-full font-mono font-bold shadow-md select-none">ESTRUCTURA MAPPED</span>
        </div>

        <p className="text-xs text-slate-350 mb-6 font-light">
          Estructuración de bloques dinámicos y de transición técnica estimado por orden cronológico:
        </p>

        {/* Timeline block container */}
        <div className="space-y-4">
          {production.dynamicStructure.map((block, index) => {
            // Colors based on structure sections
            const isChorus = block.section.toLowerCase().includes("estribillo") || block.section.toLowerCase().includes("coro") || block.section.toLowerCase().includes("chorus");
            const isBridgeOrSolo = block.section.toLowerCase().includes("puente") || block.section.toLowerCase().includes("solo") || block.section.toLowerCase().includes("bridge");
            const blockBorder = isChorus ? "border-amber-500/40" : isBridgeOrSolo ? "border-purple-500/40" : "border-white/10";
            const blockBg = isChorus ? "bg-amber-500/5 group-hover:bg-amber-500/10" : isBridgeOrSolo ? "bg-purple-500/5 group-hover:bg-purple-500/10" : "bg-slate-950/60 group-hover:bg-slate-950/80";
            const sectionIconColor = isChorus ? "text-amber-300" : isBridgeOrSolo ? "text-purple-300" : "text-slate-400";

            return (
              <div 
                key={index} 
                className={`group border rounded-2xl overflow-hidden shadow-sm transition-all duration-300 ${blockBorder} ${blockBg}`}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
                  {/* Left Column: Segment Title & Time */}
                  <div className="md:col-span-3 bg-slate-900/80 p-4 border-b md:border-b-0 md:border-r border-white/10 flex md:flex-col justify-between md:justify-center gap-2 items-start md:items-stretch shadow-md">
                    <div className="flex items-center gap-2">
                      <PlayCircle className={`w-4 h-4 shrink-0 ${sectionIconColor}`} />
                      <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-tight">{block.section}</span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-350 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-550/20 max-w-fit mt-1">
                      ⌛ {block.timestampRange}
                    </span>
                  </div>

                  {/* Right Column: Audio & production details */}
                  <div className="md:col-span-9 p-4 flex flex-col justify-center space-y-2">
                    <p className="text-slate-250 text-sm leading-relaxed font-light">
                      {block.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-350 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-white/5">
                      <span className="text-amber-300 font-bold uppercase text-[9px] border border-amber-500/20 px-1 rounded bg-amber-550/5">Foco de Mezcla:</span>
                      <span className="truncate">{block.productionHighlight}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Mixing Techniques Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 shadow-lg backdrop-blur-2xl">
          <div className="flex items-center gap-2.5 mb-4 border-b border-white/10 pb-4">
            <Radio className="w-5 h-5 text-amber-300" />
            <h3 className="text-base font-bold text-slate-100 tracking-tight">Aspectos de Ingeniería y Mezcla</h3>
          </div>
          <div className="space-y-4">
            {production.mixingTechniques.map((mix, index) => (
              <div key={index} className="bg-slate-950/60 border border-white/10 rounded-[18px] p-4 font-mono shadow-[inner_0_2px_4px_rgba(0,0,0,0.4)]">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-widest block mb-1.5 border-b border-white/5 pb-1 select-none">
                  💡 {mix.aspect}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-extralight">
                  {mix.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Production Secrets (Grabaciones ocultas, micrófonos, ideas) */}
        <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 flex flex-col justify-between shadow-lg backdrop-blur-2xl">
          <div>
            <div className="flex items-center gap-2.5 mb-4 border-b border-white/10 pb-4">
              <Lightbulb className="w-5 h-5 text-amber-300" />
              <h3 className="text-base font-bold text-slate-100 tracking-tight">Secretos y Texturas del Productor</h3>
            </div>
            
            <p className="text-xs text-slate-350 mb-4 font-light">
              Decisiones técnicas inteligentes tomadas en el estudio de grabación para darle su sonido característico:
            </p>

            <div className="space-y-3.5">
              {production.keyProductionDetails.map((detail, index) => (
                <div key={index} className="flex gap-3 items-start select-none">
                  <div className="w-5 h-5 rounded-lg bg-amber-500/15 text-amber-300 text-[10px] font-bold font-mono py-0.5 text-center shrink-0 mt-0.5 border border-amber-500/25">
                    {index + 1}
                  </div>
                  <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-light">
                    {detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-mono uppercase bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
              <EyeOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Análisis deducido mediante inteligencia de espectro musical de Gemini</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
