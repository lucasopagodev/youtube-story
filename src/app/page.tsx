"use client";

import { useRef, useState, useCallback } from "react";
import StoryControls from "@/components/StoryControls";
import StoryPreview from "@/components/StoryPreview";
import type { VideoInfo } from "@/types";

const DEFAULT_MESSAGE = "Saiu vídeo novo no canal!";
const DEFAULT_COLOR = "#e53e3e";

export default function Home() {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [customMessage, setCustomMessage] = useState(DEFAULT_MESSAGE);
  const [accentColor, setAccentColor] = useState(DEFAULT_COLOR);
  const [exporting, setExporting] = useState(false);

  // Ref to the hidden full-resolution StoryPreview used for export
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
      {/* Hidden full-resolution story used only for PNG export */}
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
          fullResolution
          useProxy
        />
      </div>

      {/* Header */}
      <header className="text-center mb-12 max-w-lg">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
          Story Generator
        </h1>
        <p className="text-sm text-neutral-500">
          Cole o link do YouTube e gere uma imagem para o seu Story do Instagram
        </p>
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
          />
          <span className="text-xs text-neutral-700">
            {Math.round(1080 / 2.5)} × {Math.round(1920 / 2.5)} px (escala ÷2.5)
          </span>
        </section>
      </div>
    </main>
  );
}
