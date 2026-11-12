export function BugIcon({ color = 'currentColor', size = 18, muted = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g stroke={muted ? 'currentColor' : color} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity={muted ? 0.7 : 1}>
        <path d="M7 9 3.5 6.5M7 13.5H3M7 18l-3.5 2.5M17 9l3.5-2.5M17 13.5h4M17 18l3.5 2.5M10 4.5 8.5 2.5M14 4.5l1.5-2" />
      </g>
      <ellipse cx="12" cy="14" rx="5" ry="6.5" fill={muted ? 'none' : color} stroke={muted ? 'currentColor' : 'none'} strokeWidth="1.6" opacity={muted ? 0.7 : 1} />
      <circle cx="12" cy="6.6" r="2.6" fill={muted ? 'none' : color} stroke={muted ? 'currentColor' : 'none'} strokeWidth="1.6" opacity={muted ? 0.7 : 0.75} />
    </svg>
  );
}

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
const Svg = ({ children }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...stroke}>
    {children}
  </svg>
);

export const RadarIcon = () => (
  <Svg>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4.5" />
    <path d="M12 12 18.5 5.5" />
  </Svg>
);
export const ContrastIcon = () => (
  <Svg>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
  </Svg>
);
export const SoundIcon = ({ off }) => (
  <Svg>
    <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" />
    {off ? <path d="m16 9.5 5 5m0-5-5 5" /> : <path d="M16 9a4.5 4.5 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />}
  </Svg>
);
export const CheckIcon = () => (
  <Svg>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
);
export const ArrowIcon = () => (
  <Svg>
    <path d="M5 12h14m-5-5 5 5-5 5" />
  </Svg>
);
export const CloseIcon = () => (
  <Svg>
    <path d="m6 6 12 12M18 6 6 18" />
  </Svg>
);
