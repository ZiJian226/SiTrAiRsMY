"use client";

import { useEffect, useState, useRef } from "react";
import { ASSETS } from "@/lib/assetPath";

type PoffuState = "flying" | "stopping" | "front-view" | "resuming";

export default function PoffuAnimationPage() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState<"east" | "west">("east");
  const [poffuState, setPoffuState] = useState<PoffuState>("flying");
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; opacity: number; size: number }>>([]);
  const [isMounted, setIsMounted] = useState(false);
  const particleCounter = useRef(0);
  const currentStateRef = useRef<PoffuState>("flying"); // Track current state for animation loop
  const poffuSize = 100; // Size of Poffu in pixels for rendering and bounds
  
  // Size offset adjustment: side sprite is slightly bigger than default sprite
  // Adjust Y offset to align them vertically (move side sprite up a bit)
  const sideViewYOffset = -8; // Negative moves up, adjust as needed

  // Sync state to ref
  useEffect(() => {
    currentStateRef.current = poffuState;
  }, [poffuState]);

  // Prevent hydration mismatch by only rendering random elements on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let animationFrame: number;
    const centerY = window.innerHeight / 2;

    // Sine wave parameters
    const amplitude = 50; // Height of the sine wave (up/down movement)
    const horizontalSpeed = 1.5; // Speed of left-right movement
    const leftBound = 800;
    const rightBound = window.innerWidth - 800 - poffuSize;
    
    // Calculate optimal frequency for sine wave to align with center at boundaries
    // Distance-based sine wave ensures Poffu is at center Y when reaching sides
    const distance = rightBound - leftBound;
    const frequency = (Math.PI / distance) * 2 ; // One complete sine cycle = full trip left-to-right-to-left

    let currentX = leftBound;
    let movingRight = true;
    let isPaused = false;
    let distanceTraveled = 0;
    let frameCount = 0;

    const animate = () => {
      if (isPaused) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }
      
      frameCount++;
      
      // Horizontal movement (left to right, then right to left)
      if (movingRight) {
        currentX += horizontalSpeed;
        distanceTraveled += horizontalSpeed;
        if (currentX >= rightBound) {
          // Reached right side - pause
          currentX = rightBound;
          isPaused = true;
          
          // Transition sequence: stopping (side→front) -> front-view -> resuming (front→opposite side) -> flying
          setPoffuState("stopping");
          
          setTimeout(() => {
            setPoffuState("front-view");
            setTimeout(() => {
              setPoffuState("resuming");
              // Change direction during resuming animation
              setDirection("west");
              setTimeout(() => {
                movingRight = false;
                isPaused = false;
                distanceTraveled = 0; // Reset for return journey
                setPoffuState("flying");
              }, 300); // Resume transition
            }, 400); // Front view duration
          }, 300); // Stop transition
        }
      } else {
        currentX -= horizontalSpeed;
        distanceTraveled += horizontalSpeed;
        if (currentX <= leftBound) {
          // Reached left side - pause
          currentX = leftBound;
          isPaused = true;
          
          setPoffuState("stopping");
          
          setTimeout(() => {
            setPoffuState("front-view");
            setTimeout(() => {
              setPoffuState("resuming");
              setDirection("east");
              setTimeout(() => {
                movingRight = true;
                isPaused = false;
                distanceTraveled = 0;
                setPoffuState("flying");
              }, 300);
            }, 400);
          }, 300);
        }
      }

      // Vertical movement (sine wave) - distance-based for perfect alignment
      const y = centerY + Math.sin(distanceTraveled * frequency) * amplitude;

      // Update position via React state
      setPosition({ x: currentX, y: y - poffuSize / 2 });

      // Create scattered dust particle effect (only when flying) - reduced frequency
      if (!isPaused && frameCount % 3 === 0 && Math.random() < 0.4) {
        const particleId = particleCounter.current++;
        // Spawn particles at the bottom of Poffu with random horizontal scatter
        const scatterX = (Math.random() - 0.5) * 40; // -20 to +20 px horizontal scatter
        const bottomOffset = poffuSize * 0.2; // Position near bottom of Poffu
        const particleSize = 8 + Math.random() * 8; // 8-16px random size
        
        setParticles((p) => [
          ...p.slice(-60), // Keep only last 60 particles
          { 
            id: particleId, 
            x: currentX + poffuSize / 2 + scatterX,
            y: y + bottomOffset,
            opacity: 1,
            size: particleSize
          },
        ]);
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []); // Remove poffuState dependency to prevent animation restart

  // Fade out particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({ ...p, opacity: p.opacity - 0.025 }))
          .filter((p) => p.opacity > 0)
      );
    }, 40); // Every 40ms instead of 30ms

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#00FF00' }}>
      {/* Background decorations removed for chroma key (green screen) recording */}
      
      {/* Dust Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute pointer-events-none"
          style={{
            left: particle.x,
            top: particle.y,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: "var(--color-primary)",
            // 4-pointed star shape for dust particles
            clipPath: "polygon(50% 0%, 65% 40%, 100% 50%, 65% 60%, 50% 100%, 35% 60%, 0% 50%, 35% 40%)",
            WebkitClipPath: "polygon(50% 0%, 65% 40%, 100% 50%, 65% 60%, 50% 100%, 35% 60%, 0% 50%, 35% 40%)",
            opacity: particle.opacity,
            transform: "translate(-50%, -50%)",
            boxShadow: `0 0 ${particle.size * 1.2}px var(--color-primary)`,
            transition: "opacity 0.3s ease-out",
          }}
        />
      ))}

      {/* Poffu flying in sine wave */}
      <div
        className="absolute"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${poffuSize}px`,
          height: `${poffuSize}px`,
        }}
      >
        <img
          src={
            poffuState === "front-view" 
              ? ASSETS.images.mascot.default // Front-facing during pause
              : poffuState === "stopping" || poffuState === "resuming"
              ? ASSETS.images.mascot.default // Transitioning to/from front view
              : ASSETS.images.mascot.side // Side view when flying
          }
          alt="Poffu Flying"
          width={poffuSize}
          height={poffuSize}
          className="select-none drop-shadow-[0_0_15px_rgba(141,118,209,0.6)]"
          style={{
            transform: (() => {
              // During stopping: rotate from side view to front view (90° rotation)
              if (poffuState === "stopping") {
                return direction === "east" ? "rotateY(-90deg)" : "rotateY(90deg)";
              }
              // During front-view: no rotation (0°)
              if (poffuState === "front-view") {
                return "rotateY(0deg)";
              }
              // During resuming: rotate from front view to opposite side (90° rotation)
              if (poffuState === "resuming") {
                return direction === "east" ? "rotateY(90deg)" : "rotateY(-90deg)";
              }
              // During flying: show side view with proper flip
              return direction === "west" ? "scaleX(1)" : "scaleX(-1)";
            })(),
            transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, margin-top 0.3s ease",
            transformStyle: "preserve-3d",
            opacity: poffuState === "stopping" 
              ? 0.7 
              : poffuState === "resuming" 
              ? 0.7 
              : 1,
            // Apply Y offset when using side sprite to compensate for size difference
            marginTop: poffuState === "flying" ? `${sideViewYOffset}px` : '0px',
          }}
          draggable={false}
        />
      </div>

      {/* Info text */}
      {/* <div className="absolute bottom-10 left-0 right-0 bg-base-100/80 p-4 rounded-lg backdrop-blur-sm max-w-sm mx-auto text-center">
        <h1 className="text-4xl font-bold text-primary mb-4 animate-pulse">
          Poffu is Flying! ✨
        </h1>
        <p className="text-lg opacity-70">
          Sine wave animation with pause at sides - Perfect for creating GIFs!
        </p>
        <p className="text-sm opacity-50 mt-2">
          Press F11 for fullscreen, then use screen recording software
        </p>
        <p className="text-xs opacity-40 mt-2">
          State: {poffuState} | Direction: {direction}
        </p>
      </div> */}

      {/* Recording tips */}
      {/* <div className="absolute bottom-10 right-10 bg-base-100/80 p-4 rounded-lg backdrop-blur-sm max-w-sm">
        <h3 className="font-bold text-primary mb-2">📹 Recording Tips:</h3>
        <ul className="text-sm space-y-1 opacity-70">
          <li>• Use OBS Studio or ShareX for recording</li>
          <li>• Record at 60 FPS for smooth animation</li>
          <li>• Crop to focus on Poffu only</li>
          <li>• Convert to GIF using ezgif.com</li>
          <li>• Poffu pauses at sides with front view!</li>
          <li>• Recommended: 500x400px output</li>
        </ul>
      </div> */}
    </div>
  );
}
