import type { CourseSpec } from '../builders';

export const D = 'java';

/** Les cinq étapes du parcours, dans l'ordre où elles doivent être suivies. */
export const JAVA_PATHS = [
  { id: 'java-path-debutant', title: '1. Débutant', description: 'Du premier programme aux méthodes : la syntaxe et rien d’autre.' },
  { id: 'java-path-objet', title: '2. Objet', description: 'Classes, objets, héritage, polymorphisme, interfaces.' },
  { id: 'java-path-moderne', title: '3. Intermédiaire', description: 'Collections, exceptions, generics, lambdas, streams, Java moderne.' },
  { id: 'java-path-api', title: '4. API et architecture', description: 'Ce qu’est une API, REST, les couches, les extensions.' },
  { id: 'java-path-performance', title: '5. Performance et qualité', description: 'Mesurer, optimiser, sécuriser, tester.' },
];

export type JavaCourse = CourseSpec;
