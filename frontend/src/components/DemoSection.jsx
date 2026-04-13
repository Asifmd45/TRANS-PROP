import { useState } from "react";
import { FlaskConical } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const dummyResults = [
  { property: "Band Gap", value: "2.1 eV", confidence: 0.92 },
  { property: "Volume", value: "40 ų", confidence: 0.88 },
  { property: "Formation Energy", value: "-1.34 eV/atom", confidence: 0.85 },
];

export default function DemoSection() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const { ref, visible } = useScrollReveal({ threshold: 0.15 });

  const handlePredict = () => {
    if (!input.trim()) return;
    setLoading(true);
    setResults(null);
    setTimeout(() => { setResults(dummyResults); setLoading(false); }, 1500);
  };

  return (
    <section id="demo" ref={ref} className="py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />

      <div className="relative z-10 max-w-3xl mx-auto px-6">
        {/* Header */}
        <div
          className={`text-center mb-12 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3 flex items-center justify-center gap-2">
            <span className="w-8 h-px bg-primary inline-block" />
            Try It
            <span className="w-8 h-px bg-primary inline-block" />
          </p>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-foreground">
            Quick <span className="gradient-text">Demo</span>
          </h2>
        </div>

        <div
          className={`glass-card rounded-2xl p-8 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          style={{ transitionDelay: "150ms" }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a crystal description… e.g. SiO2 cubic structure with lattice constant 5.43 Å"
            className="w-full h-32 bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono transition-all"
          />

          <button
            onClick={handlePredict}
            disabled={loading || !input.trim()}
            className="mt-4 w-full py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-accent-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                <FlaskConical className="w-4 h-4" />
                Predict Properties
              </>
            )}
          </button>

          {results && (
            <div className="mt-6 animate-fade-in-up">
              <div className="grid grid-cols-3 gap-3 mb-4">
                {results.map((r) => (
                  <div
                    key={r.property}
                    className="rounded-xl p-4 text-center"
                    style={{
                      background: "hsl(var(--muted))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  >
                    <div className="text-xs text-muted-foreground mb-1">{r.property}</div>
                    <div className="text-base font-bold text-primary font-mono">{r.value}</div>
                    <div className="mt-1 h-1 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-1000"
                        style={{ width: `${r.confidence * 100}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {(r.confidence * 100).toFixed(0)}% conf.
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
