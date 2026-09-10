import { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Button, EmptyState, Icon, Section, Sheet, Switch, useConfirm, useToast } from '@/design-system';
import { db } from '@/repositories/db';
import { reminderRepository } from '@/repositories/reminderRepository';
import type { Reminder } from '@/models';
import { describeDays, describeNextOccurrence, weekdayShort } from '@/utils/date';
import { newId } from '@/utils/id';
import {
  getNotificationStatus,
  ReminderScheduler,
  requestPermission,
  sendTestNotification,
} from '@/services/notificationService';
import { usePreferences } from '@/hooks/usePreferences';

const scheduler = new ReminderScheduler();

export function RemindersScreen() {
  const reminders = useLiveQuery(() => reminderRepository.list(), []);
  const domains = useLiveQuery(() => db.domains.toArray(), []);
  const confirm = useConfirm();
  const toast = useToast();
  const { preferences, update } = usePreferences();
  const [status, setStatus] = useState(() => getNotificationStatus());
  const [editing, setEditing] = useState<Reminder | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (!reminders) return undefined;
    if (status.permission === 'granted' && preferences.notificationsEnabled) {
      scheduler.schedule(reminders.filter((r) => r.enabled));
    } else {
      scheduler.clear();
    }
    return () => scheduler.clear();
  }, [reminders, status.permission, preferences.notificationsEnabled]);

  const grouped = useMemo(() => {
    const today = new Date().getDay();
    return {
      today: (reminders ?? []).filter((r) => r.enabled && (r.days.length === 0 || r.days.includes(today))),
      all: reminders ?? [],
    };
  }, [reminders]);

  const enableNotifications = async () => {
    const permission = await requestPermission();
    setStatus(getNotificationStatus());
    if (permission === 'granted') {
      await update({ notificationsEnabled: true });
      toast('Notifications activees');
    } else if (permission === 'denied') {
      toast('Notifications refusées par le navigateur');
    }
  };

  const remove = async (reminder: Reminder) => {
    const ok = await confirm({
      title: `Supprimer « ${reminder.title} » ?`,
      message: 'Ce rappel ne sera plus affiche ni notifié.',
      confirmLabel: 'Supprimer',
      destructive: true,
    });
    if (!ok) return;
    await reminderRepository.delete(reminder.id);
    toast('Rappel supprimé');
  };

  return (
    <main className="ap-page">
      <div className="ap-header">
        <div>
          <h1 className="ap-title-xl">Rappels</h1>
          <p className="ap-caption" style={{ marginTop: 4 }}>
            Garde le rythme, même les jours chargés.
          </p>
        </div>
        <button
          type="button"
          className="ap-icon-btn"
          aria-label="Nouveau rappel"
          onClick={() => {
            setEditing(null);
            setSheetOpen(true);
          }}
        >
          <Icon name="plus" size={21} />
        </button>
      </div>

      <div className="ap-stack">
        {/* --------------------------- Notifications ------------------------- */}
        <section className="ap-card">
          <div className="ap-row" style={{ alignItems: 'flex-start' }}>
            <span className="ap-icon-badge ap-icon-badge--sm ap-icon-badge--plain ap-accent-violet">
              <Icon name="bell" size={18} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700 }}>Notifications système</p>
              <p className="ap-caption" style={{ marginTop: 3 }}>
                {status.explanation}
              </p>
            </div>
          </div>

          {status.capability === 'supported' && status.permission !== 'granted' && (
            <Button block style={{ marginTop: 14 }} onClick={enableNotifications}>
              Autoriser les notifications
            </Button>
          )}

          {status.capability === 'supported' && status.permission === 'granted' && (
            <>
              <div className="ap-row ap-row--between" style={{ marginTop: 14 }}>
                <span style={{ fontSize: 14.5, fontWeight: 650 }}>Rappels notifies</span>
                <Switch
                  checked={preferences.notificationsEnabled}
                  onChange={(value) => void update({ notificationsEnabled: value })}
                  label="Activer les notifications de rappel"
                />
              </div>
              <p className="ap-caption" style={{ marginTop: 8 }}>
                Sans serveur de push, une notification n’est déclenchée que lorsque l’application est ouverte ou
                récemment active. Les rappels restent toujours visibles ci-dessous.
              </p>
              <Button
                variant="ghost"
                size="sm"
                block
                style={{ marginTop: 10 }}
                onClick={async () => {
                  const sent = await sendTestNotification();
                  toast(sent ? 'Notification envoyée' : 'Notification impossible pour le moment');
                }}
              >
                Tester une notification
              </Button>
            </>
          )}

          {status.capability === 'needs_install' && (
            <div className="block-callout block-warning" style={{ marginTop: 14 }}>
              Ajouté Apprend+ à ton écran d’accueil : Partager, puis « Sur l’écran d’accueil ». Les notifications
              deviendront disponibles.
            </div>
          )}
        </section>

        {/* ---------------------------- Aujourd’hui -------------------------- */}
        <Section title="Aujourd’hui" icon="calendar">
          {grouped.today.length === 0 ? (
            <EmptyState icon="check-circle" title="Aucun rappel prévu aujourd’hui" />
          ) : (
            <div className="ap-list">
              {grouped.today.map((reminder) => (
                <div key={reminder.id} className="ap-list-card">
                  <span className="ap-icon-badge ap-icon-badge--sm ap-icon-badge--plain ap-accent-violet">
                    <Icon name="clock" size={17} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontWeight: 700 }}>{reminder.title}</span>
                    <span className="ap-caption">{describeNextOccurrence(reminder.days, reminder.time)}</span>
                  </span>
                  <span className="ap-caption">{reminder.durationMin} min</span>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ------------------------------ Tous ------------------------------- */}
        <Section title="Tous mes rappels" icon="bell">
          {!reminders ? (
            <p className="ap-caption">Chargement…</p>
          ) : reminders.length === 0 ? (
            <EmptyState icon="bell" title="Aucun rappel" hint="Créé ton premier rappel d’apprentissage." />
          ) : (
            <div className="ap-list">
              {grouped.all.map((reminder) => (
                <div key={reminder.id} className="ap-list-card">
                  <button
                    type="button"
                    style={{ flex: 1, minWidth: 0, textAlign: 'left' }}
                    onClick={() => {
                      setEditing(reminder);
                      setSheetOpen(true);
                    }}
                  >
                    <span style={{ display: 'block', fontWeight: 700 }}>{reminder.title}</span>
                    <span className="ap-caption">
                      {describeDays(reminder.days)} · {reminder.time} · {reminder.durationMin} min
                    </span>
                  </button>
                  <Switch
                    checked={reminder.enabled}
                    onChange={(value) => void reminderRepository.put({ ...reminder, enabled: value })}
                    label={`Activer ${reminder.title}`}
                  />
                  <button type="button" aria-label={`Supprimer ${reminder.title}`} onClick={() => void remove(reminder)}>
                    <Icon name="trash" size={18} style={{ color: 'var(--ap-text-faint)' }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      <ReminderSheet
        open={sheetOpen}
        reminder={editing}
        domains={domains ?? []}
        onClose={() => setSheetOpen(false)}
        onSaved={() => {
          setSheetOpen(false);
          toast(editing ? 'Rappel modifié' : 'Rappel créé');
        }}
      />
    </main>
  );
}

function ReminderSheet({
  open,
  reminder,
  domains,
  onClose,
  onSaved,
}: {
  open: boolean;
  reminder: Reminder | null;
  domains: { id: string; name: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('18:00');
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [duration, setDuration] = useState(20);
  const [domainId, setDomainId] = useState('');

  useEffect(() => {
    if (!open) return;
    setTitle(reminder?.title ?? '');
    setTime(reminder?.time ?? '18:00');
    setDays(reminder?.days ?? [1, 2, 3, 4, 5]);
    setDuration(reminder?.durationMin ?? 20);
    setDomainId(reminder?.domainId ?? '');
  }, [open, reminder]);

  const save = async () => {
    const now = new Date().toISOString();
    await reminderRepository.put({
      id: reminder?.id ?? newId('rem'),
      title: title.trim(),
      subtitle: domains.find((d) => d.id === domainId)?.name,
      days,
      time,
      durationMin: duration,
      enabled: reminder?.enabled ?? true,
      domainId: domainId || undefined,
      createdAt: reminder?.createdAt ?? now,
      lastFiredAt: reminder?.lastFiredAt,
    });
    onSaved();
  };

  return (
    <Sheet open={open} onClose={onClose} title={reminder ? 'Modifier le rappel' : 'Nouveau rappel'}>
      <div className="ap-stack ap-stack--tight">
        <label className="ap-field">
          <span className="ap-label">Titre</span>
          <input className="ap-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Réviser Java" />
        </label>

        <div className="ap-field">
          <span className="ap-label">Jours</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1, 2, 3, 4, 5, 6, 0].map((day) => (
              <button
                key={day}
                type="button"
                aria-pressed={days.includes(day)}
                aria-label={`Jour ${day}`}
                className={`ap-chip ${days.includes(day) ? 'ap-chip--active' : ''}`}
                style={{ flex: 1, justifyContent: 'center', padding: '6px 0' }}
                onClick={() => setDays(days.includes(day) ? days.filter((d) => d !== day) : [...days, day])}
              >
                {weekdayShort(day)}
              </button>
            ))}
          </div>
        </div>

        <label className="ap-field">
          <span className="ap-label">Heure</span>
          <input className="ap-input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>

        <label className="ap-field">
          <span className="ap-label">Durée (minutes)</span>
          <input
            className="ap-input"
            type="number"
            min={5}
            max={180}
            step={5}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
        </label>

        <label className="ap-field">
          <span className="ap-label">Domaine (optionnel)</span>
          <select className="ap-select" value={domainId} onChange={(e) => setDomainId(e.target.value)}>
            <option value="">Aucun</option>
            {domains.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>

        <Button block onClick={save} disabled={title.trim().length === 0}>
          {reminder ? 'Enregistrer' : 'Créer le rappel'}
        </Button>
      </div>
    </Sheet>
  );
}
