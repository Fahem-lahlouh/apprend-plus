export const D = 'stack';

/**
 * Les dix familles du parcours technique, dans l'ordre où elles s'appuient les
 * unes sur les autres.
 *
 * Ce ne sont pas des étiquettes de rangement : un cours placé ici suppose acquis
 * ce qui précède. « Messaging » vient après « API » parce qu'on ne comprend le
 * choix de l'asynchrone qu'en ayant vu ce que coûte le synchrone ; « DevOps »
 * vient après « Spring » parce qu'on conteneurise une application, pas un vide.
 *
 * Le langage Java lui-même reste dans son propre domaine : ici on part de ce que
 * le langage ne dit pas, l'écosystème autour.
 */
export const STACK_PATHS = [
  {
    id: 'stack-path-java-avance',
    title: '1. Java avancé',
    description: 'Ce qui se passe sous le langage : bytecode, JVM, mémoire, egalité, collections en profondeur.',
  },
  {
    id: 'stack-path-ecosysteme',
    title: '2. Écosystème Java',
    description: 'Spring, Spring Boot, injection de dépendances, JPA et Hibernate.',
  },
  {
    id: 'stack-path-api',
    title: '3. API et intégration',
    description: 'REST en profondeur, codes HTTP, idempotence, SOAP et le choix entre les deux.',
  },
  {
    id: 'stack-path-messaging',
    title: '4. Messaging et asynchrone',
    description: 'Synchrone ou non, queue ou topic, JMS, TIBCO EMS, Kafka et leurs vraies différences.',
  },
  {
    id: 'stack-path-donnees',
    title: '5. Bases de données et cache',
    description: 'Redis, stratégies de cache, invalidation et les pièges qui vont avec.',
  },
  {
    id: 'stack-path-devops',
    title: '6. DevOps et conteneurs',
    description: 'Docker, Kubernetes, OpenShift, Jenkins : du code au pod qui tourne.',
  },
  {
    id: 'stack-path-observabilite',
    title: '7. Observabilité',
    description: 'Logs, métriques, traces : savoir ce que fait l’application en production.',
  },
  {
    id: 'stack-path-performance',
    title: '8. Performance et diagnostic',
    description: 'Une méthode pour trouver où passent les secondes, et des incidents à démonter.',
  },
  {
    id: 'stack-path-architecture',
    title: '9. Architecture',
    description: 'Le scénario complet, de l’utilisateur au pod, avec chaque maillon justifié.',
  },
  {
    id: 'stack-path-entretien',
    title: '10. Entretien technique',
    description: 'Tenir une discussion, pas réciter : réponse courte, développement, relances.',
  },
];
