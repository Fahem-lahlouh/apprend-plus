import type { DomainSpec } from '../builders';
import { D, JAVA_PATHS } from './shared';
import { debutantCourse } from './debutant';
import { objetCourse } from './objet';
import { moderneCourse } from './moderne';
import { apiCourse } from './api';
import { performanceCourse } from './performance';
import { debutantQuestions } from './questions-debutant';
import { objetQuestions } from './questions-objet';
import { moderneQuestions } from './questions-moderne';
import { avanceQuestions } from './questions-avance';
import { entretienQuestions } from './entretien';
import { javaFlashcards } from './flashcards';

/**
 * Parcours Java complet, en cinq étapes ordonnées.
 *
 * L'ordre des cours est l'ordre pédagogique : chaque cours suppose acquis le
 * précédent, et chaque leçon déclare ses prérequis exacts par `requires`.
 * Les définitions vivent dans les leçons qui les introduisent ; le builder les
 * matérialise, et le moteur de mémorisation les joue sans aucune configuration.
 */
export const javaDomain: DomainSpec = {
  id: D,
  name: 'Java',
  description: 'Du premier programme au diagnostic d’une API lente',
  icon: 'code',
  accent: 'violet',
  paths: JAVA_PATHS,
  courses: [debutantCourse, objetCourse, moderneCourse, apiCourse, performanceCourse],
  questions: [
    ...debutantQuestions,
    ...objetQuestions,
    ...moderneQuestions,
    ...avanceQuestions,
    ...entretienQuestions,
  ],
  flashcards: javaFlashcards,
};
