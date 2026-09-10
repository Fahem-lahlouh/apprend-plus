import type { QuizQuestion } from '@/models';
import { fillBlank, mcq, trueFalse } from '../builders';
import { D } from './shared';

const C = 'java-c3-moderne';

export const moderneQuestions: QuizQuestion[] = [
  mcq({
    id: 'java-q-collections-1',
    domainId: D, courseId: C, lessonId: 'java-l-collections',
    topic: 'collections',
    prompt: 'Quelle structure choisir pour garantir qu’aucun élément n’apparaît deux fois ?',
    options: ['Set', 'List', 'Map', 'Array'],
    answerIndex: 0,
    explanation:
      'Un Set refuse les doublons : add renvoie false et n’ajoute rien si l’élément est déjà présent. La List, elle, les accepte.',
    tags: ['collections'],
  }),
  mcq({
    id: 'java-q-collections-2',
    domainId: D, courseId: C, lessonId: 'java-l-collections',
    topic: 'collections',
    prompt: 'Que se passe-t-il ici si la clé est absente ?',
    code: `Map<String, Integer> ages = new HashMap<>();
int age = ages.get("inconnu");`,
    language: 'java',
    type: 'code_output',
    options: [
      'NullPointerException : get renvoie null, et l’unboxing vers int échoue',
      'age vaut 0',
      'age vaut -1',
      'Une erreur de compilation',
    ],
    answerIndex: 0,
    explanation:
      'get renvoie null pour une clé absente. Le convertir en int primitif déclenche un unboxing sur null. Utilise getOrDefault("inconnu", 0).',
    tags: ['collections', 'null'],
  }),
  mcq({
    id: 'java-q-hashmap-1',
    domainId: D, courseId: C, lessonId: 'java-l-implementations',
    topic: 'collections',
    prompt: 'Pourquoi une clé de HashMap devrait-elle être immuable ?',
    options: [
      'Parce que son casier est choisi d’après son hashCode à l’insertion : le modifier rend l’entrée introuvable',
      'Parce que HashMap refuse les objets modifiables',
      'Parce que cela accélère le calcul du hashCode',
      'Parce que les clés mutables consomment plus de mémoire',
    ],
    answerIndex: 0,
    explanation:
      'Modifier un champ entrant dans le hashCode change le casier attendu, mais l’objet reste dans l’ancien. La map cherche au mauvais endroit et ne trouve rien — tout en gardant l’entrée en mémoire.',
    tags: ['hashmap'],
  }),
  mcq({
    id: 'java-q-arraylist-1',
    domainId: D, courseId: C, lessonId: 'java-l-implementations',
    topic: 'collections',
    prompt: 'Que provoque ce code ?',
    code: `for (String nom : noms) {
    if (nom.isBlank()) {
        noms.remove(nom);
    }
}`,
    language: 'java',
    type: 'find_bug',
    options: [
      'ConcurrentModificationException : on modifie la collection pendant son parcours',
      'Rien, c’est la façon normale de supprimer',
      'Une erreur de compilation',
      'Une NullPointerException',
    ],
    answerIndex: 0,
    explanation:
      'Le for-each s’appuie sur un itérateur qui détecte toute modification faite dans son dos. Utilise noms.removeIf(nom -> nom.isBlank()).',
    tags: ['collections', 'bug'],
  }),

  mcq({
    id: 'java-q-exception-1',
    domainId: D, courseId: C, lessonId: 'java-l-exceptions',
    topic: 'exceptions',
    prompt: 'Quand le bloc finally est-il exécuté ?',
    options: [
      'Dans tous les cas : succès, exception attrapée, ou même après un return dans le try',
      'Uniquement si aucune exception n’a été levée',
      'Uniquement si une exception a été attrapée',
      'Uniquement si le try contient un return',
    ],
    answerIndex: 0,
    explanation:
      'C’est sa raison d’être : garantir la libération des ressources quoi qu’il arrive. Le try-with-resources rend souvent ce bloc inutile.',
    tags: ['exceptions'],
  }),
  mcq({
    id: 'java-q-checked-1',
    domainId: D, courseId: C, lessonId: 'java-l-checked-unchecked',
    topic: 'exceptions',
    prompt: 'Quelle est la différence entre une exception checked et unchecked ?',
    options: [
      'Le compilateur impose de traiter ou de déclarer une checked, il n’impose rien pour une unchecked',
      'Une unchecked arrête le programme, une checked non',
      'Une checked ne peut pas être attrapée',
      'Les unchecked n’existent plus depuis Java 8',
    ],
    answerIndex: 0,
    explanation:
      'Les checked héritent d’Exception hors RuntimeException (IOException, SQLException). Les unchecked héritent de RuntimeException (NullPointerException, IllegalArgumentException).',
    tags: ['exceptions'],
  }),
  fillBlank({
    id: 'java-q-checked-2',
    domainId: D, courseId: C, lessonId: 'java-l-checked-unchecked',
    topic: 'exceptions',
    prompt: 'Quel mot-clé lance effectivement une exception dans le corps d’une méthode ?',
    answer: 'throw',
    accepted: ['throw'],
    explanation:
      'throw lance, throws annonce dans la signature. Un s de différence, deux rôles opposés.',
    tags: ['exceptions'],
  }),

  mcq({
    id: 'java-q-generics-1',
    domainId: D, courseId: C, lessonId: 'java-l-generics',
    topic: 'generics',
    prompt: 'Quel est l’apport principal des generics ?',
    options: [
      'Transformer une erreur de type détectée à l’exécution en erreur de compilation',
      'Réduire la mémoire occupée par les collections',
      'Accélérer les appels de méthode',
      'Permettre d’écrire new T() dans une classe générique',
    ],
    answerIndex: 0,
    explanation:
      'Sans generics, une liste accepte tout et la ClassCastException apparaît en production. Avec, le compilateur refuse immédiatement, et les casts deviennent inutiles.',
    tags: ['generics'],
  }),
  mcq({
    id: 'java-q-lambda-1',
    domainId: D, courseId: C, lessonId: 'java-l-lambda',
    topic: 'lambda',
    prompt: 'Qu’est-ce qu’une interface fonctionnelle ?',
    options: [
      'Une interface ne déclarant qu’une seule méthode abstraite',
      'Une interface qui ne contient que des méthodes static',
      'Une interface héritant de Function',
      'Une interface sans aucune méthode',
    ],
    answerIndex: 0,
    explanation:
      'C’est ce qui rend la lambda non ambiguë : le compilateur sait quelle méthode elle implémente. @FunctionalInterface fait vérifier cette contrainte.',
    tags: ['lambda'],
  }),

  mcq({
    id: 'java-q-stream-1',
    domainId: D, courseId: C, lessonId: 'java-l-streams',
    topic: 'streams',
    prompt: 'Que produit ce code ?',
    code: `List<String> noms = List.of("Said", "Ali", "Samir");
List<String> resultat = noms.stream()
    .filter(nom -> nom.startsWith("S"))
    .toList();
System.out.println(resultat);`,
    language: 'java',
    type: 'code_output',
    options: ['[Said, Samir]', '[Said]', '[Ali]', '[Said, Ali, Samir]'],
    answerIndex: 0,
    explanation:
      'filter ne garde que les éléments pour lesquels la lambda renvoie true. « Said » et « Samir » commencent par S, « Ali » non.',
    tags: ['streams'],
  }),
  trueFalse({
    id: 'java-q-stream-2',
    domainId: D, courseId: C, lessonId: 'java-l-streams',
    topic: 'streams',
    prompt: 'Un stream modifie la collection sur laquelle il a été ouvert.',
    answer: false,
    explanation:
      'Jamais. Un stream produit un nouveau résultat et laisse la source intacte. C’est ce qui rend les chaînes de traitement sûres à lire et à composer.',
    tags: ['streams'],
  }),
  mcq({
    id: 'java-q-stream-3',
    domainId: D, courseId: C, lessonId: 'java-l-streams-avances',
    topic: 'streams',
    prompt: 'Quelle opération change le type des éléments d’un stream ?',
    options: ['map', 'filter', 'sorted', 'distinct'],
    answerIndex: 0,
    explanation:
      'map transforme chaque élément : .map(Personne::nom) fait passer d’un Stream<Personne> à un Stream<String>. Les trois autres conservent le type.',
    tags: ['streams'],
  }),

  mcq({
    id: 'java-q-optional-1',
    domainId: D, courseId: C, lessonId: 'java-l-optional',
    topic: 'Optional',
    prompt: 'Pourquoi renvoyer un Optional plutôt que null ?',
    options: [
      'Parce que l’absence devient visible dans la signature, donc impossible à ignorer par inadvertance',
      'Parce qu’Optional est plus rapide que null',
      'Parce que null est déprécié depuis Java 8',
      'Parce qu’Optional supprime toutes les NullPointerException',
    ],
    answerIndex: 0,
    explanation:
      'Rien, dans « renvoie un Utilisateur », n’avertit qu’on peut recevoir null. Optional<Utilisateur> déplace l’information là où on la lit forcément. Mal utilisé — get() sans test — il échoue tout autant.',
    tags: ['optional'],
  }),
  mcq({
    id: 'java-q-dates-1',
    domainId: D, courseId: C, lessonId: 'java-l-dates',
    topic: 'java.time',
    prompt: 'Quel type utiliser pour horodater un événement dans un log de serveur ?',
    options: [
      'Instant, un point absolu exprimé en UTC',
      'LocalDateTime, plus lisible',
      'LocalDate, suffisant pour un log',
      'String au format jj/mm/aaaa',
    ],
    answerIndex: 0,
    explanation:
      'Un LocalDateTime ne porte aucun fuseau : « 14 h » est ambigu, et deux serveurs dans deux pays produisent des valeurs incomparables. Instant ordonne correctement les événements.',
    tags: ['dates'],
  }),
  mcq({
    id: 'java-q-fichiers-1',
    domainId: D, courseId: C, lessonId: 'java-l-fichiers',
    topic: 'fichiers',
    prompt: 'Pourquoi utiliser un try-with-resources pour lire un fichier ?',
    options: [
      'Parce qu’il ferme la ressource automatiquement, même en cas d’exception',
      'Parce qu’il accélère la lecture',
      'Parce qu’il évite d’avoir à gérer l’encodage',
      'Parce qu’il charge tout le fichier en mémoire',
    ],
    answerIndex: 0,
    explanation:
      'Un finally correct pour plusieurs ressources est difficile à écrire. Le try-with-resources ferme dans l’ordre inverse d’ouverture et gère les exceptions imbriquées, en une ligne.',
    tags: ['fichiers'],
  }),

  mcq({
    id: 'java-q-threads-1',
    domainId: D, courseId: C, lessonId: 'java-l-threads',
    topic: 'threads',
    prompt: 'Pourquoi valeur++ n’est-il pas sûr entre plusieurs threads ?',
    options: [
      'Parce qu’il cache trois étapes — lire, ajouter, réécrire — que deux threads peuvent entrelacer',
      'Parce que ++ est déprécié sur les attributs',
      'Parce que la JVM interdit d’écrire un int depuis deux threads',
      'Parce que valeur doit être déclarée final',
    ],
    answerIndex: 0,
    explanation:
      'Si deux threads lisent 5 simultanément, tous deux écrivent 6 : un incrément est perdu. C’est une condition de course. AtomicInteger rend l’opération indivisible.',
    tags: ['threads', 'concurrence'],
  }),
  mcq({
    id: 'java-q-executor-1',
    domainId: D, courseId: C, lessonId: 'java-l-executor',
    topic: 'threads',
    prompt: 'Pourquoi les threads virtuels de Java 21 aident-ils une API ?',
    options: [
      'Parce qu’un thread virtuel bloqué en attente rend son thread système, qui sert une autre requête',
      'Parce qu’ils accélèrent les calculs intensifs',
      'Parce qu’ils suppriment le besoin de synchronisation',
      'Parce qu’ils remplacent la base de données par un cache',
    ],
    answerIndex: 0,
    explanation:
      'Une API attend surtout : base, services externes, réseau. Les threads virtuels permettent d’écrire du code bloquant simple tout en tenant une charge qui exigeait auparavant de l’asynchrone complexe.',
    tags: ['threads'],
  }),

  mcq({
    id: 'java-q-record-1',
    domainId: D, courseId: C, lessonId: 'java-l-enum-record',
    topic: 'record',
    prompt: 'Que génère automatiquement le compilateur pour public record Point(int x, int y) {} ?',
    options: [
      'Le constructeur, les accesseurs x() et y(), equals, hashCode et toString',
      'Uniquement le constructeur',
      'Des setters pour x et y',
      'Rien, il faut tout écrire à la main',
    ],
    answerIndex: 0,
    explanation:
      'C’est tout l’intérêt : moins de code à lire, et plus aucune occasion d’oublier hashCode en modifiant equals. Les champs sont finaux, donc le record est immuable.',
    tags: ['record'],
  }),
  mcq({
    id: 'java-q-enum-1',
    domainId: D, courseId: C, lessonId: 'java-l-enum-record',
    topic: 'enum',
    prompt: 'Pourquoi un enum plutôt qu’une String pour représenter un statut ?',
    options: [
      'Parce qu’il limite les valeurs possibles : la faute de frappe devient une erreur de compilation',
      'Parce qu’un enum occupe moins de mémoire',
      'Parce qu’une String ne peut pas être utilisée dans un switch',
      'Parce qu’un enum est modifiable à l’exécution',
    ],
    answerIndex: 0,
    explanation:
      'Une String accepte « VALIDÉE », « validee » ou n’importe quelle faute, qui compile et échoue plus tard. Un enum ferme l’ensemble des valeurs et permet un switch vérifiable.',
    tags: ['enum'],
  }),
  mcq({
    id: 'java-q-versions-1',
    domainId: D, courseId: C, lessonId: 'java-l-versions',
    topic: 'versions Java',
    prompt: 'Dans quelle version le mot-clé var est-il apparu ?',
    options: [
      'Java 10',
      'Java 8',
      'Java 11',
      'Java 17',
    ],
    answerIndex: 0,
    explanation:
      'var pour les variables locales date de Java 10. Java 11 y a seulement ajouté son usage dans les paramètres de lambda — l’attribution à Java 11 est une confusion très répandue.',
    tags: ['versions'],
  }),
];
