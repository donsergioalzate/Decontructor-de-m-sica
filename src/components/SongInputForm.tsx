import React, { useState, useRef } from "react";
import { Music, Search, Disc, HelpCircle, Loader2, Upload, FileAudio, X, AlertCircle, Link2, Youtube, Radio, ExternalLink } from "lucide-react";

interface SongInputFormProps {
  onAnalyze: (
    title: string,
    artist: string,
    notes: string,
    fileData?: string,
    fileType?: string,
    fileName?: string,
    songLink?: string
  ) => void;
  isLoading: boolean;
}

const SUGGESTIONS = [
  { title: "Bohemian Rhapsody", artist: "Queen", genre: "Operatic Rock", desc: "Cambios de tempo salvajes, coros polifónicos de 180 pistas y dinámicas extremas." },
  { title: "Billie Jean", artist: "Michael Jackson", genre: "Synth-Pop / Funk", desc: "El icónico loop de bajo analógico, batería seca y procesamientos de reverberación avanzados de Bruce Swedien." },
  { title: "Comfortably Numb", artist: "Pink Floyd", genre: "Progressive Rock", desc: "Dos cantantes contrastantes, texturas densas de sintetizador rústico y uno de los solos de guitarra con delay/phase más icónicos de la historia." },
  { title: "De Música Ligera", artist: "Soda Stereo", genre: "Rock Latino", desc: "Un riff circular arrollador, un baterista implacable y una de las producciones de rock alternativo en español con mayor pegada de los 90." },
  { title: "Starboy", artist: "The Weeknd ft. Daft Punk", genre: "Electro-Pop", desc: "Pulsación rítmica techno-funk armada por Daft Punk, un sintetizador de subgraves imponente y capas vocales sutiles de alta frecuencia." }
];

export const SongInputForm: React.FC<SongInputFormProps> = ({ onAnalyze, isLoading }) => {
  const [activeTab, setActiveTab] = useState<"text" | "upload" | "link">("text");
  
  // Input states per tab to prevent bleed and cross-contamination
  const [textTitle, setTextTitle] = useState("");
  const [textArtist, setTextArtist] = useState("");
  
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadArtist, setUploadArtist] = useState("");
  
  const [linkTitle, setLinkTitle] = useState("");
  const [linkArtist, setLinkArtist] = useState("");
  
  const [notes, setNotes] = useState("");
  const [songLink, setSongLink] = useState("");
  
  // Audio upload state
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioBase64, setAudioBase64] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    setFileError(null);
    
    // Check size (around 15MB max for reasonable base64 transfers in free tiers)
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setFileError(`El archivo supera el límite de 15MB. Tu archivo mide ${(file.size / (1024 * 1024)).toFixed(1)}MB.`);
      return;
    }

    setAudioFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAudioBase64(reader.result);
      }
    };
    reader.onerror = () => {
      setFileError("Fallo de lectura del archivo de audio.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isLoading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isLoading) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const validAudioTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/m4a", "audio/x-m4a", "audio/ogg", "audio/aac", "audio/flac"];
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      const validExts = ["mp3", "wav", "m4a", "ogg", "aac", "flac"];

      if (validAudioTypes.includes(file.type) || validExts.includes(ext)) {
        handleFileChange(file);
      } else {
        setFileError("Formato no soportado. Sube un archivo de audio (.mp3, .wav, .m4a, .ogg, .flac).");
      }
    }
  };

  const handleRemoveFile = () => {
    setAudioFile(null);
    setAudioBase64("");
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === "text") {
      if (!textTitle.trim()) return;
      onAnalyze(textTitle.trim(), textArtist.trim(), notes.trim());
    } else if (activeTab === "upload") {
      if (!audioFile) {
        setFileError("Por favor, sube un archivo de audio antes de iniciar.");
        return;
      }
      onAnalyze(
        uploadTitle.trim() || audioFile.name.replace(/\.[^/.]+$/, ""),
        uploadArtist.trim(),
        notes.trim(),
        audioBase64 || undefined,
        audioFile.type || undefined,
        audioFile.name || undefined
      );
    } else if (activeTab === "link") {
      if (!songLink.trim()) {
        setFileError("Por favor, introduce un enlace válido.");
        return;
      }
      onAnalyze(
        linkTitle.trim(),
        linkArtist.trim(),
        notes.trim(),
        undefined,
        undefined,
        undefined,
        songLink.trim()
      );
    }
  };

  const handleSelectSuggestion = (suggestedTitle: string, suggestedArtist: string) => {
    setActiveTab("text");
    setTextTitle(suggestedTitle);
    setTextArtist(suggestedArtist);
    setLinkTitle("");
    setLinkArtist("");
    setUploadTitle("");
    setUploadArtist("");
    handleRemoveFile();
    setSongLink("");
    onAnalyze(suggestedTitle, suggestedArtist, "");
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 md:p-8 backdrop-blur-2xl shadow-[0_20px_40px_rgba(0,0,0,0.55)] hover:border-white/15 transition-all duration-300 space-y-6" id="song-input-card">
      {/* Title block */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="p-2.5 bg-amber-500/10 text-amber-300 rounded-2xl border border-amber-550/20 shadow-inner">
          <Music className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Agregar Canción para Métricas</h2>
          <p className="text-xs text-slate-350">Analiza el espectro armónico, timbre e instrumentación con tecnología inteligente</p>
        </div>
      </div>

      {/* Tabs Switcher for the 3 options - VisionOS Capsule design */}
      <div className="grid grid-cols-3 gap-1 bg-slate-950/60 p-1 border border-white/5 rounded-2xl backdrop-blur-md" id="input-options-selector">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => {
            setActiveTab("text");
            setFileError(null);
          }}
          className={`py-2.5 px-2 text-xs md:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 ${
            activeTab === "text"
              ? "bg-white/15 text-white border border-white/10 shadow-lg"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Datos / Buscar</span>
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => {
            setActiveTab("upload");
            setFileError(null);
          }}
          className={`py-2.5 px-2 text-xs md:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 ${
            activeTab === "upload"
              ? "bg-white/15 text-white border border-white/10 shadow-lg"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Subir Audio/MP3</span>
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => {
            setActiveTab("link");
            setFileError(null);
          }}
          className={`py-2.5 px-2 text-xs md:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 ${
            activeTab === "link"
              ? "bg-white/15 text-white border border-white/10 shadow-lg"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>Pegar Enlace</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* OPTION 1: TEXT FORM (Search) */}
        {activeTab === "text" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            <div>
              <label htmlFor="song-title-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
                Título de la Canción <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                  <Music className="w-4 h-4" />
                </span>
                <input
                  id="song-title-input"
                  type="text"
                  required
                  disabled={isLoading}
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  placeholder="Ej. Bohemian Rhapsody, Billie Jean..."
                  className="w-full bg-slate-950/85 text-slate-100 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 rounded-xl py-2.5 pl-10 pr-4 text-sm placeholder-slate-550 outline-none transition duration-200"
                />
              </div>
            </div>

            <div>
              <label htmlFor="song-artist-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
                Artista / Banda <span className="text-slate-500">(Opcional)</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                  <Disc className="w-4 h-4" />
                </span>
                <input
                  id="song-artist-input"
                  type="text"
                  disabled={isLoading}
                  value={textArtist}
                  onChange={(e) => setTextArtist(e.target.value)}
                  placeholder="Ej. Queen, Michael Jackson..."
                  className="w-full bg-slate-950/85 text-slate-100 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 rounded-xl py-2.5 pl-10 pr-4 text-sm placeholder-slate-550 outline-none transition duration-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* OPTION 2: MULTIMEDIA FILE UPLOAD (.MP3, etc) */}
        {activeTab === "upload" && (
          <div className="space-y-4 animate-fade-in" id="audio-upload-dropzone">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept="audio/*"
              disabled={isLoading}
              className="hidden"
            />
            
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={isLoading ? undefined : triggerFileSelect}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition duration-200 cursor-pointer flex flex-col items-center justify-center space-y-3 ${
                isDragging
                  ? "border-amber-500 bg-amber-500/10 text-amber-400 shadow-md scale-[1.01]"
                  : audioFile
                  ? "border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400"
                  : "border-slate-800 hover:border-amber-500/30 bg-slate-950/40 hover:bg-slate-950/80 text-slate-400"
              }`}
            >
              {audioFile ? (
                <div className="w-full flex items-center justify-between gap-4 bg-slate-950/60 p-4 rounded-xl border border-emerald-500/20">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 shrink-0">
                      <FileAudio className="w-6 h-6 animate-bounce" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200 truncate max-w-[200px] sm:max-w-md">{audioFile.name}</p>
                      <p className="text-[10px] font-mono text-slate-500 uppercase">
                        {(audioFile.size / (1024 * 1024)).toFixed(2)} MB • Listo para transmisión
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                    className="p-1 px-2.5 rounded-lg text-slate-400 hover:text-red-400 bg-slate-900 hover:bg-slate-900 border border-slate-800 flex items-center gap-1 text-[10px] md:text-xs font-mono transition duration-150"
                  >
                    <X className="w-3.5 h-3.5" /> Quitar
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-white/5 rounded-full border border-white/5 text-slate-300">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">
                      Arrastra tu archivo MP3 / audio aquí o haz clic para subir
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      Soporta .mp3, .wav, .m4a, .ogg hasta 15MB • La IA decodará las ondas armónicas e instrumentación real
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Optional helper metadata fields for upload to make analysis hyper-precise */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-850">
              <div>
                <label htmlFor="song-title-upload" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Título de la obra (Opcional - Reemplazar nombre del archivo)
                </label>
                <input
                  id="song-title-upload"
                  type="text"
                  disabled={isLoading}
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder={audioFile ? audioFile.name.replace(/\.[^/.]+$/, "") : "Ej: Mi Canción Demo 24"}
                  className="w-full bg-slate-900 text-slate-250 border border-slate-800 focus:border-amber-500/50 rounded-lg py-2 px-3 text-xs outline-none transition"
                />
              </div>
              <div>
                <label htmlFor="song-artist-upload" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Artista / Banda (Opcional)
                </label>
                <input
                  id="song-artist-upload"
                  type="text"
                  disabled={isLoading}
                  value={uploadArtist}
                  onChange={(e) => setUploadArtist(e.target.value)}
                  placeholder="Ej: Banda Propia, Artista Desconocido..."
                  className="w-full bg-slate-900 text-slate-250 border border-slate-800 focus:border-amber-500/50 rounded-lg py-2 px-3 text-xs outline-none transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* OPTION 3: WEB LINKS (Spotify, YT, Deezer, etc.) */}
        {activeTab === "link" && (
          <div className="space-y-4 animate-fade-in" id="link-input-group">
            <div>
              <label htmlFor="song-link-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5 flex justify-between">
                <span>Enlace Sónico <span className="text-amber-400">*</span></span>
                <span className="text-[10px] text-amber-400/85 bg-amber-500/10 px-2 py-0.5 rounded font-mono border border-amber-500/10">PREMIUM ANALYSER</span>
              </label>
              
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                  <Link2 className="w-4 h-4" />
                </span>
                <input
                  id="song-link-input"
                  type="url"
                  required
                  disabled={isLoading}
                  value={songLink}
                  onChange={(e) => setSongLink(e.target.value)}
                  placeholder="Pega el enlace de Spotify, Apple Music, Deezer, YouTube, SoundCloud..."
                  className="w-full bg-slate-950/85 text-slate-100 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 rounded-xl py-3 pl-10 pr-4 text-sm placeholder-slate-550 outline-none transition duration-200"
                />
              </div>
            </div>

            {/* Interactive Badge/Logos list */}
            <div className="flex flex-wrap items-center gap-3 py-1 text-slate-400 border border-slate-850 bg-slate-950/40 p-3 rounded-xl">
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-500">Soportamos:</span>
              <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/10 text-[10px] font-semibold flex items-center gap-1 font-mono">
                🟢 Spotify
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/10 text-[10px] font-semibold flex items-center gap-1 font-mono">
                🎵 Apple Music
              </span>
              <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/10 text-[10px] font-semibold flex items-center gap-1 font-mono">
                🔴 YouTube
              </span>
              <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/10 text-[10px] font-semibold flex items-center gap-1 font-mono">
                📱 Deezer
              </span>
              <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/10 text-[10px] font-semibold flex items-center gap-1 font-mono font-sans">
                🔥 SoundCloud
              </span>
            </div>

            {/* Optional Metadata helper for Link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-850">
              <div>
                <label htmlFor="song-title-link" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Título (Opcional si es conocido para guiar a la IA)
                </label>
                <input
                  id="song-title-link"
                  type="text"
                  disabled={isLoading}
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="Ej: Starboy"
                  className="w-full bg-slate-900 text-slate-250 border border-slate-800 focus:border-amber-500/50 rounded-lg py-2 px-3 text-xs outline-none transition"
                />
              </div>
              <div>
                <label htmlFor="song-artist-link" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Artista / Banda (Opcional)
                </label>
                <input
                  id="song-artist-link"
                  type="text"
                  disabled={isLoading}
                  value={linkArtist}
                  onChange={(e) => setLinkArtist(e.target.value)}
                  placeholder="Ej: The Weeknd"
                  className="w-full bg-slate-900 text-slate-250 border border-slate-800 focus:border-amber-500/50 rounded-lg py-2 px-3 text-xs outline-none transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* SHARED ADVANCED FOCUS NOTES FIELD */}
        <div id="advanced-instructions-section">
          <label htmlFor="song-notes-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
            ¿En qué detalles de producción o emoción te gustaría enfocarte? <span className="text-slate-500">(Opcional)</span>
          </label>
          <div className="relative">
            <span className="absolute top-3 left-3 text-slate-500 pointer-events-none">
              <HelpCircle className="w-4 h-4" />
            </span>
            <textarea
              id="song-notes-input"
              rows={2}
              disabled={isLoading}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. 'Me interesa el brillo estéreo de los sintetizadores' o '¿Cómo deconstruyen las frecuencias medias de la guitarra?'"
              className="w-full bg-slate-950/85 text-slate-100 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 rounded-xl py-2.5 pl-10 pr-4 text-sm placeholder-slate-550 outline-none transition duration-200 resize-none font-sans"
            />
          </div>
        </div>

        {/* Global Error Notice for Input Area */}
        {fileError && (
          <div className="text-xs text-rose-400 flex items-center gap-1.5 font-mono bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{fileError}</span>
          </div>
        )}

        {/* Run Search / Analyze Button */}
        <button
          type="submit"
          disabled={
            isLoading ||
            (activeTab === "text" && !textTitle.trim()) ||
            (activeTab === "upload" && !audioFile) ||
            (activeTab === "link" && !songLink.trim())
          }
          id="analyse-submit-btn"
          className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-bold tracking-widest uppercase text-xs py-4 px-6 rounded-2xl shadow-[0_4px_24px_rgba(245,158,11,0.2)] hover:shadow-[0_4px_30px_rgba(245,158,11,0.35)] active:scale-[0.99] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analizando espectro armónico y frecuencias...</span>
            </>
          ) : (
            <>
              {activeTab === "text" && (
                <>
                  <Search className="w-4 h-4" />
                  <span>Iniciar Deconstrucción AI</span>
                </>
              )}
              {activeTab === "upload" && (
                <>
                  <FileAudio className="w-4 h-4" />
                  <span>Escuchar & Deconstruir Audio Subido</span>
                </>
              )}
              {activeTab === "link" && (
                <>
                  <ExternalLink className="w-4 h-4" />
                  <span>Procesar Enlace & Deconstruir Obra</span>
                </>
              )}
            </>
          )}
        </button>
      </form>

      {/* Suggestion Section */}
      <div className="mt-8 border-t border-white/10 pt-6">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3.5 font-mono">Prueba rápida con clásicos sugeridos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {SUGGESTIONS.map((s, index) => (
            <button
              key={index}
              type="button"
              disabled={isLoading}
              onClick={() => handleSelectSuggestion(s.title, s.artist)}
              className="text-left bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 rounded-2xl p-3.5 transition-all duration-200 group disabled:opacity-40 shadow-sm hover:shadow-md"
            >
              <div className="flex justify-between items-start gap-1 pb-1">
                <span className="text-xs font-bold text-slate-200 truncate group-hover:text-amber-400 block max-w-full transition-colors font-sans">
                  {s.title}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block truncate mb-1">
                {s.artist}
              </span>
              <p className="text-[9px] text-slate-400 line-clamp-2 leading-snug">
                {s.desc}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
