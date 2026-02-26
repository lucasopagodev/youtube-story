import { useState, useRef, useCallback } from "react";

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\s]+)/,
    /(?:youtu\.be\/)([^?\s]+)/,
    /(?:youtube\.com\/embed\/)([^?\s]+)/,
    /(?:youtube\.com\/shorts\/)([^?\s]+)/,
  ];
  for (const p of patterns) {
    const match = url.match(p);
    if (match) return match[1];
  }
  return null;
}

async function fetchVideoInfo(url) {
  try {
    const res = await fetch(
      `https://noembed.com/embed?url=${encodeURIComponent(url)}`
    );
    const data = await res.json();
    const videoId = extractVideoId(url);
    return {
      title: data.title || "Título não encontrado",
      channelTitle: data.author_name || "Canal",
      thumbnail: videoId
        ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        : data.thumbnail_url,
      videoId,
    };
  } catch {
    const videoId = extractVideoId(url);
    return {
      title: "Vídeo do YouTube",
      channelTitle: "Canal",
      thumbnail: videoId
        ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        : null,
      videoId,
    };
  }
}

function StoryPreview({ videoInfo, customMessage, accentColor }) {
  const title = videoInfo?.title || "Título do vídeo";
  const channel = videoInfo?.channelTitle || "Nome do Canal";
  const thumb = videoInfo?.thumbnail;

  return (
    <div
      style={{
        width: 1080 / 2.5,
        height: 1920 / 2.5,
        background: "#0a0a0a",
        borderRadius: 20,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        fontFamily: "'DM Sans', sans-serif",
        boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
      }}
    >
      <div
        style={{
          height: 3,
          background: `linear-gradient(90deg, ${accentColor}, transparent)`,
          width: "60%",
        }}
      />

      <div
        style={{
          padding: "32px 28px 16px",
          fontSize: 15,
          fontWeight: 700,
          color: "#fff",
          letterSpacing: "0.02em",
        }}
      >
        {customMessage || "Saiu vídeo novo no canal!"}
      </div>

      <div style={{ padding: "0 28px", position: "relative" }}>
        <div
          style={{
            width: "100%",
            aspectRatio: "16/9",
            borderRadius: 14,
            overflow: "hidden",
            background: "#1a1a1a",
          }}
        >
          {thumb ? (
            <img
              src={thumb}
              alt="thumbnail"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
              crossOrigin="anonymous"
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#444",
                fontSize: 13,
              }}
            >
              Thumbnail
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: "20px 28px 0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${accentColor}, #333)`,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            {channel.charAt(0).toUpperCase()}
          </div>
          <div style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>
            {channel}
          </div>
        </div>

        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.35,
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title}
        </h2>
      </div>

      <div style={{ flex: 1 }} />

      <div
        style={{
          padding: "0 28px 36px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: "#fff",
            color: "#0a0a0a",
            padding: "12px 28px",
            borderRadius: 50,
            fontSize: 14,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
              stroke="#0a0a0a"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
              stroke="#0a0a0a"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          assista aqui!
        </div>
      </div>
    </div>
  );
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = text.split(" ");
  let line = "";
  let lineCount = 0;
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      lineCount++;
      if (lineCount >= maxLines) {
        ctx.fillText(line.trim() + "...", x, y);
        return;
      }
      ctx.fillText(line.trim(), x, y);
      line = words[i] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, y);
}

async function renderStoryToCanvas(canvas, videoInfo, customMessage, accentColor) {
  const W = 1080;
  const H = 1920;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, W, H);

  const grad = ctx.createLinearGradient(0, 0, W * 0.6, 0);
  grad.addColorStop(0, accentColor);
  grad.addColorStop(1, "transparent");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W * 0.6, 8);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 40px 'DM Sans', sans-serif";
  ctx.fillText(customMessage || "Saiu vídeo novo no canal!", 70, 120);

  return new Promise((resolve) => {
    const thumbImg = new Image();
    thumbImg.crossOrigin = "anonymous";

    const finishRender = (hasThumb) => {
      const tx = 70, ty = 170, tw = W - 140, th = tw * (9 / 16), tr = 36;

      if (hasThumb) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(tx + tr, ty);
        ctx.lineTo(tx + tw - tr, ty);
        ctx.quadraticCurveTo(tx + tw, ty, tx + tw, ty + tr);
        ctx.lineTo(tx + tw, ty + th - tr);
        ctx.quadraticCurveTo(tx + tw, ty + th, tx + tw - tr, ty + th);
        ctx.lineTo(tx + tr, ty + th);
        ctx.quadraticCurveTo(tx, ty + th, tx, ty + th - tr);
        ctx.lineTo(tx, ty + tr);
        ctx.quadraticCurveTo(tx, ty, tx + tr, ty);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(thumbImg, tx, ty, tw, th);
        ctx.restore();
      } else {
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(tx, ty, tw, th);
      }

      const afterThumb = ty + th + 55;
      const avatarX = 70, avatarR = 48;

      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarR, afterThumb + avatarR, avatarR, 0, Math.PI * 2);
      const aGrad = ctx.createLinearGradient(avatarX, afterThumb, avatarX + avatarR * 2, afterThumb + avatarR * 2);
      aGrad.addColorStop(0, accentColor);
      aGrad.addColorStop(1, "#333");
      ctx.fillStyle = aGrad;
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 40px 'DM Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText((videoInfo?.channelTitle || "C").charAt(0).toUpperCase(), avatarX + avatarR, afterThumb + avatarR);
      ctx.restore();

      ctx.fillStyle = "#888";
      ctx.font = "500 34px 'DM Sans', sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(videoInfo?.channelTitle || "Canal", avatarX + avatarR * 2 + 24, afterThumb + avatarR);

      ctx.fillStyle = "#fff";
      ctx.font = "bold 48px 'DM Sans', sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      wrapText(ctx, videoInfo?.title || "Título do vídeo", 70, afterThumb + avatarR * 2 + 30, W - 140, 60, 3);

      // CTA button
      const btnW = 380, btnH = 76, btnX = (W - btnW) / 2, btnY = H - 140;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.roundRect(btnX, btnY, btnW, btnH, 50);
      ctx.fill();

      // Link icon
      ctx.save();
      ctx.strokeStyle = "#0a0a0a";
      ctx.lineWidth = 3.5;
      ctx.lineCap = "round";
      const ix = btnX + 65, iy = btnY + btnH / 2;
      ctx.beginPath();
      ctx.arc(ix - 4, iy + 4, 10, -0.6, 2.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(ix + 4, iy - 4, 10, 2.5, 5.3);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = "#0a0a0a";
      ctx.font = "bold 36px 'DM Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("assista aqui!", W / 2 + 15, btnY + btnH / 2);

      resolve(canvas);
    };

    thumbImg.onload = () => finishRender(true);
    thumbImg.onerror = () => finishRender(false);
    thumbImg.src = videoInfo?.thumbnail || `https://img.youtube.com/vi/${videoInfo?.videoId}/maxresdefault.jpg`;
  });
}

const ACCENT_COLORS = [
  { name: "Vermelho", value: "#e53e3e" },
  { name: "Azul", value: "#3b82f6" },
  { name: "Verde", value: "#10b981" },
  { name: "Roxo", value: "#8b5cf6" },
  { name: "Laranja", value: "#f59e0b" },
  { name: "Rosa", value: "#ec4899" },
  { name: "Branco", value: "#ffffff" },
];

export default function YouTubeStoryGenerator() {
  const [url, setUrl] = useState("");
  const [customMessage, setCustomMessage] = useState("Saiu vídeo novo no canal!");
  const [videoInfo, setVideoInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accentColor, setAccentColor] = useState("#e53e3e");
  const [exporting, setExporting] = useState(false);
  const canvasRef = useRef(null);

  const handleFetch = useCallback(async () => {
    if (!url.trim()) return;
    const id = extractVideoId(url);
    if (!id) {
      setError("URL inválida. Cole um link do YouTube.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const info = await fetchVideoInfo(url);
      setVideoInfo(info);
    } catch {
      setError("Erro ao buscar informações do vídeo.");
    } finally {
      setLoading(false);
    }
  }, [url]);

  const handleExport = useCallback(async () => {
    if (!videoInfo) return;
    setExporting(true);
    try {
      const canvas = canvasRef.current || document.createElement("canvas");
      canvasRef.current = canvas;
      await renderStoryToCanvas(canvas, videoInfo, customMessage, accentColor);
      const link = document.createElement("a");
      link.download = "instagram-story.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error(e);
      setError("Erro ao exportar imagem.");
    } finally {
      setExporting(false);
    }
  }, [videoInfo, customMessage, accentColor]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#fff",
        fontFamily: "'DM Sans', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 20px",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap"
        rel="stylesheet"
      />

      <div style={{ textAlign: "center", marginBottom: 40, maxWidth: 500 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            margin: "0 0 8px",
            letterSpacing: "-0.03em",
          }}
        >
          Story Generator
        </h1>
        <p style={{ fontSize: 14, color: "#666", margin: 0 }}>
          Cole o link do YouTube e gere uma imagem para o seu Story
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 48,
          alignItems: "flex-start",
          flexWrap: "wrap",
          justifyContent: "center",
          width: "100%",
          maxWidth: 900,
        }}
      >
        {/* Controls */}
        <div
          style={{
            flex: "1 1 340px",
            maxWidth: 400,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div>
            <label
              style={{
                fontSize: 12,
                color: "#666",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 8,
                display: "block",
              }}
            >
              Link do YouTube
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFetch()}
                placeholder="https://youtube.com/watch?v=..."
                style={{
                  flex: 1,
                  background: "#111",
                  border: "1px solid #222",
                  borderRadius: 10,
                  padding: "12px 16px",
                  color: "#fff",
                  fontSize: 14,
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
              <button
                onClick={handleFetch}
                disabled={loading}
                style={{
                  background: "#fff",
                  color: "#000",
                  border: "none",
                  borderRadius: 10,
                  padding: "12px 20px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: loading ? "wait" : "pointer",
                  fontFamily: "inherit",
                  opacity: loading ? 0.5 : 1,
                  whiteSpace: "nowrap",
                }}
              >
                {loading ? "..." : "Buscar"}
              </button>
            </div>
            {error && (
              <p style={{ color: "#e53e3e", fontSize: 13, marginTop: 8 }}>
                {error}
              </p>
            )}
          </div>

          <div>
            <label
              style={{
                fontSize: 12,
                color: "#666",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 8,
                display: "block",
              }}
            >
              Mensagem personalizada
            </label>
            <input
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Saiu vídeo novo no canal!"
              style={{
                width: "100%",
                background: "#111",
                border: "1px solid #222",
                borderRadius: 10,
                padding: "12px 16px",
                color: "#fff",
                fontSize: 14,
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: 12,
                color: "#666",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 10,
                display: "block",
              }}
            >
              Cor de destaque
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setAccentColor(c.value)}
                  title={c.name}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: c.value,
                    border:
                      accentColor === c.value
                        ? "3px solid #fff"
                        : "3px solid #333",
                    cursor: "pointer",
                    transform:
                      accentColor === c.value ? "scale(1.15)" : "scale(1)",
                    transition: "all 0.2s",
                  }}
                />
              ))}
            </div>
          </div>

          {videoInfo && (
            <button
              onClick={handleExport}
              disabled={exporting}
              style={{
                width: "100%",
                background: `linear-gradient(135deg, ${accentColor}, #222)`,
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "14px 20px",
                fontSize: 15,
                fontWeight: 700,
                cursor: exporting ? "wait" : "pointer",
                fontFamily: "inherit",
                marginTop: 8,
                opacity: exporting ? 0.6 : 1,
                transition: "opacity 0.2s",
              }}
            >
              {exporting ? "Exportando..." : "📥 Baixar Story (1080×1920)"}
            </button>
          )}
        </div>

        {/* Preview */}
        <div
          style={{
            flex: "0 0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: "#444",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Preview
          </span>
          <StoryPreview
            videoInfo={videoInfo}
            customMessage={customMessage}
            accentColor={accentColor}
          />
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
