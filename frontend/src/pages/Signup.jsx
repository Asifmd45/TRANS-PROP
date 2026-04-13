import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Atom, ArrowRight, Check, ArrowLeft } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";

const EXPRESS_BASE_URL = import.meta.env.VITE_EXPRESS_BASE_URL || "";

const benefits = [
  "Unlimited crystal property predictions",
  "Save and export your results",
  "Access batch processing mode",
];

function Field({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  icon: Icon,
  showToggle,
  show,
  onToggle,
  focused,
  setFocused,
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
      <div
        className="relative rounded-xl transition-all duration-300"
        style={{
          boxShadow: focused === id
            ? "0 0 0 2px hsl(var(--primary) / 0.5), 0 0 20px hsl(var(--primary) / 0.1)"
            : "none",
        }}
      >
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <input
          type={showToggle ? (show ? "text" : "password") : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(id)}
          onBlur={() => setFocused(null)}
          placeholder={placeholder}
          required
          className="relative z-30 pointer-events-auto w-full bg-muted/80 border border-border pl-10 pr-10 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none rounded-xl transition-colors"
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            tabIndex={-1}
            className="absolute z-40 pointer-events-auto right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Signup() {
  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [focused,   setFocused]   = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${EXPRESS_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || "Signup failed");
      }

      setSubmitted(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message || "Signup failed");
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

            {/* Left panel — benefits */}
            <div
              className="p-10 flex flex-col justify-between relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, hsl(222 47% 8%), hsl(260 40% 12%))",
                borderRight: "1px solid hsl(222 30% 22% / 0.6)",
              }}
            >
              {/* Decorative glow */}
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
                  Start predicting<br />
                  <span className="gradient-text">crystal properties</span>
                </h2>
                <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                  Create your free account and get instant access to AI-powered material predictions.
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
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>

            {/* Right panel — form */}
            <div className="p-10 relative z-20 pointer-events-auto">
              {submitted ? (
                <div className="flex flex-col items-center justify-center h-full py-10 animate-fade-in-up text-center">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
                    style={{
                      background: "linear-gradient(135deg, hsl(142 76% 36% / 0.3), hsl(142 76% 36% / 0.1))",
                      border: "2px solid hsl(142 76% 36% / 0.5)",
                      boxShadow: "0 0 40px hsl(142 76% 36% / 0.3)",
                    }}
                  >
                    <Check className="w-10 h-10 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Account created!</h3>
                  <p className="text-sm text-muted-foreground">Redirecting you to sign in…</p>
                </div>
              ) : (
                <>
                  <div className="mb-7">
                    <h3 className="text-xl font-bold text-foreground">Create your account</h3>
                    <p className="text-muted-foreground text-sm mt-1">Free forever. No credit card required.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Field id="name" label="Full Name" type="text" value={name}
                      onChange={setName} placeholder="Jane Doe" icon={User}
                      focused={focused} setFocused={setFocused} />
                    <Field id="email" label="Email" type="email" value={email}
                      onChange={setEmail} placeholder="you@example.com" icon={Mail}
                      focused={focused} setFocused={setFocused} />
                    <Field id="password" label="Password" type="password" value={password}
                      onChange={setPassword} placeholder="••••••••" icon={Lock}
                      showToggle show={showPw} onToggle={() => setShowPw(s => !s)}
                      focused={focused} setFocused={setFocused} />

                    <button
                      type="submit"
                      disabled={!name || !email || !password || loading}
                      className="relative w-full py-3.5 rounded-xl font-bold text-sm overflow-hidden group mt-1 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))",
                        boxShadow: "0 0 30px hsl(var(--primary) / 0.3)",
                      }}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2 text-black">
                        {loading ? "Creating Account..." : "Create Account"}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                    </button>

                    {error && (
                      <p className="text-xs text-destructive">{error}</p>
                    )}
                  </form>
                </>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-5">
          By creating an account, you agree to our Terms of Service & Privacy Policy
        </p>
      </div>
    </div>
  );
}
