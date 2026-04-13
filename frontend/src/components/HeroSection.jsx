import { useEffect, useRef, useState } from "react";
import Crystal3D from "./Crystal3D";
import { ArrowRight, Sparkles, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const stats = [
  { value: "98.2%", label: "Accuracy"  },
  { value: "<1s",   label: "Inference" },
  { value: "T5",    label: "Backbone"  },
];

export default function HeroSection() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY,  setScrollY]  = useState(0);

  // Scroll parallax
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Mouse parallax
  useEffect(() => {
    const h = (e) =>
      setMousePos({
        x: (e.clientX / window.innerWidth  - 0.5) * 24,
        y: (e.clientY / window.innerHeight - 0.5) * 24,
      });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  const textReveal   = useScrollReveal({ threshold: 0.05, direction: "up" });
  const crystalReveal = useScrollReveal({ threshold: 0.05, direction: "scale", delay: 200 });
  const statsReveal  = useScrollReveal({ threshold: 0.05, direction: "up", delay: 400 });

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">

      {/* Scroll-parallax blobs */}
      <div
        className="absolute top-1/4 left-1/4 w-[520px] h-[520px] rounded-full blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(199 89% 48% / 0.13), transparent 70%)",
          transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5 - scrollY * 0.08}px)`,
          transition: "transform 0.12s ease-out",
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[420px] h-[420px] rounded-full blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(260 60% 55% / 0.1), transparent 70%)",
          transform: `translate(${-mousePos.x * 0.35}px, ${-mousePos.y * 0.35 + scrollY * 0.05}px)`,
          transition: "transform 0.12s ease-out",
        }}
      />
      <div
        className="absolute top-1/2 left-2/3 w-[280px] h-[280px] rounded-full blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(10 90% 55% / 0.07), transparent 70%)",
          transform: `translate(${mousePos.x * 0.25}px, ${mousePos.y * 0.25 - scrollY * 0.04}px)`,
          transition: "transform 0.15s ease-out",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-screen pt-20">

          {/* ── LEFT: text ─────────────────────────────────────────── */}
          <div ref={textReveal.ref} className={`space-y-6 ${textReveal.className}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/8 text-xs font-semibold text-primary backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Research — npj Computational Materials
            </div>

            <div>
              <h1 className="text-6xl md:text-8xl font-black uppercase leading-[1.0] tracking-tighter">
                <span className="gradient-text">LLM</span>
                <br />
                <span className="text-foreground">PROP</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md leading-relaxed mt-4">
                Predicting Crystal Properties using Large Language Models.
                A T5-based transformer approach to materials science.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-1">
              <Link
                to="/predict"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-primary-foreground transition-all hover:scale-105 active:scale-95 hover:brightness-110"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))",
                  boxShadow: "0 0 30px hsl(var(--primary) / 0.4)",
                }}
              >
                Let's Predict
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-7 py-3.5 border border-primary/40 text-primary font-semibold rounded-xl hover:bg-primary/10 transition-all hover:scale-105 active:scale-95 backdrop-blur-sm"
              >
                Sign Up Free
              </Link>
            </div>
          </div>

          {/* ── RIGHT: crystal ─────────────────────────────────────── */}
          <div
            ref={crystalReveal.ref}
            className={`relative h-[500px] lg:h-[600px] ${crystalReveal.className}`}
            style={{
              transform: `${crystalReveal.visible ? "scale(1)" : "scale(0.9)"} translate(${mousePos.x * 0.07}px, ${mousePos.y * 0.07 - scrollY * 0.03}px)`,
              transition: "transform 0.18s ease-out, opacity 0.7s ease-out",
            }}
          >
            <Crystal3D className="w-full h-full cursor-grab active:cursor-grabbing" />
          </div>
        </div>

        {/* Stats row */}
        <div
          ref={statsReveal.ref}
          className={`absolute bottom-12 left-6 flex gap-10 ${statsReveal.className}`}
        >
          {stats.map(s => (
            <div key={s.label}>
              <div className="text-2xl font-extrabold gradient-text">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5 tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce opacity-60">
        <ChevronDown className="w-5 h-5 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground tracking-widest uppercase">Scroll</span>
      </div>
    </section>
  );
}
