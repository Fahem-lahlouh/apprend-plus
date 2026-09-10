import type { QuizQuestion } from '@/models';
import { mcq, trueFalse } from '../builders';
import { D } from './shared';

const C4 = 'java-c4-api';
const C5 = 'java-c5-performance';

export const avanceQuestions: QuizQuestion[] = [
  /* -------------------------- Cours 4 : API -------------------------- */
  mcq({
    id: 'java-q-api-1',
    domainId: D, courseId: C4, lessonId: 'java-l-api',
    topic: 'API',
    prompt: 'Pourquoi une application mobile ne se connecte-t-elle pas directement à la base de données ?',
    options: [
      'Sécurité, règles métier centralisées et liberté de faire évoluer le serveur',
      'Parce que les bases de données n’acceptent pas les connexions mobiles',
      'Parce que le JSON est plus rapide que le SQL',
      'Parce que les téléphones n’ont pas assez de mémoire',
    ],
    answerIndex: 0,
    explanation:
      'Il faudrait distribuer les identifiants de la base sur des milliers de téléphones, réécrire les règles métier dans chaque client, et toute modification de schéma casserait les applications déjà installées.',
    tags: ['api'],
  }),
  mcq({
    id: 'java-q-rest-1',
    domainId: D, courseId: C4, lessonId: 'java-l-api-rest',
    topic: 'REST',
    prompt: 'Quelle méthode utiliser pour modifier uniquement l’email d’un utilisateur ?',
    options: [
      'PATCH /users/10',
      'PUT /users/10',
      'POST /updateUserEmail',
      'GET /users/10?email=nouveau',
    ],
    answerIndex: 0,
    explanation:
      'PUT remplace la ressource entière : les champs non transmis seraient effacés. PATCH n’applique que les champs fournis.',
    tags: ['rest'],
  }),
  trueFalse({
    id: 'java-q-rest-2',
    domainId: D, courseId: C4, lessonId: 'java-l-api-rest',
    topic: 'REST',
    prompt: 'POST est idempotent : l’envoyer deux fois produit le même résultat qu’une fois.',
    answer: false,
    explanation:
      'POST crée une ressource : deux envois en créent deux. C’est pour cela qu’un double clic peut produire deux commandes. PUT et DELETE, eux, sont idempotents.',
    tags: ['rest'],
  }),
  mcq({
    id: 'java-q-http-1',
    domainId: D, courseId: C4, lessonId: 'java-l-codes-http',
    topic: 'HTTP',
    prompt: 'Quelle est la différence entre 401 et 403 ?',
    options: [
      '401 = je ne sais pas qui tu es ; 403 = je le sais, et tu n’as pas le droit',
      '401 = interdit définitivement ; 403 = réessaye plus tard',
      'Aucune, ce sont des synonymes',
      '401 concerne le serveur, 403 le client',
    ],
    answerIndex: 0,
    explanation:
      'Les réactions attendues sont opposées : sur 401 le client se reconnecte ou rafraîchit son jeton, sur 403 se reconnecter ne changera rien. Confondre les deux envoie l’utilisateur en boucle sur l’écran de connexion.',
    tags: ['http'],
  }),
  mcq({
    id: 'java-q-http-2',
    domainId: D, courseId: C4, lessonId: 'java-l-codes-http',
    topic: 'HTTP',
    prompt: 'Que renvoyer après un POST ayant créé une ressource ?',
    options: [
      '201 Created, avec un en-tête Location vers la nouvelle ressource',
      '200 OK avec le corps vide',
      '204 No Content',
      '202 Accepted systématiquement',
    ],
    answerIndex: 0,
    explanation:
      '201 dit précisément ce qui s’est passé et indique où trouver la ressource créée. 204 est réservé au succès sans corps, typiquement après un DELETE.',
    tags: ['http'],
  }),
  mcq({
    id: 'java-q-choix-api-1',
    domainId: D, courseId: C4, lessonId: 'java-l-meilleure-api',
    topic: 'API',
    prompt: 'Quelle technologie pour des notifications instantanées poussées vers le navigateur ?',
    options: ['WebSocket', 'REST', 'gRPC', 'GraphQL'],
    answerIndex: 0,
    explanation:
      'WebSocket maintient une connexion ouverte dans les deux sens. REST oblige le client à demander sans arrêt s’il y a du nouveau, ce qui est coûteux et toujours en retard.',
    tags: ['api', 'architecture'],
  }),
  mcq({
    id: 'java-q-extension-1',
    domainId: D, courseId: C4, lessonId: 'java-l-extension-api',
    topic: 'API',
    prompt: 'Que faut-il demander quand quelqu’un parle d’« extension d’API » ?',
    options: [
      'Sur quelle plateforme, car le terme n’a pas de sens standard en Java',
      'Quelle version de Java est utilisée',
      'Si l’API est en REST ou en SOAP',
      'Rien, le terme est parfaitement défini',
    ],
    answerIndex: 0,
    explanation:
      'Le mot peut désigner une REST API Extension Bonita, un plugin de passerelle, un module de CMS ou simplement de nouveaux endpoints. Les contraintes n’ont rien à voir d’un cas à l’autre.',
    tags: ['api', 'extension'],
  }),
  mcq({
    id: 'java-q-architecture-1',
    domainId: D, courseId: C4, lessonId: 'java-l-architecture-api',
    topic: 'architecture',
    prompt: 'Où placer la règle « on ne commande pas plus que le stock disponible » ?',
    options: [
      'Dans le service, pour qu’elle s’applique à tous les points d’entrée',
      'Dans le controller, au plus près de la requête',
      'Dans le repository, au plus près des données',
      'Dans le DTO, à la validation',
    ],
    answerIndex: 0,
    explanation:
      'Placée dans le controller, la règle serait contournée par un import de fichier ou un message asynchrone, et intestable sans serveur HTTP. Dans le service, elle vaut pour tous les appelants.',
    tags: ['architecture'],
  }),
  mcq({
    id: 'java-q-dto-1',
    domainId: D, courseId: C4, lessonId: 'java-l-dto',
    topic: 'DTO',
    prompt: 'Pourquoi ne pas renvoyer directement une entité JPA depuis un controller ?',
    options: [
      'Fuite de champs sensibles, requêtes N+1 déclenchées par le sérialiseur, et contrat lié au schéma',
      'Parce que JPA interdit la sérialisation',
      'Parce qu’une entité ne peut pas être convertie en JSON',
      'Parce que c’est plus lent à écrire',
    ],
    answerIndex: 0,
    explanation:
      'Le sérialiseur parcourt les relations et déclenche des chargements paresseux non demandés ; et tout champ ajouté demain à l’entité fuiterait sans que personne ne le remarque.',
    tags: ['dto'],
  }),
  trueFalse({
    id: 'java-q-dto-2',
    domainId: D, courseId: C4, lessonId: 'java-l-dto',
    topic: 'DTO',
    prompt: 'Il est souvent justifié d’avoir un DTO différent en entrée et en sortie d’un endpoint.',
    answer: true,
    explanation:
      'En création le client envoie un mot de passe sans identifiant ; en lecture l’API renvoie un identifiant sans mot de passe. Un DTO unique forcerait à rendre tous les champs facultatifs.',
    tags: ['dto'],
  }),
  mcq({
    id: 'java-q-perf-api-1',
    domainId: D, courseId: C4, lessonId: 'java-l-api-performante',
    topic: 'performance',
    prompt: 'Quelle est la première chose à faire face à une API lente ?',
    options: [
      'Mesurer, pour savoir où le temps passe réellement',
      'Ajouter un cache sur les endpoints les plus appelés',
      'Augmenter la mémoire de la JVM',
      'Passer en microservices',
    ],
    answerIndex: 0,
    explanation:
      'Sans mesure, on optimise ce qu’on comprend le mieux, pas ce qui coûte le plus cher. Une journée sur une boucle à 30 ms pendant qu’une requête SQL en consomme 8 000.',
    tags: ['performance'],
  }),
  mcq({
    id: 'java-q-diagnostic-1',
    domainId: D, courseId: C4, lessonId: 'java-l-api-lente',
    topic: 'diagnostic',
    prompt: 'Temps total 10 s : SQL 8,5 s, Java 500 ms, appel externe 300 ms. Où chercher ?',
    options: [
      'Dans le SQL, qui représente 85 % du temps',
      'Dans le code Java, plus facile à modifier',
      'Dans l’appel externe',
      'Partout à la fois, pour aller plus vite',
    ],
    answerIndex: 0,
    explanation:
      'Optimiser parfaitement le Java ferait passer de 10 s à 9,5 s. On corrige le goulot d’étranglement, c’est-à-dire la plus grosse part du temps, et rien d’autre.',
    tags: ['performance', 'diagnostic'],
  }),
  mcq({
    id: 'java-q-diagnostic-2',
    domainId: D, courseId: C4, lessonId: 'java-l-api-lente',
    topic: 'diagnostic',
    prompt: 'Temps total 7 s : 240 requêtes SQL de 25 ms chacune. Quel diagnostic ?',
    options: [
      'Un problème N+1 : aucune requête n’est lente, c’est leur nombre qui coûte',
      'Un index manquant sur la table principale',
      'Une pause du ramasse-miettes',
      'Un pool de connexions trop grand',
    ],
    answerIndex: 0,
    explanation:
      'Un nombre de requêtes proportionnel au nombre de lignes affichées est la signature du N+1. La base signale des requêtes rapides, et pourtant l’API rampe.',
    tags: ['performance', 'N+1'],
  }),

  /* --------------------- Cours 5 : performance ----------------------- */
  mcq({
    id: 'java-q-optim-1',
    domainId: D, courseId: C5, lessonId: 'java-l-optimisation-java',
    topic: 'performance',
    prompt: 'Pourquoi repository.findAllById(ids) bat-il une boucle de findById(id) ?',
    options: [
      'Parce qu’un seul aller-retour réseau remplace N allers-retours, chacun payant sa latence',
      'Parce que findAllById utilise un index et findById non',
      'Parce que la boucle crée trop d’objets Java',
      'Parce que findById n’est pas transactionnel',
    ],
    answerIndex: 0,
    explanation:
      'Chaque appel paie un coût fixe indépendant du volume. 500 appels à 2 ms font une seconde de pure latence ; une requête ramenant 500 lignes coûte à peine plus qu’une en ramenant une.',
    tags: ['performance'],
  }),
  mcq({
    id: 'java-q-complexite-1',
    domainId: D, courseId: C5, lessonId: 'java-l-complexite',
    topic: 'complexité',
    prompt: 'Quelle est la complexité de map.get(cle) sur une HashMap ?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    answerIndex: 0,
    explanation:
      'La map calcule le hachage de la clé, en déduit le casier, et n’examine que celui-ci. Le nombre total d’entrées n’intervient pas : dix ou un million, le travail est le même.',
    tags: ['complexité'],
  }),
  mcq({
    id: 'java-q-complexite-2',
    domainId: D, courseId: C5, lessonId: 'java-l-complexite',
    topic: 'complexité',
    prompt: 'Combien d’opérations pour un algorithme en O(n²) sur 10 000 éléments, contre 1 000 ?',
    options: [
      'Cent fois plus : on passe d’un million à cent millions',
      'Dix fois plus',
      'Deux fois plus',
      'Le même nombre',
    ],
    answerIndex: 0,
    explanation:
      'Multiplier les données par dix multiplie le coût par cent en O(n²). C’est pour cela qu’un traitement correct en recette s’effondre en production.',
    tags: ['complexité'],
  }),
  mcq({
    id: 'java-q-memoire-1',
    domainId: D, courseId: C5, lessonId: 'java-l-memoire-jvm',
    topic: 'JVM',
    prompt: 'Pourquoi une application Java est-elle plus lente à ses premières requêtes ?',
    options: [
      'La JVM interprète d’abord le bytecode ; le JIT ne compile en natif qu’après plusieurs exécutions',
      'Parce que le ramasse-miettes tourne en permanence au démarrage',
      'Parce que la base de données est froide',
      'Parce que le tas est vide',
    ],
    answerIndex: 0,
    explanation:
      'C’est le temps de chauffe. Le chargement paresseux des classes y contribue aussi. Une mesure de performance faite sur les dix premières requêtes ne veut donc rien dire.',
    tags: ['jvm', 'jit'],
  }),
  mcq({
    id: 'java-q-index-1',
    domainId: D, courseId: C5, lessonId: 'java-l-index-sql',
    topic: 'index',
    prompt: 'Pourquoi WHERE UPPER(nom) = \'DUPONT\' n’utilise-t-il pas l’index sur nom ?',
    options: [
      'Parce que l’index contient les valeurs brutes, pas leur transformation',
      'Parce que UPPER est une fonction dépréciée',
      'Parce que les index ne fonctionnent pas sur du texte',
      'Parce qu’il manque un ORDER BY',
    ],
    answerIndex: 0,
    explanation:
      'La base devrait appliquer UPPER à chaque ligne pour comparer, donc les lire toutes. Il faut soit comparer sans transformer, soit créer un index sur l’expression.',
    tags: ['sql', 'index'],
  }),
  mcq({
    id: 'java-q-nplus1-1',
    domainId: D, courseId: C5, lessonId: 'java-l-n-plus-1',
    topic: 'N+1',
    prompt: 'Combien de requêtes pour afficher 100 commandes avec le nom de leur client, en N+1 ?',
    options: ['101', '100', '2', '1'],
    answerIndex: 0,
    explanation:
      'Une requête pour les 100 commandes, puis une par commande pour son client : 101 au total. D’où le nom du problème.',
    tags: ['N+1', 'sql'],
  }),
  mcq({
    id: 'java-q-nplus1-2',
    domainId: D, courseId: C5, lessonId: 'java-l-n-plus-1',
    topic: 'N+1',
    prompt: 'Quelle solution charge la relation dans la même requête ?',
    options: ['JOIN FETCH', 'Un index supplémentaire', 'Un cache de second niveau', 'Augmenter le pool de connexions'],
    answerIndex: 0,
    explanation:
      'JOIN FETCH ramène commandes et clients d’un coup. EntityGraph et la projection DTO répondent au même besoin sous d’autres formes.',
    tags: ['N+1'],
  }),
  mcq({
    id: 'java-q-cache-1',
    domainId: D, courseId: C5, lessonId: 'java-l-cache',
    topic: 'cache',
    prompt: 'Quelle est la vraie difficulté d’un cache ?',
    options: [
      'L’invalider au bon moment, pour ne pas servir de données périmées',
      'Le remplir suffisamment vite',
      'Choisir la bonne bibliothèque',
      'Le rendre compatible avec JSON',
    ],
    answerIndex: 0,
    explanation:
      'Remplir un cache est trivial. Le vider quand la donnée change ne l’est pas : sans invalidation, l’API renvoie l’ancien nom pendant une heure alors que la base est à jour.',
    tags: ['cache'],
  }),
  mcq({
    id: 'java-q-cache-2',
    domainId: D, courseId: C5, lessonId: 'java-l-cache',
    topic: 'cache',
    prompt: 'Quel est le risque de sécurité classique d’un cache ?',
    options: [
      'Une clé qui n’inclut pas l’identité de l’utilisateur : le second reçoit les données du premier',
      'Le cache est stocké en clair sur le disque',
      'Le cache empêche le chiffrement HTTPS',
      'Le cache expose les identifiants de la base',
    ],
    answerIndex: 0,
    explanation:
      'Toute donnée dépendant de l’utilisateur doit inclure son identité dans la clé de cache, sinon la réponse personnalisée fuite vers un autre utilisateur.',
    tags: ['cache', 'sécurité'],
  }),
  mcq({
    id: 'java-q-pagination-1',
    domainId: D, courseId: C5, lessonId: 'java-l-pagination',
    topic: 'pagination',
    prompt: 'Pourquoi la pagination par OFFSET devient-elle lente sur les pages lointaines ?',
    options: [
      'Parce que la base doit parcourir puis jeter toutes les lignes précédentes',
      'Parce que le JSON devient plus gros',
      'Parce que l’index cesse de fonctionner au-delà de 1 000 lignes',
      'Parce que le tri est recalculé à chaque page',
    ],
    answerIndex: 0,
    explanation:
      'Demander la page 50 000 revient à lire un million de lignes pour en renvoyer vingt. La pagination par curseur — « après cet identifiant » — évite ce parcours.',
    tags: ['pagination'],
  }),
  mcq({
    id: 'java-q-logs-1',
    domainId: D, courseId: C5, lessonId: 'java-l-logs-monitoring',
    topic: 'logs',
    prompt: 'Pourquoi la moyenne des temps de réponse est-elle trompeuse ?',
    options: [
      'Elle dilue les cas graves : 95 requêtes à 50 ms et 5 à 10 s donnent 550 ms, un chiffre que personne ne vit',
      'Parce qu’elle est calculée sur trop peu de requêtes',
      'Parce qu’elle ignore les erreurs 500',
      'Parce qu’elle dépend du fuseau horaire',
    ],
    answerIndex: 0,
    explanation:
      'Le p99 dit que 1 % des utilisateurs attendent 10 secondes — l’information utile. C’est sur les percentiles qu’on alerte, pas sur la moyenne.',
    tags: ['monitoring'],
  }),
  mcq({
    id: 'java-q-securite-1',
    domainId: D, courseId: C5, lessonId: 'java-l-securite',
    topic: 'sécurité',
    prompt: 'Pourquoi une requête paramétrée protège-t-elle de l’injection SQL ?',
    options: [
      'Parce que la structure de la requête est fixée avant l’arrivée de la valeur, qui ne peut plus la modifier',
      'Parce qu’elle échappe automatiquement les apostrophes',
      'Parce qu’elle chiffre la valeur envoyée',
      'Parce qu’elle limite la longueur de la saisie',
    ],
    answerIndex: 0,
    explanation:
      'La base analyse la requête et fixe son plan, puis reçoit la valeur séparément : elle ne l’interprétera jamais comme du SQL. L’échappement manuel, lui, suppose qu’on a pensé à tous les cas.',
    tags: ['sécurité'],
  }),
  mcq({
    id: 'java-q-securite-2',
    domainId: D, courseId: C5, lessonId: 'java-l-securite',
    topic: 'sécurité',
    prompt: 'Un utilisateur connecté demande GET /factures/9981, qui ne lui appartient pas. Que renvoyer ?',
    options: [
      '404, pour ne pas divulguer que cette facture existe',
      '403, plus honnête',
      '200 avec un corps vide',
      '401, pour le forcer à se reconnecter',
    ],
    answerIndex: 0,
    explanation:
      'Répondre 403 confirme l’existence de la ressource et permet de cartographier les identifiants valides. 404 ne divulgue rien. Dans tous les cas, le contrôle doit porter sur la ressource, pas seulement sur l’endpoint.',
    tags: ['sécurité'],
  }),
  mcq({
    id: 'java-q-tests-1',
    domainId: D, courseId: C5, lessonId: 'java-l-tests',
    topic: 'tests',
    prompt: 'Faut-il viser 100 % de couverture de code ?',
    options: [
      'Non : la couverture mesure les lignes exécutées, pas les comportements vérifiés',
      'Oui, c’est le seul indicateur fiable de qualité',
      'Oui, en dessous de 100 % le code n’est pas testé',
      'Non, il ne faut jamais mesurer la couverture',
    ],
    answerIndex: 0,
    explanation:
      'Un test sans assertion couvre parfaitement du code sans rien garantir. Mieux vaut couvrir sérieusement les règles métier et les cas limites qu’atteindre un chiffre en testant des accesseurs.',
    tags: ['tests'],
  }),
  mcq({
    id: 'java-q-pratiques-1',
    domainId: D, courseId: C5, lessonId: 'java-l-bonnes-pratiques',
    topic: 'clean code',
    prompt: 'Que doit expliquer un commentaire ?',
    options: [
      'Le pourquoi : une contrainte cachée, une raison non évidente',
      'Le quoi : ce que fait chaque ligne',
      'L’auteur et la date de modification',
      'La liste des méthodes appelées',
    ],
    answerIndex: 0,
    explanation:
      'Le code dit déjà ce qu’il fait, et un commentaire qui le répète se désynchronise à la première modification. Ce que le code ne peut pas dire, c’est pourquoi il a fallu faire ainsi.',
    tags: ['clean code'],
  }),
];
