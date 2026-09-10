import type { Reminder } from '@/models';
import { nextOccurrence } from './reminders';

export type NotificationCapability =
  | 'supported'
  | 'needs_install' // iOS: the Notification API only exists in an installed web app
  | 'denied'
  | 'unsupported';

export interface NotificationStatus {
  capability: NotificationCapability;
  permission: NotificationPermission | 'unavailable';
  isStandalone: boolean;
  isIos: boolean;
  explanation: string;
}

function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false;
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return iosStandalone || window.matchMedia?.('(display-mode: standalone)').matches === true;
}

function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes('Macintosh') && 'ontouchend' in document);
}

/**
 * Honest capability report. Web push on iPhone requires the PWA to be added to
 * the home screen (iOS 16.4+) and an explicit permission grant; when that is
 * not the case we say so instead of pretending a notification was scheduled.
 */
export function getNotificationStatus(): NotificationStatus {
  const isIos = isIosDevice();
  const isStandalone = isStandaloneDisplay();
  const hasApi = typeof window !== 'undefined' && 'Notification' in window;

  if (!hasApi) {
    return {
      capability: isIos && !isStandalone ? 'needs_install' : 'unsupported',
      permission: 'unavailable',
      isStandalone,
      isIos,
      explanation:
        isIos && !isStandalone
          ? "Sur iPhone, les notifications ne sont disponibles qu’une fois l’application ajoutée à l’écran d’accueil (Partager puis « Sur l’écran d’accueil »)."
          : "Ce navigateur n’expose pas l’API de notifications. Les rappels restent visibles dans l’application.",
    };
  }

  const permission = Notification.permission;
  if (permission === 'denied') {
    return {
      capability: 'denied',
      permission,
      isStandalone,
      isIos,
      explanation:
        'Les notifications ont ete refusées. Autorise-les dans les reglages du navigateur pour les reactiver.',
    };
  }

  return {
    capability: 'supported',
    permission,
    isStandalone,
    isIos,
    explanation:
      permission === 'granted'
        ? "Les rappels s’affichent comme notifications système tant que l’application est ouverte ou en arrière-plan récent."
        : "Autorise les notifications pour recevoir tes rappels en dehors de l’application.",
  };
}

export async function requestPermission(): Promise<NotificationPermission | 'unavailable'> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unavailable';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'unavailable';
  }
}

async function show(title: string, options: NotificationOptions): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;
  try {
    const registration = await navigator.serviceWorker?.getRegistration();
    if (registration) {
      await registration.showNotification(title, options);
    } else {
      new Notification(title, options);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Timer-based local notifications. They only fire while the page is alive -
 * this is a real limitation of web apps without a push server, and the UI says
 * so rather than promising background delivery.
 */
export class ReminderScheduler {
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  schedule(reminders: Reminder[], onFire?: (reminder: Reminder) => void): void {
    this.clear();
    const now = new Date();
    for (const reminder of reminders) {
      const next = nextOccurrence(reminder, now);
      if (!next) continue;
      const delay = next.getTime() - now.getTime();
      // setTimeout is capped at ~24.8 days; reminders never exceed a week.
      const timer = setTimeout(() => {
        void show(reminder.title, {
          body: reminder.subtitle ?? `${reminder.durationMin} min d’apprentissage`,
          tag: `reminder-${reminder.id}`,
          badge: undefined,
        });
        onFire?.(reminder);
      }, Math.max(0, delay));
      this.timers.set(reminder.id, timer);
    }
  }

  clear(): void {
    for (const timer of this.timers.values()) clearTimeout(timer);
    this.timers.clear();
  }
}

/** Fires one notification right away, used by the "tester" button. */
export async function sendTestNotification(): Promise<boolean> {
  return show('Apprend+', { body: 'Les notifications fonctionnent. A tout a l’heure !', tag: 'apprend-test' });
}
