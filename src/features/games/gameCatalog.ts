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
    id: 'défi',
    title: 'Défi rapide',
    short: '3 minutes pour progresser',
    description: 'Enchaîne un maximum de bonnes réponses avant la fin du chronomètre.',
    icon: 'bolt',
    accent: 'amber',
    to: '/games/defi',
  },
];
