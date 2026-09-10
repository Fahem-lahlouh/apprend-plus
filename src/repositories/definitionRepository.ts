import { db } from './db';
import type { Definition, DefinitionProgress, Id, MemoTargetStat, TimedRun } from '@/models';

export const definitionRepository = {
  async list(): Promise<Definition[]> {
    const all = await db.definitions.toArray();
    return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },
  get(id: Id) {
    return db.definitions.get(id);
  },
  byDomain(domainId: Id) {
    return db.definitions.where('domainId').equals(domainId).toArray();
  },
  put(definition: Definition) {
    return db.definitions.put(definition);
  },
  async remove(id: Id) {
    await db.transaction('rw', db.definitions, db.definitionProgress, db.memoTargetStats, async () => {
      await db.memoTargetStats.where('definitionId').equals(id).delete();
      await db.definitionProgress.delete(id);
      await db.definitions.delete(id);
    });
  },

  getProgress(definitionId: Id) {
    return db.definitionProgress.get(definitionId);
  },
  putProgress(progress: DefinitionProgress) {
    return db.definitionProgress.put(progress);
  },
  listProgress() {
    return db.definitionProgress.toArray();
  },

  targetStats(definitionId: Id) {
    return db.memoTargetStats.where('definitionId').equals(definitionId).toArray();
  },
  putTargetStat(stat: MemoTargetStat) {
    return db.memoTargetStats.put(stat);
  },

  addTimedRun(run: TimedRun) {
    return db.timedRuns.put(run);
  },
  listTimedRuns() {
    return db.timedRuns.toArray();
  },
};
