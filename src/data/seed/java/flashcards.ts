import type { SeedFlashcard } from '../builders';

/** Cartes de révision rapide, complémentaires des définitions à mémoriser. */
export const javaFlashcards: SeedFlashcard[] = [
  { id: 'java-f-jvm', front: 'JVM', back: 'Java Virtual Machine : exécute le bytecode. C’est elle qui rend Java portable.', courseId: 'java-c1-debutant', tags: ['java'] },
  { id: 'java-f-jdk', front: 'JDK', back: 'Java Development Kit : le JRE plus les outils, dont javac. Nécessaire pour compiler.', courseId: 'java-c1-debutant', tags: ['java'] },
  { id: 'java-f-bytecode', front: 'Bytecode', back: 'Format intermédiaire du fichier .class : ni source lisible, ni code machine.', courseId: 'java-c1-debutant', tags: ['java'] },
  { id: 'java-f-final', front: 'final sur une variable', back: 'Interdit toute réaffectation. Sur une référence, fige la référence, pas l’objet pointé.', courseId: 'java-c1-debutant', tags: ['java'] },
  { id: 'java-f-string', front: 'Pourquoi String est immuable ?', back: 'Sécurité, partage sans risque entre plusieurs endroits, et usage sûr depuis plusieurs threads.', courseId: 'java-c1-debutant', tags: ['java'] },
  { id: 'java-f-this', front: 'this.nom = nom;', back: 'À gauche l’attribut de l’objet, à droite le paramètre qui le masque dans le constructeur.', courseId: 'java-c2-objet', tags: ['poo'] },
  { id: 'java-f-override', front: '@Override', back: 'Fait vérifier par le compilateur qu’on redéfinit bien une méthode existante.', courseId: 'java-c2-objet', tags: ['poo'] },
  { id: 'java-f-dispatch', front: 'Dispatch dynamique', back: 'La méthode exécutée est choisie à l’exécution d’après le type réel de l’objet, pas le type déclaré.', courseId: 'java-c2-objet', tags: ['poo'] },
  { id: 'java-f-est-un', front: 'extends ou attribut ?', back: 'extends si « X est un Y ». Attribut si « X a un Y ».', courseId: 'java-c2-objet', tags: ['poo'] },
  { id: 'java-f-equals', front: 'equals sans hashCode', back: 'Deux objets égaux tombent dans des casiers différents : la HashMap ne les retrouve jamais.', courseId: 'java-c2-objet', tags: ['poo'] },
  { id: 'java-f-list-set-map', front: 'List, Set, Map', back: 'List : ordre et doublons. Set : unicité. Map : recherche par clé.', courseId: 'java-c3-moderne', tags: ['collections'] },
  { id: 'java-f-throw', front: 'throw ou throws ?', back: 'throw lance une exception. throws l’annonce dans la signature.', courseId: 'java-c3-moderne', tags: ['exceptions'] },
  { id: 'java-f-terminale', front: 'Opération terminale d’un stream', back: 'Celle qui déclenche le calcul : toList, count, findFirst. Avant elle, rien ne s’exécute.', courseId: 'java-c3-moderne', tags: ['streams'] },
  { id: 'java-f-var', front: 'Le mot-clé var', back: 'Arrivé en Java 10, pas en 11. Le type reste fixé à la compilation.', courseId: 'java-c3-moderne', tags: ['versions'] },
  { id: 'java-f-virtual', front: 'Threads virtuels', back: 'Java 21. Un thread bloqué en attente rend son thread système, qui sert une autre requête.', courseId: 'java-c3-moderne', tags: ['threads'] },
  { id: 'java-f-201', front: 'Code 201', back: 'Created : renvoyé après un POST, avec un en-tête Location vers la ressource créée.', courseId: 'java-c4-api', tags: ['api'] },
  { id: 'java-f-401-403', front: '401 ou 403 ?', back: '401 : je ne sais pas qui tu es. 403 : je le sais, tu n’as pas le droit.', courseId: 'java-c4-api', tags: ['api'] },
  { id: 'java-f-idempotent', front: 'Idempotent', back: 'Rejouer l’opération laisse le même état final. Vrai pour PUT et DELETE, faux pour POST.', courseId: 'java-c4-api', tags: ['api'] },
  { id: 'java-f-dto', front: 'DTO', back: 'Data Transfer Object : ne transporte que les champs voulus, et protège le contrat de l’API.', courseId: 'java-c4-api', tags: ['api'] },
  { id: 'java-f-nplus1', front: 'N+1', back: '1 requête pour la liste, puis 1 par élément. Le coût vient du nombre, pas de la lenteur.', courseId: 'java-c5-performance', tags: ['performance'] },
  { id: 'java-f-on2', front: 'O(n²) sur 10 000 éléments', back: 'Cent millions d’opérations. Multiplier les données par 10 multiplie le coût par 100.', courseId: 'java-c5-performance', tags: ['performance'] },
  { id: 'java-f-mesurer', front: 'Première étape face à une lenteur', back: 'Mesurer, et découper le temps par étape. Jamais supposer.', courseId: 'java-c5-performance', tags: ['performance'] },
  { id: 'java-f-p99', front: 'p99 plutôt que la moyenne', back: 'La moyenne dilue les cas graves. Le p99 dit ce que vit le centième d’utilisateurs le plus mal servi.', courseId: 'java-c5-performance', tags: ['monitoring'] },
  { id: 'java-f-prepared', front: 'Requête paramétrée', back: 'La structure est fixée avant l’arrivée de la valeur : celle-ci ne peut plus être interprétée comme du SQL.', courseId: 'java-c5-performance', tags: ['sécurité'] },
];
