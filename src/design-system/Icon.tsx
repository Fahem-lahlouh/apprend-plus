import type { SVGProps } from 'react';

export type IconName =
  | 'home'
  | 'book'
  | 'code'
  | 'bell'
  | 'user'
  | 'chevron-right'
  | 'chevron-left'
  | 'chevron-down'
  | 'play'
  | 'globe'
  | 'trophy'
  | 'brain'
  | 'cards'
  | 'bolt'
  | 'calendar'
  | 'gamepad'
  | 'laptop'
  | 'database'
  | 'chat'
  | 'flame'
  | 'search'
  | 'plus'
  | 'check'
  | 'check-circle'
  | 'x'
  | 'star'
  | 'star-filled'
  | 'trash'
  | 'pencil'
  | 'download'
  | 'upload'
  | 'refresh'
  | 'sun'
  | 'moon'
  | 'target'
  | 'chart'
  | 'clock'
  | 'volume'
  | 'note'
  | 'bookmark'
  | 'rotate'
  | 'sparkle'
  | 'lock'
  | 'external';

const PATHS: Record<IconName, JSX.Element> = {
  home: <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z" />,
  book: <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5zM19 18v3H6.5" />,
  code: <path d="m9 8-4 4 4 4m6-8 4 4-4 4" />,
  bell: <path d="M18 15V10a6 6 0 1 0-12 0v5l-1.5 2.5h15zM10 20a2 2 0 0 0 4 0" />,
  user: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8m8 8a8 8 0 1 0-16 0" />,
  'chevron-right': <path d="m9 5 7 7-7 7" />,
  'chevron-left': <path d="m15 5-7 7 7 7" />,
  'chevron-down': <path d="m5 9 7 7 7-7" />,
  play: <path d="M8 5.5v13l11-6.5z" />,
  globe: <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3" />,
  trophy: <path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a4 4 0 0 0 3 3.9M17 6h3v1a4 4 0 0 1-3 3.9M9.5 20h5M12 14v6" />,
  brain: <path d="M9.5 4A2.5 2.5 0 0 0 7 6.5 2.5 2.5 0 0 0 5.5 11 2.5 2.5 0 0 0 7 15.4V17a2.5 2.5 0 0 0 5 0V4.9A2 2 0 0 0 9.5 4m5 0A2.5 2.5 0 0 1 17 6.5 2.5 2.5 0 0 1 18.5 11 2.5 2.5 0 0 1 17 15.4V17a2.5 2.5 0 0 1-5 0" />,
  cards: <path d="M8.5 7h9a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 7 17.5v-9A1.5 1.5 0 0 1 8.5 7M5 15.5V6a1.5 1.5 0 0 1 1.5-1.5H16" />,
  bolt: <path d="M13.5 3 5 13.5h6L10.5 21 19 10.5h-6z" />,
  calendar: <path d="M4.5 7A1.5 1.5 0 0 1 6 5.5h12A1.5 1.5 0 0 1 19.5 7v11a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 18zM4.5 10h15M8.5 3.5v3m7-3v3" />,
  gamepad: <path d="M7 9h10a4 4 0 0 1 4 4v1a3 3 0 0 1-5.4 1.8L14.5 15h-5l-1.1.8A3 3 0 0 1 3 14v-1a4 4 0 0 1 4-4M7.5 12v2M6.5 13h2m7.5-.5h.01M18 14h.01" />,
  laptop: <path d="M5.5 6.5A1 1 0 0 1 6.5 5.5h11a1 1 0 0 1 1 1V16h-13zM3 18.5h18" />,
  database: <path d="M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />,
  chat: <path d="M4.5 6.5A2 2 0 0 1 6.5 4.5h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H10l-4 3.5V15.5h-1.5z" />,
  flame: <path d="M12 3c.6 3.2-1.5 4.4-2.7 5.8A5.6 5.6 0 0 0 8 12.4 4.3 4.3 0 0 0 12.3 17c2.4 0 4.2-1.7 4.2-4.2 0-1.3-.5-2.6-1.4-3.6.1 1.2-.6 2-1.5 2.2.5-2.6-.3-5.9-1.6-8.4" />,
  search: <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14m5.2-1.8L21 21" />,
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  'check-circle': <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18m-3.6-9.2 2.6 2.6 4.6-5" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  star: <path d="m12 4 2.5 5.2 5.5.8-4 3.9 1 5.6-5-2.7-5 2.7 1-5.6-4-3.9 5.5-.8z" />,
  'star-filled': <path d="m12 4 2.5 5.2 5.5.8-4 3.9 1 5.6-5-2.7-5 2.7 1-5.6-4-3.9 5.5-.8z" />,
  trash: <path d="M5 7h14M10 7V5h4v2m-7 0 .8 12.1a1 1 0 0 0 1 .9h6.4a1 1 0 0 0 1-.9L18 7" />,
  pencil: <path d="M5 19h3l9.5-9.5a2.1 2.1 0 0 0-3-3L5 16z" />,
  download: <path d="M12 4v11m0 0 4-4m-4 4-4-4M5 20h14" />,
  upload: <path d="M12 19V8m0 0 4 4m-4-4-4 4M5 4h14" />,
  refresh: <path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v4h-4" />,
  sun: <path d="M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19" />,
  moon: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5" />,
  target: <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18m0-4.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4" />,
  chart: <path d="M5 19V10m7 9V5m7 14v-6M3 21h18" />,
  clock: <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18m0-13.5V12l3.5 2" />,
  volume: <path d="M5 9.5h3L12 6v12l-4-3.5H5zM15.5 9.5a4 4 0 0 1 0 5M18 7a7.5 7.5 0 0 1 0 10" />,
  note: <path d="M6 4.5h9L19 8.5V19a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1M14.5 4.5V9H19M8.5 12.5h7m-7 3.5h4" />,
  bookmark: <path d="M7 4.5h10a.5.5 0 0 1 .5.5v15l-5.5-3.5L6.5 20V5a.5.5 0 0 1 .5-.5" />,
  rotate: <path d="M4 12a8 8 0 1 0 2.6-5.9M4 4v4h4" />,
  sparkle: <path d="M12 3.5 13.8 9l5.7 1.8-5.7 1.8L12 18.3l-1.8-5.7L4.5 10.8 10.2 9zM18.5 16.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />,
  lock: <path d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5H6a.5.5 0 0 1-.5-.5v-8A.5.5 0 0 1 6 11" />,
  external: <path d="M14 4h6v6m0-6-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />,
};

const FILLED: IconName[] = ['play', 'star-filled', 'bolt'];

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 22, ...rest }: IconProps) {
  const filled = FILLED.includes(name);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
