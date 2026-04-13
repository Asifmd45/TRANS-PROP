import { useEffect, useRef, useState } from "react";
import { FileText, Cpu, BrainCircuit, BarChart3 } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const steps = [
  { num: "01", title: "Crystal Input",    desc: "Paste crystal text description",         Icon: FileText,      color: "#38bdf8", glow: "rgba(56,189,248,0.5)"   },
  { num: "02", title: "Text Generation",  desc: "Structured description auto-created from crystal data",     Icon: FileText,    color: "#c084fc", glow: "rgba(192,132,252,0.5)"  },
  { num: "03", title: "Preprocessing",    desc: "[NUM], [ANG] token replacement & stopword removal",         Icon: Cpu,         color: "#34d399", glow: "rgba(52,211,153,0.5)"   },
  { num: "04", title: "T5 Encoder",       desc: "Transformer-based semantic encoding of crystal text",       Icon: BrainCircuit,color: "#f97316", glow: "rgba(249,115,22,0.5)"   },
  { num: "05", title: "Prediction",       desc: "Band gap, volume, formation energy — instant output",       Icon: BarChart3,   color: "#fbbf24", glow: "rgba(251,191,36,0.5)"   },
];

function Connector({ color, active }) {
  return (
    <div className="flex-1 relative flex items-center mx-1" style={{ minWidth: 24 }}>
      <div
        className="h-px w-full transition-all duration-700"
        style={{
          background: active ? `linear-gradient(90deg, ${color}70, ${color})` : "hsl(var(--border))",
          boxShadow: active ? `0 0 8px ${color}80` : "none",
        }}
      />
      {active && (
        <span
          className="absolute w-2 h-2 rounded-full animate-travel-dot"
          style={{ background: color, boxShadow: `0 0 8px ${color}` }}
        />
      )}
    </div>
  );
}

export default function HowItWorksSection() {
  const sectionRef = useRef(null);
  const [visibleSteps, setVisibleSteps] = useState([]);

  const headerReveal = useScrollReveal({ threshold: 0.05, direction: "up" });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          steps.forEach((_, i) =>
            setTimeout(() => setVisibleSteps(prev => [...prev, i]), i * 260)
          );
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" ref={sectionRef} className="py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">

        {/* Header */}
        <div ref={headerReveal.ref} className={`text-center mb-20 ${headerReveal.className}`}>
          <p className="text-primary text-xs font-bold tracking-widest uppercase mb-3 flex items-center justify-center gap-2">
            <span className="w-8 h-px bg-primary inline-block" />
            Pipeline
            <span className="w-8 h-px bg-primary inline-block" />
          </p>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-sm leading-relaxed">
            From raw crystal description to property prediction — powered by a fine-tuned T5 transformer.
          </p>
        </div>

        {/* Desktop horizontal pipeline */}
        <div className="hidden md:flex items-start justify-between relative">
          {steps.map((step, i) => {
            const visible = visibleSteps.includes(i);
            const { Icon } = step;
            return (
              <div key={step.num} className="flex items-start" style={{ flex: 1 }}>
                <div
                  className={`flex flex-col items-center text-center flex-1 transition-all duration-700 ${
                    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                  }`}
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  {/* Node */}
                  <div
                    className="relative w-20 h-20 rounded-2xl border-2 bg-card flex items-center justify-center mb-5 cursor-default transition-all duration-300 hover:scale-110"
                    style={{
                      borderColor: visible ? step.color : "hsl(var(--border))",
                      boxShadow: visible ? `0 0 24px ${step.glow}` : "none",
                    }}
                  >
                    {visible && (
                      <span
                        className="absolute inset-0 rounded-2xl animate-neon-ring"
                        style={{ boxShadow: `0 0 0 4px ${step.color}25` }}
                      />
                    )}
                    <Icon className="w-7 h-7" style={{ color: step.color }} />
                    <span
                      className="absolute -top-2 -right-2 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: step.color, color: "#0a0a0f" }}
                    >
                      {step.num}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-[130px]">{step.desc}</p>
                </div>

                {i < steps.length - 1 && (
                  <div className="flex items-center mt-10 mx-1" style={{ minWidth: 24 }}>
                    <Connector color={steps[i + 1].color} active={visibleSteps.includes(i + 1)} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile vertical pipeline */}
        <div className="md:hidden space-y-0">
          {steps.map((step, i) => {
            const visible = visibleSteps.includes(i);
            const { Icon } = step;
            return (
              <div
                key={step.num}
                className={`flex items-start gap-4 transition-all duration-700 ${
                  visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
                }`}
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="flex flex-col items-center">
                  <div
                    className="w-14 h-14 rounded-xl border-2 bg-card flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      borderColor: visible ? step.color : "hsl(var(--border))",
                      boxShadow: visible ? `0 0 18px ${step.glow}` : "none",
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: step.color }} />
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className="w-px h-8 mt-1 transition-all duration-700"
                      style={{
                        background: visible
                          ? `linear-gradient(${step.color}, ${steps[i + 1].color})`
                          : "hsl(var(--border))",
                      }}
                    />
                  )}
                </div>
                <div className="pt-2 pb-8">
                  <p className="text-[10px] font-mono font-bold mb-0.5" style={{ color: step.color }}>
                    {step.num}
                  </p>
                  <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
