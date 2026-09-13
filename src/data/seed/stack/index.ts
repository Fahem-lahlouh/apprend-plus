import type { DomainSpec } from '../builders';
import { D, STACK_PATHS } from './shared';
import { javaAvanceCourse } from './java-avance';
import { springCourse } from './spring';
import { apiCourse } from './api';
import { messagingCourse } from './messaging';
import { cacheCourse } from './cache';
import { devopsCourse } from './devops';
import { observabiliteCourse } from './observabilite';
import { performanceCourse } from './performance';
import { architectureCourse } from './architecture';
import { entretienCourse, stackEntretienQuestions } from './entretien';
import { stackQuestions } from './questions';

/**
 * Parcours technique : l'écosystème autour du langage.
 *
 * Ce domaine complète `java` au lieu de le doubler. Le langage, la POO, les
 * collections de base et les streams restent là-bas ; ici on traite ce que le
 * langage ne dit pas — la machine qui l'exécute, le cadre applicatif, les
 * échanges entre services, le déploiement, l'exploitation et le diagnostic.
 *
 * Les prérequis traversent donc les deux domaines : une leçon d'ici peut exiger
 * une leçon de `java`, ce que le graphe résout puisqu'il se lit sur l'ensemble
 * des leçons et non par domaine.
 */
export const stackDomain: DomainSpec = {
  id: D,
  name: 'Parcours technique',
  description: 'Spring, API, messaging, conteneurs, observabilité, performance et entretien',
  icon: 'laptop',
  accent: 'blue',
  paths: STACK_PATHS,
  courses: [
    javaAvanceCourse,
    springCourse,
    apiCourse,
    messagingCourse,
    cacheCourse,
    devopsCourse,
    observabiliteCourse,
    performanceCourse,
    architectureCourse,
    entretienCourse,
  ],
  questions: [...stackQuestions, ...stackEntretienQuestions],
  flashcards: [],
};
