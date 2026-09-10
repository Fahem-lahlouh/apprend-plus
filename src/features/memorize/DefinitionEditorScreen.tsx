import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Button, useConfirm, useToast } from '@/design-system';
import { TopBar } from '@/app/TopBar';
import { db } from '@/repositories/db';
import { definitionRepository } from '@/repositories/definitionRepository';
import { saveDefinition } from '@/services/memorizationProgress';
import { analyzeDefinition } from '@/services/textAnalysis';
import { availableGames } from '@/services/memorizationEngine';
import './memorize.css';

export function DefinitionEditorScreen() {
  const { definitionId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();

  const domains = useLiveQuery(() => db.domains.toArray(), []);
  const existing = useLiveQuery(
    async () => (definitionId ? await definitionRepository.get(definitionId) : undefined),
    [definitionId],
  );

  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [domainId, setDomainId] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!definitionId) {
      setLoaded(true);
      return;
    }
    if (existing && !loaded) {
      setTitle(existing.title);
      setText(existing.text);
      setDomainId(existing.domainId ?? '');
      setLoaded(true);
    }
  }, [definitionId, existing, loaded]);

  // L'aperçu montre ce que le moteur voit : rien n'est stocké, tout est recalculé.
  const analysis = analyzeDefinition(text);
  const games = availableGames(analysis, 20);
  const ready = title.trim().length > 0 && analysis.wordCount >= 4;

  const submit = async () => {
    const saved = await saveDefinition({
      id: definitionId,
      title,
      text,
      domainId: domainId || undefined,
    });
    toast(definitionId ? 'Définition mise à jour' : 'Définition prête à apprendre', 'xp');
    navigate(`/memorize/${saved.id}`, { replace: true });
  };

  const remove = async () => {
    if (!definitionId) return;
    const ok = await confirm({
      title: `Supprimer « ${title} » ?`,
      message: 'La définition, sa progression et ses statistiques de mémorisation seront effacées.',
      confirmLabel: 'Supprimer',
      destructive: true,
    });
    if (!ok) return;
    await definitionRepository.remove(definitionId);
    toast('Définition supprimée');
    navigate('/memorize', { replace: true });
  };

  return (
    <main className="ap-page">
      <TopBar title={definitionId ? 'Modifier la définition' : 'Nouvelle définition'} />

      <form
        className="ap-stack ap-stack--tight"
        onSubmit={(event) => {
          event.preventDefault();
          if (ready) void submit();
        }}
      >
        <label className="ap-field">
          <span className="ap-label">Titre</span>
          <input
            className="ap-input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Spring Boot"
            required
          />
        </label>

        <label className="ap-field">
          <span className="ap-label">Définition</span>
          <textarea
            className="ap-textarea"
            style={{ minHeight: 160 }}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Spring Boot est un framework basé sur Spring qui simplifie la création d’applications autonomes…"
          />
        </label>

        <label className="ap-field">
          <span className="ap-label">Domaine (optionnel, crée aussi une flashcard)</span>
          <select className="ap-select" value={domainId} onChange={(event) => setDomainId(event.target.value)}>
            <option value="">Aucun</option>
            {(domains ?? []).map((domain) => (
              <option key={domain.id} value={domain.id}>
                {domain.name}
              </option>
            ))}
          </select>
        </label>

        {analysis.wordCount > 0 && (
          <div className="ap-card">
            <p style={{ fontWeight: 700, fontSize: 14.5 }}>Ce que l’application a compris</p>
            <p className="ap-caption" style={{ marginTop: 4 }}>
              {analysis.sentences.length} phrase{analysis.sentences.length > 1 ? 's' : ''} ·{' '}
              {analysis.wordCount} mots · {games.length} jeux applicables
            </p>
            {analysis.importantTokens.length > 0 && (
              <div className="ap-chip-row" style={{ marginTop: 10 }}>
                {analysis.importantTokens.slice(0, 8).map((token) => (
                  <span key={`${token.key}-${token.start}`} className="ap-chip">
                    {token.text}
                  </span>
                ))}
              </div>
            )}
            {analysis.importantPhrases.length > 0 && (
              <p className="ap-caption" style={{ marginTop: 8 }}>
                Expressions repérées :{' '}
                {analysis.importantPhrases.slice(0, 3).map((phrase) => `« ${phrase.text} »`).join(', ')}
              </p>
            )}
          </div>
        )}

        <Button type="submit" block disabled={!ready} icon="check">
          Enregistrer
        </Button>
        {!ready && text.length > 0 && (
          <p className="ap-caption">Il faut un titre et au moins quatre mots pour générer des exercices.</p>
        )}

        {definitionId && (
          <Button variant="ghost" block icon="trash" onClick={remove}>
            Supprimer cette définition
          </Button>
        )}
      </form>
    </main>
  );
}
