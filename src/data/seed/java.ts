import type { DomainSpec } from './builders';
import { code, def, example, exercise, fillBlank, keypoints, mcq, quiz, text, tip, trueFalse, warn } from './builders';

const D = 'java';

export const javaDomain: DomainSpec = {
  id: D,
  name: 'Java',
  description: 'Apprends à coder des applications',
  icon: 'code',
  accent: 'violet',
  paths: [
    { id: 'java-path-fondamentaux', title: 'Java Fondamentaux', description: 'La base du langage, de zéro au premier programme.' },
    { id: 'java-path-objet', title: 'Java Objet', description: 'Classes, objets, héritage, interfaces et exceptions.' },
    { id: 'java-path-moderne', title: 'Java Moderne', description: 'Collections, generics, lambdas, streams et Java 8 à 21.' },
  ],
  courses: [
    {
      id: 'java-fondamentaux',
      pathId: 'java-path-fondamentaux',
      title: 'Java Fondamentaux',
      description: 'JVM, variables, types, conditions, boucles et méthodes.',
      icon: '☕',
      level: 'debutant',
      tags: ['java', 'bases', 'syntaxe'],
      chapters: [
        {
          id: 'java-ch-démarrer',
          title: 'Démarrer avec Java',
          description: 'Ce qu’est Java et comment un programme est exécute.',
          lessons: [
            {
              id: 'java-l-introduction',
              title: 'Introduction a Java',
              summary: 'Ce qu’est Java, a quoi il sert et pourquoi il est encore partout.',
              minutes: 6,
              blocks: [
                def('Java', "Un langage de programmation oriente objet, compilé vers un bytecode exécute par une machine virtuelle. Écrit une fois, il tourne sur n’importe quel système disposant d’une JVM."),
                text(
                  "Java est utilisé pour des applications d’entreprise, des API REST (Spring Boot), des applications Android, du traitement de données (Kafka, Spark) et des outils système. Sa force n’est pas la concision mais la stabilité : du code Java de 2010 compilé encore aujourd’hui.",
                ),
                keypoints([
                  'Langage compilé puis interprété par la JVM.',
                  'Type statique : les erreurs de type sont vues à la compilation.',
                  'Oriente objet, avec une bibliothèque standard très large.',
                  'Rétrocompatibilité forte entre versions.',
                ], 'À retenir'),
                quiz('java-q-intro-1'),
              ],
            },
            {
              id: 'java-l-jvm',
              title: 'JVM, JDK et JRE',
              summary: 'La différence exacte entre les trois sigles que tout le monde confond.',
              minutes: 7,
              blocks: [
                def('JVM', "Java Virtual Machine : le programme qui exécute le bytecode .class. C'est elle qui rend Java portable."),
                def('JRE', "Java Runtime Environment : la JVM plus les bibliothèques standard. Suffisant pour exécuter, pas pour compiler."),
                def('JDK', "Java Development Kit : le JRE plus les outils de développement, notamment le compilateur javac."),
                example(
                  "Tu écris Main.java. `javac Main.java` (JDK) produit Main.class en bytecode. `java Main` (JVM) exécute ce bytecode. Sur un serveur de production qui ne fait qu’exécuter, un JRE suffisait historiquement.",
                ),
                code('text', 'Main.java  --javac-->  Main.class  --JVM-->  programme en cours', { caption: 'Le chemin du code source à l’exécution' }),
                tip("Depuis Java 11, le JRE seul n’est plus distribué séparément : on installe un JDK, même en production."),
                quiz('java-q-jvm-1'),
              ],
            },
            {
              id: 'java-l-premier-programme',
              title: 'Ton premier programme',
              summary: 'La structure minimale d’un programme Java, ligne par ligne.',
              minutes: 8,
              blocks: [
                text("Tout programme Java demarre dans une méthode `main` avec une signature précise. Si la signature changé, la JVM ne trouve pas le point d’entrée."),
                code(
                  'java',
                  `public class Main {
    public static void main(String[] args) {
        System.out.println("Bonjour");
    }
}`,
                  { caption: 'Le programme minimal', runnable: true },
                ),
                keypoints([
                  '`public class Main` : la classe, dont le nom doit correspondre au fichier.',
                  '`static` : la méthode est appelable sans créer d’objet.',
                  '`void` : elle ne renvoie rien.',
                  '`String[] args` : les arguments passés en ligne de commande.',
                ]),
                warn("`System.out.println` écrit sur la sortie standard suivie d’un retour à la ligne ; `print` n’ajouté pas ce retour."),
                exercise({
                  title: 'Affiche ton prénom',
                  statement: 'Modifié le programme pour afficher deux lignes : ton prénom, puis « Je debute en Java ».',
                  language: 'java',
                  starterCode: `public class Main {
    public static void main(String[] args) {
        System.out.println("Bonjour");
    }
}`,
                  hint: 'Deux appels a System.out.println suffisent.',
                  solution: `public class Main {
    public static void main(String[] args) {
        System.out.println("Fahem");
        System.out.println("Je debute en Java");
    }
}`,
                }),
              ],
            },
          ],
        },
        {
          id: 'java-ch-variables',
          title: 'Variables et types',
          lessons: [
            {
              id: 'java-l-variables',
              title: 'Variables et constantes',
              summary: 'Declarer, affecter, et savoir quand utiliser final.',
              minutes: 6,
              blocks: [
                def('Variable', 'Un emplacement nomme en mémoire, associé à un type qui ne changé jamais après la declaration.'),
                code(
                  'java',
                  `int age = 30;
String prénom = "Fahem";
final double TVA = 0.20;   // constante : réaffectation interdite
var total = 100.0;         // type déduit (Java 10+), toujours statique`,
                ),
                tip("Déclare `final` par défaut : une variable qui ne changé pas est une variable qu’on n’a pas besoin de suivre du regard."),
                quiz('java-q-var-1'),
              ],
            },
            {
              id: 'java-l-types',
              title: 'Types primitifs et objets',
              summary: 'Les huit primitifs, leurs wrappers, et le piege de la comparaison.',
              minutes: 8,
              blocks: [
                text('Java distingue huit types primitifs (valeurs brutes) des types objets (références).'),
                code(
                  'java',
                  `byte b = 12;        // 8 bits
short s = 1200;     // 16 bits
int i = 120000;     // 32 bits - le choix par défaut
long l = 12000000L; // 64 bits, suffixe L
float f = 1.5f;     // 32 bits, suffixe f
double d = 1.5;     // 64 bits - le choix par défaut
char c = 'A';
boolean ok = true;`,
                ),
                def('Autoboxing', 'La conversion automatique entre un primitif (`int`) et son wrapper objet (`Integer`).'),
                warn("Sur des objets, `==` compare les références, pas le contenu. Utilisé toujours `equals` pour comparer deux String."),
                code(
                  'java',
                  `String a = new String("test");
String b = new String("test");
System.out.println(a == b);      // false : deux objets différents
System.out.println(a.equals(b)); // true  : même contenu`,
                  { runnable: true },
                ),
                quiz('java-q-types-1'),
              ],
            },
            {
              id: 'java-l-conversions',
              title: 'Conversions et précision',
              summary: 'Cast implicite, cast explicite et le problème des flottants.',
              minutes: 6,
              blocks: [
                text("Une conversion vers un type plus large est automatique. Vers un type plus étroit, elle doit être explicite et peut perdre de l’information."),
                code(
                  'java',
                  `int i = 42;
long l = i;          // élargissement : implicite
double d = i;        // implicite aussi

double prix = 9.99;
int arrondi = (int) prix;  // cast explicite -> 9, la partie décimale est perdue

System.out.println(0.1 + 0.2); // 0.30000000000000004`,
                  { runnable: true },
                ),
                warn("N'utilisé jamais `double` pour de l’argent : passé par `BigDecimal`, sinon les centimes dérivent."),
                quiz('java-q-conv-1'),
              ],
            },
          ],
        },
        {
          id: 'java-ch-flux',
          title: 'Contrôle du flux',
          lessons: [
            {
              id: 'java-l-conditions',
              title: 'Conditions',
              summary: 'if / else, switch classique et switch expression.',
              minutes: 7,
              blocks: [
                code(
                  'java',
                  `int note = 14;
if (note >= 16) {
    System.out.println("Très bien");
} else if (note >= 12) {
    System.out.println("Bien");
} else {
    System.out.println("A travailler");
}`,
                  { runnable: true },
                ),
                text('Depuis Java 14, le switch peut être une expression qui renvoie une valeur, sans `break` ni chute involontaire.'),
                code(
                  'java',
                  `String jour = "SAMEDI";
String type = switch (jour) {
    case "SAMEDI", "DIMANCHE" -> "week-end";
    default -> "semaine";
};`,
                ),
                quiz('java-q-cond-1'),
              ],
            },
            {
              id: 'java-l-boucles',
              title: 'Boucles',
              summary: 'for, while, do-while et for-each : laquelle choisir.',
              minutes: 7,
              blocks: [
                code(
                  'java',
                  `for (int i = 0; i < 3; i++) {
    System.out.println("Tour " + i);
}

String[] langues = {"Java", "SQL", "Python"};
for (String langue : langues) {   // for-each : pas d’index à gérer
    System.out.println(langue);
}

int n = 3;
while (n > 0) { n--; }`,
                  { runnable: true },
                ),
                keypoints([
                  '`for` quand tu connais le nombre d’itérations.',
                  '`for-each` quand tu parcours une collection sans avoir besoin de l’index.',
                  '`while` quand la condition d’arrêt dépend de l’exécution.',
                  '`do-while` quand le corps doit s’exécuter au moins une fois.',
                ]),
                quiz('java-q-boucles-1'),
              ],
            },
            {
              id: 'java-l-méthodes',
              title: 'Méthodes',
              summary: 'Signature, paramètres, retour et surcharge.',
              minutes: 7,
              blocks: [
                def('Signature', "Le nom d’une méthode et la liste des types de ses paramètres. Le type de retour n’en fait pas partie."),
                code(
                  'java',
                  `public static int somme(int a, int b) {
    return a + b;
}

// Surcharge : même nom, paramètres différents
public static double somme(double a, double b) {
    return a + b;
}`,
                ),
                warn("Deux méthodes qui ne différent que par leur type de retour ne compilent pas : la signature serait identique."),
                exercise({
                  title: 'Écris une méthode',
                  statement: 'Écris une méthode `estPair(int n)` qui renvoie true si n’est pair, et affiche le résultat pour 7 et 10.',
                  language: 'java',
                  starterCode: `public class Main {
    public static void main(String[] args) {
        // appelle estPair ici
    }
}`,
                  hint: 'Le modulo `%` donne le reste de la division.',
                  solution: `public class Main {
    public static boolean estPair(int n) {
        return n % 2 == 0;
    }

    public static void main(String[] args) {
        System.out.println(estPair(7));
        System.out.println(estPair(10));
    }
}`,
                }),
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'java-poo',
      pathId: 'java-path-objet',
      title: 'Java - Programmation objet',
      description: 'Classes, encapsulation, héritage, polymorphisme, interfaces et exceptions.',
      icon: '🧩',
      level: 'intermediaire',
      tags: ['java', 'poo', 'objet'],
      chapters: [
        {
          id: 'java-ch-classes',
          title: 'Classes et objets',
          lessons: [
            {
              id: 'java-l-classes',
              title: 'Classes et instances',
              summary: 'Definir un type, puis en créer des exemplaires.',
              minutes: 7,
              blocks: [
                def('Classe', "Le plan qui décrit un ensemble d’objets : leurs données (champs) et leurs comportements (méthodes)."),
                def('Objet', "Une instance concrète d’une classe, créée avec `new`, avec ses propres valeurs de champs."),
                code(
                  'java',
                  `public class Compte {
    private String titulaire;
    private double solde;

    public Compte(String titulaire, double solde) {
        this.titulaire = titulaire;
        this.solde = solde;
    }

    public void deposer(double montant) {
        this.solde += montant;
    }
}

Compte c = new Compte("Fahem", 100);`,
                ),
                quiz('java-q-classes-1'),
              ],
            },
            {
              id: 'java-l-encapsulation',
              title: 'Encapsulation',
              summary: 'Pourquoi les champs sont prives et ce que cela protège.',
              minutes: 6,
              blocks: [
                def('Encapsulation', "Cacher l’état interne d’un objet derriere des méthodes, pour garantir que cet état reste valide."),
                text("Un champ public peut être mis dans n’importe quel état depuis l’exterieur. Un champ prive avec une méthode `deposer` peut refuser un montant négatif."),
                code(
                  'java',
                  `public void deposer(double montant) {
    if (montant <= 0) {
        throw new IllegalArgumentException("Montant invalide");
    }
    this.solde += montant;
}`,
                ),
                tip("Un getter n’est pas obligatoire : n’expose que ce dont l’exterieur a réellement besoin."),
                quiz('java-q-encap-1'),
              ],
            },
          ],
        },
        {
          id: 'java-ch-héritage',
          title: 'Héritage et polymorphisme',
          lessons: [
            {
              id: 'java-l-héritage',
              title: 'Héritage',
              summary: 'extends, super, et quand ne pas hériter.',
              minutes: 8,
              blocks: [
                def('Héritage', "Une classe fille reprend les champs et méthodes d’une classe mère et peut les compléter ou les redéfinir."),
                code(
                  'java',
                  `public class Animal {
    protected String nom;
    public Animal(String nom) { this.nom = nom; }
    public String crier() { return "..."; }
}

public class Chien extends Animal {
    public Chien(String nom) { super(nom); }

    @Override
    public String crier() { return "Wouf"; }
}`,
                ),
                warn("Hérite seulement quand la relation « est un » est vraie. Un `Rectangle` n’est pas forcement un bon parent pour `Carre`."),
                tip('Java ne permet pas l’héritage multiple de classes : une classe n à qu’un seul parent, mais peut implementer plusieurs interfaces.'),
                quiz('java-q-héritage-1'),
              ],
            },
            {
              id: 'java-l-polymorphisme',
              title: 'Polymorphisme',
              summary: 'Un même appel, des comportements différents selon le type reel.',
              minutes: 7,
              blocks: [
                text("Le type déclaré choisit ce que l’on peut appeler ; le type reel choisit ce qui s’exécute. C'est résolu à l’exécution."),
                code(
                  'java',
                  `Animal a = new Chien("Rex");
System.out.println(a.crier()); // "Wouf" : la version de Chien`,
                ),
                keypoints([
                  'Le polymorphisme évite les longues chaînes de if sur le type.',
                  '@Override protège des fautes de frappe dans la redéfinition.',
                  'Les champs, eux, ne sont pas polymorphes : seul le type déclaré compte.',
                ]),
                quiz('java-q-poly-1'),
              ],
            },
            {
              id: 'java-l-interfaces',
              title: 'Interfaces',
              summary: 'Un contrat sans implémentation, ou presque.',
              minutes: 7,
              blocks: [
                def('Interface', "Un contrat : une liste de méthodes qu’une classe s’engage à fournir. Depuis Java 8 elle peut aussi porter des méthodes `default`."),
                code(
                  'java',
                  `public interface Payable {
    double montant();

    default String résumé() {
        return "Montant : " + montant();
    }
}

public class Facture implements Payable {
    public double montant() { return 120.0; }
}`,
                ),
                tip('Programme contre une interface, pas contre une implémentation : cela rend le code testable et remplaçable.'),
                quiz('java-q-interface-1'),
              ],
            },
          ],
        },
        {
          id: 'java-ch-exceptions',
          title: 'Exceptions',
          lessons: [
            {
              id: 'java-l-exceptions',
              title: 'Gérer les exceptions',
              summary: 'checked vs unchecked, try/catch/finally et try-with-resources.',
              minutes: 9,
              blocks: [
                def('Exception checked', "Une exception que le compilateur oblige à traiter ou à déclarer (`IOException`, `SQLException`)."),
                def('Exception unchecked', "Une `RuntimeException` : le compilateur ne vérifie rien (`NullPointerException`, `IllegalArgumentException`)."),
                code(
                  'java',
                  `try {
    int résultat = 10 / diviseur;
} catch (ArithmeticException e) {
    System.out.println("Division par zéro : " + e.getMessage());
} finally {
    System.out.println("Toujours exécute");
}`,
                ),
                text('`try-with-resources` fermé automatiquement tout objet qui implemente `AutoCloseable`, même en cas d’exception.'),
                code(
                  'java',
                  `try (var reader = new BufferedReader(new FileReader("f.txt"))) {
    System.out.println(reader.readLine());
}`,
                ),
                warn("N'attrape jamais `Exception` pour l’ignorer silencieusement : une exception avalée est un bug invisible."),
                quiz('java-q-exceptions-1'),
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'java-moderne',
      pathId: 'java-path-moderne',
      title: 'Java moderne',
      description: 'Collections, generics, lambdas, streams, Optional et les apports de Java 8 à 21.',
      icon: '⚡',
      level: 'avance',
      tags: ['java', 'streams', 'collections', 'java8'],
      chapters: [
        {
          id: 'java-ch-collections',
          title: 'Collections',
          lessons: [
            {
              id: 'java-l-collections',
              title: 'List, Set et Map',
              summary: 'Les trois familles, et laquelle choisir selon le besoin.',
              minutes: 8,
              blocks: [
                keypoints([
                  '`List` : ordonnée, doublons autorises. ArrayList par défaut.',
                  '`Set` : pas de doublons, pas d’ordre garanti. HashSet par défaut.',
                  '`Map` : associations clé-valeur. HashMap par défaut.',
                ]),
                code(
                  'java',
                  `List<String> langues = new ArrayList<>();
langues.add("Java");
langues.add("Java"); // accepte

Set<String> uniques = new HashSet<>(langues); // 1 seul element

Map<String, Integer> ages = new HashMap<>();
ages.put("Fahem", 30);
ages.getOrDefault("Inconnu", 0); // 0`,
                ),
                tip('`HashMap` n’est pas thread-safe. En contexte concurrent, utilisé `ConcurrentHashMap`, pas `Hashtable`.'),
                quiz('java-q-collections-1'),
              ],
            },
            {
              id: 'java-l-generics',
              title: 'Generics',
              summary: 'Des types paramètres vérifiés à la compilation.',
              minutes: 7,
              blocks: [
                def('Générique', "Un type paramètre par un autre type : `List<String>` est une liste dont le compilateur garantit qu’elle ne contient que des String."),
                code(
                  'java',
                  `public class Boite<T> {
    private T contenu;
    public void mettre(T valeur) { this.contenu = valeur; }
    public T prendre() { return contenu; }
}

Boite<String> b = new Boite<>();
b.mettre("Bonjour");
String s = b.prendre(); // pas de cast`,
                ),
                text("À l’exécution, l’information de type générique est effacée (type erasure) : c’est une sécurité de compilation, pas d’exécution."),
                quiz('java-q-generics-1'),
              ],
            },
          ],
        },
        {
          id: 'java-ch-streams',
          title: 'Lambda et Streams',
          lessons: [
            {
              id: 'java-l-lambda',
              title: 'Lambdas',
              summary: 'Passer un comportement en paramètre.',
              minutes: 6,
              blocks: [
                def('Lambda', "Une fonction anonyme concise, implémentant une interface fonctionnelle (une seule méthode abstraite)."),
                code(
                  'java',
                  `Runnable r = () -> System.out.println("Hello");
Comparator<String> parLongueur = (a, b) -> a.length() - b.length();
Function<Integer, Integer> carre = n -> n * n;`,
                ),
                quiz('java-q-lambda-1'),
              ],
            },
            {
              id: 'java-l-streams',
              title: 'Streams',
              summary: 'Filtrer, transformer, agréger une collection de facon declarative.',
              minutes: 10,
              blocks: [
                text("Un stream décrit un traitement, il ne stocke rien. Les opérations intermédiaires (`filter`, `map`) sont paresseuses ; seule une opération terminale (`collect`, `count`) déclenche le calcul."),
                code(
                  'java',
                  `List<String> langues = List.of("Java", "SQL", "Python", "Go");

List<String> longues = langues.stream()
    .filter(l -> l.length() > 2)
    .map(String::toUpperCase)
    .sorted()
    .toList();`,
                ),
                warn("Un stream se consomme une seule fois : le réutiliser lève `IllegalStateException`."),
                keypoints([
                  '`filter` garde les elements qui vérifient un prédicat.',
                  '`map` transforme chaque element.',
                  '`reduce` / `collect` agrègent le résultat.',
                  'Rien ne s’exécute tant qu’il n y à pas d’opération terminale.',
                ]),
                quiz('java-q-streams-1'),
                quiz('java-q-streams-2'),
              ],
            },
            {
              id: 'java-l-optional',
              title: 'Optional',
              summary: 'Exprimer l’absence de valeur sans null.',
              minutes: 6,
              blocks: [
                def('Optional', "Un conteneur qui contient soit une valeur, soit rien. Il rend l’absence visible dans la signature."),
                code(
                  'java',
                  `Optional<String> trouve = repository.findNom(id);
String nom = trouve.orElse("inconnu");
trouve.ifPresent(System.out::println);`,
                ),
                warn("N'appelle jamais `get()` sans avoir vérifie la présence : c’est exactement le NullPointerException que tu voulais éviter."),
                quiz('java-q-optional-1'),
              ],
            },
          ],
        },
        {
          id: 'java-ch-versions',
          title: 'Java 8 à 21',
          lessons: [
            {
              id: 'java-l-versions',
              title: 'Ce qui a changé de Java 8 à 21',
              summary: 'Les apports qui changent vraiment la facon d’écrire du code.',
              minutes: 8,
              blocks: [
                keypoints([
                  'Java 8 : lambdas, streams, Optional, nouvelle API date/heure.',
                  'Java 10 : `var` pour les variables locales.',
                  'Java 11 : LTS, HttpClient standard, `String.isBlank`.',
                  'Java 14-17 : switch expressions, records, sealed classes, pattern matching pour instanceof.',
                  'Java 21 : LTS, virtual threads, pattern matching pour switch.',
                ]),
                code(
                  'java',
                  `// record : un porteur de données immuable en une ligne
public record Utilisateur(String nom, int age) {}

// pattern matching pour instanceof
if (objet instanceof String s && s.length() > 3) {
    System.out.println(s.toUpperCase());
}`,
                ),
                tip('Les versions LTS (8, 11, 17, 21) sont celles que tu rencontreras en entreprise.'),
                quiz('java-q-versions-1'),
              ],
            },
          ],
        },
      ],
    },
  ],
  questions: [
    mcq({ id: 'java-q-intro-1', domainId: D, courseId: 'java-fondamentaux', lessonId: 'java-l-introduction', topic: 'Java Bases', prompt: 'Que produit le compilateur Java ?', options: ['Du code machine natif', 'Du bytecode exécute par la JVM', 'Du code C intermédiaire'], answerIndex: 1, explanation: 'javac produit du bytecode (.class), qui est ensuite exécute par la JVM. C est ce qui rend Java portable.' }),
    mcq({ id: 'java-q-jvm-1', domainId: D, courseId: 'java-fondamentaux', lessonId: 'java-l-jvm', topic: 'Java Bases', prompt: 'Que signifie JVM ?', options: ['Java Variable Manager', 'Java Virtual Machine', 'Java Version Module'], answerIndex: 1, explanation: 'JVM signifie Java Virtual Machine : la machine virtuelle qui exécute le bytecode Java.' }),
    trueFalse({ id: 'java-q-var-1', domainId: D, courseId: 'java-fondamentaux', lessonId: 'java-l-variables', topic: 'Java Bases', prompt: 'Une variable déclarée `final` peut être réaffectée plus tard.', answer: false, explanation: '`final` interdit la réaffectation. L objet référence peut lui-même changer d’état, mais la référence ne changé plus.' }),
    mcq({ id: 'java-q-types-1', domainId: D, courseId: 'java-fondamentaux', lessonId: 'java-l-types', topic: 'Java Types', prompt: 'Comment comparer le contenu de deux String ?', options: ['a == b', 'a.equals(b)', 'a.compare(b)'], answerIndex: 1, explanation: 'Sur des objets, == compare les références. equals compare le contenu.' }),
    mcq({ id: 'java-q-conv-1', domainId: D, courseId: 'java-fondamentaux', lessonId: 'java-l-conversions', topic: 'Java Types', prompt: 'Quel type utiliser pour représenter un montant en euros sans perte de précision ?', options: ['double', 'float', 'BigDecimal'], answerIndex: 2, explanation: 'Les flottants binaires ne representent pas exactement 0.1. BigDecimal travaille en décimal exact.' }),
    mcq({ id: 'java-q-cond-1', domainId: D, courseId: 'java-fondamentaux', lessonId: 'java-l-conditions', topic: 'Java Bases', prompt: 'Quel avantage principal apporte le switch expression (Java 14+) ?', options: ['Il est plus rapide à l’exécution', 'Il renvoie une valeur et supprimé le risque de chute entre les cas', 'Il accepte des conditions complexes'], answerIndex: 1, explanation: 'Le switch expression renvoie une valeur et n à pas besoin de break : la chute involontaire disparaît.' }),
    mcq({ id: 'java-q-boucles-1', domainId: D, courseId: 'java-fondamentaux', lessonId: 'java-l-boucles', topic: 'Java Bases', prompt: 'Quelle boucle garantit au moins une exécution du corps ?', options: ['for', 'while', 'do-while'], answerIndex: 2, explanation: 'do-while teste la condition après avoir exécute le corps une première fois.' }),
    mcq({ id: 'java-q-classes-1', domainId: D, courseId: 'java-poo', lessonId: 'java-l-classes', topic: 'Java POO', prompt: 'Quelle est la différence entre une classe et un objet ?', options: ['Aucune, ce sont des synonymes', 'La classe est le plan, l’objet une instance concrète', 'L objet est le plan, la classe une instance'], answerIndex: 1, explanation: 'La classe décrit la structure ; chaque objet créé avec new possède ses propres valeurs.' }),
    trueFalse({ id: 'java-q-encap-1', domainId: D, courseId: 'java-poo', lessonId: 'java-l-encapsulation', topic: 'Java POO', prompt: 'Rendre un champ prive oblige à fournir un getter public.', answer: false, explanation: 'Rien n’oblige à exposer un getter. On n’expose que ce dont l’exterieur à besoin.' }),
    mcq({ id: 'java-q-héritage-1', domainId: D, courseId: 'java-poo', lessonId: 'java-l-héritage', topic: 'Java POO', prompt: 'Combien de classes une classe Java peut-elle étendre directement ?', options: ['Une seule', 'Deux', 'Autant que nécessaire'], answerIndex: 0, explanation: 'Java n’autorisé pas l’héritage multiple de classes, mais une classe peut implementer plusieurs interfaces.' }),
    mcq({ id: 'java-q-poly-1', domainId: D, courseId: 'java-poo', lessonId: 'java-l-polymorphisme', topic: 'Java POO', prompt: 'Quel code s’exécute pour `Animal a = new Chien(); a.crier();` ?', options: ['Celui de Animal', 'Celui de Chien', 'Une erreur de compilation'], answerIndex: 1, explanation: 'La méthode appelée est celle du type reel de l’objet, résolue à l’exécution.' }),
    mcq({ id: 'java-q-interface-1', domainId: D, courseId: 'java-poo', lessonId: 'java-l-interfaces', topic: 'Java POO', prompt: 'Depuis quelle version une interface peut-elle contenir une méthode avec un corps ?', options: ['Java 5', 'Java 8', 'Java 17'], answerIndex: 1, explanation: 'Java 8 a introduit les méthodes `default` et `static` dans les interfaces.' }),
    mcq({ id: 'java-q-exceptions-1', domainId: D, courseId: 'java-poo', lessonId: 'java-l-exceptions', topic: 'Java Exceptions', prompt: 'Laquelle de ces exceptions est unchecked ?', options: ['IOException', 'SQLException', 'NullPointerException'], answerIndex: 2, explanation: 'NullPointerException hérite de RuntimeException : le compilateur n’oblige pas à la traiter.' }),
    trueFalse({ id: 'java-q-exceptions-2', domainId: D, courseId: 'java-poo', lessonId: 'java-l-exceptions', topic: 'Java Exceptions', prompt: 'Le bloc finally est exécute même si le bloc try lève une exception.', answer: true, explanation: 'finally s’exécute dans tous les cas, ce qui en fait l’endroit historique pour libérer des ressources.' }),
    mcq({ id: 'java-q-collections-1', domainId: D, courseId: 'java-moderne', lessonId: 'java-l-collections', topic: 'Java Collections', prompt: 'Quelle structure interdit les doublons ?', options: ['List', 'Set', 'ArrayList'], answerIndex: 1, explanation: 'Un Set ne contient jamais deux elements égaux au sens de equals/hashCode.' }),
    mcq({ id: 'java-q-generics-1', domainId: D, courseId: 'java-moderne', lessonId: 'java-l-generics', topic: 'Java Collections', prompt: 'À quel moment les generics sont-ils vérifiés ?', options: ['À la compilation', 'À l’exécution', 'Les deux'], answerIndex: 0, explanation: 'Le type générique est effacé à l’exécution (type erasure) : la vérification est faite par le compilateur.' }),
    mcq({ id: 'java-q-lambda-1', domainId: D, courseId: 'java-moderne', lessonId: 'java-l-lambda', topic: 'Java Streams', prompt: 'Qu est-ce qu’une interface fonctionnelle ?', options: ['Une interface sans méthode', 'Une interface avec exactement une méthode abstraite', 'Une interface annotée @Override'], answerIndex: 1, explanation: 'Une seule méthode abstraite : c’est ce qui permet de l’implementer par une lambda.' }),
    mcq({ id: 'java-q-streams-1', domainId: D, courseId: 'java-moderne', lessonId: 'java-l-streams', topic: 'Java Streams', prompt: 'Quand un stream exécute-t-il réellement les opérations ?', options: ['Des le premier filter', 'A la création du stream', 'A l’appel d’une opération terminale'], answerIndex: 2, explanation: 'Les opérations intermédiaires sont paresseuses ; seule une opération terminale déclenche le traitement.' }),
    mcq({ id: 'java-q-streams-2', domainId: D, courseId: 'java-moderne', lessonId: 'java-l-streams', topic: 'Java Streams', type: 'code_output', language: 'java', code: `List.of(1, 2, 3, 4).stream()
    .filter(n -> n % 2 == 0)
    .map(n -> n * 10)
    .toList();`, prompt: 'Que contient la liste résultante ?', options: ['[10, 20, 30, 40]', '[20, 40]', '[2, 4]'], answerIndex: 1, explanation: 'filter garde 2 et 4, puis map les multiplie par 10 : [20, 40].' }),
    mcq({ id: 'java-q-optional-1', domainId: D, courseId: 'java-moderne', lessonId: 'java-l-optional', topic: 'Java Streams', prompt: 'Quelle méthode récupère la valeur ou une valeur par défaut ?', options: ['get()', 'orElse(valeur)', 'isPresent()'], answerIndex: 1, explanation: 'orElse renvoie la valeur si présente, sinon la valeur fournie, sans risque d’exception.' }),
    fillBlank({ id: 'java-q-versions-1', domainId: D, courseId: 'java-moderne', lessonId: 'java-l-versions', topic: 'Java Moderne', prompt: 'Quel mot-clé (Java 14+) déclaré un porteur de données immuable en une ligne ?', answer: 'record', accepted: ['record', 'records'], explanation: 'Un `record` génère constructeur, accesseurs, equals, hashCode et toString.' }),
  ],
  flashcards: [
    { id: 'java-fc-jvm', courseId: 'java-fondamentaux', front: 'JVM', back: 'Java Virtual Machine : exécute le bytecode .class, rend Java portable.', tags: ['java'] },
    { id: 'java-fc-jdk', courseId: 'java-fondamentaux', front: 'JDK vs JRE', back: 'JDK = JRE + outils de développement (javac). JRE = JVM + bibliothèques.', tags: ['java'] },
    { id: 'java-fc-equals', courseId: 'java-fondamentaux', front: '== ou equals pour des String ?', back: 'equals : == compare les références, pas le contenu.', tags: ['java'] },
    { id: 'java-fc-encaps', courseId: 'java-poo', front: 'Encapsulation', back: "Cacher l’état interne derriere des méthodes qui garantissent sa validite.", tags: ['poo'] },
    { id: 'java-fc-poly', courseId: 'java-poo', front: 'Polymorphisme', back: 'Un même appel produit un comportement différent selon le type reel de l’objet.', tags: ['poo'] },
    { id: 'java-fc-checked', courseId: 'java-poo', front: 'Checked vs unchecked', back: 'Checked : le compilateur oblige à traiter (IOException). Unchecked : RuntimeException, non verifiee.', tags: ['exceptions'] },
    { id: 'java-fc-hashmap', courseId: 'java-moderne', front: 'HashMap vs ConcurrentHashMap', back: 'HashMap n’est pas thread-safe. ConcurrentHashMap le permet sans verrouiller toute la table.', tags: ['collections'] },
    { id: 'java-fc-stream-lazy', courseId: 'java-moderne', front: 'Un stream est-il paresseux ?', back: 'Oui : rien ne s’exécute avant une opération terminale (collect, count, forEach).', tags: ['streams'] },
    { id: 'java-fc-optional', courseId: 'java-moderne', front: 'Optional', back: "Conteneur qui rend l’absence de valeur explicite dans la signature. Utilisé orElse, pas get.", tags: ['streams'] },
    { id: 'java-fc-record', courseId: 'java-moderne', front: 'record', back: 'Porteur de données immuable : constructeur, accesseurs, equals, hashCode et toString générés.', tags: ['java17'] },
  ],
};

