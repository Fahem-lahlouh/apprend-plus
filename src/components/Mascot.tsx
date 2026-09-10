/** The Apprend+ owl. Pure SVG so it stays crisp and works offline. */
export function Mascot({ size = 108 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <ellipse cx="60" cy="108" rx="34" ry="6" fill="var(--ap-violet-200)" opacity="0.45" />
      <path d="M24 46c0-9 3-19 8-25 3 6 8 10 13 12z" fill="var(--ap-violet-500)" />
      <path d="M96 46c0-9-3-19-8-25-3 6-8 10-13 12z" fill="var(--ap-violet-500)" />
      <ellipse cx="60" cy="62" rx="37" ry="42" fill="var(--ap-violet-500)" />
      <ellipse cx="60" cy="72" rx="26" ry="30" fill="#fdfdff" />
      <circle cx="46" cy="52" r="14" fill="#fdfdff" />
      <circle cx="74" cy="52" r="14" fill="#fdfdff" />
      <path d="M39 52c3.5-4.5 10.5-4.5 14 0" stroke="#1f2140" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <path d="M67 52c3.5-4.5 10.5-4.5 14 0" stroke="#1f2140" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <path d="M55 62l5-5 5 5-5 4z" fill="#f7a825" />
      <path d="M52 74c4 4 12 4 16 0" stroke="#f7a825" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M96 34l6-6M100 44l8-2M92 26l3-8" stroke="var(--ap-violet-400)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
