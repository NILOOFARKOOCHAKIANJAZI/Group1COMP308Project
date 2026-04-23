export default function EarthChan({ size = 110, blink = true, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="planetBody" cx="0.4" cy="0.35" r="0.8">
          <stop offset="0%" stopColor="#7fc4ec" />
          <stop offset="55%" stopColor="#4ea1d8" />
          <stop offset="100%" stopColor="#2c6ea3" />
        </radialGradient>
        <radialGradient id="planetGlow" cx="0.5" cy="0.5" r="0.6">
          <stop offset="60%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(180,220,245,0.55)" />
        </radialGradient>
        <linearGradient id="irisGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#5fb6e0" />
          <stop offset="100%" stopColor="#1d4f7a" />
        </linearGradient>
        <clipPath id="headClip">
          <circle cx="60" cy="62" r="44" />
        </clipPath>
      </defs>

      <circle cx="60" cy="62" r="48" fill="url(#planetGlow)" opacity="0.9" />

      <circle cx="60" cy="62" r="44" fill="url(#planetBody)" />

      <g clipPath="url(#headClip)">
        <path
          d="M22 38 q6 -8 14 -6 q5 1 8 5 q3 4 9 3 q6 -1 9 4 q3 4 9 4 q7 0 12 -4 q5 -4 11 -2 q4 1 7 -1"
          fill="none"
          stroke="#3b8c4f"
          strokeWidth="9"
          strokeLinecap="round"
          opacity="0.95"
        />
        <path
          d="M28 32 q5 -3 10 -1 q5 2 11 0"
          fill="none"
          stroke="#56a86a"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.85"
        />
        <ellipse cx="35" cy="55" rx="6" ry="4" fill="#3b8c4f" opacity="0.78" />
        <ellipse cx="86" cy="60" rx="7" ry="4" fill="#3b8c4f" opacity="0.78" />
        <ellipse cx="62" cy="92" rx="14" ry="6" fill="#3b8c4f" opacity="0.7" />
        <ellipse cx="20" cy="78" rx="6" ry="3" fill="#56a86a" opacity="0.6" />
      </g>

      <ellipse cx="60" cy="62" rx="44" ry="44" fill="none" stroke="#1f4f78" strokeWidth="1.2" opacity="0.35" />

      <g>
        <ellipse cx="44" cy="60" rx="9.5" ry="11" fill="#ffffff" />
        <ellipse cx="76" cy="60" rx="9.5" ry="11" fill="#ffffff" />

        <ellipse cx="45" cy="62" rx="6.2" ry="7.6" fill="url(#irisGrad)" />
        <ellipse cx="77" cy="62" rx="6.2" ry="7.6" fill="url(#irisGrad)" />

        <circle cx="45" cy="63" r="3" fill="#0a1f33" />
        <circle cx="77" cy="63" r="3" fill="#0a1f33" />

        <circle cx="46.6" cy="60.4" r="1.4" fill="#ffffff" />
        <circle cx="78.6" cy="60.4" r="1.4" fill="#ffffff" />
        <circle cx="43.8" cy="65.2" r="0.7" fill="#ffffff" opacity="0.85" />
        <circle cx="75.8" cy="65.2" r="0.7" fill="#ffffff" opacity="0.85" />

        {blink && (
          <>
            <rect x="34" y="58" width="20" height="0" fill="#0a1f33" rx="2">
              <animate
                attributeName="height"
                values="0;0;0;0;0;0;0;0;11;0"
                dur="5.6s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="y"
                values="58;58;58;58;58;58;58;58;58;58"
                dur="5.6s"
                repeatCount="indefinite"
              />
            </rect>
            <rect x="66" y="58" width="20" height="0" fill="#0a1f33" rx="2">
              <animate
                attributeName="height"
                values="0;0;0;0;0;0;0;0;11;0"
                dur="5.6s"
                repeatCount="indefinite"
              />
            </rect>
          </>
        )}
      </g>

      <ellipse cx="34" cy="74" rx="4" ry="2.4" fill="#f4a3b5" opacity="0.78" />
      <ellipse cx="86" cy="74" rx="4" ry="2.4" fill="#f4a3b5" opacity="0.78" />

      <path
        d="M52 78 q8 6 16 0"
        fill="none"
        stroke="#0a1f33"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}
