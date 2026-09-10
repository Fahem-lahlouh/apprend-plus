import type { CodeLanguage } from '@/models';

/**
 * CodeExecutionService
 * --------------------
 * Running Java inside a browser is not something the platform can do honestly:
 * there is no bundled JVM, and shipping one through WebAssembly (CheerpJ, TeaVM,
 * DoppioJVM) costs tens of megabytes and does not support the full JDK. So the
 * service is an abstraction with pluggable strategies:
 *
 *  - LocalJavaScriptStrategy: JavaScript really runs, in a sandboxed Worker.
 *  - PistonStrategy: Java / Python / other languages are sent to a Piston
 *    instance (open source, free, no API key). Requires network.
 *
 * If no strategy can handle a language, the service says so. It never fakes a
 * compilation result.
 */

export interface ExecutionRequest {
  language: CodeLanguage;
  code: string;
  stdin?: string;
}

export interface ExecutionResult {
  ok: boolean;
  stdout: string;
  stderr: string;
  /** Human-readable strategy name shown in the UI. */
  runner: string;
  durationMs: number;
  /** Set when nothing could be run at all (offline, unsupported language). */
  unavailableReason?: string;
}

export interface ExecutionStrategy {
  readonly name: string;
  supports(language: CodeLanguage): boolean;
  isAvailable(): boolean;
  run(request: ExecutionRequest): Promise<ExecutionResult>;
}

const WORKER_SOURCE = `
self.onmessage = (event) => {
  const logs = [];
  const format = (value) => {
    if (typeof value === 'string') return value;
    try { return JSON.stringify(value); } catch { return String(value); }
  };
  const console = {
    log: (...args) => logs.push(args.map(format).join(' ')),
    info: (...args) => logs.push(args.map(format).join(' ')),
    warn: (...args) => logs.push(args.map(format).join(' ')),
    error: (...args) => logs.push(args.map(format).join(' ')),
  };
  try {
    const fn = new Function('console', event.data.code);
    const returned = fn(console);
    if (returned !== undefined) logs.push(format(returned));
    self.postMessage({ ok: true, stdout: logs.join('\\n'), stderr: '' });
  } catch (error) {
    self.postMessage({ ok: false, stdout: logs.join('\\n'), stderr: String(error) });
  }
};
`;

export class LocalJavaScriptStrategy implements ExecutionStrategy {
  readonly name = 'JavaScript (local)';
  private timeoutMs: number;

  constructor(timeoutMs = 4000) {
    this.timeoutMs = timeoutMs;
  }

  supports(language: CodeLanguage): boolean {
    return language === 'javascript';
  }

  isAvailable(): boolean {
    return typeof Worker !== 'undefined' && typeof URL?.createObjectURL === 'function';
  }

  run(request: ExecutionRequest): Promise<ExecutionResult> {
    const started = Date.now();
    return new Promise((resolve) => {
      const blob = new Blob([WORKER_SOURCE], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      const worker = new Worker(url);
      let settled = false;

      const finish = (result: Omit<ExecutionResult, 'runner' | 'durationMs'>) => {
        if (settled) return;
        settled = true;
        worker.terminate();
        URL.revokeObjectURL(url);
        resolve({ ...result, runner: this.name, durationMs: Date.now() - started });
      };

      const timer = setTimeout(
        () =>
          finish({
            ok: false,
            stdout: '',
            stderr: `Exécution interrompue après ${this.timeoutMs} ms (boucle infinie ?)`,
          }),
        this.timeoutMs,
      );

      worker.onmessage = (event: MessageEvent) => {
        clearTimeout(timer);
        finish(event.data as { ok: boolean; stdout: string; stderr: string });
      };
      worker.onerror = (event) => {
        clearTimeout(timer);
        finish({ ok: false, stdout: '', stderr: event.message });
      };
      worker.postMessage({ code: request.code });
    });
  }
}

const PISTON_LANGUAGES: Partial<Record<CodeLanguage, { language: string; version: string; fileName: string }>> = {
  java: { language: 'java', version: '15.0.2', fileName: 'Main.java' },
  python: { language: 'python', version: '3.10.0', fileName: 'main.py' },
  javascript: { language: 'javascript', version: '18.15.0', fileName: 'main.js' },
};

export class PistonStrategy implements ExecutionStrategy {
  readonly name = 'Piston (exécution distante)';
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  supports(language: CodeLanguage): boolean {
    return language in PISTON_LANGUAGES;
  }

  isAvailable(): boolean {
    return typeof fetch === 'function' && (typeof navigator === 'undefined' || navigator.onLine !== false);
  }

  async run(request: ExecutionRequest): Promise<ExecutionResult> {
    const started = Date.now();
    const config = PISTON_LANGUAGES[request.language];
    if (!config) {
      return {
        ok: false,
        stdout: '',
        stderr: '',
        runner: this.name,
        durationMs: 0,
        unavailableReason: `Langage non supporté : ${request.language}`,
      };
    }
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: config.language,
          version: config.version,
          files: [{ name: config.fileName, content: request.code }],
          stdin: request.stdin ?? '',
        }),
      });
      if (!response.ok) {
        return {
          ok: false,
          stdout: '',
          stderr: '',
          runner: this.name,
          durationMs: Date.now() - started,
          unavailableReason: `Le service d’exécution a répondu ${response.status}. Reessaie dans un instant.`,
        };
      }
      const payload = (await response.json()) as {
        run?: { stdout?: string; stderr?: string; code?: number };
        compile?: { stdout?: string; stderr?: string; code?: number };
      };
      const compileError = payload.compile?.stderr?.trim();
      const stdout = payload.run?.stdout ?? '';
      const stderr = compileError ? compileError : (payload.run?.stderr ?? '');
      return {
        ok: !compileError && (payload.run?.code ?? 0) === 0,
        stdout,
        stderr,
        runner: this.name,
        durationMs: Date.now() - started,
      };
    } catch {
      return {
        ok: false,
        stdout: '',
        stderr: '',
        runner: this.name,
        durationMs: Date.now() - started,
        unavailableReason:
          "Impossible de joindre le service d’exécution. Vérifie ta connexion : l’exécution de Java nécessite le réseau.",
      };
    }
  }
}

export class CodeExecutionService {
  private strategies: ExecutionStrategy[];

  constructor(strategies: ExecutionStrategy[]) {
    this.strategies = strategies;
  }

  strategyFor(language: CodeLanguage): ExecutionStrategy | undefined {
    return this.strategies.find((s) => s.supports(language) && s.isAvailable());
  }

  canRun(language: CodeLanguage): boolean {
    return this.strategyFor(language) !== undefined;
  }

  async run(request: ExecutionRequest): Promise<ExecutionResult> {
    const strategy = this.strategyFor(request.language);
    if (!strategy) {
      return {
        ok: false,
        stdout: '',
        stderr: '',
        runner: 'aucun',
        durationMs: 0,
        unavailableReason:
          request.language === 'sql' || request.language === 'text'
            ? "Ce langage n’est pas exécutable ici : l’éditeur sert à s’entraîner a écrire le code."
            : "Aucun moteur d’exécution disponible hors ligne pour ce langage.",
      };
    }
    return strategy.run(request);
  }
}

export function createCodeExecutionService(pistonEndpoint: string): CodeExecutionService {
  return new CodeExecutionService([new LocalJavaScriptStrategy(), new PistonStrategy(pistonEndpoint)]);
}
