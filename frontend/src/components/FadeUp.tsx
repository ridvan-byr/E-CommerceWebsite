"use client";

import { useEffect, useRef, useState } from "react";

interface FadeUpProps {
  children: React.ReactNode;
  delay?: number;       // ms — birden fazla eleman için sıralı gecikme
  duration?: number;    // ms
  distance?: number;    // px — ne kadar aşağıdan gelecek
  className?: string;
  once?: boolean;       // true = sadece bir kez tetikle (varsayılan), false = her scroll'da
  threshold?: number;   // 0-1, elementin kaçı görününce tetiklensin
}

export default function FadeUp({
  children,
  delay = 0,
  duration = 500,
  distance = 28,
  className = "",
  once = true,
  threshold = 0.12,
}: FadeUpProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${distance}px)`,
        transition: `opacity ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
