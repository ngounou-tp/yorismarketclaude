// ═══════════════════════════════════════════════════════════════════════════
// 🎬 YORIX — Hooks d'animation premium pour la HomePage
// ═══════════════════════════════════════════════════════════════════════════
// Zero-dépendance · GPU-friendly · accessibilité (prefers-reduced-motion)
// IntersectionObserver natif · requestAnimationFrame
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from "react";

// ─── 1) Respect strict de prefers-reduced-motion ───────────────────────────
export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cb = (e) => setReduced(e.matches);
    m.addEventListener?.("change", cb);
    return () => m.removeEventListener?.("change", cb);
  }, []);
  return reduced;
}

// ─── 2) Reveal au scroll (ajoute la classe `is-in` à l'élément) ────────────
// Usage :
//   const ref = useScrollReveal();
//   <div ref={ref} className="yx-reveal">…</div>
export function useScrollReveal(options = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof window === "undefined" ||
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("is-in");
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px", ...options }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [options.threshold, options.rootMargin]);
  return ref;
}

// ─── 3) Reveal pour plusieurs enfants automatiquement (staggered) ──────────
// Usage : <div ref={useStaggerReveal()}>… chaque enfant aura .yx-reveal .is-in
export function useStaggerReveal(delayMs = 70) {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const children = Array.from(root.children);
    children.forEach((c, i) => {
      c.classList.add("yx-reveal");
      c.style.setProperty("--yx-d", `${i * delayMs}ms`);
    });
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      children.forEach((c) => c.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            children.forEach((c) => c.classList.add("is-in"));
            io.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
    );
    io.observe(root);
    return () => io.disconnect();
  }, [delayMs]);
  return ref;
}

// ─── 4) Compteur animé "count-up" (déclenché à l'apparition) ───────────────
// Usage : <CountUp value={1280} />
export function useCountUp(target, { duration = 1400, decimals = 0 } = {}) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const isReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) {
      setVal(target);
      return;
    }
    let raf = 0;
    let started = false;
    const ease = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic

    const run = () => {
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / duration);
        const v = ease(p) * target;
        setVal(decimals ? Number(v.toFixed(decimals)) : Math.round(v));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started) {
            started = true;
            run();
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, duration, decimals]);
  return [ref, val];
}

// ─── 5) Composant utilitaire CountUp prêt à l'emploi ───────────────────────
// Affiche un nombre formaté FR + suffixe optionnel
export function CountUp({ value, suffix = "", prefix = "", className = "", duration = 1400, decimals = 0 }) {
  const [ref, current] = useCountUp(Number(value) || 0, { duration, decimals });
  const formatted = decimals
    ? current.toLocaleString("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.round(current).toLocaleString("fr-FR");
  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

// ─── 6b) useInViewClass — adds a CSS class when element enters viewport ───────
// Usage: const ref = useInViewClass("is-in"); <div ref={ref} className="yx-reveal">
export function useInViewClass(className = "is-in", threshold = 0.15) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add(className);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add(className);
          io.unobserve(el);
        }
      },
      { threshold, rootMargin: "0px 0px -30px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [className, threshold]);
  return ref;
}

// ─── 6) Tilt 3D ultra-léger au pointeur (cartes premium) ────────────────────
export function useTilt({ max = 6 } = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia?.("(hover: none)").matches) return; // pas en tactile
    let raf = 0;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(900px) rotateX(${-y * max}deg) rotateY(${x * max}deg) translateZ(0)`;
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      el.style.transform = "perspective(900px) rotateX(0) rotateY(0)";
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [max]);
  return ref;
}
