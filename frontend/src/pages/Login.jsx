import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Atom, ArrowRight, Sparkles, ArrowLeft } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function Login() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [focused,  setFocused]  = useState(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/predict");
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      <Link to="/" className="absolute top-6 left-6 z-50 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
      </Link>
      <AnimatedBackground />

      {/* Glow overlays */}
      <div className="absolute inset-0 bg-background/70 z-[1]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full blur-3xl bg-primary/8 z-[1] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full blur-3xl bg-secondary/6 z-[1] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[420px] mx-auto px-4 py-20">
        {/* Card */}
        <div
          className="rounded-3xl p-8 animate-fade-in-up"
          style={{
            background: "hsl(222 40% 10% / 0.85)",
            border: "1px solid hsl(222 30% 22% / 0.8)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 0 80px hsl(199 89% 48% / 0.08), 0 30px 80px rgba(0,0,0,0.5)",
          }}
        >
          {/* Brand */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex flex-col items-center gap-2 group">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1 group-hover:scale-110 transition-transform"
                style={{
                  background: "linear-gradient(135deg, hsl(199 89% 48% / 0.2), hsl(260 60% 55% / 0.15))",
                  border: "1px solid hsl(199 89% 48% / 0.3)",
                  boxShadow: "0 0 30px hsl(199 89% 48% / 0.2)",
                }}
              >
                <Atom className="w-7 h-7 text-primary" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight">
                <span className="gradient-text">LLM</span>
                <span className="text-foreground ml-1">PROP</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm mt-3">Welcome back. Sign in to continue.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Email
              </label>
              <div
                className="relative rounded-xl overflow-hidden transition-all duration-300"
                style={{
                  boxShadow: focused === "email"
                    ? "0 0 0 2px hsl(var(--primary) / 0.5), 0 0 20px hsl(var(--primary) / 0.1)"
                    : "none",
                }}
              >
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-muted/80 border border-border pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none rounded-xl transition-colors"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Password
                </label>
                <button type="button" className="text-[11px] text-primary hover:text-primary/80 transition-colors">
                  Forgot password?
                </button>
              </div>
              <div
                className="relative rounded-xl overflow-hidden transition-all duration-300"
                style={{
                  boxShadow: focused === "password"
                    ? "0 0 0 2px hsl(var(--primary) / 0.5), 0 0 20px hsl(var(--primary) / 0.1)"
                    : "none",
                }}
              >
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-muted/80 border border-border pl-10 pr-11 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none rounded-xl transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="relative w-full py-3.5 rounded-xl font-semibold text-sm overflow-hidden group mt-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))",
                boxShadow: "0 0 30px hsl(var(--primary) / 0.3)",
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2 text-black font-bold">
                Sign In
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Sign up link */}
          <Link
            to="/signup"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-muted/40 transition-all group"
          >
            <Sparkles className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            Create a free account
          </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground/60 mt-6">
          By signing in, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
