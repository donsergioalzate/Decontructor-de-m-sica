import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Youtube, Music, Radio, Laptop, ExternalLink, HelpCircle } from "lucide-react";

interface AudioPlayerControllerProps {
  title: string;
  artist?: string;
  audioUrl?: string; // Local sound blob URL
  songLink?: string;  // Direct sound link (Spotify, YT, etc)
}

export const AudioPlayerController: React.FC<AudioPlayerControllerProps> = ({
  title,
  artist = "Artista desconocido",
  audioUrl,
  songLink
}) => {
  // Local audio tag states
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);

  // Real-time Web Audio API and Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [visualMode, setVisualMode] = useState<"bars" | "wave">("bars");

  // Parse URLs to detect provider (YouTube, Spotify, SoundCloud, or general iframe embeds)
  const getEmbedTypeAndUrl = (): { type: "youtube" | "spotify" | "generic" | "none"; url: string } => {
    if (audioUrl) {
      return { type: "none", url: "" };
    }

    const trimmedLink = songLink?.trim() || "";
    if (!trimmedLink) {
      // If we don't have a direct link but we have title and search, we can search on YouTube
      const query = encodeURIComponent(`${title} ${artist}`.trim());
      return {
        type: "youtube",
        url: `https://www.youtube.com/embed?listType=search&list=${query}&autoplay=0&hl=es&modestbranding=1&rel=0`
      };
    }

    // YouTube checks
    const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const ytMatch = trimmedLink.match(ytRegex);
    if (ytMatch && ytMatch[1]) {
      return {
        type: "youtube",
        url: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&hl=es&modestbranding=1&rel=0`
      };
    }

    // Spotify checks
    if (trimmedLink.includes("spotify.com")) {
      const trackRegex = /track\/([a-zA-Z0-9]{22})/;
      const trackMatch = trimmedLink.match(trackRegex);
      if (trackMatch && trackMatch[1]) {
        return {
          type: "spotify",
          url: `https://open.spotify.com/embed/track/${trackMatch[1]}?utm_source=generator&theme=0`
        };
      }
      const playlistRegex = /playlist\/([a-zA-Z0-9]{22})/;
      const playlistMatch = trimmedLink.match(playlistRegex);
      if (playlistMatch && playlistMatch[1]) {
        return {
          type: "spotify",
          url: `https://open.spotify.com/embed/playlist/${playlistMatch[1]}?utm_source=generator&theme=0`
        };
      }
      const albumRegex = /album\/([a-zA-Z0-9]{22})/;
      const albumMatch = trimmedLink.match(albumRegex);
      if (albumMatch && albumMatch[1]) {
        return {
          type: "spotify",
          url: `https://open.spotify.com/embed/album/${albumMatch[1]}?utm_source=generator&theme=0`
        };
      }
    }

    // Return direct embedded player link if it is already an embed or fallback to search
    if (trimmedLink.includes("/embed")) {
      return { type: "generic", url: trimmedLink };
    }

    // Default fallback: Search YT so the user gets instant audio for free!
    const query = encodeURIComponent(`${title} ${artist}`.trim());
    return {
      type: "youtube",
      url: `https://www.youtube.com/embed?listType=search&list=${query}&autoplay=0&hl=es&modestbranding=1&rel=0`
    };
  };

  const mediaSource = getEmbedTypeAndUrl();

  // Handle local HTML5 Audio element interactions
  useEffect(() => {
    if (audioUrl) {
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.load();
        setIsPlaying(false);
        setCurrentTime(0);
      }
    }
  }, [audioUrl]);

  // Audio events
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    // Standard high fidelity Web Audio Graph initialization
    if (!audioContextRef.current) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256; 
        analyser.smoothingTimeConstant = 0.82;
        
        // Single connection guard prevents "already connected" Web Audio API throw
        const source = ctx.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(ctx.destination);
        
        audioContextRef.current = ctx;
        analyserRef.current = analyser;
        sourceRef.current = source;
      } catch (err) {
        console.error("No se pudo iniciar el Analizador de Audio Web:", err);
      }
    }

    // Resume suspended audio contexts (Autoplay restrictions bypass)
    if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Audio playback interrupted: ", err);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    if (vol > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioRef.current.muted = nextMute;
  };

  // Format seconds to mm:ss
  const formatTime = (timeInSecs: number) => {
    if (isNaN(timeInSecs)) return "0:00";
    const mins = Math.floor(timeInSecs / 60);
    const secs = Math.floor(timeInSecs % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // High Fidelity real-time Canvas Animation hook
  useEffect(() => {
    let active = true;

    const draw = () => {
      if (!active) return;

      const canvas = canvasRef.current;
      if (!canvas) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.clearRect(0, 0, width, height);

      const analyser = analyserRef.current;
      const isActuallyPlaying = isPlaying && audioRef.current && !audioRef.current.paused;

      const bufferLength = analyser ? analyser.frequencyBinCount : 128;
      const dataArray = new Uint8Array(bufferLength);

      if (analyser && isActuallyPlaying) {
        if (visualMode === "bars") {
          analyser.getByteFrequencyData(dataArray);
        } else {
          analyser.getByteTimeDomainData(dataArray);
        }
      } else {
        // Build beautiful atmospheric ambient wave idle waves when paused
        const currentTimeMillis = Date.now();
        for (let i = 0; i < bufferLength; i++) {
          if (visualMode === "bars") {
            dataArray[i] = Math.max(
              12,
              12 + Math.sin(i * 0.18 + currentTimeMillis * 0.0025) * 8 + Math.cos(i * 0.06 + currentTimeMillis * 0.001) * 6
            );
          } else {
            dataArray[i] = 128 + Math.sin(i * 0.06 + currentTimeMillis * 0.003) * 15 * Math.sin(currentTimeMillis * 0.0008);
          }
        }
      }

      if (visualMode === "bars") {
        // Render sleek glowing 3D-effect frequencies
        const barWidth = (width / (bufferLength * 0.58)) * 0.85;
        const barGap = barWidth * 0.22;
        let x = 0;

        const maxBars = Math.min(bufferLength, Math.floor(width / (barWidth + barGap)));

        for (let i = 0; i < maxBars; i++) {
          const percent = dataArray[i] / 255;
          const barHeight = Math.max(4, Math.pow(percent, 1.28) * (height * 0.88));

          const gradient = ctx.createLinearGradient(x, height, x, height - barHeight);
          gradient.addColorStop(0, "rgba(245, 158, 11, 0.45)"); // Amber 500 gradient bottom
          gradient.addColorStop(0.5, "rgba(245, 158, 11, 0.85)"); // Amber intense middle
          gradient.addColorStop(1, "rgba(251, 113, 133, 1)"); // Rose 400 glowing tip

          ctx.fillStyle = gradient;

          ctx.beginPath();
          const radius = Math.min(barWidth / 2, 3);
          if (ctx.roundRect) {
            ctx.roundRect(x, height - barHeight, barWidth, barHeight, [radius, radius, 0, 0]);
          } else {
            ctx.rect(x, height - barHeight, barWidth, barHeight);
          }
          ctx.fill();

          // Purity glowing nodes on peaks
          if (percent > 0.42) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
            ctx.shadowColor = "rgba(245, 158, 11, 0.75)";
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(x + barWidth / 2, height - barHeight - 2, Math.min(barWidth / 2, 2.22), 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0; // reset
          }

          x += barWidth + barGap;
        }
      } else {
        // Render silky smooth responsive wave path
        ctx.beginPath();
        ctx.lineWidth = 2.5;

        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, "rgba(245, 158, 11, 0.85)"); // Amber
        gradient.addColorStop(0.5, "rgba(251, 113, 133, 0.95)"); // Rose
        gradient.addColorStop(1, "rgba(99, 102, 241, 0.85)"); // Indigo

        ctx.strokeStyle = gradient;
        ctx.shadowColor = "rgba(245, 158, 11, 0.35)";
        ctx.shadowBlur = 10;

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            const prevX = x - sliceWidth;
            const prevV = dataArray[i - 1] / 128.0;
            const prevY = (prevV * height) / 2;
            ctx.bezierCurveTo(prevX + sliceWidth / 2, prevY, prevX + sliceWidth / 2, y, x, y);
          }
          x += sliceWidth;
        }

        ctx.stroke();
        ctx.shadowBlur = 0; // reset

        // Draw elegant reflection gradient filling under the path
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        const fillGradient = ctx.createLinearGradient(0, 0, 0, height);
        fillGradient.addColorStop(0, "rgba(245, 158, 11, 0.08)");
        fillGradient.addColorStop(1, "rgba(245, 158, 11, 0)");
        ctx.fillStyle = fillGradient;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    animationRef.current = requestAnimationFrame(draw);

    return () => {
      active = false;
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, visualMode]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] backdrop-blur-2xl relative overflow-hidden transition-all duration-300 hover:border-white/15" id="audio-listening-panel">
      {/* Visual background ambient orb */}
      <div className="absolute top-[-30%] right-[-10%] w-60 h-60 bg-gradient-to-br from-amber-500/10 to-rose-500/10 rounded-full blur-[80px] pointer-events-none"></div>
      
      {/* Header and Label */}
      <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-4 select-none">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/10 text-amber-300 border border-amber-550/20 rounded-xl">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest font-mono">Consola de Escucha Interactiva</h3>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">Disfruta o compara mientras deconstruyes las frecuencias del audio</p>
          </div>
        </div>

        {audioUrl ? (
          <span className="text-[9px] bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Canal Local Audio
          </span>
        ) : songLink ? (
          <span className="text-[9px] bg-amber-500/15 border border-amber-500/25 text-amber-300 font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
            Enlace Externo
          </span>
        ) : (
          <span className="text-[9px] bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Búsqueda Espectral Auto
          </span>
        )}
      </div>

      {/* RENDER OPTION A: LOCAL AUDIO UPLOAD (HTML5 direct interactive sound-bar) */}
      {audioUrl && (
        <div className="space-y-4 font-mono select-none" id="local-player-layout">
          {/* Audio Tag hidden */}
          <audio
            ref={audioRef}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleAudioEnded}
          />

          <div className="bg-slate-950/60 border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-inner">
            <div className="flex items-center gap-4">
              {/* VisionOS Play Circular Button */}
              <button
                type="button"
                onClick={togglePlayPause}
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-500 text-slate-950 flex items-center justify-center hover:scale-105 active:scale-95 shadow-[0_4px_16px_rgba(245,158,11,0.35)] transition-all duration-200"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-slate-950 text-slate-950" /> : <Play className="w-5 h-5 fill-slate-950 text-slate-950 ml-0.5" />}
              </button>

              <div>
                <h4 className="text-sm font-bold text-slate-200 truncate max-w-[200px] sm:max-w-md font-sans leading-none mb-1">
                  {title}
                </h4>
                <p className="text-[10px] text-amber-300/80 uppercase tracking-widest leading-none font-semibold">
                  {artist || "Canal de Audio Local"}
                </p>
              </div>
            </div>

            {/* Selector de tipo de Visualizador en tiempo real */}
            <div className="flex gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-white/5 self-end md:self-auto select-none">
              <button
                type="button"
                onClick={() => setVisualMode("bars")}
                className={`px-3 py-1 text-[10px] font-mono font-bold rounded-lg transition-all duration-200 ${
                  visualMode === "bars"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "text-slate-400 hover:text-slate-250"
                }`}
              >
                Espectro
              </button>
              <button
                type="button"
                onClick={() => setVisualMode("wave")}
                className={`px-3 py-1 text-[10px] font-mono font-bold rounded-lg transition-all duration-200 ${
                  visualMode === "wave"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "text-slate-400 hover:text-slate-250"
                }`}
              >
                Osciloscopio
              </button>
            </div>
          </div>

          {/* Lienzo Canvas Waveform / Frecuencias en Tiempo Real */}
          <div className="relative h-28 w-full bg-slate-950/80 border border-white/5 rounded-2xl overflow-hidden shadow-inner py-1">
            <canvas ref={canvasRef} className="w-full h-full block" />
            
            {/* Cuadrícula sutil de estudio técnico */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
            
            <div className="absolute bottom-2 left-3 text-[8px] font-mono text-slate-500 tracking-wider select-none">
              {visualMode === "bars" ? "FTT ANALYZER • MULTI-BAND CORES" : "DIGITAL WAVE ENVELOPE • HIGH ACCURACY"}
            </div>
          </div>

          {/* Time & seek bar wrapper */}
          <div className="space-y-2 bg-slate-950/40 p-4 border border-white/5 rounded-2xl">
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-400 font-bold min-w-[34px]">{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 accent-amber-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer appearance-none focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 font-bold min-w-[34px]">{formatTime(duration)}</span>
            </div>

            <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
              <div className="flex items-center gap-2">
                <Laptop className="w-3.5 h-3.5" />
                <span>Format: MP3/WAV Decoder Core</span>
              </div>

              {/* Volume block bar */}
              <div className="flex items-center gap-2">
                <button type="button" onClick={toggleMute} className="text-slate-400 hover:text-slate-200 transition-colors">
                  {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-rose-450" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 accent-amber-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer appearance-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENDER OPTION B: IFRAME EMBEDS (Spotify or YouTube integrations) */}
      {!audioUrl && mediaSource.type !== "none" && (
        <div className="space-y-4" id="embeds-track-player">
          {mediaSource.type === "spotify" ? (
            <div className="relative rounded-2xl overflow-hidden bg-[#000000] border border-green-500/20 shadow-lg">
              <iframe
                src={mediaSource.url}
                width="100%"
                height="152"
                frameBorder="0"
                allowFullScreen={false}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title="Reproductor oficial de Spotify de deconstrucción"
              />
            </div>
          ) : (
            // YouTube Iframe configuration - sleek and optimized
            <div className="relative rounded-3xl overflow-hidden aspect-video max-h-[310px] bg-slate-950 border border-white/10 shadow-lg group">
              <iframe
                src={mediaSource.url}
                width="100%"
                height="100%"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy animate-fade-in"
                title={`${title} - Vídeo analizado`}
                className="w-full h-full"
              />
            </div>
          )}

          <div className="bg-slate-950/60 border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 text-xs select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Music className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <p className="font-semibold text-slate-200 truncate max-w-[220px] sm:max-w-md">
                  {title}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {artist} • Reproducción de referencia
                </p>
              </div>
            </div>

            {songLink && (
              <a
                href={songLink}
                target="_blank"
                rel="noreferrer noopener"
                className="text-[10px] font-mono font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-white/10 text-amber-300 py-1.5 px-3 rounded-xl flex items-center gap-1 hover:text-white transition-all duration-150"
              >
                <span>Fuente Original</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
