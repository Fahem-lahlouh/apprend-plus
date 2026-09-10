import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/repositories/db';
import { seedDatabase } from '@/data/seed';
import {
  backupFileName,
  eraseAllData,
  exportBackup,
  importBackup,
  inspectBackup,
  resetProgressOnly,
} from '@/services/backupService';
import { completeLesson, recordSession } from '@/services/learningService';

async function reset() {
  // Sequential inside one transaction: clearing tables concurrently races with
  // Dexie's auto-open and occasionally leaves a table populated.
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
}

describe('backup and restore', () => {
  beforeEach(async () => {
    await reset();
    await seedDatabase({ withDemoProgress: true });
  });

  it('exports every store', async () => {
    const backup = await exportBackup();
    expect(backup.format).toBe('apprend-plus-backup');
    expect(backup.data.lessons.length).toBeGreaterThan(30);
    expect(backup.data.reminders.length).toBe(3);
    expect(backup.data.dayStats.length).toBeGreaterThan(0);
  });

  it('rejects a file that is not an Apprend+ backup', () => {
    expect(() => inspectBackup({ hello: 'world' })).toThrow();
    expect(() => inspectBackup(null)).toThrow();
  });

  it('rejects a backup from a newer version', () => {
    expect(() => inspectBackup({ format: 'apprend-plus-backup', version: 99, data: {} })).toThrow();
  });

  it('describes what a backup contains before importing it', async () => {
    const summary = inspectBackup(await exportBackup());
    expect(summary.counts.courses).toBeGreaterThan(0);
    expect(summary.total).toBeGreaterThan(summary.counts.courses);
  });

  it('restores an exported backup after data loss', async () => {
    const lesson = (await db.lessons.get('java-l-streams'))!;
    await completeLesson(lesson);
    const backup = await exportBackup();

    await eraseAllData();
    expect(await db.lessons.count()).toBe(0);

    await importBackup(backup, 'replace');
    expect(await db.lessons.count()).toBe(backup.data.lessons.length);
    expect((await db.lessonProgress.get(lesson.id))?.status).toBe('completed');
  });

  it('merges without deleting content absent from the backup', async () => {
    const backup = await exportBackup();
    await db.courses.put({
      id: 'crs-local', domainId: 'java', title: 'Cours local', description: '', icon: '📘',
      level: 'debutant', estimatedMinutes: 0, tags: [], order: 99, archived: false,
      createdAt: '', updatedAt: '',
    });
    await importBackup(backup, 'merge');
    expect(await db.courses.get('crs-local')).toBeDefined();
  });

  it('replaces and therefore drops content absent from the backup', async () => {
    const backup = await exportBackup();
    await db.courses.put({
      id: 'crs-local', domainId: 'java', title: 'Cours local', description: '', icon: '📘',
      level: 'debutant', estimatedMinutes: 0, tags: [], order: 99, archived: false,
      createdAt: '', updatedAt: '',
    });
    await importBackup(backup, 'replace');
    expect(await db.courses.get('crs-local')).toBeUndefined();
  });

  it('resets progress but keeps the courses', async () => {
    await recordSession({ durationSec: 600, activity: 'lesson', domainId: 'java' });
    await resetProgressOnly();
    expect(await db.sessions.count()).toBe(0);
    expect(await db.lessonProgress.count()).toBe(0);
    expect(await db.dayStats.count()).toBe(0);
    expect(await db.lessons.count()).toBeGreaterThan(0);
    expect(await db.flashcards.count()).toBeGreaterThan(0);
  });

  it('names the export file with a sortable timestamp', () => {
    expect(backupFileName(new Date('2026-09-10T18:30:00.000Z'))).toBe(
      'apprend-plus-sauvegarde-2026-09-10-18-30-00.json',
    );
  });
});
