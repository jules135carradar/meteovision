export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="3.5" fill="#0ea5e9" />
      <rect x="12.75" y="2"    width="2.5" height="5.5" rx="1.25" fill="#0ea5e9" />
      <rect x="12.75" y="20.5" width="2.5" height="5.5" rx="1.25" fill="#0ea5e9" />
      <rect x="2"    y="12.75" width="5.5" height="2.5" rx="1.25" fill="#0ea5e9" />
      <rect x="20.5" y="12.75" width="5.5" height="2.5" rx="1.25" fill="#0ea5e9" />
      <line x1="20.6" y1="7.4"  x2="18.2" y2="9.8"  stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round" />
      <line x1="7.4"  y1="20.6" x2="9.8"  y2="18.2" stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round" />
      <line x1="20.6" y1="20.6" x2="18.2" y2="18.2" stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round" />
      <line x1="7.4"  y1="7.4"  x2="9.8"  y2="9.8"  stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
