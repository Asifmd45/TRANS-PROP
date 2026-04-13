import { useEffect, useRef, useState } from "react";

const HIDDEN = {
  up:    "opacity-0 translate-y-12",
  down:  "opacity-0 -translate-y-12",
  left:  "opacity-0 translate-x-12",
  right: "opacity-0 -translate-x-12",
  scale: "opacity-0 scale-90",
  fade:  "opacity-0",
};

const VISIBLE = "opacity-100 translate-y-0 translate-x-0 scale-100";

export function useScrollReveal(options = {}) {
  const {
    threshold = 0.12,
    delay = 0,
    direction = "up",
    once = true,
  } = options;

  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => setVisible(true), delay);
          } else {
            setVisible(true);
          }
          if (once) obs.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, delay, once]);

  const className = `transition-all duration-700 ease-out ${
    visible ? VISIBLE : HIDDEN[direction]
  }`;

  return { ref, visible, className };
}

// Staggered children hook — returns a list of classNames, one per index
export function useStaggerReveal(
  count,
  options = {}
) {
  const { threshold = 0.1, staggerMs = 120, direction = "up", once = true } = options;
  const ref = useRef(null);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          for (let i = 0; i < count; i++) {
            setTimeout(() => setVisibleCount(v => Math.max(v, i + 1)), i * staggerMs);
          }
          if (once) obs.disconnect();
        }
      },
      { threshold }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [count, threshold, staggerMs, once]);

  const itemClass = (i) =>
    `transition-all duration-700 ease-out ${
      i < visibleCount ? VISIBLE : HIDDEN[direction]
    }`;

  return { ref, visibleCount, itemClass };
}
