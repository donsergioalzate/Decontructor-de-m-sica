import React, { useState } from "react";
import { Download, Copy, Share2, ClipboardCheck, FileText, CheckCircle } from "lucide-react";

interface ExportPanelProps {
  title: string;
  artist: string;
  reportMarkdown: string;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ title, artist, reportMarkdown }) => {
  const [copied, setCopied] = useState(false);

  const cleanFilename = `${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_deconstruction`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(reportMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Fallo al copiar texto: ", err);
    }
  };

  const downloadFile = (extension: "txt" | "md") => {
    const blob = new Blob([reportMarkdown], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${cleanFilename}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 md:p-8 space-y-6 shadow-[0_20px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl" id="export-panel-card">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1.5 px-3 bg-amber-500/10 text-amber-300 border border-amber-550/20 text-[10px] font-mono rounded-lg font-bold uppercase tracking-wider">
              TXT/MD RENDERER
            </div>
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">Reporte de Análisis Técnico</h2>
          </div>
          <p className="text-xs text-slate-350 font-light">Exporta o imprime el reporte estructurado completo deconstruido</p>
        </div>

        {/* Quick actions row */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={copyToClipboard}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/5 hover:bg-white/15 border border-white/10 text-slate-200 hover:text-white font-bold font-mono text-xs py-2.5 px-4 rounded-xl transition-all duration-200 active:scale-95"
          >
            {copied ? (
              <>
                <ClipboardCheck className="w-4 h-4 text-emerald-450 animate-bounce" />
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Reporte</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => downloadFile("txt")}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/5 hover:bg-white/15 border border-white/10 text-slate-200 hover:text-white font-bold font-mono text-xs py-2.5 px-4 rounded-xl transition-all duration-200 active:scale-95"
          >
            <FileText className="w-4 h-4" />
            <span>Descargar .txt</span>
          </button>

          <button
            type="button"
            onClick={() => downloadFile("md")}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-550/30 text-amber-300 font-bold font-mono text-xs py-2.5 px-4 rounded-xl transition-all duration-200 active:scale-95"
          >
            <Download className="w-4 h-4 animate-bounce" />
            <span>Descargar .md</span>
          </button>
        </div>
      </div>

      {/* Styled Markdown Text report Preview Container */}
      <div className="relative">
        <label htmlFor="markdown-preview-textarea" className="sr-only">Reporte de análisis técnico de la canción</label>
        <textarea
          id="markdown-preview-textarea"
          readOnly
          value={reportMarkdown}
          rows={14}
          className="w-full bg-slate-950/65 text-slate-300 font-mono text-xs rounded-2xl p-5 border border-white/10 outline-none leading-relaxed resize-y focus:border-amber-500/50 shadow-[inner_0_4px_12px_rgba(0,0,0,0.5)]"
        />
        <div className="absolute bottom-4 right-4 text-[9px] bg-slate-900/90 border border-white/5 text-slate-400 py-1 px-2.5 rounded-lg tracking-widest font-mono font-bold uppercase select-none">
          VISTA DE SÓLO-LECTURA
        </div>
      </div>

      {/* Print footer / recommendation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/60 border border-white/10 rounded-[20px] p-4 md:p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-450 shrink-0" />
          <p className="text-xs text-slate-350 max-w-md font-light">
            Listo para ser exportado a editores de DAW, blogs musicales, informes de clase o proyectos personales de audio.
          </p>
        </div>
        <button
          type="button"
          onClick={handlePrint}
          className="text-xs font-mono font-bold text-slate-400 hover:text-amber-350 underline decoration-dotted capitalize shrink-0 transition-colors"
        >
          🖨️ Abrir modo de impresión
        </button>
      </div>
    </div>
  );
};
