import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Atom } from "lucide-react";

const navLinks = [
  { to: "/", label: "Home", hash: "" },
  { to: "/#how-it-works", label: "How It Works", hash: "how-it-works" },
  { to: "/#features", label: "Features", hash: "features" },
  { to: "/predict", label: "Predict", hash: "" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (to, hash) => {
    setOpen(false);
    if (hash && location.pathname === "/") {
      setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
          ? "bg-background/85 backdrop-blur-md border-b border-border/60 shadow-lg shadow-black/20"
          : "bg-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Atom className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-wider">
              <span className="gradient-text">LLM</span>
              <span className="text-foreground ml-1">PROP</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => handleNav(l.to, l.hash)}
                className="px-4 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 hover:scale-[1.02]"
              >
                {l.label}
              </Link>
            ))}

            {/* Divider */}
            <div className="w-px h-5 bg-border mx-1" />

            {/* Login */}
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-all duration-200 hover:scale-[1.02]"
            >
              Login
            </Link>

            {/* Sign Up (primary CTA) */}
            <Link
              to="/signup"
              className="ml-1 px-5 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-accent-hover transition-all duration-200 hover:scale-[1.03] animate-pulse-glow"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(true)}
            className="md:hidden text-foreground p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-72 bg-card border-l border-border p-6 animate-slide-in-right">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-foreground p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-2 mb-10">
              <Atom className="w-5 h-5 text-primary" />
              <span className="font-bold">
                <span className="gradient-text">LLM</span>
                <span className="text-foreground ml-1">PROP</span>
              </span>
            </Link>

            <div className="flex flex-col gap-1">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => handleNav(l.to, l.hash)}
                  className="px-4 py-3 text-foreground hover:bg-muted rounded-xl transition-colors text-sm font-medium"
                >
                  {l.label}
                </Link>
              ))}
              <div className="my-3 border-t border-border" />
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-center rounded-xl border border-primary/30 text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-center rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-accent-hover transition-colors mt-1"
              >
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
