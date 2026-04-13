import { FlaskConical, Atom, Network } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const features = [
  {
    Icon: FlaskConical,
    title: "Fast Predictions",
    desc: "Get crystal property predictions in seconds using optimized T5 transformer inference.",
    color: "#38bdf8",
    glow: "rgba(56,189,248,0.25)",
    gradient: "from-[#38bdf8]/10 to-[#06b6d4]/5",
  },
  {
    Icon: Atom,
    title: "AI-driven Insights",
    desc: "Leverage T5 language model fine-tuned on materials data for accurate multi-property predictions.",
    color: "#c084fc",
    glow: "rgba(192,132,252,0.25)",
    gradient: "from-[#c084fc]/10 to-[#a78bfa]/5",
  },
  {
    Icon: Network,
    title: "Scalable Architecture",
    desc: "Process single inputs or batch datasets — built for research-scale workloads.",
    color: "#34d399",
    glow: "rgba(52,211,153,0.25)",
    gradient: "from-[#34d399]/10 to-[#10b981]/5",
  },
];

export default function FeaturesSection() {
  const { ref, visible } = useScrollReveal({ threshold: 0.1 });

  return (
    <section id="features" ref={ref} className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3 flex items-center justify-center gap-2">
            <span className="w-8 h-px bg-primary inline-block" />
            Capabilities
            <span className="w-8 h-px bg-primary inline-block" />
          </p>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-foreground">
            Core <span className="gradient-text">Features</span>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const { Icon } = f;
            return (
              <div
                key={f.title}
                className={`glass-card rounded-2xl p-8 group cursor-default relative overflow-hidden transition-all duration-700 hover:scale-[1.03] hover:-translate-y-1 ${
                  visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
                style={{
                  transitionDelay: `${i * 120}ms`,
                  borderColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 1.5px ${f.color}60, 0 20px 60px ${f.glow}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                {/* Background gradient tint */}
                <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />

                {/* Icon */}
                <div className="relative z-10 mb-5">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: `${f.color}18`,
                      boxShadow: `0 0 20px ${f.glow}`,
                    }}
                  >
                    <Icon className="w-7 h-7 transition-colors" style={{ color: f.color }} />
                  </div>
                  {/* Neon ring */}
                  <span
                    className="absolute top-0 left-0 w-14 h-14 rounded-xl animate-neon-ring opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ boxShadow: `0 0 0 3px ${f.color}30` }}
                  />
                </div>

                <div className="relative z-10">
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-white transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
