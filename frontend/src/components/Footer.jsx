import { Github, Atom } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const team = ["Asif", "Vinay Paul", "Sri Ram", "Bhanu Prakash", "Krishna Bajaj"];

export default function Footer() {
  const { ref, visible } = useScrollReveal(0.1);

  return (
    <footer ref={ref} className="border-t border-border/60 relative overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-40 rounded-full blur-3xl bg-primary/5 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-12 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
        >
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Atom className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-lg font-bold">
                <span className="gradient-text">LLM</span>
                <span className="text-foreground ml-1">PROP</span>
              </h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Predicting crystalline material properties using large language models.
              Based on T5 transformer architecture.
            </p>
          </div>

          {/* Team */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="w-4 h-px bg-primary inline-block" />
              Team G1143
            </h4>
            <ul className="space-y-1.5">
              {team.map((name) => (
                <li key={name} className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50 inline-block" />
                  {name}
                </li>
              ))}
            </ul>
          </div>

          {/* References */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="w-4 h-px bg-primary inline-block" />
              References
            </h4>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
            >
              <Github className="w-4 h-4 group-hover:scale-110 transition-transform" />
              GitHub Repository
            </a>
            <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
              npj Computational Materials — LLM-Prop: Predicting physical and electronic
              properties of crystalline solids from their text descriptions.
            </p>
          </div>
        </div>

        <div className="border-t border-border/50 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© 2025 LLM-PROP · Crystal Property Prediction</span>
          <span className="flex items-center gap-1">
            Built with <Atom className="w-3 h-3 text-primary mx-0.5" /> T5 + React
          </span>
        </div>
      </div>
    </footer>
  );
}
