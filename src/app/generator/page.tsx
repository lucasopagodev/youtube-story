"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import StoryControls from "@/components/StoryControls";
import StoryPreview from "@/components/StoryPreview";
import type { VideoInfo } from "@/types";

const DEFAULT_MESSAGE = "Saiu vídeo novo no canal!";
const DEFAULT_COLOR = "#e53e3e";

export default function Generator() {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [customMessage, setCustomMessage] = useState(DEFAULT_MESSAGE);
  const [accentColor, setAccentColor] = useState(DEFAULT_COLOR);
  const [showAccentLine, setShowAccentLine] = useState(true);
  const [exporting, setExporting] = useState(false);

  const exportRef = useRef<HTMLDivElement>(null);

  const handleExport = useCallback(async () => {
    if (!videoInfo || !exportRef.current) return;
    setExporting(true);
    try {
      const { exportStoryAsPng } = await import("@/lib/export");
      await exportStoryAsPng(exportRef.current);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Erro ao exportar a imagem. Tente novamente.");
    } finally {
      setExporting(false);
    }
  }, [videoInfo]);

  return (
    <main
      className="min-h-screen flex flex-col items-center px-5 py-10"
      style={{ background: "#050505" }}
    >
      {/* Hidden full-resolution story for export */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: "-9999px",
          left: "-9999px",
          width: "1080px",
          height: "1920px",
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        <StoryPreview
          ref={exportRef}
          videoInfo={videoInfo}
          customMessage={customMessage}
          accentColor={accentColor}
          showAccentLine={showAccentLine}
          fullResolution
          useProxy
        />
      </div>

      {/* Header */}
      <header className="w-full max-w-5xl flex items-center justify-between mb-10">
        <Link href="/" className="flex items-center gap-2 group">
          <svg viewBox="0 0 100 100" className="w-7 h-7 flex-shrink-0">
            <rect width="100" height="100" rx="22" fill="#0f0f0f" />
            <rect x="23" y="9" width="54" height="82" rx="15" fill="#FF0000" />
            <polygon points="39,31 39,69 67,50" fill="white" />
          </svg>
          <span className="text-white font-bold text-base tracking-tight group-hover:text-neutral-300 transition-colors">
            YouTube Story
          </span>
        </Link>
      </header>

      {/* Main content */}
      <div className="flex flex-col lg:flex-row gap-12 items-start justify-center w-full max-w-5xl">
        {/* Controls panel */}
        <section className="w-full lg:flex-1 lg:max-w-sm" aria-label="Controles">
          <StoryControls
            onVideoFetched={setVideoInfo}
            customMessage={customMessage}
            onMessageChange={setCustomMessage}
            accentColor={accentColor}
            onColorChange={setAccentColor}
            onExport={handleExport}
            hasVideo={!!videoInfo}
            exporting={exporting}
            accentColorValue={accentColor}
            showAccentLine={showAccentLine}
            onAccentLineToggle={() => setShowAccentLine((v) => !v)}
          />

          {videoInfo && (
            <div className="mt-6 p-4 rounded-xl bg-neutral-900 border border-neutral-800">
              <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">
                Vídeo carregado
              </p>
              <p className="text-sm text-white font-medium line-clamp-2">
                {videoInfo.title}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                {videoInfo.channelTitle}
              </p>
            </div>
          )}
        </section>

        {/* Preview panel */}
        <section
          className="flex flex-col items-center gap-3 flex-shrink-0"
          aria-label="Preview do Story"
        >
          <span className="text-xs text-neutral-600 uppercase tracking-widest">
            Preview
          </span>
          <StoryPreview
            videoInfo={videoInfo}
            customMessage={customMessage}
            accentColor={accentColor}
            showAccentLine={showAccentLine}
          />
          <span className="text-xs text-neutral-700">
            {Math.round(1080 / 2.5)} × {Math.round(1920 / 2.5)} px (escala ÷2.5)
          </span>
        </section>
      </div>
    </main>
  );
}
