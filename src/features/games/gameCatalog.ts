import type { IconName } from '@/design-system/Icon';
import type { AccentKey } from '@/models';

export interface GameEntry {
  id: string;
  title: string;
  short: string;
  description: string;
  icon: IconName;
  accent: AccentKey;
  to: string;
}

export const GAMES: GameEntry[] = [
  {
    id: 'quiz',
    title: 'Quiz',
    short: 'Teste tes connaissances',
    description: 'QCM, vrai/faux, texte a compléter, sortie de code et chasse au bug, avec explication à chaque réponse.',
    icon: 'trophy',
    accent: 'violet',
    to: '/games/quiz',
  },
  {
    id: 'memory',
    title: 'Mémoire',
    short: 'Retrouve les paires',
    description: 'Associe chaque terme à sa définition en retournant les cartes.',
    icon: 'brain',
    accent: 'pink',
    to: '/games/memory',
  },
  {
    id: 'flashcards',
    title: 'Flashcards',
    short: 'Révise rapidement',
    description: 'Révision espacée : chaque carte revient au moment ou tu risques de l’oublier.',
    icon: 'cards',
    accent: 'green',
    to: '/flashcards',
  },
  {
    id: 'entretien',
    title: 'Mode entretien',
    short: 'Explique avec tes mots',
    description:
      'Questions ouvertes posées en entretien technique. Tu formules ta réponse, tu la compares au modèle, tu t’auto-évalues.',
    icon: 'chat',
    accent: 'blue',
    to: '/games/entretien',
  },
  {
    id: 'code',
    title: 'Que fait ce code ?',
    short: 'Lis avant de répondre',
    description:
      'Un extrait, quatre réponses possibles. Sortie du programme, bug caché, comportement surprenant — avec l’explication à chaque fois.',
    icon: 'code',
    accent: 'violet',
    to: '/games/code',
  },
  {
    id: 'incident',
    title: 'Mode incident',
    short: 'Diagnostique comme en production',
    description:
      'Un symptôme réel, les informations révélées au fur et à mesure. Tu choisis par où commencer, la correction n’apparaît qu’après les hypothèses.',
    icon: 'bolt',
    accent: 'red',
    to: '/games/incident',
  },
  {
    id: 'timed',
    title: 'Mot manquant chronométré',
    short: 'Réponds avant la fin du temps',
    description:
      'Le mot manquant d’une de tes définitions, à retrouver avant la fin du chronomètre. La difficulté suit ta vitesse.',
    icon: 'clock',
    accent: 'teal',
    to: '/games/timed',
  },
  {
    id: 'défi',
    title: 'Défi rapide',
    short: '3 minutes pour progresser',
    description: 'Enchaîne un maximum de bonnes réponses avant la fin du chronomètre.',
    icon: 'bolt',
    accent: 'amber',
    to: '/games/defi',
  },
];
