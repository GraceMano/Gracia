"use client";

import React from "react";

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function Logo({ size = 36, className = "", showText = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm"
      >
        <defs>
          <linearGradient id="logoBgA" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#022c22" />
            <stop offset="60%" stopColor="#064e3b" />
            <stop offset="100%" stopColor="#022c22" />
          </linearGradient>

          <linearGradient id="logoLegLeft" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>

          <linearGradient id="logoLegRight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          <linearGradient id="logoCrossbar" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#6ee7b7" />
          </linearGradient>

          <linearGradient id="logoAccentDot" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {/* Container Tile with Rounded Corners */}
        <rect
          x="5"
          y="5"
          width="90"
          height="90"
          rx="22"
          fill="url(#logoBgA)"
          stroke="#10b981"
          strokeWidth="1.8"
          strokeOpacity="0.4"
        />

        {/* Subtle Topographic Curve in background */}
        <path
          d="M18 78 Q50 64 82 78"
          stroke="#10b981"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.3"
        />

        {/* Left Leg of the 'A' */}
        <path
          d="M50 18 L24 82 L37 82 L47 57 L50 49 Z"
          fill="url(#logoLegLeft)"
        />

        {/* Right Leg of the 'A' */}
        <path
          d="M50 18 L76 82 L63 82 L53 57 L50 49 Z"
          fill="url(#logoLegRight)"
        />

        {/* Apex Cap */}
        <circle cx="50" cy="18" r="3" fill="#34d399" />

        {/* Contour/Leaf Crossbar forming the 'A' bar */}
        <path
          d="M30 60 Q50 50 70 60 Q50 56 30 60 Z"
          fill="url(#logoCrossbar)"
        />
        <path
          d="M33 60 Q50 52 67 60"
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Golden Geo-Node Pin inside the upper apex */}
        <circle cx="50" cy="38" r="2.8" fill="url(#logoAccentDot)" />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className="font-extrabold text-base tracking-tight text-white leading-tight">
            <span className="text-emerald-400">Agr</span>smart
          </span>
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
            Kabare &bull; Sud-Kivu
          </span>
        </div>
      )}
    </div>
  );
}
