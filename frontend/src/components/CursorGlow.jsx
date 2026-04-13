import { useEffect, useRef } from "react";

/**
 * Renders a soft radial glow that follows the mouse cursor across the entire page.
 */
export default function CursorGlow() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e) => {
      el.style.left = `${e.clientX}px`;
      el.style.top  = `${e.clientY}px`;
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return <div ref={ref} className="cursor-glow" aria-hidden="true" />;
}
