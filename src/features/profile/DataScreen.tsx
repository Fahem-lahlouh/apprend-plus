import { useRef, useState } from 'react';
import { Button, Icon, Section, useConfirm, useToast } from '@/design-system';
import { TopBar } from '@/app/TopBar';
import {
  downloadBackup,
  eraseAllData,
  exportBackup,
  importBackup,
  inspectBackup,
  resetProgressOnly,
  type BackupSummary,
} from '@/services/backupService';
import { seedDatabase } from '@/data/seed';

export function DataScreen() {
  const confirm = useConfirm();
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ raw: unknown; summary: BackupSummary } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onExport = async () => {
    const backup = await exportBackup();
    downloadBackup(backup);
    toast('Sauvegarde exportee');
  };

  const onFile = async (file: File) => {
    setError(null);
    try {
      const raw = JSON.parse(await file.text());
      setPending({ raw, summary: inspectBackup(raw) });
    } catch (cause) {
      setPending(null);
      setError(cause instanceof Error ? cause.message : 'Fichier illisible.');
    }
  };

  const applyImport = async (mode: 'replace' | 'merge') => {
    if (!pending) return;
    const ok = await confirm({
      title: mode === 'replace' ? 'Remplacer toutes les données ?' : 'Fusionner la sauvegarde ?',
      message:
        mode === 'replace'
          ? 'Le contenu actuel de cet appareil sera effacé et remplace par celui de la sauvegarde. Cette action est irréversible.'
          : 'Les elements de la sauvegarde seront ajoutés ou mis à jour. Les elements absents de la sauvegarde sont conserves.',
      confirmLabel: mode === 'replace' ? 'Remplacer' : 'Fusionner',
      destructive: mode === 'replace',
    });
    if (!ok) return;
    await importBackup(pending.raw, mode);
    setPending(null);
    toast('Sauvegarde importee');
  };

  const onResetProgress = async () => {
    const ok = await confirm({
      title: 'Réinitialiser la progression ?',
      message:
        'Leçons terminées, sessions, quiz, révisions, XP et badges seront effaces. Les cours et flashcards sont conserves.',
      confirmLabel: 'Réinitialiser',
      destructive: true,
    });
    if (!ok) return;
    await resetProgressOnly();
    toast('Progression réinitialisée');
  };

  const onEraseAll = async () => {
    const ok = await confirm({
      title: 'Effacer toutes les données ?',
      message:
        'Tout est supprimé : domaines, cours, leçons, flashcards, progression, rappels et préférences. Exporte une sauvegarde avant si tu veux pouvoir revenir en arrière.',
      confirmLabel: 'Tout effacer',
      destructive: true,
    });
    if (!ok) return;
    await eraseAllData();
    await seedDatabase({ withDemoProgress: false });
    toast('Données effacées, contenu de base restauré');
  };

  return (
    <main className="ap-page">
      <TopBar title="Sauvegarde et données" />

      <div className="ap-stack">
        <Section title="Sauvegarde" icon="download">
          <div className="ap-card">
            <p className="ap-body">
              La sauvegarde contient tout : domaines, cours, chapitres, leçons, progression, flashcards, quiz,
              résultats, sessions, rappels, badges et préférences.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
              <Button block icon="download" onClick={onExport}>
                Exporter une sauvegarde
              </Button>
              <Button block variant="ghost" icon="upload" onClick={() => fileInput.current?.click()}>
                Importer une sauvegarde
              </Button>
              <input
                ref={fileInput}
                type="file"
                accept="application/json,.json"
                className="ap-sr-only"
                aria-label="Fichier de sauvegarde"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void onFile(file);
                  event.target.value = '';
                }}
              />
            </div>

            {error && (
              <div className="block-callout block-warning" style={{ marginTop: 12 }}>
                {error}
              </div>
            )}

            {pending && (
              <div className="ap-card" style={{ marginTop: 14, background: 'var(--ap-surface-sunken)' }}>
                <p style={{ fontWeight: 700 }}>Sauvegarde détectée</p>
                <p className="ap-caption" style={{ marginTop: 4 }}>
                  {pending.summary.exportedAt
                    ? `Exportee le ${new Date(pending.summary.exportedAt).toLocaleString('fr-FR')}`
                    : 'Date inconnue'}{' '}
                  · {pending.summary.total} elements
                </p>
                <ul className="ap-caption" style={{ marginTop: 8, paddingLeft: 18 }}>
                  <li>{pending.summary.counts.courses} cours · {pending.summary.counts.lessons} leçons</li>
                  <li>{pending.summary.counts.flashcards} flashcards · {pending.summary.counts.questions} questions</li>
                  <li>{pending.summary.counts.sessions} sessions enregistrées</li>
                </ul>
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <Button block variant="ghost" onClick={() => void applyImport('merge')}>
                    Fusionner
                  </Button>
                  <Button block variant="danger" onClick={() => void applyImport('replace')}>
                    Remplacer
                  </Button>
                </div>
                <Button block variant="ghost" size="sm" style={{ marginTop: 8 }} onClick={() => setPending(null)}>
                  Annuler
                </Button>
              </div>
            )}
          </div>
        </Section>

        <Section title="Contenu" icon="refresh">
          <div className="ap-card">
            <p className="ap-body">
              Reinstalle les domaines et cours fournis avec l’application, sans toucher à ta progression ni à ton
              contenu personnel.
            </p>
            <Button
              block
              variant="ghost"
              icon="refresh"
              style={{ marginTop: 12 }}
              onClick={async () => {
                await seedDatabase({ withDemoProgress: false });
                toast('Contenu de base restauré');
              }}
            >
              Restaurer le contenu de base
            </Button>
          </div>
        </Section>

        <Section title="Zone sensible" icon="lock">
          <div className="ap-card">
            <p className="ap-body">
              Ces actions sont irréversibles. Une confirmation est demandée à chaque fois.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
              <Button block variant="ghost" icon="rotate" onClick={onResetProgress}>
                Réinitialiser la progression
              </Button>
              <Button block variant="danger" icon="trash" onClick={onEraseAll}>
                Effacer toutes les données
              </Button>
            </div>
          </div>
        </Section>

        <p className="ap-caption" style={{ textAlign: 'center' }}>
          <Icon name="lock" size={13} /> Aucune donnee n’est envoyée sur un serveur.
        </p>
      </div>
    </main>
  );
}
