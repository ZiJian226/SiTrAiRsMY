"use client";

import { useEffect, useRef } from "react";
import { fadeInUp, staggerFadeInUp } from "@/lib/animations";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  animation?: "fadeInUp" | "stagger";
  delay?: number;
}

export default function AnimatedSection({
  children,
  className = "",
  animation = "fadeInUp",
  delay = 0,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (animation === "fadeInUp") {
                fadeInUp(entry.target as HTMLElement, delay);
              } else if (animation === "stagger") {
                const children = entry.target.children;
                staggerFadeInUp(children as any);
              }
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1,
        }
      );

      observer.observe(ref.current);

      return () => observer.disconnect();
    }
  }, [animation, delay]);

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
