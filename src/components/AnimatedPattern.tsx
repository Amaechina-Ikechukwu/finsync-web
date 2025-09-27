import React from "react";

/**
 * AnimatedPattern renders the large topology SVG gently panning in the background.
 * Positioned absolutely; place inside a relatively positioned container (e.g., <body> wrapper div).
 */
interface AnimatedPatternProps {
  /** Percentage width relative to viewport (e.g. 110 for 110%). */
  widthPercent?: number;
  /** Max pixel width cap (default 1200). */
  maxWidthPx?: number;
  /** CSS top offset (default '-5rem'). */
  topOffset?: string;
  /** Opacity 0..1 (default 0.5). */
  opacity?: number;
  /** Disable slow pan animation */
  disablePan?: boolean;
  /** Disable subtle rotation */
  disableRotate?: boolean;
}

export default function AnimatedPattern({
  widthPercent = 110,
  maxWidthPx = 1200,
  topOffset = "-5rem",
  opacity = 0.5,
  disablePan = false,
  disableRotate = false,
}: AnimatedPatternProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Subtle radial fade to keep center content readable */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.75),rgba(255,255,255,0.95))]" />
      <div
        className={[
          "absolute left-1/2 -translate-x-1/2 mix-blend-multiply",
          disablePan ? "" : "animate-pan-slow",
        ].join(" ")}
        style={{
          top: topOffset,
          width: `${widthPercent}%`,
          maxWidth: `${maxWidthPx}px`,
          opacity,
        }}
      >
        {/* We inline the SVG so stroke color / opacity can be tweaked with CSS if needed */}
        <svg
          width="530"
          height="662"
          viewBox="0 0 530 662"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={[
            "w-full h-auto",
            disableRotate ? "" : "animate-drift-rotate",
          ].join(" ")}
        >
          <title>Decorative topology background pattern</title>
          <g stroke="#525252" strokeOpacity="0.20" strokeWidth="1.2">
            <path d="M-56.8634 -181.971C-82.4623 -242.713 -209.107 -272.708 -188.208 -151.766C-184.781 -131.936 -184.436 -97.7901 -188.208 -56.2274C-191.663 -18.1535 -259.296 2.67944 -280.057 51.8749C-312.616 129.028 -190.879 182.804 -210.251 223.362C-235.625 276.483 -313.318 299.531 -356.292 328.594C-396.747 355.953 -422.516 399.852 -432.41 444.984C-449.768 524.164 -418.267 607.142 -331.492 611.27C-288.053 613.337 -230.763 595.644 -158.816 547.825C-126.649 526.444 -98.2836 508.825 -73.0744 494.577C-8.19043 457.907 -25.6347 544.646 51.5186 547.825C95.4803 549.636 141.396 474.754 176.154 514.696C200.869 543.098 229.231 577.559 269.734 612.987C340.864 675.206 429.797 684.367 442.376 595.568C448.314 553.65 437.237 489.902 399.241 399.602C374.926 341.815 435.407 343.853 442.376 269.801C449.344 195.75 392.36 161.6 433.611 130.951L434.437 130.337C465.879 106.979 499.413 82.0667 517.727 34.2172C533.502 -7.00035 531.995 -47.8235 517.727 -79.1921C502.457 -112.763 472.57 -135.505 433.611 -136.312C394.52 -137.122 346.294 -115.847 294.533 -61.2702C260.406 -25.2865 237.294 -109.015 176.154 -100.456C115.013 -91.8969 106.515 -11.1095 69.8885 -34.541C6.26453 -75.2435 -26.8825 -110.832 -56.8634 -181.971Z" />
            <path d="M66.6337 149.359C62.7379 140.034 44.582 142.481 43.6632 152.587C42.6171 164.094 48.9945 179.088 48.2573 190.622C46.8339 212.891 38.2074 219.23 21.0307 230.967C14.874 235.167 10.9523 241.907 9.44655 248.835C6.80487 260.991 11.5989 273.729 24.8048 274.363C31.4156 274.68 40.1344 271.964 51.0836 264.623C55.9791 261.341 60.2958 258.636 64.1323 256.449C80.8334 246.165 96.377 254.223 102.061 259.537C105.822 263.897 110.139 269.188 116.303 274.627C127.128 284.178 143.52 282.927 142.576 271.952C141.242 256.449 112.218 198.577 142.576 188.486C156.678 183.799 156.215 173.181 154.044 168.365C151.72 163.212 147.172 159.72 141.242 159.597C135.293 159.472 125.438 168.365 120.077 171.117C100.285 181.273 82.6247 186.524 66.6337 149.359Z" />
          </g>
        </svg>
      </div>
    </div>
  );
}
