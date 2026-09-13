import type { ChapterSpec, CourseSpec } from '../builders';
import {
  badGood,
  code,
  codeExplain,
  compare,
  def,
  example,
  exercise,
  keypoints,
  memorize,
  question,
  quiz,
  steps,
  techDef,
  text,
  tip,
  warn,
  why,
} from '../builders';

/* =====================================================================
   Cours 1 - Java Débutant
   Chapitres 1 à 8 : de « qu'est-ce que Java » aux méthodes.
   Aucune notion n'apparaît avant celles dont elle dépend.
   ===================================================================== */

const chapters: ChapterSpec[] = [
  /* ---------------------- 1. Introduction à Java --------------------- */
  {
    id: 'java-ch01-introduction',
    title: '1. Introduction à Java',
    description: 'Ce qu’est Java, à quoi il sert, et ce que veut dire « portable ».',
    lessons: [
      {
        id: 'java-l-introduction',
        title: 'Qu’est-ce que Java ?',
        summary: 'Un langage orienté objet dont le même code tourne sur Windows, Linux et macOS.',
        minutes: 7,
        difficulty: 'decouverte',
        concepts: ['Java'],
        definitions: [
          {
            id: 'java-d-java',
            title: 'Java',
            text: "Java est un langage de programmation orienté objet. Il a été conçu pour être portable, c'est-à-dire que le même code peut s'exécuter sur différents systèmes d'exploitation comme Windows, Linux ou macOS sans modification. Cela est possible grâce à la JVM, la Java Virtual Machine, qui exécute le bytecode Java sur chaque système.",
            tags: ['java', 'bases'],
          },
        ],
        blocks: [
          def(
            'Java',
            "Java est un langage de programmation orienté objet. Il a été conçu pour être portable, c'est-à-dire que le même code peut s'exécuter sur différents systèmes d'exploitation comme Windows, Linux ou macOS sans modification. Cela est possible grâce à la JVM, la Java Virtual Machine, qui exécute le bytecode Java sur chaque système.",
          ),
          text('On résume souvent cette portabilité par une formule : « Write once, run anywhere ». Écris une fois, exécute partout.'),
          techDef(
            'Java',
            "Java est un langage de programmation généraliste, fortement typé et orienté objet. Le code source Java est compilé en bytecode par le compilateur javac, puis ce bytecode est exécuté par la JVM.",
          ),
          why(
            'Pourquoi apprendre Java aujourd’hui ?',
            "Parce qu’il fait tourner une part énorme des systèmes qui doivent durer : banques, assurances, administrations, applications Android, traitement de données. Sa qualité principale n’est pas la concision, c’est la stabilité : du code écrit il y a dix ans compile encore. Une entreprise qui choisit Java achète surtout la certitude que son application vivra longtemps.",
          ),
          example(
            "Ton application bancaire mobile parle à un serveur Java. Ta commande en ligne passe par un service Java. Le moteur de recherche interne de ton entreprise est probablement en Java. Tu ne le vois jamais : Java vit côté serveur.",
          ),
          code(
            'java',
            `public class Main {
    public static void main(String[] args) {
        System.out.println("Bonjour");
    }
}`,
            { caption: 'Le plus petit programme Java complet', runnable: true },
          ),
          codeExplain([
            ['public class Main', 'Déclare une classe appelée Main. En Java, tout code vit dans une classe.'],
            ['public static void main(String[] args)', 'Le point d’entrée du programme : c’est la méthode que la JVM cherche et lance en premier.'],
            ['System.out.println("Bonjour")', 'Affiche le texte « Bonjour » dans la console, suivi d’un retour à la ligne.'],
          ]),
          keypoints([
            'Java est compilé en bytecode, puis ce bytecode est exécuté par la JVM.',
            'Fortement typé : le type de chaque variable est vérifié à la compilation.',
            'Orienté objet : le code s’organise autour d’objets, pas de fonctions isolées.',
            'Portable : un même .class tourne sur tout système disposant d’une JVM.',
          ]),
          question(
            'Pourquoi dit-on que Java est portable ?',
            "Parce que le compilateur ne produit pas du code machine propre à un processeur, mais du bytecode. Chaque système dispose de sa propre JVM, qui sait traduire ce bytecode pour lui. Le même fichier .class fonctionne donc partout où une JVM est installée.",
          ),
          warn("Portable ne veut pas dire « identique partout ». Les chemins de fichiers, les fins de ligne ou le fuseau horaire par défaut diffèrent selon le système : c’est le langage qui est portable, pas les hypothèses que tu fais sur l’environnement."),
          quiz('java-q-introduction-1'),
          quiz('java-q-introduction-2'),
          memorize('java-d-java'),
        ],
      },
      {
        id: 'java-l-ou-sert-java',
        title: 'Où Java est utilisé',
        summary: 'Les domaines réels où tu croiseras Java, pour savoir ce que tu prépares.',
        minutes: 5,
        difficulty: 'decouverte',
        requires: ['java-l-introduction'],
        concepts: ['Java'],
        blocks: [
          text(
            "Savoir à quoi sert un langage évite d’apprendre dans le vide. Java occupe quatre terrains principaux, et c’est le premier qui te concernera le plus probablement.",
          ),
          keypoints([
            'Applications d’entreprise et API REST côté serveur, très souvent avec Spring Boot.',
            'Applications Android, historiquement en Java, aujourd’hui partagées avec Kotlin.',
            'Traitement de données à grande échelle : Kafka, Spark, Elasticsearch sont écrits en Java.',
            'Outils et systèmes internes qui doivent tourner des années sans réécriture.',
          ]),
          why(
            'Pourquoi tant d’API sont-elles écrites en Java ?',
            "Parce qu’une API d’entreprise doit tenir des milliers de requêtes par seconde, rester en ligne des années, et être reprise par des équipes qui changent. Java apporte un typage strict qui attrape les erreurs avant la mise en production, un écosystème mature pour la base de données et la sécurité, et une compatibilité qui évite de tout réécrire à chaque montée de version.",
          ),
          tip("Ce parcours te mène précisément là : les cinq étapes vont des bases du langage jusqu’au diagnostic d’une API lente. Spring Boot viendra après, une fois Java compris."),
          quiz('java-q-usages-1'),
        ],
      },
    ],
  },

  /* ---------------------- 2. JVM, JDK, JRE --------------------------- */
  {
    id: 'java-ch02-jvm',
    title: '2. JVM, JDK, JRE',
    description: 'Les trois sigles que tout le monde confond, enfin séparés.',
    lessons: [
      {
        id: 'java-l-jvm',
        title: 'La JVM et le chemin du code',
        summary: 'Du code source au bytecode, puis du bytecode au programme qui tourne.',
        minutes: 8,
        difficulty: 'facile',
        requires: ['java-l-introduction'],
        concepts: ['JVM'],
        definitions: [
          {
            id: 'java-d-jvm',
            title: 'JVM',
            text: "JVM signifie Java Virtual Machine. La JVM est l'environnement qui exécute le bytecode Java. Elle permet au même programme Java de fonctionner sur plusieurs systèmes d'exploitation, car chaque système dispose de sa propre JVM capable de traduire ce bytecode.",
            tags: ['java', 'jvm'],
          },
        ],
        blocks: [
          def(
            'JVM',
            "JVM signifie Java Virtual Machine. La JVM est l'environnement qui exécute le bytecode Java. Elle permet au même programme Java de fonctionner sur plusieurs systèmes d'exploitation, car chaque système dispose de sa propre JVM capable de traduire ce bytecode.",
          ),
          code(
            'text',
            `Code Java  (Main.java)
    |
    v   javac  — le compilateur
Bytecode   (Main.class)
    |
    v   JVM  — la machine virtuelle
Windows  /  Linux  /  macOS`,
            { caption: 'Le trajet complet, de ce que tu écris à ce qui tourne' },
          ),
          text(
            "Trois formes de code se succèdent, et les confondre rend la portabilité incompréhensible. Voici exactement ce que chacune est.",
          ),
          keypoints([
            'Le code source : le texte que tu écris, dans Main.java. Lisible par un humain, incompréhensible pour la machine.',
            'Le bytecode : le contenu de Main.class, produit par javac. Ni lisible ni exécutable directement par le processeur ; c’est un format intermédiaire commun à tous les systèmes.',
            'Le code machine : les instructions que le processeur exécute réellement. C’est la JVM qui traduit le bytecode en code machine, sur la machine où le programme tourne.',
          ], 'Trois formes de code, à ne pas mélanger'),
          why(
            'Pourquoi passer par un bytecode plutôt que compiler directement ?',
            "Parce que compiler directement en code machine produirait un fichier différent par système et par processeur : une version Windows, une version Linux, une version macOS. Le bytecode découpe le problème en deux. Ton compilateur ne s’occupe que de traduire Java en bytecode, une seule fois. C’est la JVM, écrite par d’autres pour chaque système, qui absorbe les différences.",
          ),
          question(
            'Pourquoi Java peut-il fonctionner sur plusieurs systèmes ?',
            "Parce que le code Java est compilé en bytecode, puis la JVM adaptée à chaque système exécute ce bytecode.",
          ),
          question(
            'Le fichier .class produit sur un Mac fonctionne-t-il sur un serveur Linux ?',
            "Oui. Le bytecode ne contient rien de spécifique à la machine qui l’a compilé. C’est la JVM installée sur le serveur Linux qui le traduira pour son processeur.",
          ),
          tip("La JVM ne se contente pas de traduire : elle observe le programme pendant qu’il tourne et recompile en code machine natif les portions les plus utilisées. C’est le compilateur JIT, vu plus loin dans le parcours."),
          quiz('java-q-jvm-1'),
          quiz('java-q-jvm-2'),
          memorize('java-d-jvm'),
        ],
      },
      {
        id: 'java-l-jdk-jre',
        title: 'JDK et JRE',
        summary: 'Ce qu’il faut pour développer, ce qu’il faut pour exécuter, et ce qui a changé depuis Java 9.',
        minutes: 8,
        difficulty: 'facile',
        requires: ['java-l-jvm'],
        concepts: ['JDK', 'JRE'],
        definitions: [
          {
            id: 'java-d-jdk',
            title: 'JDK',
            text: "JDK signifie Java Development Kit. Le JDK contient les outils nécessaires pour développer des applications Java, notamment le compilateur javac, le lanceur java, un débogueur et les bibliothèques standard du langage.",
            tags: ['java', 'jdk'],
          },
          {
            id: 'java-d-jre',
            title: 'JRE',
            text: "JRE signifie Java Runtime Environment. Le JRE permet d'exécuter des applications Java. Il contient la JVM et les bibliothèques standard, mais pas le compilateur : il suffit pour lancer un programme, pas pour le compiler.",
            tags: ['java', 'jre'],
          },
        ],
        blocks: [
          def(
            'JDK',
            "JDK signifie Java Development Kit. Le JDK contient les outils nécessaires pour développer des applications Java, notamment le compilateur javac, le lanceur java, un débogueur et les bibliothèques standard du langage.",
          ),
          def(
            'JRE',
            "JRE signifie Java Runtime Environment. Le JRE permet d'exécuter des applications Java. Il contient la JVM et les bibliothèques standard, mais pas le compilateur : il suffit pour lancer un programme, pas pour le compiler.",
          ),
          code(
            'text',
            `JDK  =  JRE  +  outils de développement (javac, débogueur…)
JRE  =  JVM  +  bibliothèques standard
JVM  =  l'exécuteur de bytecode`,
            { caption: 'Le rapport d’inclusion, du plus large au plus étroit' },
          ),
          codeExplain([
            ['javac Main.java', 'Fourni par le JDK. Lit le code source et produit Main.class, le bytecode. Sans JDK, pas de compilation.'],
            ['java Main', 'Lance la JVM sur la classe Main. C’est ce que fait tourner un serveur en production.'],
          ], 'Les deux commandes à connaître'),
          why(
            'Pourquoi cette distinction a-t-elle existé ?',
            "Historiquement on installait un JRE sur les machines qui devaient seulement faire tourner des applications, et un JDK sur les postes des développeurs. Le JRE était plus léger et n’exposait pas d’outils inutiles sur un serveur. La distinction servait à réduire ce qu’on installait en production.",
          ),
          warn(
            "Depuis Java 9, cette séparation n’est plus la norme. Oracle a cessé de distribuer un JRE séparé à partir de Java 11 : on installe un JDK, y compris en production. Pour réduire la taille d’une image, on construit désormais un runtime sur mesure avec l’outil jlink plutôt que d’installer un JRE tout fait. Si un cours te dit « installe le JRE en production », il date d’avant 2018.",
          ),
          compare(
            ['JDK', 'JRE'],
            [
              ['Contient', 'Compilateur, outils, JRE complet', 'JVM et bibliothèques standard'],
              ['Permet de', 'Compiler et exécuter', 'Exécuter uniquement'],
              ['Commande phare', 'javac', 'java'],
              ['Aujourd’hui', 'Ce qu’on installe partout', 'Plus distribué séparément depuis Java 11'],
            ],
            'JDK ou JRE, en un coup d’œil',
          ),
          question(
            'Tu récupères un projet Java et tu veux le compiler. JRE ou JDK ?',
            "Le JDK. Le JRE ne contient pas javac : il sait lancer un programme déjà compilé, pas transformer du code source en bytecode.",
          ),
          quiz('java-q-jdk-1'),
          quiz('java-q-jdk-2'),
          memorize('java-d-jdk'),
          memorize('java-d-jre'),
        ],
      },
    ],
  },

  /* ---------------------- 3. Premier programme ----------------------- */
  {
    id: 'java-ch03-premier-programme',
    title: '3. Premier programme Java',
    description: 'La structure minimale, les packages, et le cycle compiler puis exécuter.',
    lessons: [
      {
        id: 'java-l-premier-programme',
        title: 'La méthode main',
        summary: 'La signature exacte du point d’entrée, et pourquoi elle ne se négocie pas.',
        minutes: 8,
        difficulty: 'facile',
        requires: ['java-l-jdk-jre'],
        concepts: ['main', 'Java'],
        blocks: [
          text(
            "Tout programme Java démarre dans une méthode nommée main, avec une signature très précise. Si un seul mot change, la JVM ne trouve plus le point d’entrée et refuse de lancer le programme.",
          ),
          code(
            'java',
            `public class Main {
    public static void main(String[] args) {
        System.out.println("Bonjour");
    }
}`,
            { caption: 'Le programme minimal', runnable: true },
          ),
          codeExplain([
            ['public', 'Visible depuis l’extérieur de la classe. La JVM doit pouvoir appeler cette méthode, donc elle ne peut pas être privée.'],
            ['static', 'Appelable sans créer d’objet. Au démarrage, aucun objet n’existe encore : la JVM n’aurait rien sur quoi appeler la méthode.'],
            ['void', 'Ne renvoie aucune valeur. Le code de sortie du programme ne passe pas par un return ici.'],
            ['main', 'Le nom exact que la JVM recherche. « Main », « start » ou « run » ne fonctionneraient pas.'],
            ['String[] args', 'Les arguments passés en ligne de commande, sous forme de tableau de chaînes.'],
            ['System.out.println("Bonjour")', 'Écrit sur la sortie standard, puis passe à la ligne suivante.'],
          ]),
          why(
            'Pourquoi main doit-elle être static ?',
            "Parce qu’au moment où le programme démarre, aucun objet n’a encore été créé. Une méthode non statique appartient à un objet et ne peut être appelée que sur un objet existant. La JVM devrait donc en fabriquer un, sans savoir avec quels paramètres. Déclarer main static résout le problème : la méthode appartient à la classe elle-même et s’appelle directement.",
          ),
          warn("System.out.println ajoute un retour à la ligne, System.out.print n’en ajoute pas. C’est la source d’un affichage collé sur une seule ligne quand on s’attend à plusieurs."),
          question(
            'Que se passe-t-il si tu renommes main en demarrer ?',
            "Le code compile sans erreur, parce que demarrer est une méthode parfaitement valide. Mais à l’exécution, la JVM cherche main, ne la trouve pas, et s’arrête sur une erreur du type « Main method not found in class Main ».",
          ),
          exercise({
            title: 'Affiche deux lignes',
            statement: 'Modifie le programme pour afficher ton prénom sur une première ligne, puis « Je débute en Java » sur une seconde.',
            language: 'java',
            starterCode: `public class Main {
    public static void main(String[] args) {
        System.out.println("Bonjour");
    }
}`,
            hint: 'Deux appels successifs à System.out.println suffisent.',
            solution: `public class Main {
    public static void main(String[] args) {
        System.out.println("Fahem");
        System.out.println("Je débute en Java");
    }
}`,
          }),
          quiz('java-q-main-1'),
          quiz('java-q-main-2'),
        ],
      },
      {
        id: 'java-l-packages-imports',
        title: 'Packages et imports',
        summary: 'Ranger les classes et aller chercher celles qui vivent ailleurs.',
        minutes: 7,
        difficulty: 'facile',
        requires: ['java-l-premier-programme'],
        concepts: ['package', 'import'],
        definitions: [
          {
            id: 'java-d-package',
            title: 'Package',
            text: "Un package est un espace de noms qui regroupe des classes liées entre elles. Il évite les conflits de noms entre deux classes identiques venant de bibliothèques différentes, et il correspond à l'arborescence des dossiers du projet.",
            tags: ['java', 'organisation'],
          },
        ],
        blocks: [
          def(
            'Package',
            "Un package est un espace de noms qui regroupe des classes liées entre elles. Il évite les conflits de noms entre deux classes identiques venant de bibliothèques différentes, et il correspond à l'arborescence des dossiers du projet.",
          ),
          code(
            'java',
            `package com.exemple.boutique;

import java.util.ArrayList;
import java.util.List;

public class Panier {
    private List<String> articles = new ArrayList<>();
}`,
            { caption: 'Un fichier Java complet, avec son package et ses imports' },
          ),
          codeExplain([
            ['package com.exemple.boutique;', 'Toujours la première instruction du fichier. Elle annonce où vit cette classe ; le fichier doit se trouver dans com/exemple/boutique/.'],
            ['import java.util.List;', 'Autorise à écrire List au lieu du nom complet java.util.List dans tout le fichier.'],
            ['import java.util.ArrayList;', 'Chaque classe s’importe séparément : importer List n’importe pas ArrayList.'],
          ]),
          why(
            'Pourquoi ranger les classes dans des packages ?',
            "Pour deux raisons concrètes. D’abord éviter les collisions : java.util.List et java.awt.List sont deux classes différentes qui portent le même nom, et seul le package les distingue. Ensuite structurer le projet : en regardant les packages d’une application, on comprend son découpage sans lire une ligne de code.",
          ),
          tip("Les classes de java.lang (String, Integer, System, Math…) sont importées automatiquement. C’est pour cela que System.out.println fonctionne sans aucun import."),
          example(
            "La convention est le nom de domaine inversé : une entreprise exemple.com nommera ses packages com.exemple.quelquechose. Cela garantit l’unicité mondiale sans coordination entre entreprises.",
          ),
          question(
            'Peut-on utiliser une classe sans l’importer ?',
            "Oui, en écrivant son nom complet : java.util.List<String> noms = new java.util.ArrayList<>(); L’import n’est qu’un raccourci d’écriture, il n’ajoute rien au programme compilé.",
          ),
          quiz('java-q-package-1'),
          memorize('java-d-package'),
        ],
      },
      {
        id: 'java-l-compiler-executer',
        title: 'Compiler et exécuter',
        summary: 'Les commandes réelles, et comment lire les erreurs qu’elles renvoient.',
        minutes: 6,
        difficulty: 'facile',
        requires: ['java-l-premier-programme'],
        concepts: ['javac', 'compilation'],
        blocks: [
          steps([
            'Écrire le code dans un fichier dont le nom correspond exactement à la classe publique : Main.java pour public class Main.',
            'Compiler avec javac Main.java, ce qui produit Main.class à côté du source.',
            'Exécuter avec java Main — sans l’extension .class, on donne le nom de la classe, pas celui du fichier.',
          ], 'Le cycle complet'),
          code(
            'text',
            `$ javac Main.java
$ java Main
Bonjour`,
            { caption: 'Ce que tu tapes réellement dans un terminal' },
          ),
          warn(
            "Deux erreurs de débutant reviennent sans cesse. Écrire java Main.class au lieu de java Main : la commande java attend un nom de classe. Et nommer le fichier autrement que la classe publique qu’il contient : javac refuse alors de compiler.",
          ),
          tip("Depuis Java 11, un fichier unique peut être lancé sans compilation préalable : java Main.java compile en mémoire et exécute dans la foulée. Pratique pour tester une idée, inadapté à un vrai projet."),
          question(
            'Une erreur apparaît à javac, une autre à java. Quelle différence ?',
            "Une erreur de javac est une erreur de compilation : le code est mal écrit, rien n’a été produit. Une erreur de java est une erreur d’exécution : le code était valide, mais quelque chose s’est mal passé pendant qu’il tournait, par exemple une division par zéro.",
          ),
          quiz('java-q-compilation-1'),
        ],
      },
    ],
  },
  /* ---------------------- 4. Variables et types ---------------------- */
  {
    id: 'java-ch04-variables',
    title: '4. Variables et types',
    description: 'Nommer une valeur, choisir son type, et comprendre primitif contre objet.',
    lessons: [
      {
        id: 'java-l-variables',
        title: 'Variables et constantes',
        summary: 'Déclarer, affecter, et savoir quand verrouiller une valeur avec final.',
        minutes: 7,
        difficulty: 'facile',
        requires: ['java-l-premier-programme'],
        concepts: ['variable', 'final'],
        definitions: [
          {
            id: 'java-d-variable',
            title: 'Variable',
            text: "Une variable est un emplacement nommé qui contient une valeur d'un type donné. En Java, le type est déclaré avant le nom et ne change plus ensuite : une variable déclarée int contiendra toujours un entier.",
            tags: ['java', 'bases'],
          },
        ],
        blocks: [
          def(
            'Variable',
            "Une variable est un emplacement nommé qui contient une valeur d'un type donné. En Java, le type est déclaré avant le nom et ne change plus ensuite : une variable déclarée int contiendra toujours un entier.",
          ),
          code(
            'java',
            `int age = 30;
String nom = "Said";
final double TAUX_TVA = 0.20;

age = 31;        // autorisé
// TAUX_TVA = 0.21;  // refusé à la compilation`,
            { caption: 'Déclaration, affectation, constante' },
          ),
          codeExplain([
            ['int age = 30;', 'Le type int, le nom age, puis la valeur initiale. Les trois d’un coup.'],
            ['age = 31;', 'Réaffectation : le nom reste, la valeur change. Le type, lui, ne change jamais.'],
            ['final double TAUX_TVA = 0.20;', 'final interdit toute réaffectation ultérieure. La convention nomme ces constantes en majuscules avec des underscores.'],
          ]),
          why(
            'Pourquoi utiliser final ?',
            "Parce qu’une valeur qui ne doit pas bouger et qui bouge quand même est un bug difficile à retrouver. final transforme cette règle en contrainte vérifiée par le compilateur : l’erreur apparaît avant même l’exécution. C’est aussi une information pour qui relit le code — voir final dit « inutile de chercher où cette valeur change, elle ne change pas ».",
          ),
          tip("Depuis Java 10, var permet d’omettre le type d’une variable locale quand il est évident : var noms = new ArrayList<String>(); Le type reste fixé à la compilation, ce n’est pas du typage dynamique."),
          question(
            'Quelle est la différence entre déclarer et affecter ?',
            "Déclarer, c’est annoncer le nom et le type : int age; Affecter, c’est y mettre une valeur : age = 30; La ligne int age = 30; fait simplement les deux d’un coup.",
          ),
          warn("Une variable locale doit être affectée avant d’être lue. Le compilateur refuse int age; System.out.println(age); avec l’erreur « variable age might not have been initialized »."),
          quiz('java-q-variable-1'),
          memorize('java-d-variable'),
        ],
      },
      {
        id: 'java-l-types-primitifs',
        title: 'Les types primitifs',
        summary: 'Les huit types de base, ce qu’ils contiennent, et lequel choisir.',
        minutes: 8,
        difficulty: 'facile',
        requires: ['java-l-variables'],
        concepts: ['types primitifs'],
        blocks: [
          text("Java possède exactement huit types primitifs. Ils ne sont pas des objets : ils contiennent directement une valeur, pas une référence vers un objet."),
          code(
            'java',
            `byte    petitEntier = 100;          // 8 bits,  -128 à 127
short   entierCourt  = 30000;       // 16 bits
int     entier       = 2000000;     // 32 bits, le choix par défaut
long    grandEntier  = 9000000000L; // 64 bits, noter le L final

float   flottant     = 3.14f;       // 32 bits, noter le f final
double  reel         = 3.14159;     // 64 bits, le choix par défaut

char    lettre       = 'A';         // un caractère, apostrophes simples
boolean vrai         = true;        // true ou false, rien d'autre`,
            { caption: 'Les huit types primitifs' },
          ),
          keypoints([
            'int pour les entiers et double pour les nombres à virgule : ce sont les défauts, choisis-les sauf raison précise.',
            'long exige un L en fin de littéral, sinon la valeur est traitée comme un int et déborde.',
            'float exige un f, sinon le littéral est un double et la compilation échoue.',
            'char utilise des apostrophes simples, String des guillemets doubles. Ce ne sont pas les mêmes.',
            'boolean ne vaut que true ou false ; contrairement à d’autres langages, 0 n’est pas faux en Java.',
          ]),
          why(
            'Pourquoi ne pas toujours prendre long et double ?',
            "Parce qu’un type occupe de la mémoire, et qu’un tableau d’un million de long pèse deux fois plus qu’un tableau d’int. Sur une variable isolée cela n’a aucune importance ; sur des collections volumineuses ou des traitements massifs, cela change la consommation mémoire et le temps de parcours.",
          ),
          warn(
            "N’utilise jamais double ou float pour de l’argent. 0.1 + 0.2 ne vaut pas 0.3 en virgule flottante : ces types sont des approximations binaires. Pour un montant, utilise BigDecimal, ou raisonne en centimes avec des entiers.",
          ),
          code(
            'java',
            `System.out.println(0.1 + 0.2);   // affiche 0.30000000000000004`,
            { caption: 'La preuve en une ligne', runnable: true },
          ),
          question(
            'Pourquoi long x = 9000000000; ne compile-t-il pas ?',
            "Parce que le littéral 9000000000 est lu comme un int avant d’être affecté, et qu’il dépasse la capacité d’un int. Il faut écrire 9000000000L pour que le littéral soit lui-même un long.",
          ),
          quiz('java-q-types-1'),
          quiz('java-q-types-2'),
        ],
      },
      {
        id: 'java-l-string',
        title: 'String et immutabilité',
        summary: 'Pourquoi une chaîne ne change jamais, et ce que cela implique quand on la modifie.',
        minutes: 8,
        difficulty: 'moyen',
        requires: ['java-l-types-primitifs'],
        concepts: ['String', 'immutabilité'],
        definitions: [
          {
            id: 'java-d-string',
            title: 'String',
            text: "String représente une chaîne de caractères. Une String est immuable : une fois créée, son contenu ne peut plus être modifié. Toute opération qui semble la transformer renvoie en réalité une nouvelle chaîne, et laisse l'originale intacte.",
            tags: ['java', 'string'],
          },
        ],
        blocks: [
          def(
            'String',
            "String représente une chaîne de caractères. Une String est immuable : une fois créée, son contenu ne peut plus être modifié. Toute opération qui semble la transformer renvoie en réalité une nouvelle chaîne, et laisse l'originale intacte.",
          ),
          code(
            'java',
            `String nom = "Said";
String message = "Bonjour " + nom;
System.out.println(message);   // Bonjour Said`,
            { caption: 'Créer et concaténer', runnable: true },
          ),
          text("Voici maintenant le piège que tout le monde rencontre une fois."),
          code(
            'java',
            `String texte = "Java";
texte.concat(" 21");
System.out.println(texte);   // affiche Java, pas Java 21`,
            { caption: 'Le résultat surprend, et pourtant il est logique', runnable: true },
          ),
          codeExplain([
            ['String texte = "Java";', 'La variable texte référence une chaîne dont le contenu est « Java ».'],
            ['texte.concat(" 21");', 'concat fabrique une nouvelle chaîne « Java 21 » et la renvoie. Mais rien ne récupère ce retour : la nouvelle chaîne est aussitôt perdue. texte, lui, n’a pas bougé.'],
            ['texte = texte.concat(" 21");', 'Voilà la correction : on réaffecte texte pour qu’il référence la nouvelle chaîne.'],
          ]),
          why(
            'Pourquoi les String sont-elles immuables ?',
            "Pour trois raisons qui se renforcent. La sécurité d’abord : un nom de fichier ou une URL passé à une méthode ne peut pas être modifié dans ton dos. Le partage ensuite : comme personne ne peut les altérer, la JVM réutilise une même chaîne littérale à plusieurs endroits sans risque. Les threads enfin : une valeur qui ne change jamais est utilisable par plusieurs threads sans aucune synchronisation.",
          ),
          warn(
            "Concaténer dans une boucle avec + crée une nouvelle chaîne à chaque tour. Sur mille itérations, ce sont mille objets construits puis jetés. Utilise StringBuilder, qui modifie un tampon interne au lieu de recréer.",
          ),
          badGood({
            language: 'java',
            title: 'Construire une chaîne dans une boucle',
            bad: `String resultat = "";
for (String mot : mots) {
    resultat = resultat + mot + " ";
}`,
            good: `StringBuilder resultat = new StringBuilder();
for (String mot : mots) {
    resultat.append(mot).append(" ");
}
String texte = resultat.toString();`,
            why: "La version de gauche alloue une nouvelle String à chaque tour : le coût grandit avec le carré du nombre d’éléments. StringBuilder écrit dans un tampon qu’il agrandit de temps en temps, et ne construit la String finale qu’une seule fois.",
          }),
          question(
            'Après String a = "Java"; String b = a; b = b + " 21"; que vaut a ?',
            "a vaut toujours « Java ». b référençait la même chaîne, puis a été réaffectée vers une chaîne neuve. Comme aucune chaîne n’a été modifiée sur place, a est intacte.",
          ),
          quiz('java-q-string-1'),
          quiz('java-q-string-2'),
          memorize('java-d-string'),
        ],
      },
      {
        id: 'java-l-wrappers',
        title: 'int ou Integer : primitifs et objets',
        summary: 'Autoboxing, unboxing, et le null qui fait planter un calcul.',
        minutes: 8,
        difficulty: 'moyen',
        requires: ['java-l-string'],
        concepts: ['autoboxing', 'wrapper'],
        definitions: [
          {
            id: 'java-d-autoboxing',
            title: 'Autoboxing',
            text: "L'autoboxing est la conversion automatique d'un type primitif vers son objet enveloppe, par exemple d'un int vers un Integer. L'opération inverse s'appelle l'unboxing. Elle est automatique elle aussi, et elle échoue avec une NullPointerException si l'objet vaut null.",
            tags: ['java', 'types'],
          },
        ],
        blocks: [
          text("À chaque type primitif correspond une classe enveloppe : int a Integer, long a Long, double a Double, boolean a Boolean, char a Character. La différence n’est pas cosmétique."),
          compare(
            ['int (primitif)', 'Integer (objet)'],
            [
              ['Contient', 'Directement la valeur', 'Une référence vers un objet'],
              ['Peut valoir null', 'Non, jamais', 'Oui'],
              ['Valeur par défaut', '0', 'null'],
              ['Utilisable dans List<…>', 'Non', 'Oui'],
              ['Coût mémoire', 'Minimal', 'Un objet complet'],
            ],
          ),
          code(
            'java',
            `Integer age = 30;      // autoboxing : int 30 -> Integer
int valeur = age;      // unboxing  : Integer -> int 30`,
            { caption: 'Les conversions se font toutes seules' },
          ),
          why(
            'Pourquoi les classes enveloppes existent-elles ?',
            "Parce que les collections Java ne stockent que des objets. Une List<int> est impossible, il faut une List<Integer>. Les enveloppes servent aussi à représenter l’absence de valeur : un int vaut forcément quelque chose, alors qu’un Integer peut valoir null, ce qui distingue « âge inconnu » de « âge zéro ».",
          ),
          warn(
            "L’unboxing d’un null lance une NullPointerException, et la ligne fautive ne ressemble pourtant pas à un appel de méthode.",
          ),
          code(
            'java',
            `Integer total = null;
int resultat = total + 1;   // NullPointerException ici`,
            { caption: 'Le piège classique' },
          ),
          warn(
            "Ne compare jamais deux Integer avec ==. L’opérateur compare les références, pas les valeurs. Java met en cache les Integer de -128 à 127, si bien que la comparaison semble marcher sur de petits nombres puis échoue au-delà. Utilise equals, ou compare les valeurs primitives.",
          ),
          code(
            'java',
            `Integer a = 127, b = 127;
System.out.println(a == b);        // true  — valeurs mises en cache
Integer c = 128, d = 128;
System.out.println(c == d);        // false — deux objets distincts
System.out.println(c.equals(d));   // true  — la bonne façon de comparer`,
            { caption: 'La comparaison qui ment', runnable: true },
          ),
          question(
            'Quand choisir int et quand choisir Integer ?',
            "int par défaut : c’est plus rapide, plus léger, et impossible à confondre avec null. Integer uniquement quand tu en as besoin : pour ranger la valeur dans une collection, ou pour représenter une absence de valeur.",
          ),
          quiz('java-q-wrapper-1'),
          quiz('java-q-wrapper-2'),
          memorize('java-d-autoboxing'),
        ],
      },
    ],
  },

  /* ---------------------- 5. Opérateurs ------------------------------ */
  {
    id: 'java-ch05-operateurs',
    title: '5. Opérateurs',
    description: 'Calculer, comparer, combiner des conditions.',
    lessons: [
      {
        id: 'java-l-operateurs',
        title: 'Arithmétique et affectation',
        summary: 'Les calculs, les raccourcis, et la division entière qui surprend.',
        minutes: 7,
        difficulty: 'facile',
        requires: ['java-l-types-primitifs'],
        concepts: ['opérateurs'],
        blocks: [
          code(
            'java',
            `int a = 7, b = 2;

System.out.println(a + b);   // 9
System.out.println(a - b);   // 5
System.out.println(a * b);   // 14
System.out.println(a / b);   // 3   <- division entière
System.out.println(a % b);   // 1   <- le reste`,
            { caption: 'Les cinq opérateurs arithmétiques', runnable: true },
          ),
          warn(
            "7 / 2 vaut 3 et non 3,5. Quand les deux opérandes sont des entiers, Java fait une division entière et jette la partie décimale. Pour obtenir 3,5, au moins un opérande doit être un nombre à virgule : 7.0 / 2, ou (double) a / b.",
          ),
          code(
            'java',
            `int vitesse = 50;
vitesse += 10;   // équivaut à vitesse = vitesse + 10;  -> 60
vitesse -= 5;    // -> 55
vitesse++;       // -> 56
vitesse--;       // -> 55`,
            { caption: 'Les raccourcis d’affectation' },
          ),
          codeExplain([
            ['vitesse += 10;', 'Lit la valeur, ajoute 10, réécrit le résultat dans la même variable. Strictement équivalent à vitesse = vitesse + 10.'],
            ['vitesse++;', 'Incrémente de 1. En version postfixée, la valeur renvoyée est celle d’avant l’incrément.'],
            ['++vitesse;', 'Incrémente aussi de 1, mais renvoie la valeur d’après. La différence ne compte que si tu utilises le résultat.'],
          ]),
          code(
            'java',
            `int x = 5;
System.out.println(x++);   // affiche 5, puis x vaut 6
int y = 5;
System.out.println(++y);   // y vaut 6, puis affiche 6`,
            { caption: 'x++ contre ++x', runnable: true },
          ),
          question(
            'Que vaut 10 % 3, et à quoi sert cet opérateur ?',
            "10 % 3 vaut 1, le reste de la division entière. On l’utilise surtout pour tester la divisibilité : n % 2 == 0 dit que n est pair, et n % 15 == 0 qu’il est divisible par 15.",
          ),
          quiz('java-q-operateurs-1'),
          quiz('java-q-operateurs-2'),
        ],
      },
      {
        id: 'java-l-comparaison-logique',
        title: 'Comparaison et logique',
        summary: 'Les opérateurs qui produisent un booléen, et l’évaluation paresseuse.',
        minutes: 7,
        difficulty: 'facile',
        requires: ['java-l-operateurs'],
        concepts: ['opérateurs', 'booléen'],
        blocks: [
          code(
            'java',
            `int age = 20;

boolean majeur      = age >= 18;    // true
boolean exactement  = age == 20;    // true
boolean different   = age != 20;    // false

boolean etudiantMajeur = age >= 18 && age <= 25;   // ET
boolean tarifReduit    = age < 18  || age >= 65;   // OU
boolean mineur         = !majeur;                  // NON`,
            { caption: 'Comparer, puis combiner' },
          ),
          keypoints([
            '== teste l’égalité, = affecte une valeur. Les confondre est l’erreur numéro un.',
            '&& est vrai si les deux côtés sont vrais ; || est vrai si au moins un l’est.',
            '! inverse un booléen.',
            'Sur des objets, == compare les références. Pour comparer des contenus, utilise equals.',
          ]),
          why(
            'Pourquoi && s’arrête-t-il dès que le premier test est faux ?',
            "C’est l’évaluation paresseuse, et elle est utilisable comme protection. Dans if (nom != null && nom.length() > 3), si nom vaut null le premier test est faux, donc Java n’évalue jamais le second — et l’appel à length() sur null n’a pas lieu. Inverser les deux tests provoquerait une NullPointerException.",
          ),
          code(
            'java',
            `String nom = null;
if (nom != null && nom.length() > 3) {   // sûr
    System.out.println("Nom long");
}`,
            { caption: 'Le garde-fou le plus utilisé de Java' },
          ),
          question(
            'Pourquoi ne faut-il pas comparer deux String avec == ?',
            "Parce que == demande « est-ce le même objet en mémoire ? » et non « ont-elles le même contenu ? ». Deux chaînes construites séparément peuvent contenir le même texte tout en étant deux objets distincts. equals compare les contenus, c’est celui qu’il faut.",
          ),
          quiz('java-q-logique-1'),
        ],
      },
    ],
  },

  /* ---------------------- 6. Conditions ------------------------------ */
  {
    id: 'java-ch06-conditions',
    title: '6. Conditions',
    description: 'Faire prendre une décision au programme.',
    lessons: [
      {
        id: 'java-l-conditions',
        title: 'if, else if, else',
        summary: 'Brancher le programme selon une condition, sans empiler les niveaux.',
        minutes: 7,
        difficulty: 'facile',
        requires: ['java-l-comparaison-logique'],
        concepts: ['conditions'],
        blocks: [
          code(
            'java',
            `int note = 14;

if (note >= 16) {
    System.out.println("Très bien");
} else if (note >= 12) {
    System.out.println("Bien");
} else {
    System.out.println("À revoir");
}`,
            { caption: 'Une chaîne de décisions', runnable: true },
          ),
          codeExplain([
            ['if (note >= 16)', 'La condition doit produire un booléen. Contrairement à d’autres langages, un entier n’est pas accepté ici.'],
            ['else if (note >= 12)', 'Testé seulement si la condition précédente était fausse. L’ordre compte donc énormément.'],
            ['else', 'Le cas restant, sans condition. Facultatif.'],
          ]),
          warn(
            "L’ordre des branches est une règle, pas un détail. Placer if (note >= 12) avant if (note >= 16) rendrait la seconde branche inatteignable : une note de 18 satisferait déjà la première.",
          ),
          tip("Les accolades sont facultatives sur une instruction unique, mais mets-les toujours. Sans elles, ajouter une deuxième ligne plus tard change silencieusement le sens du code."),
          badGood({
            language: 'java',
            title: 'Aplatir plutôt qu’imbriquer',
            bad: `if (utilisateur != null) {
    if (utilisateur.estActif()) {
        if (utilisateur.aDroit()) {
            traiter(utilisateur);
        }
    }
}`,
            good: `if (utilisateur == null) return;
if (!utilisateur.estActif()) return;
if (!utilisateur.aDroit()) return;

traiter(utilisateur);`,
            why: "La version de droite sort tôt sur chaque cas d’échec. Le cas normal reste au premier niveau d’indentation, et ajouter une condition n’enfonce pas le code d’un cran de plus. On appelle cela des clauses de garde.",
          }),
          question(
            'Que fait if (x = 5) en Java ?',
            "Il ne compile pas, et c’est une bonne nouvelle. x = 5 est une affectation qui produit un int, alors que if exige un boolean. En C ce code passerait et serait toujours vrai ; Java refuse ce piège à la compilation.",
          ),
          quiz('java-q-conditions-1'),
          quiz('java-q-conditions-2'),
        ],
      },
      {
        id: 'java-l-switch',
        title: 'switch et opérateur ternaire',
        summary: 'Comparer une valeur à plusieurs cas, et écrire une condition en une ligne.',
        minutes: 7,
        difficulty: 'moyen',
        requires: ['java-l-conditions'],
        concepts: ['conditions', 'switch'],
        blocks: [
          code(
            'java',
            `String jour = "MARDI";

switch (jour) {
    case "SAMEDI":
    case "DIMANCHE":
        System.out.println("Week-end");
        break;
    case "MARDI":
        System.out.println("Semaine");
        break;
    default:
        System.out.println("Jour inconnu");
}`,
            { caption: 'switch classique', runnable: true },
          ),
          warn(
            "Sans break, l’exécution continue dans le cas suivant. C’est parfois voulu — les deux cas week-end ci-dessus partagent volontairement leur traitement — mais un break oublié est un bug silencieux.",
          ),
          text("Depuis Java 14, la forme à flèche supprime ce piège : il n’y a plus de break, et chaque cas est isolé."),
          code(
            'java',
            `String type = switch (jour) {
    case "SAMEDI", "DIMANCHE" -> "Week-end";
    case "MARDI"              -> "Semaine";
    default                   -> "Jour inconnu";
};`,
            { caption: 'switch en expression, depuis Java 14' },
          ),
          codeExplain([
            ['String type = switch (jour) {', 'Le switch produit ici une valeur au lieu d’exécuter des instructions : c’est une expression.'],
            ['case "SAMEDI", "DIMANCHE" ->', 'Plusieurs valeurs sur un même cas, séparées par des virgules.'],
            ['-> "Week-end";', 'La flèche renvoie directement la valeur. Aucun break n’est nécessaire, aucune chute dans le cas suivant n’est possible.'],
          ]),
          code(
            'java',
            `String mention = note >= 12 ? "Admis" : "Recalé";`,
            { caption: 'L’opérateur ternaire : condition ? valeur si vrai : valeur si faux' },
          ),
          tip("Le ternaire est excellent pour choisir entre deux valeurs. Dès qu’il faut trois cas ou une instruction, repasse à if : un ternaire imbriqué devient illisible."),
          quiz('java-q-switch-1'),
        ],
      },
    ],
  },

  /* ---------------------- 7. Boucles --------------------------------- */
  {
    id: 'java-ch07-boucles',
    title: '7. Boucles',
    description: 'Répéter un traitement sans réécrire le code.',
    lessons: [
      {
        id: 'java-l-boucles',
        title: 'for, while, do while',
        summary: 'Les trois formes de répétition et le critère pour choisir.',
        minutes: 8,
        difficulty: 'facile',
        requires: ['java-l-conditions'],
        concepts: ['boucles'],
        blocks: [
          code(
            'java',
            `for (int i = 0; i < 5; i++) {
    System.out.println("Tour " + i);
}`,
            { caption: 'for : quand le nombre de tours est connu', runnable: true },
          ),
          codeExplain([
            ['int i = 0', 'Initialisation, exécutée une seule fois avant le premier tour.'],
            ['i < 5', 'Condition testée avant chaque tour. Dès qu’elle est fausse, la boucle s’arrête.'],
            ['i++', 'Exécuté à la fin de chaque tour. C’est ce qui fait avancer la boucle vers sa fin.'],
          ]),
          code(
            'java',
            `int reste = 3;
while (reste > 0) {
    System.out.println("Il reste " + reste);
    reste--;
}`,
            { caption: 'while : quand le nombre de tours dépend d’une condition', runnable: true },
          ),
          code(
            'java',
            `int essai = 0;
do {
    essai++;
} while (essai < 3);`,
            { caption: 'do while : le corps s’exécute au moins une fois' },
          ),
          compare(
            ['for', 'while'],
            [
              ['À utiliser quand', 'Le nombre de tours est connu', 'On répète tant qu’une condition tient'],
              ['Compteur', 'Déclaré dans la boucle', 'Géré à la main autour'],
              ['Exemple typique', 'Parcourir 10 éléments', 'Lire jusqu’à la fin d’un fichier'],
            ],
          ),
          warn(
            "Une boucle infinie arrive quand la condition ne devient jamais fausse — souvent parce qu’on a oublié de faire avancer le compteur. Vérifie toujours que quelque chose, dans le corps, rapproche la boucle de sa fin.",
          ),
          text("Pour parcourir une collection, la boucle for-each est plus courte et supprime le risque d’erreur d’indice."),
          code(
            'java',
            `String[] noms = { "Said", "Ali", "Samir" };

for (String nom : noms) {
    System.out.println(nom);
}`,
            { caption: 'for-each : « pour chaque nom parmi noms »', runnable: true },
          ),
          question(
            'Quand faut-il préférer for-each à for classique ?',
            "Dès que tu veux simplement voir chaque élément. for-each supprime l’indice, donc supprime les débordements et les erreurs de borne. Garde le for classique quand tu as besoin de l’indice lui-même, ou quand tu parcours à l’envers ou de deux en deux.",
          ),
          exercise({
            title: 'Somme des nombres pairs',
            statement: 'Affiche la somme des nombres pairs de 1 à 20 inclus.',
            language: 'java',
            starterCode: `public class Main {
    public static void main(String[] args) {
        int somme = 0;
        // à toi de jouer
        System.out.println(somme);
    }
}`,
            hint: 'Parcours de 1 à 20 et teste i % 2 == 0.',
            solution: `public class Main {
    public static void main(String[] args) {
        int somme = 0;
        for (int i = 1; i <= 20; i++) {
            if (i % 2 == 0) {
                somme += i;
            }
        }
        System.out.println(somme);   // 110
    }
}`,
          }),
          quiz('java-q-boucles-1'),
          quiz('java-q-boucles-2'),
        ],
      },
      {
        id: 'java-l-break-continue',
        title: 'break et continue',
        summary: 'Sortir d’une boucle ou sauter un tour, sans casser la lisibilité.',
        minutes: 5,
        difficulty: 'facile',
        requires: ['java-l-boucles'],
        concepts: ['boucles'],
        blocks: [
          code(
            'java',
            `for (int i = 1; i <= 10; i++) {
    if (i % 2 != 0) {
        continue;      // saute les impairs, passe au tour suivant
    }
    if (i > 6) {
        break;         // arrête complètement la boucle
    }
    System.out.println(i);   // affiche 2, 4, 6
}`,
            { caption: 'Les deux mots-clés, côte à côte', runnable: true },
          ),
          keypoints([
            'continue abandonne le tour en cours et passe au suivant.',
            'break sort de la boucle entièrement.',
            'Les deux ne concernent que la boucle la plus proche, pas celles qui l’englobent.',
          ]),
          tip("Un continue en début de boucle joue le même rôle qu’une clause de garde dans une méthode : il écarte les cas à ignorer et laisse le traitement principal bien lisible en dessous."),
          quiz('java-q-break-1'),
        ],
      },
    ],
  },

  /* ---------------------- 8. Méthodes -------------------------------- */
  {
    id: 'java-ch08-methodes',
    title: '8. Méthodes',
    description: 'Nommer un traitement pour le réutiliser.',
    lessons: [
      {
        id: 'java-l-methodes',
        title: 'Déclarer une méthode',
        summary: 'Type de retour, nom, paramètres, corps : les quatre parties d’une signature.',
        minutes: 8,
        difficulty: 'facile',
        requires: ['java-l-boucles'],
        concepts: ['méthode'],
        definitions: [
          {
            id: 'java-d-methode',
            title: 'Méthode',
            text: "Une méthode est un bloc de code nommé qui représente une action ou un comportement. Elle reçoit éventuellement des paramètres, exécute un traitement, et renvoie éventuellement une valeur dont le type est déclaré avant son nom.",
            tags: ['java', 'méthode'],
          },
        ],
        blocks: [
          def(
            'Méthode',
            "Une méthode est un bloc de code nommé qui représente une action ou un comportement. Elle reçoit éventuellement des paramètres, exécute un traitement, et renvoie éventuellement une valeur dont le type est déclaré avant son nom.",
          ),
          code(
            'java',
            `public static int addition(int a, int b) {
    return a + b;
}`,
            { caption: 'Une méthode complète' },
          ),
          codeExplain([
            ['public', 'La visibilité : qui a le droit d’appeler cette méthode.'],
            ['static', 'Appelable sur la classe, sans créer d’objet.'],
            ['int', 'Le type de retour. Ici la méthode renvoie un entier ; void signifierait qu’elle ne renvoie rien.'],
            ['addition', 'Le nom. Par convention un verbe ou une action, en minuscule initiale.'],
            ['(int a, int b)', 'Les paramètres : les valeurs que la méthode reçoit pour travailler.'],
            ['return a + b;', 'Renvoie le résultat et termine immédiatement la méthode.'],
          ]),
          why(
            'Pourquoi découper le code en méthodes ?',
            "Pour trois gains simultanés. Ne pas répéter : le traitement est écrit une fois et appelé partout. Nommer : calculerTva(montant) explique son intention, alors que trois lignes de calcul obligent à les déchiffrer. Tester : une méthode isolée se vérifie seule, alors qu’un bloc noyé dans un autre ne se teste pas.",
          ),
          code(
            'java',
            `int resultat = addition(3, 4);   // resultat vaut 7`,
            { caption: 'Appeler la méthode' },
          ),
          text("Une méthode qui ne renvoie rien se déclare void — elle agit sans produire de valeur."),
          code(
            'java',
            `public static void saluer(String nom) {
    System.out.println("Bonjour " + nom);
}`,
            { caption: 'Une méthode void' },
          ),
          question(
            'Quelle différence entre un paramètre et un argument ?',
            "Le paramètre est le nom déclaré dans la signature — le a de int a. L’argument est la valeur réellement passée à l’appel — le 3 de addition(3, 4). Le paramètre est le contenant, l’argument le contenu.",
          ),
          warn("Une méthode dont le type de retour n’est pas void doit renvoyer une valeur sur tous ses chemins d’exécution. Un return oublié dans une branche du if provoque l’erreur « missing return statement »."),
          quiz('java-q-methodes-1'),
          quiz('java-q-methodes-2'),
          memorize('java-d-methode'),
        ],
      },
      {
        id: 'java-l-surcharge',
        title: 'Surcharge et portée des variables',
        summary: 'Plusieurs méthodes de même nom, et jusqu’où une variable existe.',
        minutes: 7,
        difficulty: 'moyen',
        requires: ['java-l-methodes'],
        concepts: ['méthode', 'surcharge'],
        blocks: [
          def(
            'Surcharge',
            "La surcharge consiste à déclarer plusieurs méthodes portant le même nom mais recevant des paramètres différents. Le compilateur choisit laquelle appeler d'après les types et le nombre d'arguments fournis.",
          ),
          code(
            'java',
            `public static int addition(int a, int b) {
    return a + b;
}

public static double addition(double a, double b) {
    return a + b;
}

public static int addition(int a, int b, int c) {
    return a + b + c;
}`,
            { caption: 'Trois méthodes, un seul nom' },
          ),
          why(
            'Pourquoi surcharger plutôt que nommer differemment ?',
            "Parce que ces méthodes font la même chose conceptuellement. Les appeler additionInt, additionDouble et additionTrois obligerait celui qui appelle à retenir trois noms pour une seule idée. La surcharge laisse le compilateur choisir : tu écris addition, il trouve la bonne version.",
          ),
          warn(
            "Le type de retour ne suffit pas à distinguer deux surcharges. Déclarer int calculer() et double calculer() ne compile pas : à l’appel, rien ne permettrait de choisir.",
          ),
          text("La portée d’une variable, c’est la zone où son nom existe. En Java, elle est délimitée par les accolades qui l’entourent."),
          code(
            'java',
            `public static void demo() {
    int total = 0;

    for (int i = 0; i < 3; i++) {
        int double_ = i * 2;   // n'existe que dans la boucle
        total += double_;
    }

    // System.out.println(i);        // erreur : i n'existe plus
    System.out.println(total);       // 6 — total vit dans toute la méthode
}`,
            { caption: 'Chaque accolade ouvre une portée' },
          ),
          question(
            'Modifier un paramètre dans une méthode change-t-il la variable de l’appelant ?',
            "Non. Java passe toujours une copie de la valeur. Réaffecter le paramètre ne touche pas la variable d’origine. Attention toutefois : quand l’argument est un objet, c’est la référence qui est copiée — tu ne peux pas faire pointer l’appelant ailleurs, mais tu peux très bien modifier l’objet qu’il partage.",
          ),
          quiz('java-q-surcharge-1'),
        ],
      },
    ],
  },

];

export const debutantChapters = chapters;

export const debutantCourse: CourseSpec = {
  id: 'java-c1-debutant',
  pathId: 'java-path-debutant',
  title: 'Java — Débutant',
  description: 'De « qu’est-ce que Java » aux méthodes : la syntaxe, une notion à la fois.',
  icon: '☕',
  level: 'debutant',
  tags: ['java', 'bases', 'syntaxe'],
  chapters,
};
