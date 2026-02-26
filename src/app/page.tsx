import Link from "next/link";
import StoryPreview from "@/components/StoryPreview";

const DEMO_VIDEO = {
  title: "Como fui de 0 para 100k inscritos no YouTube em 1 ano",
  channelTitle: "Seu Canal",
  thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
  channelAvatar: null,
  videoId: "demo",
};

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Cole qualquer link",
    description: "Suporta youtube.com/watch, youtu.be e Shorts. Basta colar e buscar.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
        <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: "Personalize a identidade",
    description: "7 cores de destaque e mensagem customizável. Preview em tempo real.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: "Baixe em 1080×1920",
    description: "PNG em resolução máxima, otimizado para o Story do Instagram.",
  },
];

const STEPS = [
  { number: "01", title: "Cole o link", description: "Qualquer URL do YouTube: vídeos, Shorts ou youtu.be" },
  { number: "02", title: "Personalize", description: "Escolha a cor de destaque e escreva sua mensagem" },
  { number: "03", title: "Baixe e poste", description: "Um clique gera o PNG 1080×1920 pronto para o Story" },
];

export default function Landing() {
  return (
    <div className="min-h-screen" style={{ background: "#050505", color: "#fff" }}>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-neutral-900" style={{ background: "rgba(5,5,5,0.85)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 100 100" className="w-7 h-7 flex-shrink-0">
              <rect width="100" height="100" rx="22" fill="#0f0f0f" />
              <rect x="23" y="9" width="54" height="82" rx="15" fill="#FF0000" />
              <polygon points="39,31 39,69 67,50" fill="white" />
            </svg>
            <span className="font-bold text-sm tracking-tight">YouTube Story</span>
          </div>
          <Link
            href="/generator"
            className="bg-white text-black text-sm font-bold px-4 py-2 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            Abrir app →
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-5 pt-20 pb-24 flex flex-col lg:flex-row items-center gap-16">
        {/* Text */}
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            Gratuito · Sem cadastro
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-5">
            Transforme vídeos do{" "}
            <span style={{ color: "#FF0000" }}>YouTube</span>{" "}
            em Stories prontos para postar
          </h1>

          <p className="text-neutral-400 text-lg leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
            Cole um link, escolha a cor e baixe a imagem em 1080×1920px. Simples assim.
          </p>

          <Link
            href="/generator"
            className="inline-flex items-center gap-2 bg-white text-black font-bold text-base px-7 py-3.5 rounded-xl hover:bg-neutral-100 transition-colors"
          >
            Criar meu Story agora
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Demo mockup */}
        <div className="flex-shrink-0 flex flex-col items-center gap-3">
          <div
            className="relative"
            style={{
              padding: "12px 8px 20px",
              background: "#111",
              borderRadius: "36px",
              border: "1px solid #222",
              boxShadow: "0 40px 80px rgba(0,0,0,0.7)",
            }}
          >
            {/* Phone island */}
            <div
              className="absolute top-4 left-1/2 -translate-x-1/2 bg-black rounded-full"
              style={{ width: 80, height: 10, zIndex: 10 }}
            />
            <StoryPreview
              videoInfo={DEMO_VIDEO}
              customMessage="Saiu vídeo novo no canal!"
              accentColor="#FF0000"
            />
          </div>
          <p className="text-xs text-neutral-600">Preview em tempo real</p>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="border-t border-neutral-900 py-20">
        <div className="max-w-5xl mx-auto px-5">
          <h2 className="text-2xl font-bold text-center mb-12">
            Tudo que você precisa, nada que você não precisa
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-2xl border border-neutral-800"
                style={{ background: "#0f0f0f" }}
              >
                <div className="text-neutral-400 mb-4">{f.icon}</div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-5">
          <h2 className="text-2xl font-bold text-center mb-12">Como funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.number} className="flex flex-col items-center text-center md:items-start md:text-left">
                <div className="flex items-center gap-4 mb-4">
                  <span
                    className="text-3xl font-bold"
                    style={{ color: "rgba(255,255,255,0.08)" }}
                  >
                    {step.number}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:block h-px flex-1" style={{ background: "#1f1f1f", width: 60 }} />
                  )}
                </div>
                <h3 className="font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 border-t border-neutral-900">
        <div className="max-w-lg mx-auto px-5 text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para usar</h2>
          <p className="text-neutral-500 mb-8">
            Sem cadastro, sem limite. Abra, cole o link e baixe.
          </p>
          <Link
            href="/generator"
            className="inline-flex items-center gap-2 bg-white text-black font-bold text-base px-8 py-4 rounded-xl hover:bg-neutral-100 transition-colors"
          >
            Abrir o YouTube Story
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-neutral-900 py-8">
        <div className="max-w-5xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-neutral-600 text-sm">
            <svg viewBox="0 0 100 100" className="w-5 h-5 flex-shrink-0">
              <rect width="100" height="100" rx="22" fill="#1a1a1a" />
              <rect x="23" y="9" width="54" height="82" rx="15" fill="#FF0000" />
              <polygon points="39,31 39,69 67,50" fill="white" />
            </svg>
            YouTube Story
          </div>
          <p className="text-neutral-700 text-xs">
            Feito com Next.js · Dados via YouTube Data API v3
          </p>
        </div>
      </footer>

    </div>
  );
}
