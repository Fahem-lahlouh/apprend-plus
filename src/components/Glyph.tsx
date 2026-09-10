import { Icon, type IconName } from '@/design-system/Icon';

const ICON_NAMES = new Set<string>([
  'home', 'book', 'code', 'bell', 'user', 'play', 'globe', 'trophy', 'brain', 'cards', 'bolt',
  'calendar', 'gamepad', 'laptop', 'database', 'chat', 'flame', 'search', 'star', 'target',
  'chart', 'clock', 'note', 'bookmark', 'rotate', 'sparkle', 'lock',
]);

/**
 * Domains can carry either a design-system icon name (built-in content) or a
 * plain emoji chosen by the user. One component renders both.
 */
export function Glyph({ value, size = 24 }: { value: string; size?: number }) {
  if (ICON_NAMES.has(value)) return <Icon name={value as IconName} size={size} />;
  return (
    <span aria-hidden="true" style={{ fontSize: size * 0.86, lineHeight: 1 }}>
      {value}
    </span>
  );
}
