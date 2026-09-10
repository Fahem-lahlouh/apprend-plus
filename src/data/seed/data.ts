import type { DomainSpec } from './builders';
import { code, def, exercise, keypoints, mcq, quiz, text, tip, trueFalse, warn, fillBlank } from './builders';

const D = 'data';

export const dataDomain: DomainSpec = {
  id: D,
  name: 'Data',
  description: 'Analyse et visualise tes données',
  icon: 'database',
  accent: 'green',
  paths: [
    { id: 'data-path-sql', title: 'SQL', description: 'Interroger une base relationnelle.' },
    { id: 'data-path-python', title: 'Python pour la data', description: 'Pandas, statistiques et visualisation.' },
  ],
  courses: [
    {
      id: 'data-sql',
      pathId: 'data-path-sql',
      title: 'SQL pour la data',
      description: 'Sélectionner, filtrer, joindre et agréger des données.',
      icon: '🧮',
      level: 'debutant',
      tags: ['sql', 'data', 'requêtes'],
      chapters: [
        {
          id: 'data-ch-sql-bases',
          title: 'Les bases',
          lessons: [
            {
              id: 'data-l-select',
              title: 'SELECT et WHERE',
              summary: 'Lire des colonnes et filtrer des lignes.',
              minutes: 7,
              blocks: [
                def('SELECT', "L'instruction qui choisit les colonnes à lire ; WHERE filtre les lignes retournees."),
                code('sql', `SELECT nom, ville
FROM clients
WHERE ville = 'Paris'
  AND actif = true
ORDER BY nom;`),
                tip("Évite `SELECT *` en production : tu transportes des colonnes inutiles et le code casse quand la table évolue."),
                quiz('data-q-select-1'),
              ],
            },
            {
              id: 'data-l-joins',
              title: 'Les jointures',
              summary: 'INNER, LEFT, RIGHT : ce que chacune conserve.',
              minutes: 9,
              blocks: [
                keypoints([
                  'INNER JOIN : seulement les lignes qui existent des deux côtés.',
                  'LEFT JOIN : toutes les lignes de gauche, compléments a NULL a droite.',
                  'RIGHT JOIN : le symétrique.',
                  'FULL OUTER JOIN : tout, des deux côtés.',
                ]),
                code('sql', `SELECT c.nom, COUNT(cmd.id) AS nb_commandes
FROM clients c
LEFT JOIN commandes cmd ON cmd.client_id = c.id
GROUP BY c.nom;`),
                warn("Avec un LEFT JOIN, une condition sur la table de droite placee dans WHERE annule l’effet du LEFT JOIN : mets-la dans le ON."),
                quiz('data-q-join-1'),
                quiz('data-q-join-2'),
              ],
            },
          ],
        },
        {
          id: 'data-ch-sql-agrégation',
          title: 'Agrégation',
          lessons: [
            {
              id: 'data-l-groupby',
              title: 'GROUP BY et HAVING',
              summary: 'Regrouper, compter, puis filtrer sur le résultat agrege.',
              minutes: 8,
              blocks: [
                text("WHERE filtre les lignes avant le regroupement ; HAVING filtre les groupes après. C'est la source d’erreur la plus fréquente en SQL."),
                code('sql', `SELECT ville, COUNT(*) AS nb
FROM clients
WHERE actif = true      -- filtre les lignes
GROUP BY ville
HAVING COUNT(*) > 10    -- filtre les groupes
ORDER BY nb DESC;`),
                quiz('data-q-groupby-1'),
                exercise({
                  title: 'Chiffre d’affaires par mois',
                  statement: "Écris une requête qui affiche, par mois, la somme des montants de la table `commandes` (colonnes : date_commande, montant), du mois le plus rentable au moins rentable.",
                  language: 'sql',
                  starterCode: `SELECT ...
FROM commandes
...`,
                  hint: 'DATE_TRUNC ou EXTRACT selon le moteur, puis GROUP BY et ORDER BY.',
                  solution: `SELECT DATE_TRUNC('month', date_commande) AS mois,
       SUM(montant) AS total
FROM commandes
GROUP BY mois
ORDER BY total DESC;`,
                }),
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'data-python',
      pathId: 'data-path-python',
      title: 'Python pour la data',
      description: 'Pandas, nettoyage et premières statistiques.',
      icon: '🐍',
      level: 'debutant',
      tags: ['python', 'pandas', 'data'],
      chapters: [
        {
          id: 'data-ch-pandas',
          title: 'Pandas',
          lessons: [
            {
              id: 'data-l-pandas',
              title: 'DataFrame : les bases',
              summary: 'Charger, explorer et filtrer un jeu de données.',
              minutes: 8,
              blocks: [
                def('DataFrame', 'Un tableau bidimensionnel étiqueté : des colonnes typées et un index de lignes.'),
                code('python', `import pandas as pd

df = pd.read_csv("ventes.csv")
df.head()
df.info()
df[df["montant"] > 100]
df.groupby("ville")["montant"].sum()`),
                tip("`df.info()` avant tout : il montre les types et les valeurs manquantes, qui expliquent la moitie des bugs d’analyse."),
                quiz('data-q-pandas-1'),
              ],
            },
            {
              id: 'data-l-stats',
              title: 'Moyenne, médiane et distribution',
              summary: 'Choisir la bonne mesure de tendance centrale.',
              minutes: 7,
              blocks: [
                text("La moyenne est tirée par les valeurs extrêmes ; la médiane ne l’est pas. Sur des salaires ou des montants de commande, la médiane décrit mieux le cas typique."),
                code('python', `df["montant"].mean()
df["montant"].median()
df["montant"].describe()`, { caption: 'Trois lignes pour cadrer une distribution' }),
                quiz('data-q-stats-1'),
              ],
            },
          ],
        },
      ],
    },
  ],
  questions: [
    mcq({ id: 'data-q-select-1', domainId: D, courseId: 'data-sql', lessonId: 'data-l-select', topic: 'SQL Bases', prompt: 'Quelle clause filtre les lignes lues ?', options: ['ORDER BY', 'WHERE', 'GROUP BY'], answerIndex: 1, explanation: 'WHERE filtre les lignes avant tout regroupement ou tri.' }),
    mcq({ id: 'data-q-join-1', domainId: D, courseId: 'data-sql', lessonId: 'data-l-joins', topic: 'SQL Jointures', prompt: 'Quelle jointure conserve toutes les lignes de la table de gauche ?', options: ['INNER JOIN', 'LEFT JOIN', 'CROSS JOIN'], answerIndex: 1, explanation: 'LEFT JOIN garde toutes les lignes de gauche et complete a NULL quand il n y à pas de correspondance.' }),
    trueFalse({ id: 'data-q-join-2', domainId: D, courseId: 'data-sql', lessonId: 'data-l-joins', topic: 'SQL Jointures', prompt: 'Mettre une condition sur la table de droite dans le WHERE d’un LEFT JOIN le transforme en INNER JOIN.', answer: true, explanation: 'Les lignes sans correspondance ont NULL à droite : la condition WHERE les élimine, ce qui revient à un INNER JOIN.' }),
    mcq({ id: 'data-q-groupby-1', domainId: D, courseId: 'data-sql', lessonId: 'data-l-groupby', topic: 'SQL Agrégation', prompt: 'Quelle clause filtre après un GROUP BY ?', options: ['WHERE', 'HAVING', 'FILTER'], answerIndex: 1, explanation: 'HAVING s’applique aux groupes, après l’agrégation ; WHERE s’applique aux lignes, avant.' }),
    fillBlank({ id: 'data-q-pandas-1', domainId: D, courseId: 'data-python', lessonId: 'data-l-pandas', topic: 'Pandas', prompt: 'Quelle méthode affiche les types de colonnes et les valeurs manquantes d’un DataFrame ?', answer: 'info', accepted: ['info', 'df.info', 'info()', 'df.info()'], explanation: '`df.info()` résumé types, nombre de valeurs non nulles et mémoire utilisée.' }),
    mcq({ id: 'data-q-stats-1', domainId: D, courseId: 'data-python', lessonId: 'data-l-stats', topic: 'Statistiques', prompt: 'Quelle mesure résiste le mieux aux valeurs extrêmes ?', options: ['La moyenne', 'La médiane', "L’écart-type"], answerIndex: 1, explanation: 'La médiane ne dépend que du rang des valeurs, pas de leur amplitude.' }),
  ],
  flashcards: [
    { id: 'data-fc-join', courseId: 'data-sql', front: 'INNER JOIN vs LEFT JOIN', back: 'INNER : uniquement les correspondances. LEFT : toutes les lignes de gauche, NULL à droite si absentes.', tags: ['sql'] },
    { id: 'data-fc-having', courseId: 'data-sql', front: 'WHERE ou HAVING ?', back: 'WHERE filtre les lignes avant le GROUP BY, HAVING filtre les groupes après.', tags: ['sql'] },
    { id: 'data-fc-mediane', courseId: 'data-python', front: 'Moyenne ou médiane ?', back: 'Médiane dès que la distribution est asymétrique ou contient des valeurs extrêmes.', tags: ['stats'] },
    { id: 'data-fc-dataframe', courseId: 'data-python', front: 'DataFrame', back: 'Tableau 2D étiqueté de pandas : colonnes typées et index de lignes.', tags: ['pandas'] },
  ],
};
