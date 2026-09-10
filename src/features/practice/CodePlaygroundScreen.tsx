import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { java } from '@codemirror/lang-java';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { sql } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';
import { Button, Icon } from '@/design-system';
import { TopBar } from '@/app/TopBar';
import type { CodeLanguage } from '@/models';
import { createCodeExecutionService, type ExecutionResult } from '@/services/codeExecution';
import { codeRunCounter, refreshBadges } from '@/services/learningService';
import { usePreferences } from '@/hooks/usePreferences';
import { useStudyTimer } from '@/hooks/useStudyTimer';
import './practice.css';

const TEMPLATES: Record<CodeLanguage, string> = {
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Bonjour");
    }
}`,
  javascript: `const langues = ["Java", "SQL", "Python"];
langues.filter((l) => l.length > 3).forEach((l) => console.log(l));`,
  python: `langues = ["Java", "SQL", "Python"]
for langue in langues:
    print(langue)`,
  sql: `SELECT ville, COUNT(*) AS nb
FROM clients
GROUP BY ville
ORDER BY nb DESC;`,
  text: '',
};

const LANGUAGES: { value: CodeLanguage; label: string }[] = [
  { value: 'java', label: 'Java' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'sql', label: 'SQL' },
];

/**
 * CodeMirror 6 is used rather than Monaco: Monaco's editing surface relies on
 * behaviours that Safari on iOS handles poorly (hidden textarea, custom
 * scrolling), while CodeMirror 6 was designed with touch input in mind and is
 * roughly ten times lighter.
 */
export function CodePlaygroundScreen() {
  const location = useLocation() as { state?: { code?: string; language?: CodeLanguage } };
  const { preferences } = usePreferences();
  const initialLanguage = location.state?.language && location.state.language !== 'text' ? location.state.language : 'java';

  const [language, setLanguage] = useState<CodeLanguage>(initialLanguage);
  const [code, setCode] = useState(location.state?.code ?? TEMPLATES[initialLanguage]);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [running, setRunning] = useState(false);

  useStudyTimer({ activity: 'practice' });

  const service = useMemo(
    () => createCodeExecutionService(preferences.codeRunnerEndpoint),
    [preferences.codeRunnerEndpoint],
  );

  const extensions = useMemo(() => {
    switch (language) {
      case 'java':
        return [java()];
      case 'javascript':
        return [javascript()];
      case 'python':
        return [python()];
      case 'sql':
        return [sql()];
      default:
        return [];
    }
  }, [language]);

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const canRun = service.canRun(language);
  const strategy = service.strategyFor(language);

  const run = async () => {
    setRunning(true);
    setResult(null);
    const outcome = await service.run({ language, code });
    setResult(outcome);
    setRunning(false);
    if (!outcome.unavailableReason) {
      codeRunCounter.increment();
      void refreshBadges();
    }
  };

  return (
    <main className="ap-page">
      <TopBar title="Éditeur de code" />

      <div className="play-toolbar">
        {LANGUAGES.map((entry) => (
          <button
            key={entry.value}
            type="button"
            className={`ap-chip ${language === entry.value ? 'ap-chip--active' : ''}`}
            onClick={() => {
              setLanguage(entry.value);
              setCode(TEMPLATES[entry.value]);
              setResult(null);
            }}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div className="play-editor">
        <CodeMirror
          value={code}
          height="300px"
          theme={isDark ? oneDark : undefined}
          extensions={extensions}
          onChange={setCode}
          basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: true, autocompletion: false }}
        />
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
        <Button block icon="play" onClick={run} disabled={running || !canRun}>
          {running ? 'Exécution…' : 'Exécuter'}
        </Button>
        <Button variant="ghost" icon="refresh" onClick={() => { setCode(TEMPLATES[language]); setResult(null); }}>
          Réinitialiser
        </Button>
      </div>

      <p className="ap-caption" style={{ marginTop: 10 }}>
        {canRun ? (
          <>
            Moteur : <strong>{strategy?.name}</strong>.{' '}
            {language === 'javascript'
              ? 'JavaScript s’exécute directement sur ton iPhone, hors ligne.'
              : "Ce langage est compilé et exécuté par un service Piston (open source, gratuit, sans clé). Une connexion est nécessaire."}
          </>
        ) : (
          "Ce langage n’est pas exécutable ici : l’éditeur sert a s’entraîner à écrire le code. SQL demande une base de données, absente d’une application hors ligne."
        )}
      </p>

      {result && (
        <div className="play-output">
          <div className="play-output__head">
            <Icon
              name={result.unavailableReason ? 'bolt' : result.ok ? 'check-circle' : 'x'}
              size={16}
              style={{ color: result.ok && !result.unavailableReason ? 'var(--ap-success)' : 'var(--ap-danger)' }}
            />
            Résultat
            <span className="ap-spacer" />
            <span className="ap-caption">{result.durationMs} ms · {result.runner}</span>
          </div>
          <div className={`play-output__body ${result.ok ? '' : 'play-output__body--error'}`}>
            {result.unavailableReason ?? (result.stdout || result.stderr || '(aucune sortie)')}
            {result.stdout && result.stderr && `\n${result.stderr}`}
          </div>
        </div>
      )}
    </main>
  );
}
