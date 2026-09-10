# Apprend+

Plateforme personnelle d'apprentissage, installable comme PWA sur iPhone.
Informatique, langues, data, culture générale : la structure n'est figée sur
aucun domaine, tout se crée depuis l'application.

Tout est local : IndexedDB via Dexie, aucun compte, aucun serveur, aucune donnée
envoyée nulle part.

## Stack

React 18 · TypeScript · Vite · vite-plugin-pwa (Workbox) · Dexie/IndexedDB ·
CodeMirror 6 · Vitest. Design system maison, sans framework CSS.

## Architecture

```
src/
├── app/            shell, routes, navigation
├── components/     composants transverses
├── design-system/  tokens, styles globaux, composants UI
├── features/       un dossier par écran/fonctionnalité
├── models/         types du domaine (aucune dépendance)
├── repositories/   accès IndexedDB (Dexie), sans règle métier
├── services/       règles métier : progression, SRS, XP, analytics…
├── hooks/          liaison React ↔ services
├── utils/          fonctions pures (dates, texte, tableaux)
└── data/seed/      contenu livré avec l'application
```

Le sens de dépendance est strict :

```
UI (features) → hooks → services → repositories → IndexedDB
```

Aucun composant n'écrit directement dans la base : toute écriture croisée passe
par `services/learningService.ts`. Les moteurs (`spacedRepetition`, `streak`,
`progression`, `analytics`, `recommendation`, `gamification`, `reminders`) sont
des fonctions pures, donc testables sans navigateur.

## Ce qui est réellement calculé

Aucune valeur affichée n'est codée en dur :

- **Progression** d'un domaine, d'un cours ou d'un chapitre = leçons terminées / leçons totales.
- **Objectif du jour** = somme des sessions réelles, mesurées quand l'écran est visible.
- **Série** = jours consécutifs où l'objectif a été atteint, recalculée depuis l'historique.
- **XP et niveaux** = règles explicites (`services/gamification.ts`), niveaux quadratiques.
- **Points faibles** = taux de réussite par notion, à partir des vraies tentatives de quiz.
- **Révisions** = algorithme de répétition espacée dérivé de SM-2.

## Mémorisation : un moteur, pas des exercices écrits à la main

Tu écris une définition (titre + texte), tu enregistres, et elle devient
immédiatement un parcours de mémorisation. Aucun exercice n'est à configurer.

```
Définition enregistrée
        ↓  (à chaque partie, jamais stocké)
analyzeDefinition(text)   phrases · mots porteurs de sens · expressions
        ↓
MemorizationEngine.generateExercise(definition, { kind, level, weakness })
        ↓
un exercice, dans l'une des six formes d'interaction
```

**La règle d'architecture qui compte.** L'analyse n'est *jamais* persistée : elle
est recalculée depuis `Definition.text`. Un nouveau jeu ajouté dans six mois est
donc une entrée de plus dans `GAME_REGISTRY` — les cent définitions déjà
enregistrées le proposent à la seconde suivante, sans migration, sans retoucher
une seule ligne de contenu.

**Rien n'est écrit pour un domaine.** Le découpage, le repérage des mots
importants (rareté, casse, longueur) et la construction des distracteurs sont
purement structurels. Java, Docker, le present perfect ou la grammaire française
passent par le même code — c'est vérifié par les tests.

Quinze jeux dans le registre : définition à trous progressive, choix de mots,
trous sans choix, remise en ordre des mots, remise en ordre des morceaux, phrase
cachée, continuer une phrase, mot déclencheur, question → réponse, vrai/faux,
trouver l'erreur, choisir la bonne formulation, reconstruction complète, dictée,
et mot manquant chronométré. Ils tiennent en six formes d'interaction, donc un
jeu supplémentaire n'a le plus souvent aucun composant à écrire.

**Difficulté et erreurs.** Le niveau va de 1 à 20 : quelques mots masqués au
début, des groupes vers 10, des morceaux de phrase vers 15, une reconstruction
quasi complète à 20. Trois bonnes réponses d'affilée font monter, une erreur fait
redescendre. Les trous sont tirés au sort à chaque session — la position n'est
donc jamais mémorisable — mais pondérés par le taux d'erreur passé sur chaque
mot : ce qui bloque revient plus souvent.

**Mot manquant chronométré.** Quatre paliers (10 s avec choix → 3 s sans aide sur
des expressions entières), cinq modes (sprint 1 min, sprint 3 min, 10 questions,
20 questions, infini), un mot raté qui revient plus tard dans la même session, et
un classement personnel : record du jour, meilleur score, meilleure série,
meilleur temps.

## Limites assumées

Trois points où le web mobile ne permet pas de tenir une promesse, et où
l'application le dit au lieu de simuler :

- **Exécution de Java.** Le navigateur n'a pas de JVM. `CodeExecutionService`
  expose plusieurs stratégies : JavaScript s'exécute réellement en local dans un
  Web Worker isolé ; Java et Python passent par une instance Piston (open source,
  gratuite, sans clé d'API) et nécessitent donc le réseau. SQL n'est pas exécuté :
  l'éditeur sert à s'entraîner à écrire la requête.
- **Notifications iPhone.** L'API `Notification` n'existe sur iOS que dans une PWA
  ajoutée à l'écran d'accueil (iOS 16.4+) et après autorisation explicite. Sans
  serveur de push, une notification ne part que si l'application est ouverte ou
  récemment active. L'écran Rappels décrit l'état réel ; les rappels restent
  toujours visibles dans l'application.
- **Navigateur intégré.** Les sites de documentation envoient `X-Frame-Options`
  ou une CSP `frame-ancestors` qui interdit l'iframe. Les ressources s'ouvrent
  donc dans un onglet Safari.

La prononciation utilise `SpeechSynthesis` pour l'écoute. Aucune note de
prononciation n'est calculée : la reconnaissance vocale de Safari iOS n'est pas
assez fiable pour produire un score honnête.

## Développement

```bash
npm install
npm run dev      # serveur local
npm run lint
npm test
npm run build    # APP_BASE_PATH=/mon-repo/ npm run build pour GitHub Pages
```

## Déploiement

`.github/workflows/pwa-deploy.yml` lint, teste, build et publie sur GitHub Pages
à chaque push sur `master`. Le chemin de base est dérivé du nom du dépôt
(`APP_BASE_PATH`), rien n'est codé en dur. Le routage utilise un `HashRouter`,
donc les liens profonds fonctionnent sans règle de réécriture côté serveur.

Activer une fois : **Settings → Pages → Source: GitHub Actions**.

## Installation sur iPhone

Safari → Partager → « Sur l'écran d'accueil » → Apprend+.
L'application s'ouvre alors en plein écran, fonctionne hors ligne et peut
demander l'autorisation des notifications.

## Sauvegarde

Profil → Sauvegarde et données : export JSON complet, import en mode fusion ou
remplacement. Aucune action destructive ne se fait en un seul geste : chaque
suppression demande une confirmation explicite.
