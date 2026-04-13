import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Atom, ArrowRight, Sparkles, ArrowLeft, Check } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";

const EXPRESS_BASE_URL = import.meta.env.VITE_EXPRESS_BASE_URL || "";
const TOKEN_KEY = "llmprop_token";
const USER_KEY = "llmprop_user";

const benefits = [
  "Access your prediction history",
  "Secure authenticated prediction API",
  "Continue your materials workflow instantly",
];

export default function Login() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [focused,  setFocused]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = location.state?.from?.pathname || "/predict";

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${EXPRESS_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user || {}));

      navigate(fromPath, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      <Link to="/" className="absolute top-6 left-6 z-50 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
      </Link>
      <AnimatedBackground />

      <div className="absolute inset-0 bg-background/70 z-[1] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[600px] h-[350px] rounded-full blur-3xl bg-secondary/8 z-[1] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] rounded-full blur-3xl bg-primary/6 z-[1] pointer-events-none" />

      <div className="relative z-20 w-full max-w-[900px] mx-auto px-4 py-16 pointer-events-auto">
        <div
          className="rounded-3xl overflow-hidden animate-fade-in-up"
          style={{
            background: "hsl(222 40% 10% / 0.85)",
            border: "1px solid hsl(222 30% 22% / 0.8)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 0 80px hsl(260 60% 55% / 0.08), 0 30px 80px rgba(0,0,0,0.5)",
          }}
        >
          <div className="grid md:grid-cols-2">
            <div
              className="p-10 flex flex-col justify-between relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, hsl(222 47% 8%), hsl(260 40% 12%))",
                borderRight: "1px solid hsl(222 30% 22% / 0.6)",
              }}
            >
              <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <Link to="/" className="inline-flex items-center gap-2 mb-10 group">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{
                      background: "linear-gradient(135deg, hsl(199 89% 48% / 0.25), hsl(260 60% 55% / 0.2))",
                      border: "1px solid hsl(199 89% 48% / 0.4)",
                    }}
                  >
                    <Atom className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-extrabold text-xl">
                    <span className="gradient-text">LLM</span>
                    <span className="text-foreground ml-1">PROP</span>
                  </span>
                </Link>

                <h2 className="text-2xl font-bold text-foreground mb-2 leading-tight">
                  Welcome back to<br />
                  <span className="gradient-text">LLM-PROP</span>
                </h2>
                <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                  Sign in to continue predicting crystal properties.
                </p>

                <ul className="space-y-3">
                  {benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative z-10 mt-10">
                <p className="text-xs text-muted-foreground/60">
                  New here?{" "}
                  <Link to="/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">
                    Create an account
                  </Link>
                </p>
              </div>
            </div>

            <div className="p-10 relative z-20 pointer-events-auto">
              <div className="mb-7">
                <h3 className="text-xl font-bold text-foreground">Sign in</h3>
                <p className="text-muted-foreground text-sm mt-1">Use your account credentials to continue.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                      className="relative z-30 pointer-events-auto w-full bg-muted/80 border border-border pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none rounded-xl transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Password
                  </label>
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
                      className="relative z-30 pointer-events-auto w-full bg-muted/80 border border-border pl-10 pr-11 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none rounded-xl transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(s => !s)}
                      className="absolute z-40 pointer-events-auto right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim() || !password}
                  className="relative w-full py-3.5 rounded-xl font-bold text-sm overflow-hidden group mt-1 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))",
                    boxShadow: "0 0 30px hsl(var(--primary) / 0.3)",
                  }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 text-black">
                    {loading ? "Signing In..." : "Sign In"}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                </button>

                {error && (
                  <p className="text-xs text-destructive">{error}</p>
                )}
              </form>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">OR</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <Link
                to="/signup"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-muted/40 transition-all group"
              >
                <Sparkles className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                Create a free account
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-5">
          By signing in, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
