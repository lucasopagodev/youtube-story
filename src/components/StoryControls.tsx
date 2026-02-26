"use client";

import { useState, useCallback } from "react";
import ColorPicker from "./ColorPicker";
import type { VideoInfo } from "@/types";

interface StoryControlsProps {
  onVideoFetched: (info: VideoInfo) => void;
  customMessage: string;
  onMessageChange: (msg: string) => void;
  accentColor: string;
  onColorChange: (color: string) => void;
  onExport: () => void;
  hasVideo: boolean;
  exporting: boolean;
  accentColorValue: string;
}

export default function StoryControls({
  onVideoFetched,
  customMessage,
  onMessageChange,
  accentColor,
  onColorChange,
  onExport,
  hasVideo,
  exporting,
  accentColorValue,
}: StoryControlsProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFetch = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(
        `/api/youtube?url=${encodeURIComponent(trimmed)}`
      );
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Erro ao buscar vídeo.");
        return;
      }
      onVideoFetched(data);
    } catch {
      setError("Erro de rede. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  }, [url, onVideoFetched]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleFetch();
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* YouTube URL */}
      <div>
        <label className="block text-xs text-neutral-500 uppercase tracking-widest mb-2">
          Link do YouTube
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://youtube.com/watch?v=..."
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-neutral-600 transition-colors font-sans"
          />
          <button
            onClick={handleFetch}
            disabled={loading || !url.trim()}
            className="bg-white text-black rounded-xl px-5 py-3 text-sm font-bold whitespace-nowrap transition-opacity hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed font-sans"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Buscando
              </span>
            ) : (
              "Buscar"
            )}
          </button>
        </div>
        {error && (
          <p className="text-red-400 text-xs mt-2 leading-relaxed">{error}</p>
        )}
      </div>

      {/* Custom message */}
      <div>
        <label className="block text-xs text-neutral-500 uppercase tracking-widest mb-2">
          Mensagem personalizada
        </label>
        <input
          type="text"
          value={customMessage}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Saiu vídeo novo no canal!"
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-neutral-600 transition-colors font-sans"
        />
      </div>

      {/* Color picker */}
      <ColorPicker value={accentColor} onChange={onColorChange} />

      {/* Export button */}
      {hasVideo && (
        <button
          onClick={onExport}
          disabled={exporting}
          className="w-full rounded-xl px-5 py-4 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-wait font-sans mt-2"
          style={{
            background: `linear-gradient(135deg, ${accentColorValue}cc, #1a1a1a)`,
            border: `1px solid ${accentColorValue}44`,
          }}
        >
          {exporting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Exportando...
            </span>
          ) : (
            "Baixar Story (1080×1920)"
          )}
        </button>
      )}
    </div>
  );
}
