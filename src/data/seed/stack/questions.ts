import type { QuizQuestion } from '@/models';
import { fillBlank, mcq, trueFalse } from '../builders';
import { D } from './shared';

const C_JAVA = 'stack-c-java-avance';
const C_SPRING = 'stack-c-spring';
const C_API = 'stack-c-api';
const C_MSG = 'stack-c-messaging';
const C_CACHE = 'stack-c-cache';
const C_DEVOPS = 'stack-c-devops';
const C_OBS = 'stack-c-observabilite';
const C_PERF = 'stack-c-performance';
const C_ARCHI = 'stack-c-architecture';
const C_ENTRETIEN = 'stack-c-entretien';

/**
 * Questions du parcours technique.
 *
 * Les questions de type `code_output` et `find_bug` alimentent aussi le jeu
 * « Que fait ce code ? », qui les sélectionne sur leur type : aucune n'a besoin
 * d'être déclarée ailleurs pour y apparaître.
 */
export const stackQuestions: QuizQuestion[] = [
  /* ------------------------------ Java avancé ----------------------------- */
  mcq({
    id: 'stack-q-bytecode-1',
    domainId: D,
    courseId: C_JAVA,
    lessonId: 'stack-l-bytecode',
    topic: 'JVM',
    prompt: 'Que produit `javac` à partir d’un fichier .java ?',
    options: [
      'Du bytecode dans un fichier .class',
      'Du code machine pour le processeur courant',
      'Un exécutable autonome',
      'Directement un fichier JAR',
    ],
    answerIndex: 0,
    explanation:
      '`javac` produit du bytecode, un format intermédiaire indépendant du processeur, stocké dans un .class. C’est la JVM qui le traduit ensuite pour la machine réelle — d’où la portabilité du même artefact compilé.',
  }),
  trueFalse({
    id: 'stack-q-jit-1',
    domainId: D,
    courseId: C_JAVA,
    lessonId: 'stack-l-jit',
    topic: 'JVM',
    prompt: 'La JVM compile tout le bytecode en code machine au démarrage de l’application.',
    answer: false,
    explanation:
      'Non : elle commence par interpréter, compte les invocations, et ne fait compiler par le JIT que les méthodes réellement sollicitées. C’est pourquoi une application est plus lente pendant ses premières secondes, et pourquoi un benchmark sans échauffement ne mesure que l’interpréteur.',
  }),
  mcq({
    id: 'stack-q-memoire-1',
    domainId: D,
    courseId: C_JAVA,
    lessonId: 'stack-l-heap-stack',
    topic: 'JVM',
    prompt: 'Où vit l’objet créé par `List<String> l = new ArrayList<>();` dans une méthode ?',
    options: [
      'L’objet est sur le tas, la référence `l` sur la pile',
      'L’objet et la référence sont tous deux sur la pile',
      'L’objet et la référence sont tous deux sur le tas',
      'L’objet est sur la pile, la référence sur le tas',
    ],
    answerIndex: 0,
    explanation:
      'Tous les objets vont sur le tas, partagé par les threads. La variable locale `l` ne contient qu’une référence, et vit dans le cadre d’appel sur la pile du thread — cadre qui disparaît au retour de la méthode.',
  }),
  mcq({
    id: 'stack-q-gc-1',
    domainId: D,
    courseId: C_JAVA,
    lessonId: 'stack-l-gc',
    topic: 'JVM',
    prompt: 'Pourquoi une fuite mémoire reste-t-elle possible malgré le ramasse-miettes ?',
    options: [
      'Parce qu’il libère ce qui est inatteignable, pas ce qui est inutile',
      'Parce qu’il ne s’exécute qu’au démarrage',
      'Parce qu’il ignore les objets créés dans les boucles',
      'Parce qu’il faut appeler `System.gc()` pour qu’il agisse',
    ],
    answerIndex: 0,
    explanation:
      'Le ramasse-miettes part des racines et conserve tout ce qu’il peut atteindre. Une entrée oubliée dans une Map statique reste parfaitement atteignable, donc conservée, même si plus aucun code ne s’en sert : c’est le scénario typique de la mémoire qui monte en escalier.',
  }),
  mcq({
    id: 'stack-q-equals-1',
    domainId: D,
    courseId: C_JAVA,
    lessonId: 'stack-l-equals-hashcode',
    topic: 'Collections',
    prompt: 'Une classe redéfinit `equals` mais pas `hashCode`. Que se passe-t-il avec un HashSet ?',
    options: [
      'L’ensemble peut contenir deux objets pourtant égaux',
      'Rien, `equals` suffit au HashSet',
      'La compilation échoue',
      'Le HashSet lève une exception à l’ajout',
    ],
    answerIndex: 0,
    explanation:
      '`hashCode` reste celui d’Object et dépend de l’instance : deux objets égaux tombent dans des compartiments différents et ne se rencontrent jamais. `contains` renvoie faux sur un objet présent, et l’ensemble accepte des doublons apparents.',
  }),
  trueFalse({
    id: 'stack-q-equals-2',
    domainId: D,
    courseId: C_JAVA,
    lessonId: 'stack-l-equals-hashcode',
    topic: 'Collections',
    prompt: 'Deux objets ayant le même hashCode sont forcément égaux.',
    answer: false,
    explanation:
      'L’implication ne vaut que dans un sens : deux objets égaux doivent avoir le même hachage, mais deux hachages identiques peuvent appartenir à des objets différents. C’est une collision, et la HashMap la gère en comparant avec `equals` les clés du même compartiment.',
  }),
  mcq({
    id: 'stack-q-dispatch-1',
    domainId: D,
    courseId: C_JAVA,
    lessonId: 'stack-l-reference-reel',
    topic: 'POO',
    prompt: 'Avec `Animal a = new Chien();`, quelle version de `crier()` s’exécute ?',
    code: 'class Animal { void crier() { System.out.println("..."); } }\nclass Chien extends Animal { @Override void crier() { System.out.println("Wouf"); } }\n\nAnimal a = new Chien();\na.crier();',
    language: 'java',
    type: 'code_output',
    options: ['Wouf', '...', 'Rien, le code ne compile pas', 'Une ClassCastException'],
    answerIndex: 0,
    explanation:
      'Le type de référence `Animal` décide de ce que le compilateur autorise ; le type réel `Chien` décide de ce qui s’exécute. C’est le dispatch dynamique : la méthode redéfinie est bien celle qui s’applique.',
  }),
  mcq({
    id: 'stack-q-list-1',
    domainId: D,
    courseId: C_JAVA,
    lessonId: 'stack-l-list-implementations',
    topic: 'Collections',
    prompt: 'Quel est le coût de `get(i)` sur une LinkedList ?',
    options: [
      'Linéaire : il faut parcourir depuis une extrémité',
      'Constant, comme sur une ArrayList',
      'Logarithmique',
      'Constant seulement si i est pair',
    ],
    answerIndex: 0,
    explanation:
      'Une LinkedList est une chaîne de maillons : atteindre l’indice i suppose de suivre i liens. C’est pourquoi la réputation de « meilleure pour les insertions » est trompeuse — `add(i, x)` doit d’abord parcourir jusqu’à i.',
  }),
  mcq({
    id: 'stack-q-set-1',
    domainId: D,
    courseId: C_JAVA,
    lessonId: 'stack-l-set-map',
    topic: 'Collections',
    prompt: 'Tu dois garder des éléments uniques tout en conservant l’ordre d’insertion. Quelle structure ?',
    options: ['LinkedHashSet', 'HashSet', 'TreeSet', 'ArrayList'],
    answerIndex: 0,
    explanation:
      'Le LinkedHashSet combine la table de hachage, qui assure l’unicité à coût constant, et une liste chaînée qui conserve l’ordre d’arrivée. HashSet ne garantit aucun ordre, TreeSet impose l’ordre de comparaison, et ArrayList n’assure pas l’unicité.',
  }),
  trueFalse({
    id: 'stack-q-map-1',
    domainId: D,
    courseId: C_JAVA,
    lessonId: 'stack-l-set-map',
    topic: 'Collections',
    prompt: 'Map hérite de l’interface Collection.',
    answer: false,
    explanation:
      'Map forme une hiérarchie distincte : une Collection manipule des éléments, une Map des couples clé-valeur, et `add(E)` n’y aurait aucun sens. Elle expose en revanche des vues qui sont, elles, des Collections : keySet, values et entrySet.',
  }),
  mcq({
    id: 'stack-q-exception-1',
    domainId: D,
    courseId: C_JAVA,
    lessonId: 'stack-l-hierarchie-exceptions',
    topic: 'Exceptions',
    prompt: 'Quelle est la différence entre `throw` et `throws` ?',
    options: [
      '`throw` lance une exception, `throws` la déclare dans la signature',
      'Ce sont deux écritures du même mot-clé',
      '`throw` est pour les checked, `throws` pour les unchecked',
      '`throws` lance, `throw` attrape',
    ],
    answerIndex: 0,
    explanation:
      '`throw` est une instruction, écrite dans le corps de la méthode, qui lance effectivement une exception maintenant. `throws` est une clause de signature qui annonce ce que la méthode peut laisser remonter à son appelant.',
  }),
  mcq({
    id: 'stack-q-exception-2',
    domainId: D,
    courseId: C_JAVA,
    lessonId: 'stack-l-hierarchie-exceptions',
    topic: 'Exceptions',
    prompt: 'Quel est le problème de ce code ?',
    code: 'try {\n    return service.charger(id);\n} catch (Exception e) {\n    return null;\n}',
    language: 'java',
    type: 'find_bug',
    options: [
      'Il attrape tout, perd la cause et renvoie null : l’erreur réapparaîtra plus loin en NPE',
      'Il manque un bloc finally',
      '`catch (Exception e)` ne compile pas',
      'Il faudrait attraper Throwable pour être complet',
    ],
    answerIndex: 0,
    explanation:
      'Attraper `Exception` capture aussi ce qu’on n’avait pas prévu. En renvoyant `null` sans journaliser ni conserver la cause, on supprime l’information et on déplace le problème : l’appelant récoltera une NullPointerException très loin de l’origine réelle.',
  }),
  mcq({
    id: 'stack-q-generics-1',
    domainId: D,
    courseId: C_JAVA,
    lessonId: 'stack-l-generics-wildcards',
    topic: 'Generics',
    prompt: 'Pourquoi `List<Animal> a = chiens;` est-il refusé, avec `List<Chien> chiens` ?',
    options: [
      'Parce qu’on pourrait alors ajouter un Chat dans ce qui est en réalité une liste de Chien',
      'Parce que Chien n’hérite pas d’Animal',
      'Parce qu’il faut utiliser un cast explicite',
      'Parce que les listes sont immuables',
    ],
    answerIndex: 0,
    explanation:
      'Les types paramétrés ne sont pas covariants, précisément pour empêcher ce scénario : si l’affectation était permise, `a.add(new Chat())` serait légal, et la lecture depuis `chiens` exploserait. On utilise `? extends Animal` pour lire sans pouvoir écrire.',
  }),
  mcq({
    id: 'stack-q-versions-1',
    domainId: D,
    courseId: C_JAVA,
    lessonId: 'stack-l-versions-java',
    topic: 'Versions Java',
    prompt: 'Quelle fonctionnalité est apparue en Java 21 ?',
    options: [
      'Les threads virtuels',
      'Les lambdas et les Streams',
      'Le client HTTP standard',
      'Les expressions switch',
    ],
    answerIndex: 0,
    explanation:
      'Les threads virtuels sont finalisés en Java 21. Les lambdas et Streams datent de Java 8, le client HTTP a été standardisé en 11, et les expressions switch ont été finalisées en 14 — disponibles donc bien avant 21.',
  }),

  /* --------------------------------- Spring -------------------------------- */
  mcq({
    id: 'stack-q-di-1',
    domainId: D,
    courseId: C_SPRING,
    lessonId: 'stack-l-injection',
    topic: 'Spring',
    prompt: 'Pourquoi préférer l’injection par constructeur à l’injection par champ ?',
    options: [
      'Elle permet des champs final, échoue au démarrage si une dépendance manque et rend la classe testable sans conteneur',
      'Elle est plus rapide à l’exécution',
      'Elle est la seule supportée par Spring Boot',
      'Elle évite d’avoir à déclarer des interfaces',
    ],
    answerIndex: 0,
    explanation:
      'Le constructeur rend les dépendances explicites et obligatoires : champs immuables, échec au démarrage plutôt qu’un champ nul découvert en production, instanciation directe en test. Il rend aussi visible l’excès de dépendances, qu’un empilement de champs masque.',
  }),
  mcq({
    id: 'stack-q-boot-1',
    domainId: D,
    courseId: C_SPRING,
    lessonId: 'stack-l-spring-vs-boot',
    topic: 'Spring',
    prompt: 'Quelle affirmation est exacte ?',
    options: [
      'Spring Boot est une couche posée sur Spring, qu’il utilise',
      'Spring Boot remplace Spring Framework',
      'Spring Boot est une version récente de Spring Framework',
      'Spring Boot et Spring sont deux projets sans rapport',
    ],
    answerIndex: 0,
    explanation:
      'Spring Boot ne réimplémente rien : il s’appuie sur le socle Spring et y ajoute la configuration automatique, des groupes de dépendances cohérents et un serveur embarqué. C’est la confusion la plus fréquente en entretien.',
  }),
  mcq({
    id: 'stack-q-couches-1',
    domainId: D,
    courseId: C_SPRING,
    lessonId: 'stack-l-couches-spring',
    topic: 'Spring',
    prompt: 'Où doit vivre une règle métier comme « au-delà de 1000 €, la commande passe en vérification » ?',
    options: [
      'Dans le service',
      'Dans le contrôleur, au plus près de la requête',
      'Dans le repository, au plus près des données',
      'Dans le DTO',
    ],
    answerIndex: 0,
    explanation:
      'Le service est la couche de décision. Dans le contrôleur, la règle ne serait applicable que par HTTP et devrait être recopiée dès qu’un batch ou un consommateur de messages doit valider une commande.',
  }),
  mcq({
    id: 'stack-q-transaction-1',
    domainId: D,
    courseId: C_SPRING,
    lessonId: 'stack-l-jpa-transaction',
    topic: 'Spring',
    prompt: 'Une méthode annotée @Transactional est appelée depuis une autre méthode de la même classe. Que se passe-t-il ?',
    options: [
      'L’annotation est sans effet : l’appel ne passe pas par le mandataire',
      'La transaction fonctionne normalement',
      'Spring lève une exception au démarrage',
      'Deux transactions imbriquées sont ouvertes',
    ],
    answerIndex: 0,
    explanation:
      'Spring implémente @Transactional par un mandataire qui entoure le bean. Un appel interne invoque directement la méthode sans passer par lui : aucune transaction n’est ouverte, et aucun message n’avertit. C’est un piège classique.',
  }),

  /* ----------------------------------- API --------------------------------- */
  mcq({
    id: 'stack-q-idempotence-1',
    domainId: D,
    courseId: C_API,
    lessonId: 'stack-l-idempotence',
    topic: 'API REST',
    prompt: 'Quelle méthode HTTP n’est pas idempotente ?',
    options: ['POST', 'GET', 'PUT', 'DELETE'],
    answerIndex: 0,
    explanation:
      'POST crée une nouvelle ressource à chaque appel : deux envois donnent deux créations. GET, PUT et DELETE laissent le système dans le même état qu’on les appelle une ou dix fois, ce qui rend leur réessai sûr.',
  }),
  mcq({
    id: 'stack-q-codes-1',
    domainId: D,
    courseId: C_API,
    lessonId: 'stack-l-codes-choix',
    topic: 'API REST',
    prompt: 'Un utilisateur authentifié tente une action qui lui est interdite. Quel code ?',
    options: ['403 Forbidden', '401 Unauthorized', '400 Bad Request', '404 Not Found'],
    answerIndex: 0,
    explanation:
      '401 signifie « je ne sais pas qui tu es » : pas de jeton, ou jeton invalide. 403 signifie « je sais qui tu es, et tu n’as pas le droit ». Renvoyer 401 à un utilisateur authentifié fait boucler les clients qui tentent de renouveler leur jeton.',
  }),
  mcq({
    id: 'stack-q-codes-2',
    domainId: D,
    courseId: C_API,
    lessonId: 'stack-l-codes-choix',
    topic: 'API REST',
    prompt: 'Une création échoue parce que l’adresse e-mail est déjà utilisée. Quel code ?',
    options: ['409 Conflict', '400 Bad Request', '500 Internal Server Error', '403 Forbidden'],
    answerIndex: 0,
    explanation:
      'La requête est bien formée, donc pas un 400, et l’utilisateur a le droit d’agir, donc pas un 403. Ce qui bloque est l’état actuel du système : 409 exprime exactement ce conflit.',
  }),
  mcq({
    id: 'stack-q-perf-api-1',
    domainId: D,
    courseId: C_API,
    lessonId: 'stack-l-api-performante',
    topic: 'Performance',
    prompt: 'Par quoi commencer pour rendre une API plus rapide ?',
    options: [
      'Mesurer la répartition du temps entre les couches',
      'Ajouter un cache Redis devant la base',
      'Augmenter le nombre de pods',
      'Passer les appels en asynchrone',
    ],
    answerIndex: 0,
    explanation:
      'Sans répartition du temps, toute optimisation est un pari : on risque de réécrire du code qui pèse vingt millisecondes sur dix secondes. Le cache, en particulier, masque un problème non corrigé qui réapparaîtra au pire moment.',
  }),
  mcq({
    id: 'stack-q-soap-1',
    domainId: D,
    courseId: C_API,
    lessonId: 'stack-l-soap',
    topic: 'API SOAP',
    prompt: 'À quoi sert un WSDL ?',
    options: [
      'À décrire formellement le contrat d’un service : opérations, types et point d’accès',
      'À chiffrer les messages SOAP',
      'À convertir du XML en JSON',
      'À équilibrer la charge entre serveurs SOAP',
    ],
    answerIndex: 0,
    explanation:
      'Le WSDL est un document XML décrivant le contrat de façon exécutable : on y génère clients et serveurs, et il sert de référence opposable entre partenaires. C’est ce contrat formel qui distingue le plus nettement SOAP de REST.',
  }),

  /* -------------------------------- Messaging ------------------------------ */
  mcq({
    id: 'stack-q-async-1',
    domainId: D,
    courseId: C_MSG,
    lessonId: 'stack-l-sync-async',
    topic: 'Messaging',
    prompt: 'Quel code HTTP convient à une opération acceptée mais pas encore traitée ?',
    options: ['202 Accepted', '200 OK', '201 Created', '204 No Content'],
    answerIndex: 0,
    explanation:
      '202 dit exactement cela : la demande est reçue et validée, le traitement n’est pas terminé. On l’accompagne d’un identifiant de suivi, puisque le client n’a plus le résultat dans la réponse.',
  }),
  mcq({
    id: 'stack-q-queue-1',
    domainId: D,
    courseId: C_MSG,
    lessonId: 'stack-l-queue-topic',
    topic: 'Messaging',
    prompt: 'Trois consommateurs sont attachés à une même file. Que reçoit chacun ?',
    options: [
      'Ils se répartissent les messages : chaque message va à un seul d’entre eux',
      'Chacun reçoit tous les messages',
      'Seul le premier connecté reçoit les messages',
      'Les messages sont dupliqués en trois exemplaires',
    ],
    answerIndex: 0,
    explanation:
      'C’est la définition d’une file : un message, un consommateur. Ajouter des consommateurs répartit la charge. Pour que tous reçoivent tout, il faut un sujet — c’est le modèle publication-abonnement.',
  }),
  mcq({
    id: 'stack-q-jms-1',
    domainId: D,
    courseId: C_MSG,
    lessonId: 'stack-l-jms',
    topic: 'Messaging',
    prompt: 'Qu’est-ce que JMS ?',
    options: [
      'Une spécification Java définissant une API de messagerie',
      'Un serveur de messagerie développé par Oracle',
      'Un protocole réseau concurrent d’AMQP',
      'Une bibliothèque de sérialisation',
    ],
    answerIndex: 0,
    explanation:
      'JMS ne fournit aucun serveur : c’est le contrat que les brokers implémentent, exactement comme JPA face à Hibernate. TIBCO EMS, ActiveMQ ou IBM MQ sont les serveurs qui le mettent en œuvre.',
  }),
  mcq({
    id: 'stack-q-ems-1',
    domainId: D,
    courseId: C_MSG,
    lessonId: 'stack-l-ems',
    topic: 'Messaging',
    prompt: 'Quelle relation entre JMS et TIBCO EMS ?',
    options: [
      'EMS est un broker qui implémente la spécification JMS',
      'JMS est une version open source d’EMS',
      'Ce sont deux noms du même produit',
      'EMS remplace JMS depuis Java 11',
    ],
    answerIndex: 0,
    explanation:
      'La relation est celle d’Hibernate à JPA : EMS est le serveur qu’on installe et exploite, JMS l’API utilisée dans le code. Dire « le code est du JMS standard, le broker est EMS » montre qu’on sait où passe la frontière.',
  }),
  mcq({
    id: 'stack-q-kafka-1',
    domainId: D,
    courseId: C_MSG,
    lessonId: 'stack-l-kafka',
    topic: 'Kafka',
    prompt: 'Dans Kafka, où l’ordre des messages est-il garanti ?',
    options: [
      'À l’intérieur d’une partition uniquement',
      'Sur l’ensemble du topic',
      'Entre tous les topics d’un même broker',
      'Nulle part : Kafka ne garantit aucun ordre',
    ],
    answerIndex: 0,
    explanation:
      'Chaque partition est une séquence strictement ordonnée, mais rien n’ordonne les partitions entre elles. Pour garantir l’ordre par client, on utilise son identifiant comme clé : tous ses messages tombent alors dans la même partition.',
  }),
  trueFalse({
    id: 'stack-q-kafka-2',
    domainId: D,
    courseId: C_MSG,
    lessonId: 'stack-l-kafka',
    topic: 'Kafka',
    prompt: 'Dans Kafka, un message est supprimé dès qu’un consommateur l’a lu.',
    answer: false,
    explanation:
      'C’est la différence de modèle avec une file : le message reste dans le journal pendant toute la durée de rétention configurée. C’est le consommateur qui mémorise sa position, ce qui permet à plusieurs groupes de lire le même flux et de rejouer l’historique.',
  }),

  /* ---------------------------------- Cache -------------------------------- */
  mcq({
    id: 'stack-q-redis-1',
    domainId: D,
    courseId: C_CACHE,
    lessonId: 'stack-l-redis',
    topic: 'Redis',
    prompt: 'Quelle description de Redis est la plus juste ?',
    options: [
      'Un stockage clé-valeur en mémoire, souvent utilisé comme cache mais pas uniquement',
      'Un cache HTTP placé devant les serveurs web',
      'Une base relationnelle optimisée pour la lecture',
      'Un broker de messages compatible JMS',
    ],
    answerIndex: 0,
    explanation:
      'Redis est un stockage clé-valeur en mémoire ; le cache est son usage le plus répandu, pas sa définition. Il sert aussi de compteur atomique, de verrou distribué, de stockage de sessions, de classement trié ou de file légère.',
  }),
  mcq({
    id: 'stack-q-cache-1',
    domainId: D,
    courseId: C_CACHE,
    lessonId: 'stack-l-cache-aside',
    topic: 'Cache',
    prompt: 'Dans le motif cache-aside, que fait le service en cas de défaut de cache ?',
    options: [
      'Il lit la source, dépose le résultat dans le cache, puis le renvoie',
      'Il renvoie une erreur au client',
      'Il attend que le cache soit rempli par un autre processus',
      'Il vide le cache et recommence',
    ],
    answerIndex: 0,
    explanation:
      'C’est le cœur du motif : le service reste responsable du cache. Il lit la source en cas d’absence, y dépose le résultat avec une durée de vie explicite, et doit invalider cette entrée à chaque écriture de la donnée.',
  }),
  mcq({
    id: 'stack-q-cache-2',
    domainId: D,
    courseId: C_CACHE,
    lessonId: 'stack-l-pieges-cache',
    topic: 'Cache',
    prompt: 'Une clé très demandée expire et mille requêtes reconstruisent la même valeur en même temps. Comment appelle-t-on cela ?',
    options: [
      'Une ruée sur le cache',
      'Un défaut de cache normal',
      'Une invalidation en cascade',
      'Une collision de hachage',
    ],
    answerIndex: 0,
    explanation:
      'La base reçoit d’un coup toute la charge que le cache absorbait. On l’atténue en ajoutant un écart aléatoire aux durées de vie, en reconstruisant sous verrou, ou en rafraîchissant les clés chaudes en arrière-plan.',
  }),

  /* --------------------------------- DevOps -------------------------------- */
  mcq({
    id: 'stack-q-docker-1',
    domainId: D,
    courseId: C_DEVOPS,
    lessonId: 'stack-l-docker',
    topic: 'Docker',
    prompt: 'Quelle est la différence entre une image et un conteneur ?',
    options: [
      'L’image est un modèle figé, le conteneur une exécution de ce modèle',
      'L’image tourne, le conteneur est stocké dans un registre',
      'Ce sont deux mots pour la même chose',
      'L’image contient les données, le conteneur le code',
    ],
    answerIndex: 0,
    explanation:
      'C’est exactement le rapport de la classe à l’objet : une image donne autant de conteneurs qu’on veut. L’image est immuable, ce qui garantit que ce qui a été testé est ce qui tourne — d’où la règle de ne jamais y figer la configuration.',
  }),
  mcq({
    id: 'stack-q-k8s-1',
    domainId: D,
    courseId: C_DEVOPS,
    lessonId: 'stack-l-pod',
    topic: 'Kubernetes',
    prompt: 'Qu’est-ce qu’un pod ?',
    options: [
      'La plus petite unité déployable : un ou plusieurs conteneurs partageant réseau et volumes',
      'Un synonyme exact de conteneur',
      'Une machine physique du cluster',
      'Un groupe de nœuds gérés ensemble',
    ],
    answerIndex: 0,
    explanation:
      'Kubernetes ne déploie jamais un conteneur seul. Le pod en contient généralement un, mais peut en réunir plusieurs quand ils doivent partager le réseau — par exemple un agent de collecte de journaux aux côtés de l’application.',
  }),
  mcq({
    id: 'stack-q-k8s-2',
    domainId: D,
    courseId: C_DEVOPS,
    lessonId: 'stack-l-pod',
    topic: 'Kubernetes',
    prompt: 'Quelle sonde retire un pod du trafic sans le tuer ?',
    options: ['readiness', 'liveness', 'startup', 'health'],
    answerIndex: 0,
    explanation:
      'La readiness décide si le pod peut recevoir du trafic ; en cas d’échec il est retiré du service mais reste vivant. La liveness, elle, provoque la destruction et la recréation du conteneur — la confondre avec la readiness cause des redémarrages en boucle.',
  }),
  mcq({
    id: 'stack-q-cicd-1',
    domainId: D,
    courseId: C_DEVOPS,
    lessonId: 'stack-l-cicd',
    topic: 'CI/CD',
    prompt: 'Pourquoi ne pas reconstruire l’image pour le déploiement en production ?',
    options: [
      'Parce qu’on déploierait alors un artefact différent de celui qui a été testé',
      'Parce que la reconstruction est trop lente',
      'Parce que le registre n’accepte qu’une image par jour',
      'Parce que Kubernetes refuse les images reconstruites',
    ],
    answerIndex: 0,
    explanation:
      'La même image traverse tous les environnements : c’est ce qui donne sa valeur à la chaîne de tests. Seule la configuration change, injectée par ConfigMap et Secret. On promeut une image, on ne la refabrique pas.',
  }),

  /* ------------------------------ Observabilité ---------------------------- */
  mcq({
    id: 'stack-q-obs-1',
    domainId: D,
    courseId: C_OBS,
    lessonId: 'stack-l-piliers',
    topic: 'Observabilité',
    prompt: 'Quel signal permet de savoir où sont passées les secondes d’une requête lente ?',
    options: ['Les traces', 'Les journaux', 'Les métriques', 'Les alertes'],
    answerIndex: 0,
    explanation:
      'La trace suit la requête à travers tous les services et découpe sa durée par étape. Les métriques disent qu’il y a un problème et son ampleur, les journaux ce qui s’est passé à un endroit précis, mais aucune ne donne la répartition du temps.',
  }),
  mcq({
    id: 'stack-q-logs-1',
    domainId: D,
    courseId: C_OBS,
    lessonId: 'stack-l-niveaux-logs',
    topic: 'Observabilité',
    prompt: 'Quel niveau pour une situation inattendue que le code a su traiter par un repli ?',
    options: ['WARN', 'ERROR', 'INFO', 'DEBUG'],
    answerIndex: 0,
    explanation:
      'WARN signale l’anormal qui a été géré : réessai, valeur par défaut, repli. ERROR doit rester réservé aux traitements qui n’ont pas abouti et exigent une action — sinon plus personne ne regarde les erreurs.',
  }),
  trueFalse({
    id: 'stack-q-elk-1',
    domainId: D,
    courseId: C_OBS,
    lessonId: 'stack-l-elk',
    topic: 'Observabilité',
    prompt: 'La collecte des journaux vers Elasticsearch passe obligatoirement par Logstash.',
    answer: false,
    explanation:
      'Dans un cluster Kubernetes, la collecte se fait le plus souvent par un agent léger sur chaque nœud — Filebeat, Fluent Bit, Fluentd, Vector ou l’OpenTelemetry Collector — qui envoie directement. Logstash n’intervient que s’il faut vraiment transformer les flux.',
  }),
  fillBlank({
    id: 'stack-q-grafana-1',
    domainId: D,
    courseId: C_OBS,
    lessonId: 'stack-l-grafana',
    topic: 'Observabilité',
    prompt: 'La latence se lit en ___ plutôt qu’en moyenne, car la moyenne masque les cas extrêmes.',
    answer: 'centiles',
    accepted: ['centile', 'percentiles', 'percentile'],
    explanation:
      'Une moyenne à 200 ms est compatible avec 5 % de requêtes à 8 secondes. Le 95e et le 99e centile montrent ce que vivent réellement les utilisateurs les plus mal servis — ceux qui se plaignent.',
  }),

  /* ------------------------------- Performance ----------------------------- */
  mcq({
    id: 'stack-q-perf-1',
    domainId: D,
    courseId: C_PERF,
    lessonId: 'stack-l-methode-perf',
    topic: 'Performance',
    prompt: 'La base prend 8,5 s sur 10 s. Quelle est la première action ?',
    options: [
      'Savoir s’il s’agit d’une requête lente ou de mille requêtes rapides',
      'Ajouter un index sur la table la plus grosse',
      'Mettre un cache Redis devant la base',
      'Augmenter la taille du pool de connexions',
    ],
    answerIndex: 0,
    explanation:
      'Les deux cas donnent 8,5 secondes et appellent des corrections opposées : plan d’exécution et index pour une requête lente, suppression d’un N+1 pour mille requêtes rapides — et aucun index ne corrigera un N+1.',
  }),
  trueFalse({
    id: 'stack-q-perf-2',
    domainId: D,
    courseId: C_PERF,
    lessonId: 'stack-l-methode-perf',
    topic: 'Performance',
    prompt: 'Face à une application lente, ajouter du cache est une bonne première mesure.',
    answer: false,
    explanation:
      'Un cache posé sur une requête non corrigée la masque : elle reste lente sur les défauts de cache, et le problème resurgit au redémarrage ou en pleine charge. On mesure, on identifie, on corrige, on re-mesure — le cache vient après.',
  }),
  mcq({
    id: 'stack-q-incident-1',
    domainId: D,
    courseId: C_PERF,
    lessonId: 'stack-l-incidents-app',
    topic: 'Diagnostic',
    prompt: 'Une API renvoie 500 en production mais pas en recette. Où chercher en premier ?',
    options: [
      'Dans ce qui diffère entre les deux environnements : configuration, secrets, volume, droits réseau',
      'Dans le code du contrôleur',
      'Dans la version de Java utilisée',
      'Dans les tests unitaires manquants',
    ],
    answerIndex: 0,
    explanation:
      'Si le même code fonctionne d’un côté et pas de l’autre, la cause est par définition dans l’écart. On compare les valeurs réellement injectées dans le pod — pas les fichiers du dépôt —, le volume de données, et les droits réseau.',
  }),
  mcq({
    id: 'stack-q-incident-2',
    domainId: D,
    courseId: C_PERF,
    lessonId: 'stack-l-incidents-infra',
    topic: 'Diagnostic',
    prompt: 'Un pod redémarre en boucle. Quelle information regarder en premier ?',
    options: [
      'Le motif du dernier arrêt : OOMKilled, échec de sonde, ou sortie applicative',
      'Le nombre de requêtes reçues',
      'La version de l’image déployée',
      'Le taux de succès du cache',
    ],
    answerIndex: 0,
    explanation:
      'Le motif oriente immédiatement vers trois enquêtes différentes, et on l’oublie souvent pour aller lire les journaux. Il faut aussi penser à lire les journaux du conteneur précédent, puisque le conteneur courant vient de démarrer.',
  }),

  /* ------------------------------ Architecture ----------------------------- */
  mcq({
    id: 'stack-q-archi-1',
    domainId: D,
    courseId: C_ARCHI,
    lessonId: 'stack-l-chaine-complete',
    topic: 'Architecture',
    prompt: 'Pourquoi mettre l’envoi du courriel de confirmation hors du chemin synchrone ?',
    options: [
      'Pour ne pas faire dépendre la validation de la commande de la disponibilité du serveur de messagerie',
      'Parce que l’envoi de courriel est interdit dans un contrôleur',
      'Pour réduire la taille de la réponse HTTP',
      'Parce que Kafka est plus rapide que SMTP',
    ],
    answerIndex: 0,
    explanation:
      'Le chemin synchrone doit être court : chaque maillon y ajoute sa latence et son risque de panne. Ce qui n’est pas nécessaire à la réponse part en événement, où il peut réessayer, tomber et reprendre sans conséquence pour l’utilisateur.',
  }),
  mcq({
    id: 'stack-q-archi-2',
    domainId: D,
    courseId: C_ARCHI,
    lessonId: 'stack-l-remplacer-composants',
    topic: 'Architecture',
    prompt: 'Qu’est-ce qui rend un composant facile à remplacer ?',
    options: [
      'Avoir été utilisé à travers une abstraction standard plutôt que par ses fonctions propres',
      'Être open source',
      'Être déployé dans un conteneur séparé',
      'Avoir été ajouté récemment au projet',
    ],
    answerIndex: 0,
    explanation:
      'Du JPA standard change d’implémentation ; du code truffé d’annotations propres à Hibernate ne bouge plus. C’est la raison d’être de JMS face aux brokers et de JPA face à Hibernate — et cela ne justifie pas d’inventer ses propres abstractions par précaution.',
  }),

  /* -------------------------------- Entretien ------------------------------ */
  mcq({
    id: 'stack-q-entretien-1',
    domainId: D,
    courseId: C_ENTRETIEN,
    lessonId: 'stack-l-structurer-reponse',
    topic: 'Entretien',
    prompt: 'Comment commencer une réponse à une question technique large ?',
    options: [
      'Par une réponse directe de vingt à trente secondes, puis une pause',
      'Par tout ce qu’on sait, pour montrer l’étendue de ses connaissances',
      'Par les détails d’implémentation, qui prouvent la pratique',
      'Par une question en retour, systématiquement',
    ],
    answerIndex: 0,
    explanation:
      'Une réponse courte prouve qu’on a compris la question et rend la main à l’interlocuteur, qui relance là où cela l’intéresse. Une réponse de trois minutes qui démarre sur l’implémentation donne l’impression de réciter et ne laisse aucune prise.',
  }),
  mcq({
    id: 'stack-q-entretien-2',
    domainId: D,
    courseId: C_ENTRETIEN,
    lessonId: 'stack-l-pieges-entretien',
    topic: 'Entretien',
    prompt: 'On te pose une question dont tu ne connais qu’une partie de la réponse. Que fais-tu ?',
    options: [
      'Je dis ce que je sais précisément, puis ce que j’ignore et comment je le chercherais',
      'J’improvise une réponse plausible pour ne pas paraître ignorant',
      'Je dis simplement que je ne sais pas et j’attends la question suivante',
      'Je change de sujet vers un domaine que je maîtrise',
    ],
    answerIndex: 0,
    explanation:
      'Délimiter ce qu’on sait, reconnaître le reste et montrer sa méthode inspire plus confiance qu’une réponse inventée — qu’un interlocuteur technique repère presque toujours, et qui le fera ensuite douter de tout le reste.',
  }),
];
