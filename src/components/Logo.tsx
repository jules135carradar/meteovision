export default function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer ring */}
      <circle cx="16" cy="16" r="14.5" stroke="#059669" strokeWidth="1" opacity="0.3" />
      {/* Inner ring */}
      <circle cx="16" cy="16" r="8.5" stroke="#059669" strokeWidth="1.2" opacity="0.5" />
      {/* Cardinal rays — from inner ring outward */}
      <line x1="16" y1="1.5"  x2="16" y2="7.2"  stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="16" y1="24.8" x2="16" y2="30.5" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="1.5"  y1="16" x2="7.2"  y2="16" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="24.8" y1="16" x2="30.5" y2="16"  stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
      {/* Diagonal ticks */}
      <line x1="23.5" y1="8.5"  x2="21.1" y2="10.9" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="8.5"  y1="23.5" x2="10.9" y2="21.1" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="23.5" y1="23.5" x2="21.1" y2="21.1" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="8.5"  y1="8.5"  x2="10.9" y2="10.9" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round" />
      {/* Small dots at inner ring / cardinal intersections */}
      <circle cx="16" cy="7.5"  r="1.3" fill="#059669" opacity="0.6" />
      <circle cx="16" cy="24.5" r="1.3" fill="#059669" opacity="0.6" />
      <circle cx="7.5"  cy="16" r="1.3" fill="#059669" opacity="0.6" />
      <circle cx="24.5" cy="16" r="1.3" fill="#059669" opacity="0.6" />
      {/* Center filled circle */}
      <circle cx="16" cy="16" r="3.5" fill="#059669" />
    </svg>
  );
}
