import React from "react";
import { SongMetadata } from "../types";
import { Calendar, Layers, Activity, Key, Sliders, Info, Clock } from "lucide-react";

interface MetadataHeaderProps {
  metadata: SongMetadata;
}

export const MetadataHeader: React.FC<MetadataHeaderProps> = ({ metadata }) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-[28px] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl" id="metadata-header-card">
      {/* DAW Header Panel */}
      <div className="bg-slate-950/60 border-b border-white/10 px-6 py-3.5 flex flex-wrap justify-between items-center gap-4 text-xs font-mono text-slate-355 select-none relative z-10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>ESTADO: DECONSTRUCCIÓN COMPLETADA</span>
        </div>
        <div className="flex items-center gap-4">
          <span>CANAL: STEREO L/R</span>
          <span>SAMPLED: 48 KHZ / 32-BIT FLOAT</span>
        </div>
      </div>

      <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Mock Disc Cover Artwork - VisionOS Premium Floating Cylinder Glass Cover */}
        <div className="lg:col-span-3 flex justify-center">
          <div className="relative group w-40 h-40 md:w-44 md:h-44 bg-gradient-to-tr from-amber-500 via-rose-600 to-indigo-800 rounded-[24px] shadow-[0_15px_30px_rgba(0,0,0,0.5)] flex flex-col justify-center items-center p-4 text-center border border-white/20 overflow-hidden select-none hover:scale-105 transition-all duration-300">
            {/* Ambient Record Ring */}
            <div className="absolute inset-2 border border-white/10 rounded-full"></div>
            <div className="absolute inset-6 border border-white/20 rounded-full animate-[spin_20s_linear_infinite]"></div>
            <div className="absolute inset-10 border border-white/30 rounded-full flex justify-center items-center">
              <div className="w-10 h-10 rounded-full bg-slate-950 border border-amber-500/40 flex items-center justify-center shadow-lg">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
              </div>
            </div>
            
            <div className="z-10 mt-auto w-full text-center">
              <h4 className="text-white text-xs font-bold leading-tight line-clamp-2 uppercase tracking-wider drop-shadow-md">
                {metadata.title}
              </h4>
              <p className="text-slate-200 text-[10px] uppercase font-mono mt-0.5 tracking-wider drop-shadow-md">
                {metadata.artist}
              </p>
            </div>
            
            <div className="absolute top-2 right-2 text-white/50 text-[8px] font-mono tracking-widest bg-slate-950/70 py-0.5 px-1.5 rounded uppercase font-bold">
              AUDIO HI-FI
            </div>
          </div>
        </div>

        {/* Text and Digital parameters */}
        <div className="lg:col-span-9 space-y-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 text-xs font-mono border border-amber-500/20 mb-3 uppercase tracking-wider">
              <Layers className="w-3 h-3" /> {metadata.genre || 'Género'}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-100 tracking-tight" id="song-title-head">
              {metadata.title}
            </h1>
            <p className="text-lg text-slate-300 font-medium mt-1">
              por <span className="text-amber-400">{metadata.artist}</span>
            </p>
          </div>

          {/* LED / LCD Console Display for technical figures */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950/60 border border-white/10 rounded-2xl p-4 md:p-5 font-mono shadow-[inner_0_4px_12px_rgba(0,0,0,0.4)]">
            {/* Year */}
            <div className="border-r border-white/10 last:border-r-0 pr-2">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-bold">
                <Calendar className="w-3.5 h-3.5 text-slate-450" /> Lanzamiento
              </div>
              <div className="text-lg md:text-xl font-bold text-amber-300 tracking-wider">
                {metadata.releasedYear}
              </div>
            </div>

            {/* Tempo */}
            <div className="border-r border-white/10 last:border-r-0 pl-2 md:pl-4 pr-2">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-bold">
                <Activity className="w-3.5 h-3.5 text-slate-450" /> Tempo
              </div>
              <div className="text-lg md:text-xl font-bold text-amber-300 tracking-wider flex items-baseline gap-1">
                {metadata.tempo}
              </div>
            </div>

            {/* Key */}
            <div className="border-r border-white/10 last:border-r-0 pl-2 md:pl-4 pr-2">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-bold">
                <Key className="w-3.5 h-3.5 text-slate-450" /> Tonalidad
              </div>
              <div className="text-lg md:text-xl font-bold text-amber-300 tracking-wider">
                {metadata.key}
              </div>
            </div>

            {/* Duration */}
            <div className="pl-2 md:pl-4">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-bold">
                <Clock className="w-3.5 h-3.5 text-slate-450" /> Duración
              </div>
              <div className="text-lg md:text-xl font-bold text-amber-300 tracking-wider">
                {metadata.durationEstimate}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
