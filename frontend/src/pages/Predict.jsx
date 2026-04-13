import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import {
  FlaskConical, Send,
  MessageCircle, X, ChevronDown, Sparkles, ClipboardPaste,
} from "lucide-react";

const EXPRESS_BASE_URL = import.meta.env.VITE_EXPRESS_BASE_URL || "";

const chatResponses = {
  nacl:  "Sodium chloride (NaCl) crystallizes in a rock salt structure (Fm-3m) with a face-centered cubic lattice. Lattice parameter a = 5.64 Å. Each Na⁺ is surrounded by 6 Cl⁻ ions.",
  sio2:  "Silicon dioxide (SiO2) forms a tetrahedral network. In its α-quartz polymorph, it has a trigonal crystal system (P3₂21) with a = 4.91 Å, c = 5.40 Å.",
  tio2:  "Titanium dioxide (TiO2) in rutile structure has tetragonal symmetry (P4₂/mnm) with a = 4.59 Å, c = 2.96 Å. Each Ti is coordinated by 6 oxygen atoms.",
  fe2o3: "Iron(III) oxide (Fe2O3) hematite has a rhombohedral structure (R-3c) with a = 5.04 Å, c = 13.75 Å. Each Fe is octahedrally coordinated by 6 oxygen atoms.",
  gaas:  "Gallium arsenide (GaAs) adopts a zinc-blende structure (F-43m) with a = 5.65 Å. It is a direct-bandgap semiconductor used in optoelectronics.",
};

export default function Predict() {
  const [input,   setInput]   = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [revealed, setRevealed] = useState(false);

  // Chat state
  const [chatOpen,  setChatOpen]  = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { role: "bot", text: "Hi! Enter a chemical formula (e.g. NaCl, TiO2) and I'll generate its crystal description for you." },
  ]);
  const lastBotMsg = chatMessages.filter(m => m.role === "bot").at(-1)?.text ?? "";
  const chatBodyRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatMessages, chatOpen]);

  // Scroll reveal for results
  useEffect(() => {
    if (results) setTimeout(() => setRevealed(true), 50);
    else setRevealed(false);
  }, [results]);

  const formatResults = (prediction) => ([
    { property: "is_gap_direct", value: prediction.is_gap_direct },
    { property: "energy_per_atom", value: Number(prediction.energy_per_atom).toFixed(6) },
    { property: "formation_energy_per_atom", value: Number(prediction.formation_energy_per_atom).toFixed(6) },
    { property: "band_gap", value: Number(prediction.band_gap).toFixed(6) },
    { property: "e_above_hull", value: Number(prediction.e_above_hull).toFixed(6) },
    { property: "volume", value: Number(prediction.volume).toFixed(6) },
  ]);

  const handlePredict = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setResults(null);
    setError("");
    setRevealed(false);

    try {
      const response = await fetch(`${EXPRESS_BASE_URL}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Prediction failed");
      }

      const prediction = await response.json();
      setResults(formatResults(prediction));
    } catch (err) {
      setError(err.message || "Could not connect to the API");
    } finally {
      setLoading(false);
    }
  };

  const handleChat = () => {
    if (!chatInput.trim()) return;
    const q = chatInput.trim();
    setChatMessages(prev => [...prev, { role: "user", text: q }]);
    setChatInput("");
    setTimeout(() => {
      const key = q.toLowerCase().replace(/\s/g, "");
      const reply = chatResponses[key] ??
        `Crystal description for "${q}": A crystalline material with formula ${q}, exhibiting a periodic atomic arrangement with characteristic bond lengths and coordination polyhedra. Enter a well-known compound like NaCl or TiO2 for detailed structural data.`;
      setChatMessages(prev => [...prev, { role: "bot", text: reply }]);
    }, 700);
  };

  const useDescription = () => {
    setInput(lastBotMsg);
    setChatOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Shared dark 3D background */}
      <AnimatedBackground />
      <Navbar />

      <main className="flex-1 relative pt-24 pb-20 z-10">
        <div className="max-w-2xl mx-auto px-6">

          {/* Page header */}
          <div className="mb-10 animate-fade-in-up">
            <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-2 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> AI Inference
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold gradient-text mb-2">
              Predict Properties
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Enter a crystal description to predict material properties.
            </p>
          </div>

          {/* Input card */}
          <div
            className="glass-card rounded-2xl p-6 mb-5 animate-fade-in-up"
            style={{ animationDelay: "180ms" }}
          >
            <div className="relative">
              <textarea
                id="crystal-description"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Describe the crystalline material…  e.g. Sodium chloride (NaCl) in rock salt (Fm-3m), a = 5.64 Å"
                className="w-full h-44 bg-muted/60 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono transition-all"
              />
              {input && (
                <button
                  onClick={() => setInput("")}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                  title="Clear"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Predict button */}
          <button
            onClick={handlePredict}
            disabled={loading || !input.trim()}
            className="w-full py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-accent-hover transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] animate-pulse-glow mb-10"
            style={{ animationDelay: "260ms" }}
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

          {error && (
            <p className="text-sm text-red-400 mb-6">{error}</p>
          )}

          {/* Results */}
          {results && (
            <div
              className={`glass-card rounded-2xl p-6 transition-all duration-700 ${
                revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <h2 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-primary" />
                Predicted Properties
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {results.map((r, i) => (
                  <div
                    key={r.property}
                    className="rounded-xl p-4 bg-muted/60 border border-border hover:border-primary/40 transition-all"
                    style={{
                      animationDelay: `${i * 80}ms`,
                      animation: "fadeInUp 0.5s ease-out both",
                    }}
                  >
                    <p className="text-xs text-muted-foreground mb-1">{r.property}</p>
                    <p className="text-lg font-bold text-primary font-mono">{r.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Floating mini chatbot ─────────────────────────────────── */}
      <div className="fixed top-20 right-4 z-50 flex flex-col items-end gap-2">
        {/* Expanded panel */}
        {chatOpen && (
          <div className="w-80 rounded-2xl overflow-hidden shadow-2xl border border-border animate-fade-in-up glass-card flex flex-col"
            style={{ height: 380 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                  <MessageCircle className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-xs font-semibold text-foreground">Crystal Helper</span>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={chatBodyRef} className="flex-1 overflow-y-auto p-3 space-y-2">
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground border border-border"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Use Description button (shows after any bot reply) */}
            {chatMessages.length > 1 && (
              <div className="px-3 pb-1">
                <button
                  onClick={useDescription}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  Use Description
                </button>
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-border flex gap-2">
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleChat()}
                placeholder="Type formula (e.g. NaCl)"
                className="flex-1 bg-muted border border-border rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
              <button
                onClick={handleChat}
                disabled={!chatInput.trim()}
                className="p-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Toggle FAB */}
        <button
          onClick={() => setChatOpen(o => !o)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-medium text-xs transition-all hover:scale-[1.05] active:scale-95 shadow-xl ${
            chatOpen
              ? "bg-muted border border-border text-muted-foreground"
              : "bg-primary text-primary-foreground animate-pulse-glow"
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          {chatOpen ? "Close" : "Don't know the description?"}
        </button>
      </div>

      <Footer />
    </div>
  );
}
