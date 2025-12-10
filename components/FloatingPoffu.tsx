"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

export default function FloatingPoffu() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showStarTransition, setShowStarTransition] = useState(false);
  const [phase, setPhase] = useState<"idle" | "moving" | "closing" | "holding" | "poffuEffect" | "opening">("idle");
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; opacity: number; size: number }>>([]);
  const [direction, setDirection] = useState<"north" | "south" | "east" | "west">("south"); // Track sprite direction
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const animationFrame = useRef<number | undefined>(undefined);
  const poffuRef = useRef<HTMLDivElement | null>(null);
  const poffuSize = 50;
  const stopDistance = 50;
  const particleCounter = useRef(0);

  // Initialize position to bottom right (NextJS dev tool offset)
  useEffect(() => {
    const initX = window.innerWidth - poffuSize - 80; // 80px offset like dev tool
    const initY = window.innerHeight - poffuSize - 80;
    setPosition({ x: initX, y: initY });
    setTargetPosition({ x: initX, y: initY });
  }, []);

  // Handle page transitions
  useEffect(() => {
    // We no longer auto-trigger transition on pathname change because navigation is intercepted.
    prevPathname.current = pathname;
  }, [pathname]);

  const router = useRouter();
  const transitionTarget = useRef<string | null>(null);

  // Configurable transition timing (all in milliseconds)
  const TIMING = {
    poffuMoveToCenter: 300,      // Step 1: Time for Poffu to move to center
    starCloseAnimation: 500,     // Step 2: Time for star to close down
    navigationDelay: 300,        // Step 3: Wait time before navigation
    poffuEffectDuration: 300,    // Step 4: Poffu glow effect duration
    starOpenAnimation: 500,      // Step 5: Time for star to open back up
  };

  // Run controlled page transition to `href`
  const runTransition = async (href: string) => {
    if (!href) return;
    // Prevent concurrent transitions
    if (phase !== "idle") return;
    transitionTarget.current = href;

    // STEP 1: Poffu changes to "notice" sprite and moves to center
    setPhase("moving");
    setIsTransitioning(true);
    
    // Wait one frame to ensure state updates are processed
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    
    // Capture current on-screen position AFTER state changes.
    // Prefer the actual DOM position (accurate even if state is slightly stale).
    const rect = poffuRef.current?.getBoundingClientRect();
    const currentPos = { x: position.x, y: position.y };

    if (rect) {
      currentPos.x = rect.left;
      currentPos.y = rect.top;
    }

    // Fallback if position is missing or still at origin
    if ((currentPos.x === 0 && currentPos.y === 0) || Number.isNaN(currentPos.x) || Number.isNaN(currentPos.y)) {
      currentPos.x = window.innerWidth - poffuSize - 80;
      currentPos.y = window.innerHeight - poffuSize - 80;
    }
    
    const centerX = window.innerWidth / 2 - poffuSize / 2;
    const centerY = window.innerHeight / 2 - poffuSize / 2;
    
    // Calculate distance to determine dynamic duration
    const distanceX = centerX - currentPos.x;
    const distanceY = centerY - currentPos.y;
    const totalDistance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    
    // Dynamic duration: scale based on distance (min 400ms, max as configured)
    const pixelsPerMs = 1; // 1 pixel per millisecond for smooth movement
    const calculatedDuration = Math.max(400, Math.min(TIMING.poffuMoveToCenter, totalDistance / pixelsPerMs));
    
    // Manually animate to center from current position
    const startTime = Date.now();
    
    const animateToCenter = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / calculatedDuration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      
      const currentX = currentPos.x + distanceX * easeProgress;
      const currentY = currentPos.y + distanceY * easeProgress;
      
      setPosition({ x: currentX, y: currentY });
      
      // Create scattered dust particles during transition movement
      if (Math.random() < 0.5) { // 50% chance each frame for natural look
        const particleId = particleCounter.current++;
        // Scatter particles around Poffu's center with random offset
        const scatterX = (Math.random() - 0.5) * 20; // -10 to +10 px
        const scatterY = (Math.random() - 0.5) * 20; // -10 to +10 px
        const particleSize = 4 + Math.random() * 4; // 4-8px random size
        setParticles((p) => [
          ...p.slice(-100),
          { 
            id: particleId, 
            x: currentX + poffuSize / 2 + scatterX, 
            y: currentY + poffuSize / 2 + scatterY, 
            opacity: 1,
            size: particleSize
          },
        ]);
      }
      
      if (progress < 1) {
        requestAnimationFrame(animateToCenter);
      }
    };
    
    animateToCenter();
    await new Promise((r) => setTimeout(r, calculatedDuration));

    // STEP 2: Show star overlay and start closing animation (behind Poffu, in front of page)
    setShowStarTransition(true);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null))));
    setPhase("closing");
    await new Promise((r) => setTimeout(r, TIMING.starCloseAnimation));

    // STEP 3: Page covered in black, navigate in backend
    setPhase("holding");
    await new Promise((r) => setTimeout(r, TIMING.navigationDelay));
    
    try {
      await router.push(href);
    } catch (err) {
      window.location.href = href;
    }

    // Wait for new page to mount
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null))));

    // STEP 4: Poffu effect (default sprite with glow and scale)
    setPhase("poffuEffect");
    await new Promise((r) => setTimeout(r, TIMING.poffuEffectDuration));

    // STEP 5: Star opens back up to reveal page
    setPhase("opening");
    await new Promise((r) => setTimeout(r, TIMING.starOpenAnimation));

    // Cleanup
    setShowStarTransition(false);
    setPhase("idle");
    setIsTransitioning(false);
    transitionTarget.current = null;
  };

  // Intercept link clicks site-wide to run transition
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const anchor = target?.closest && (target as Element).closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      const targetAttr = anchor.getAttribute("target");
      const download = anchor.hasAttribute("download");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || targetAttr === "_blank" || download) return;

      // Same origin only
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
      } catch {
        return;
      }

      e.preventDefault();
      runTransition(href);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // Mouse tracking with direction calculation
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // ONLY block mouse tracking during transition, don't set targetPosition or direction
      if (isTransitioning) return;
      setTargetPosition({ x: e.clientX, y: e.clientY });
      
      // Calculate direction based on cursor position relative to Poffu center
      const poffuCenterX = position.x + poffuSize / 2;
      const poffuCenterY = position.y + poffuSize / 2;
      const dx = e.clientX - poffuCenterX;
      const dy = e.clientY - poffuCenterY;
      
      // Determine dominant direction (only when not transitioning)
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal dominant
        setDirection(dx > 0 ? "east" : "west");
      } else {
        // Vertical dominant
        setDirection(dy > 0 ? "south" : "north");
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isTransitioning, position]);

  // Smooth chase animation with conditional wave floating
  useEffect(() => {
    const animate = () => {
      setPosition((prev) => {
        // During transition, don't animate position (it's controlled by manual animation)
        if (isTransitioning) {
          return prev;
        }

        // Calculate distance from cursor to Poffu's CENTER (not top-left corner)
        const poffuCenterX = prev.x + poffuSize / 2;
        const poffuCenterY = prev.y + poffuSize / 2;
        const dx = targetPosition.x - poffuCenterX;
        const dy = targetPosition.y - poffuCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Stop moving if within stopDistance of target
        if (distance < stopDistance) {
          // When stopped, show the default (south) sprite (only if not transitioning)
          if (!isTransitioning) {
            setDirection("south");
          }
          return prev;
        }

        // Slower, smoother easing - reduced speed for more delay
        const speed = 0.01; // Reduced from 0.05
        let newX = prev.x + dx * speed;
        let newY = prev.y + dy * speed;

        // Add cloud wave floating effect ONLY when chasing (distance > stopDistance)
        const time = Date.now() / 500;
        const waveX = Math.sin(time * 4) * 0.2;
        const waveY = Math.cos(time * 3) * 0.3;
        newX += waveX;
        newY += waveY;

        // Page boundaries
        newX = Math.max(0, Math.min(window.innerWidth - poffuSize, newX));
        newY = Math.max(0, Math.min(window.innerHeight - poffuSize, newY));

        // Create scattered dust particle effect when moving (only while chasing)
        if (distance > stopDistance && Math.random() < 0.3) { // 30% chance per frame
          const particleId = particleCounter.current++;
          // Scatter particles around Poffu's center with random offset
          const scatterX = (Math.random() - 0.5) * 20; // -10 to +10 px
          const scatterY = (Math.random() - 0.5) * 20; // -10 to +10 px
          const particleSize = 4 + Math.random() * 4; // 4-8px random size
          setParticles((p) => [
            ...p.slice(-100),
            { 
              id: particleId, 
              x: prev.x + poffuSize / 2 + scatterX, 
              y: prev.y + poffuSize / 2 + scatterY, 
              opacity: 1,
              size: particleSize
            },
          ]);
        }

        return { x: newX, y: newY };
      });
      animationFrame.current = requestAnimationFrame(animate);
    };

    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [targetPosition, isTransitioning, stopDistance]);

  // Fade out particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({ ...p, opacity: p.opacity - 0.05 }))
          .filter((p) => p.opacity > 0)
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Full black screen during holding and poffuEffect phases (100% coverage) */}
      {(phase === "holding" || phase === "poffuEffect") && (
        <div
          className="fixed inset-0 bg-black pointer-events-none"
          style={{ zIndex: 9998 }}
        />
      )}

      {/* Page Transition Overlay - Star shape scale animation */}
      {showStarTransition && (
        <div
          className="fixed inset-0 pointer-events-none flex items-center justify-center"
          style={{
            zIndex: 9999,
            width: "100vw",
            height: "100vh",
            overflow: "hidden",
          }}
        >
          {/* SVG mask: black overlay with star-shaped hole. The star group is animated (scale down then up). */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: "block" }}
            aria-hidden
          >
            <defs>
              <mask id="starmy-star-mask">
                {/* white = reveal overlay, black = transparent hole */}
                <rect x="0" y="0" width="100" height="100" fill="white" />
                <g id="starmy-star-group" transform="translate(50 50)">
                  {/* star polygon centered at 0,0 sized to fit viewBox (use path/polygon) */}
                  <polygon
                    id="starmy-star-polygon"
                    points="0,-40 11,-12 40,-12 16,6 25,36 0,18 -25,36 -16,6 -40,-12 -11,-12"
                    fill="black"
                    style={{
                      transformOrigin: 'center',
                      transformBox: 'fill-box',
                      transform: 
                        phase === 'closing' ? 'scale(5)' : 
                        phase === 'holding' || phase === 'poffuEffect' ? 'scale(0)' : 
                        phase === 'opening' ? 'scale(0)' : 
                        'scale(5)',
                      animation:
                        phase === 'closing'
                          ? `starClose ${TIMING.starCloseAnimation}ms ease-in-out forwards`
                          : phase === 'opening'
                          ? `starOpen ${TIMING.starOpenAnimation}ms ease-in-out forwards`
                          : undefined,
                    }}
                  />
                </g>
              </mask>
            </defs>

            {/* Black overlay which uses the mask so the star area becomes transparent */}
            <rect x="0" y="0" width="100%" height="100%" fill="black" mask="url(#starmy-star-mask)" />
          </svg>
        </div>
      )}

      {/* Dust Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="fixed pointer-events-none rounded-full"
          style={{
            left: particle.x,
            top: particle.y,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: "#8D76D1", // Primary color
            opacity: particle.opacity,
            transform: "translate(-50%, -50%)",
            boxShadow: `0 0 ${particle.size * 1.5}px #8D76D1`,
            zIndex: 10000, // Above black screen and star overlay
            transition: "opacity 0.3s ease-out",
          }}
        />
      ))}

      {/* Poffu Mascot */}
      <div
        className="fixed pointer-events-auto cursor-pointer"
        ref={poffuRef}
        style={{
          left: position.x,
          top: position.y,
          width: `${poffuSize}px`,
          height: `${poffuSize}px`,
          zIndex: 10001,
          transform: phase === "poffuEffect" ? "scale(2)" : "scale(1)",
          filter: phase === "poffuEffect" ? "drop-shadow(0 0 8px rgba(141, 118, 209, 0.8))" : "none",
          transition: phase === "poffuEffect" ? "transform 100ms ease-out, filter 100ms ease-out" : "none",
        }}
        onMouseEnter={() => !isTransitioning && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={
            // During transition phases, show specific sprites and ignore direction
            phase === "moving" || phase === "closing" || phase === "holding"
              ? "/assets/images/mascot/starmy-poffu-notice.svg"
              : phase === "poffuEffect" || phase === "opening"
              ? "/assets/images/mascot/starmy-poffu-default.svg"
              : isHovered
              ? "/assets/images/mascot/starmy-poffu-notice.svg"
              : direction === "north"
              ? "/assets/images/mascot/starmy-poffu-back.svg"
              : direction === "east"
              ? "/assets/images/mascot/starmy-poffu-side.svg"
              : direction === "west"
              ? "/assets/images/mascot/starmy-poffu-side.svg"
              : "/assets/images/mascot/starmy-poffu-default.svg" // south
          }
          alt="Poffu Mascot"
          width={poffuSize}
          height={poffuSize}
          className="select-none"
          style={{
            transform: direction === "east" && phase === "idle" ? "scaleX(-1)" : "scaleX(1)", // Only flip when idle
          }}
          draggable={false}
          priority
        />
      </div>

      {/* Star mask animation CSS: separate close/open animations */}
      <style jsx global>{`
        #starmy-star-group { transform-origin: 50% 50%; }
        #starmy-star-polygon { transform-origin: center center; transform-box: fill-box; }

        @keyframes starClose {
          0% { transform: scale(5); }
          100% { transform: scale(0); }
        }

        @keyframes starOpen {
          0% { transform: scale(0); }
          100% { transform: scale(5); }
        }
      `}</style>
    </>
  );
}
