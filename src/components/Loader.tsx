"use client";
import Image from "next/image";
import React from "react";

/**
 * Reusable Loader component
 * Renders the app icon in the center with colored circles orbiting around it.
 * Props:
 *  - size: overall diameter of the loader (default 96px)
 *  - speed: base animation speed in seconds (default 1.4s)
 *  - message: optional helper text displayed below
 *  - className: optional extra wrapper classes
 */
export interface LoaderProps {
  size?: number;
  speed?: number; // base animation speed
  message?: string;
  className?: string;
  colors?: string[]; // color stops
  variant?: "orbit" | "ring"; // visual style
  thickness?: number; // ring thickness override (ring variant only)
}

const DEFAULT_COLORS = ["#ff0080", "#7928ca", "#2c59ff", "#0fa", "#ffb300", "#ff4d4d"]; // vibrant ring

export const Loader: React.FC<LoaderProps> = ({
  size = 86,
  speed = 1.4,
  message,
  className = "",
  colors = DEFAULT_COLORS,
  variant = "ring",
  thickness
}) => {
  // For orbit variant we'll still derive icon size later; ring variant now computes tighter layout
  const baseIcon = (w: number) => (
    <Image
      src="/assets/logo.png"
      alt="App Icon"
      width={w}
      height={w}
      priority
    />
  );

  if (variant === "ring") {
    const ringThickness = thickness ?? Math.max(2, Math.round(size * 0.04));
    const gradientStops = colors.join(", ");
    // Make the icon fill ~90% of the inner circle so the ring appears closer
    const innerDiameter = size - ringThickness * 2;
    const iconSize = Math.max(24, Math.round(innerDiameter * 0.9));
    return (
      <div
        className={`flex flex-col items-center justify-center ${className}`}
        style={{ minHeight: size + (message ? 28 : 0) }}
        aria-label="Loading"
        role="status"
      >
        <div
          className="relative"
          style={{ width: size, height: size, ['--thickness' as any]: `${ringThickness}px`, ['--speed' as any]: `${speed}s` }}
        >
          <div className="ringWrapper">
            <div className="inner flex items-center justify-center rounded-full overflow-hidden shadow-sm bg-white/90 backdrop-blur">
              {baseIcon(iconSize)}
            </div>
          </div>
          <style jsx>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            .ringWrapper { position:absolute; inset:0; }
            .ringWrapper:before { content:""; position:absolute; inset:0; border-radius:50%; padding:var(--thickness); background: conic-gradient(${gradientStops}); -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - var(--thickness)), #000 calc(100% - var(--thickness) + 1px)); mask: radial-gradient(farthest-side, transparent calc(100% - var(--thickness)), #000 calc(100% - var(--thickness) + 1px)); animation: spin var(--speed) linear infinite; filter: saturate(1.15); box-shadow: 0 4px 18px -4px rgba(0,0,0,0.25); }
            .inner { position:absolute; inset:var(--thickness); }
            @media (prefers-reduced-motion: reduce) { .ringWrapper:before { animation: none; } }
          `}</style>
        </div>
        {message && (
          <p className="mt-3 text-xs tracking-wide uppercase text-neutral-600">{message}</p>
        )}
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  // Orbit variant (previous design)
  const radius = size / 2;
  const circleSize = Math.max(6, Math.round(size * 0.14));
  const track = radius - circleSize * 1.2;
  return (
    <div className={`flex flex-col items-center justify-center ${className}`} style={{ minHeight: size + 12 }}>
      <div
        className="relative"
        style={{ width: size, height: size }}
        aria-label="Loading"
        role="status"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-2xl overflow-hidden shadow-sm bg-white/80 backdrop-blur">
            {baseIcon(Math.round(size * 0.55))}
          </div>
        </div>
        {colors.map((c, i) => {
          const delay = (speed / colors.length) * i;
          return (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: stable visual list
              key={i}
              className="absolute top-1/2 left-1/2 rounded-full will-change-transform"
              style={{
                width: circleSize,
                height: circleSize,
                marginTop: -circleSize / 2,
                marginLeft: -circleSize / 2,
                background: c,
                animation: `orbit ${speed}s linear infinite`,
                animationDelay: `-${delay}s`,
                transformOrigin: `${track}px 0px`,
                opacity: 0.95,
                boxShadow: "0 0 0 2px rgba(255,255,255,0.5),0 4px 10px rgba(0,0,0,0.15)",
                filter: "saturate(1.2)"
              }}
            />
          );
        })}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ boxShadow: "0 0 0 0 rgba(0,0,0,0.08)", animation: `pulseRing ${speed * 3}s ease-in-out infinite` }}
        />
        <style jsx>{`
          @keyframes orbit { 0% { transform: rotate(0deg) translate(${track}px) scale(1); } 50% { transform: rotate(180deg) translate(${track}px) scale(1.05); } 100% { transform: rotate(360deg) translate(${track}px) scale(1); } }
          @keyframes pulseRing { 0% { box-shadow: 0 0 0 0 rgba(0,0,0,0.10);} 70% { box-shadow: 0 0 0 12px rgba(0,0,0,0);} 100% { box-shadow: 0 0 0 0 rgba(0,0,0,0);} }
        `}</style>
      </div>
      {message && (
        <p className="mt-3 text-xs tracking-wide uppercase text-neutral-600">{message}</p>
      )}
      <span className="sr-only">Loading</span>
    </div>
  );
};

export default Loader;
