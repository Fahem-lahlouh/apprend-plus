import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { Icon, type IconName } from './Icon';
import type { AccentKey } from '@/models';
import { clamp } from '@/utils/array';

export { Icon };
export type { IconName };

export function accentClass(accent: AccentKey | undefined): string {
  return `ap-accent-${accent ?? 'violet'}`;
}

/* --------------------------------- Card --------------------------------- */

export function Card({
  children,
  className = '',
  as: As = 'div',
  ...rest
}: { children: ReactNode; className?: string; as?: 'div' | 'section' | 'article' } & Record<string, unknown>) {
  return (
    <As className={`ap-card ${className}`} {...rest}>
      {children}
    </As>
  );
}

/* -------------------------------- Button -------------------------------- */

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  block?: boolean;
  size?: 'md' | 'sm';
  icon?: IconName;
  trailingIcon?: IconName;
}

export function Button({
  variant = 'primary',
  block,
  size = 'md',
  icon,
  trailingIcon,
  children,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`ap-btn ap-btn--${variant} ${block ? 'ap-btn--block' : ''} ${
        size === 'sm' ? 'ap-btn--sm' : ''
      } ${className}`}
      {...rest}
    >
      {icon && <Icon name={icon} size={18} />}
      {children}
      {trailingIcon && <Icon name={trailingIcon} size={18} />}
    </button>
  );
}

/* -------------------------------- Section ------------------------------- */

export function Section({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon?: IconName;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      <header className="ap-section__head">
        <h2 className="ap-section__title">
          {icon && <Icon name={icon} size={20} style={{ color: 'var(--ap-violet-600)' }} />}
          {title}
        </h2>
        {action}
      </header>
      {children}
    </section>
  );
}

/* ------------------------------- Progress ------------------------------- */

export function ProgressBar({
  value,
  tone = 'violet',
  sunken = false,
  label,
}: {
  value: number;
  tone?: 'violet' | 'success';
  sunken?: boolean;
  label?: string;
}) {
  const pct = clamp(Math.round(value), 0, 100);
  return (
    <div
      className={`ap-bar ${sunken ? 'ap-bar--sunken' : ''}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className="ap-bar__fill"
        style={{
          width: `${pct}%`,
          background: tone === 'success' ? 'var(--ap-success)' : undefined,
        }}
      />
    </div>
  );
}

export function ProgressRing({
  value,
  size = 132,
  stroke = 14,
  primary,
  secondary,
}: {
  value: number;
  size?: number;
  stroke?: number;
  primary: string;
  secondary?: string;
}) {
  const pct = clamp(Math.round(value), 0, 100);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
      <svg width={size} height={size} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--ap-violet-100)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--ap-violet-500)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * pct) / 100}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeContent: 'center',
          textAlign: 'center',
          lineHeight: 1.15,
        }}
      >
        <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.6px' }}>{primary}</span>
        {secondary && <span style={{ fontSize: 12, color: 'var(--ap-text-soft)', fontWeight: 600 }}>{secondary}</span>}
      </div>
    </div>
  );
}

/* -------------------------------- Switch -------------------------------- */

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className="ap-switch"
      onClick={() => onChange(!checked)}
    />
  );
}

/* -------------------------------- Sheet --------------------------------- */

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="ap-sheet-backdrop" onClick={onClose} role="presentation">
      <div
        className="ap-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        ref={ref}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ap-sheet__grip" />
        {title && (
          <h2 id={titleId} className="ap-title-lg" style={{ marginBottom: 14 }}>
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}

/* ---------------------------- Confirm dialog ---------------------------- */

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
}

const ConfirmContext = createContext<((options: ConfirmOptions) => Promise<boolean>) | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ options: ConfirmOptions; resolve: (v: boolean) => void } | null>(null);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setState({ options, resolve });
      }),
    [],
  );

  const settle = (value: boolean) => {
    state?.resolve(value);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Sheet open={state !== null} onClose={() => settle(false)} title={state?.options.title}>
        <p className="ap-body" style={{ marginBottom: 20 }}>
          {state?.options.message}
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="ghost" block onClick={() => settle(false)}>
            Annuler
          </Button>
          <Button
            variant={state?.options.destructive ? 'danger' : 'primary'}
            block
            onClick={() => settle(true)}
          >
            {state?.options.confirmLabel ?? 'Confirmer'}
          </Button>
        </div>
      </Sheet>
    </ConfirmContext.Provider>
  );
}

/** Never destroy data on a single tap: every destructive action goes here. */
export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside <ConfirmProvider>');
  return ctx;
}

/* --------------------------------- Toast -------------------------------- */

interface ToastItem {
  id: number;
  message: string;
  tone: 'default' | 'xp';
}

const ToastContext = createContext<((message: string, tone?: 'default' | 'xp') => void) | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const push = useCallback((message: string, tone: 'default' | 'xp' = 'default') => {
    const id = (counter.current += 1);
    setItems((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 2600);
  }, []);

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="ap-toast-host" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`ap-toast ${t.tone === 'xp' ? 'ap-toast--xp' : ''}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

/* ------------------------------ Empty state ----------------------------- */

export function EmptyState({ icon, title, hint }: { icon?: IconName; title: string; hint?: string }) {
  return (
    <div className="ap-empty">
      {icon && <Icon name={icon} size={30} style={{ marginBottom: 8, opacity: 0.5 }} />}
      <p style={{ fontWeight: 650, color: 'var(--ap-text-soft)' }}>{title}</p>
      {hint && <p style={{ marginTop: 4 }}>{hint}</p>}
    </div>
  );
}
