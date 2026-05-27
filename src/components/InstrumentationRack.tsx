import React from "react";
import { Instrumentation } from "../types";
import { Sliders, Mic, Music, Compass, Volume2, Cpu } from "lucide-react";

interface InstrumentationRackProps {
  instrumentation: Instrumentation;
}

export const InstrumentationRack: React.FC<InstrumentationRackProps> = ({ instrumentation }) => {
  // Safe accessor to display empty states if needed
  const renderInstrumentCategory = (
    title: string,
    items: { instrument: string; role: string; details: string }[] | undefined,
    icon: React.ReactNode,
    subtitle: string
  ) => {
    return (
      <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 flex flex-col justify-between shadow-lg backdrop-blur-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="text-amber-300">
              {icon}
            </div>
            <h3 className="text-sm font-bold text-slate-100 tracking-tight uppercase tracking-widest">{title}</h3>
          </div>
          <p className="text-[10px] text-slate-355 font-mono mb-4">{subtitle}</p>

          <div className="space-y-3">
            {(!items || items.length === 0) ? (
              <p className="text-xs text-slate-500 font-mono italic">No se detectaron pistas primarias en este rango.</p>
            ) : (
              items.map((it, idx) => (
                <div key={idx} className="bg-slate-950/60 border border-white/15 rounded-xl p-3 font-mono shadow-[inner_0_2px_4px_rgba(0,0,0,0.4)]">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xs font-bold text-amber-300">{it.instrument}</span>
                    <span className="text-[9px] text-slate-350 font-bold bg-slate-900 border border-white/5 px-1.5 py-0.5 rounded uppercase max-w-[50%] truncate">
                      {it.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-extralight leading-relaxed">
                    {it.details}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6" id="instrumentation-rack">
      {/* Intro section detail */}
      <div className="flex items-center gap-2.5 mb-2">
        <div className="p-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg">
          <Sliders className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100 tracking-tight">Rack de Instrumentación & Timbres</h2>
          <p className="text-xs text-slate-400">Desglose de capas y funciones de los timbres que estructuran el sonido</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {renderInstrumentCategory(
          "Sección Rítmica",
          instrumentation.rhythmSection,
          <Music className="w-4 h-4" />,
          "BATERÍAS, BEATS, BAJOS Y PERCUSIONES"
        )}

        {renderInstrumentCategory(
          "Melodía Líder",
          instrumentation.leadMelodyInstruments,
          <Compass className="w-4 h-4" />,
          "VOCES PRINCIPALES Y GUITARRAS SOLISTAS"
        )}

        {renderInstrumentCategory(
          "Armonía y Soporte",
          instrumentation.harmonyAccompanying,
          <Volume2 className="w-4 h-4" />,
          "ACOMPAÑAMIENTOS, TECLADOS Y ACORDES"
        )}

        {renderInstrumentCategory(
          "Sintetizadores & FX",
          instrumentation.synthesizersAndEffects,
          <Cpu className="w-4 h-4" />,
          "PADS ELECTRÓNICOS Y MUESTRAS SONORAS"
        )}
      </div>

      {/* Vocal Arrangement Detail Block */}
      <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 shadow-md backdrop-blur-xl">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-1.5 bg-amber-500/10 text-amber-300 rounded-xl border border-amber-550/20">
            <Mic className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest font-mono">Diseño de Voces y Arreglo Coral</h3>
        </div>
        <p className="text-slate-205 text-sm leading-relaxed font-light">
          {instrumentation.vocalArrangement || "Análisis del diseño vocal en proceso..."}
        </p>
      </div>
    </div>
  );
};
