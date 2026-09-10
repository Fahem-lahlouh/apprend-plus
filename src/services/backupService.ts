import { db, STORE_NAMES, tableOf, type StoreName } from '@/repositories/db';
import type { BackupFile } from '@/models';

export const BACKUP_VERSION = 1;

export async function exportBackup(): Promise<BackupFile> {
  const data: Record<string, unknown[]> = {};
  for (const name of STORE_NAMES) {
    data[name] = await tableOf(db, name).toArray();
  }
  return {
    format: 'apprend-plus-backup',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };
}

export interface BackupSummary {
  exportedAt: string;
  version: number;
  counts: Record<string, number>;
  total: number;
}

/** Validates a parsed file and describes it, so the user can confirm knowingly. */
export function inspectBackup(raw: unknown): BackupSummary {
  if (!raw || typeof raw !== 'object') throw new Error('Fichier illisible.');
  const candidate = raw as Partial<BackupFile>;
  if (candidate.format !== 'apprend-plus-backup') {
    throw new Error("Ce fichier n’est pas une sauvegarde Apprend+.");
  }
  if (typeof candidate.version !== 'number' || candidate.version > BACKUP_VERSION) {
    throw new Error('Cette sauvegarde provient d’une version plus récente de l’application.');
  }
  const data = candidate.data ?? {};
  const counts: Record<string, number> = {};
  let total = 0;
  for (const name of STORE_NAMES) {
    const rows = data[name];
    const count = Array.isArray(rows) ? rows.length : 0;
    counts[name] = count;
    total += count;
  }
  return { exportedAt: candidate.exportedAt ?? '', version: candidate.version, counts, total };
}

export type ImportMode = 'replace' | 'merge';

/** Never called without an explicit confirmation from the UI. */
export async function importBackup(raw: unknown, mode: ImportMode): Promise<BackupSummary> {
  const summary = inspectBackup(raw);
  const data = (raw as BackupFile).data;
  await db.transaction('rw', db.tables, async () => {
    for (const name of STORE_NAMES) {
      const table = tableOf(db, name as StoreName);
      const rows = Array.isArray(data[name]) ? (data[name] as unknown[]) : [];
      if (mode === 'replace') await table.clear();
      if (rows.length > 0) await table.bulkPut(rows);
    }
  });
  return summary;
}

export async function eraseAllData(): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    for (const name of STORE_NAMES) {
      await tableOf(db, name).clear();
    }
  });
}

/** Clears progression but keeps the courses themselves. */
export async function resetProgressOnly(): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    await db.lessonProgress.clear();
    await db.attempts.clear();
    await db.sessions.clear();
    await db.dayStats.clear();
    await db.schedules.clear();
    await db.badges.clear();
    await db.bookmarks.clear();
    await db.reviewItems.clear();
    await db.profile.clear();
  });
}

export function backupFileName(now = new Date()): string {
  const stamp = now.toISOString().slice(0, 19).replace(/[:T]/g, '-');
  return `apprend-plus-sauvegarde-${stamp}.json`;
}

export function downloadBackup(backup: BackupFile): void {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = backupFileName();
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
