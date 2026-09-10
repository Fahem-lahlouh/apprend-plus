import { afterEach, describe, expect, it, vi } from 'vitest';
import { CodeExecutionService, PistonStrategy, createCodeExecutionService } from '@/services/codeExecution';

describe('CodeExecutionService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reports honestly when no strategy can run a language', async () => {
    const service = new CodeExecutionService([]);
    expect(service.canRun('java')).toBe(false);
    const result = await service.run({ language: 'java', code: '' });
    expect(result.ok).toBe(false);
    expect(result.unavailableReason).toBeTruthy();
    expect(result.stdout).toBe('');
  });

  it('explains that SQL is not executable rather than pretending', async () => {
    const result = await new CodeExecutionService([]).run({ language: 'sql', code: 'SELECT 1;' });
    expect(result.unavailableReason).toContain("pas exécutable");
  });

  it('routes Java to the remote strategy', () => {
    const service = createCodeExecutionService('https://example.test/execute');
    expect(service.strategyFor('java')?.name).toContain('Piston');
  });

  it('returns the compilation error when the remote compiler fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ compile: { stderr: 'Main.java:2: error: \';\' expected' }, run: { stdout: '', code: 1 } }),
    })));
    const result = await new PistonStrategy('https://example.test/execute').run({ language: 'java', code: 'oops' });
    expect(result.ok).toBe(false);
    expect(result.stderr).toContain('error');
  });

  it('returns the program output on success', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ run: { stdout: 'Bonjour\n', stderr: '', code: 0 } }),
    })));
    const result = await new PistonStrategy('https://example.test/execute').run({ language: 'java', code: 'ok' });
    expect(result.ok).toBe(true);
    expect(result.stdout).toBe('Bonjour\n');
  });

  it('says the network is needed when the service is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('network down');
    }));
    const result = await new PistonStrategy('https://example.test/execute').run({ language: 'java', code: 'ok' });
    expect(result.unavailableReason).toContain('connexion');
  });

  it('surfaces an HTTP error from the execution service', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 429, json: async () => ({}) })));
    const result = await new PistonStrategy('https://example.test/execute').run({ language: 'python', code: 'print(1)' });
    expect(result.unavailableReason).toContain('429');
  });
});
