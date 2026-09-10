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
  techDef,
  text,
  tip,
  warn,
  why,
} from '../builders';

/* =====================================================================
   Cours 2 - Java Objet
   Chapitres 9 à 17 : de la classe aux interfaces.
   ===================================================================== */

const chapters: ChapterSpec[] = [
  /* ---------------------- 9. Classes et objets ----------------------- */
  {
    id: 'java-ch09-classes-objets',
    title: '9. Classes et objets',
    description: 'Organiser un programme autour d’objets plutôt que d’instructions isolées.',
    lessons: [
      {
        id: 'java-l-poo',
        title: 'La programmation orientée objet',
        summary: 'Regrouper des données et les comportements qui agissent dessus.',
        minutes: 8,
        difficulty: 'facile',
        requires: ['java-l-methodes'],
        concepts: ['POO'],
        definitions: [
          {
            id: 'java-d-poo',
            title: 'Programmation orientée objet',
            text: "La programmation orientée objet est une manière d'organiser un programme autour d'objets. Un objet regroupe des données, appelées attributs, et des comportements, appelés méthodes. Les comportements agissent sur les données du même objet.",
            tags: ['java', 'poo'],
          },
        ],
        blocks: [
          def(
            'Programmation orientée objet',
            "La programmation orientée objet est une manière d'organiser un programme autour d'objets. Un objet regroupe des données, appelées attributs, et des comportements, appelés méthodes. Les comportements agissent sur les données du même objet.",
          ),
          example(
            "Prends une voiture. Ses données : une marque, une couleur, une vitesse. Ses comportements : démarrer, accélérer, freiner. L’objet voiture réunit les deux — et ce n’est pas un hasard, car accélérer n’a de sens que par rapport à la vitesse de cette voiture-là.",
          ),
          code(
            'java',
            `public class Voiture {

    String marque;
    String couleur;
    int vitesse;

    void accelerer() {
        vitesse = vitesse + 10;
    }
}`,
            { caption: 'Données et comportement dans la même classe' },
          ),
          codeExplain([
            ['String marque;', 'Un attribut. Il est déclaré dans la classe, hors de toute méthode : il décrit l’état de l’objet et vit aussi longtemps que lui.'],
            ['int vitesse;', 'Autre attribut. Chaque voiture créée aura sa propre vitesse, indépendante de celle des autres.'],
            ['void accelerer() {', 'Une méthode d’instance : elle s’exécute sur un objet précis.'],
            ['vitesse = vitesse + 10;', 'La méthode lit et modifie vitesse sans qu’on ait à la lui passer, parce qu’elle travaille sur l’objet auquel elle appartient.'],
          ]),
          why(
            'Pourquoi les attributs sont-ils déclarés dans la classe, et pourquoi accelerer peut-elle modifier vitesse ?',
            "Parce qu’un attribut déclaré dans la classe appartient à l’objet, pas à une méthode. Une variable locale à accelerer disparaîtrait à la fin de l’appel ; vitesse, elle, doit survivre entre deux accélérations. Et si accelerer peut la modifier sans la recevoir en paramètre, c’est que toute méthode d’instance a un accès direct aux attributs de l’objet sur lequel on l’appelle. Écrire maVoiture.accelerer() revient à dire « accélère, toi, avec ta propre vitesse ».",
          ),
          text(
            "Sans objets, il faudrait promener les données à la main : accelerer(vitesse) devrait renvoyer la nouvelle vitesse, et l’appelant devrait penser à la stocker. Avec un objet, l’état reste où il doit être.",
          ),
          question(
            'Que se passerait-il si vitesse était déclarée à l’intérieur de accelerer ?',
            "Elle serait recréée à zéro à chaque appel puis détruite à la fin. Accélérer deux fois de suite ne cumulerait rien : la voiture n’aurait aucune mémoire de sa vitesse.",
          ),
          quiz('java-q-poo-1'),
          memorize('java-d-poo'),
        ],
      },
      {
        id: 'java-l-classes',
        title: 'Classe et objet',
        summary: 'Le modèle d’un côté, les exemplaires de l’autre.',
        minutes: 8,
        difficulty: 'facile',
        requires: ['java-l-poo'],
        concepts: ['classe', 'objet'],
        definitions: [
          {
            id: 'java-d-classe',
            title: 'Classe',
            text: "Une classe est un modèle qui décrit les caractéristiques et les comportements d'un objet. Elle ne contient aucune valeur : elle dit seulement quelles données un objet possédera et ce qu'il saura faire.",
            tags: ['java', 'poo'],
          },
          {
            id: 'java-d-objet',
            title: 'Objet',
            text: "Un objet est une instance d'une classe. Il est créé avec le mot-clé new, il occupe sa propre place en mémoire, et il possède ses propres valeurs pour chaque attribut décrit par la classe.",
            tags: ['java', 'poo'],
          },
        ],
        blocks: [
          def(
            'Classe',
            "Une classe est un modèle qui décrit les caractéristiques et les comportements d'un objet. Elle ne contient aucune valeur : elle dit seulement quelles données un objet possédera et ce qu'il saura faire.",
          ),
          code(
            'java',
            `public class Personne {

    String nom;
    int age;

    void sePresenter() {
        System.out.println("Bonjour, je m'appelle " + nom);
    }
}`,
            { caption: 'Une classe : le plan' },
          ),
          codeExplain([
            ['public class Personne', 'La classe. C’est le modèle, le plan de construction.'],
            ['String nom;', 'Un attribut : une caractéristique que chaque personne possédera.'],
            ['int age;', 'Un second attribut.'],
            ['void sePresenter()', 'Une méthode : un comportement que chaque personne saura exécuter.'],
          ]),
          def(
            'Objet',
            "Un objet est une instance d'une classe. Il est créé avec le mot-clé new, il occupe sa propre place en mémoire, et il possède ses propres valeurs pour chaque attribut décrit par la classe.",
          ),
          code(
            'java',
            `Personne personne1 = new Personne();

personne1.nom = "Said";
personne1.age = 30;

personne1.sePresenter();   // Bonjour, je m'appelle Said`,
            { caption: 'Un objet : un exemplaire réel' },
          ),
          codeExplain([
            ['Personne', 'Le type de la variable. Il annonce ce que la variable pourra contenir.'],
            ['personne1', 'La variable de référence. Elle ne contient pas l’objet lui-même, mais son adresse en mémoire.'],
            ['new Personne()', 'La création : la JVM réserve la mémoire, initialise les attributs et renvoie la référence vers le nouvel objet.'],
            ['personne1.nom = "Said";', 'On accède à l’attribut de cet objet précis et on lui donne une valeur.'],
          ]),
          example(
            "La classe est le plan de l’architecte ; les objets sont les maisons bâties d’après ce plan. Un seul plan, autant de maisons que l’on veut, chacune avec sa propre couleur de façade.",
          ),
          code(
            'java',
            `Personne p1 = new Personne();
Personne p2 = new Personne();

p1.nom = "Said";
p2.nom = "Ali";

System.out.println(p1.nom);   // Said — p2 n'a rien changé chez p1`,
            { caption: 'Deux objets, deux états indépendants', runnable: true },
          ),
          why(
            'Pourquoi séparer la classe et l’objet ?',
            "Parce que tu écris la description une seule fois et que tu en fabriques autant d’exemplaires que nécessaire. Ajouter un attribut à la classe l’ajoute d’un coup à tous les objets, présents et futurs. Sans cette séparation, il faudrait redécrire la structure à chaque nouvelle personne.",
          ),
          question(
            'Combien d’objets et combien de classes dans Personne p1 = new Personne(); Personne p2 = new Personne(); ?',
            "Une seule classe, Personne, et deux objets distincts. Chacun a ses propres valeurs de nom et age ; modifier p1 ne touche jamais p2.",
          ),
          warn("Déclarer Personne p; ne crée aucun objet : la variable vaut null. Appeler p.sePresenter() lance alors une NullPointerException. C’est new qui crée l’objet."),
          quiz('java-q-classe-1'),
          quiz('java-q-objet-1'),
          memorize('java-d-classe'),
          memorize('java-d-objet'),
        ],
      },
    ],
  },

  /* ---------------------- 10. Attributs ------------------------------ */
  {
    id: 'java-ch10-attributs',
    title: '10. Attributs',
    description: 'L’état d’un objet : où il vit, et qui le possède.',
    lessons: [
      {
        id: 'java-l-attributs',
        title: 'Attributs d’instance et attributs statiques',
        summary: 'Ce qui appartient à chaque objet, et ce qui appartient à la classe entière.',
        minutes: 8,
        difficulty: 'moyen',
        requires: ['java-l-classes'],
        concepts: ['attribut', 'static'],
        definitions: [
          {
            id: 'java-d-attribut',
            title: 'Attribut',
            text: "Un attribut est une variable déclarée dans une classe qui représente l'état d'un objet. Chaque objet créé possède sa propre copie des attributs d'instance, indépendante de celle des autres objets.",
            tags: ['java', 'poo'],
          },
        ],
        blocks: [
          def(
            'Attribut',
            "Un attribut est une variable déclarée dans une classe qui représente l'état d'un objet. Chaque objet créé possède sa propre copie des attributs d'instance, indépendante de celle des autres objets.",
          ),
          code(
            'java',
            `class Voiture {
    String marque;
    int vitesse;
}`,
            { caption: 'Deux attributs d’instance' },
          ),
          why(
            'Pourquoi chaque voiture a-t-elle sa propre marque et sa propre vitesse ?',
            "Parce qu’un attribut d’instance est stocké dans l’objet lui-même, pas dans la classe. Quand tu écris new Voiture(), la JVM réserve un emplacement mémoire distinct qui contient sa marque et sa vitesse à elle. Deux voitures ne partagent donc rien : accélérer l’une laisse l’autre immobile. Sans cela, toutes les voitures du programme rouleraient à la même vitesse, ce qui n’aurait aucun sens.",
          ),
          text("Un attribut déclaré static, au contraire, appartient à la classe. Il existe en un seul exemplaire, partagé par tous les objets."),
          code(
            'java',
            `class Voiture {
    static int nombreDeVoitures = 0;   // partagé par tous
    String marque;                     // propre à chaque objet

    Voiture(String marque) {
        this.marque = marque;
        nombreDeVoitures++;
    }
}`,
            { caption: 'Un compteur partagé' },
          ),
          compare(
            ['Attribut d’instance', 'Attribut static'],
            [
              ['Appartient à', 'Chaque objet', 'La classe'],
              ['Nombre d’exemplaires', 'Un par objet', 'Un seul, pour tout le programme'],
              ['Accès', 'objet.attribut', 'Classe.attribut'],
              ['Exemple', 'La vitesse d’une voiture', 'Le nombre total de voitures créées'],
            ],
          ),
          keypoints([
            'Un attribut non initialisé prend une valeur par défaut : 0 pour les nombres, false pour boolean, null pour les objets.',
            'C’est une différence avec les variables locales, qui doivent être initialisées avant d’être lues.',
            'static ne veut pas dire constant : un attribut static peut changer. C’est final qui interdit la réaffectation.',
            'static final ensemble donnent une vraie constante partagée, nommée en majuscules par convention.',
          ]),
          warn(
            "Un attribut static mutable est partagé par tout le programme, donc par tous les threads. C’est une source classique de bugs difficiles à reproduire dans une application serveur. Réserve static aux constantes et aux compteurs volontairement globaux.",
          ),
          question(
            'Une méthode static peut-elle lire un attribut d’instance ?',
            "Non. Une méthode static s’exécute sur la classe, sans objet de rattachement : elle n’a aucun attribut d’instance à lire. Le compilateur refuse avec « non-static variable cannot be referenced from a static context ».",
          ),
          quiz('java-q-attribut-1'),
          quiz('java-q-attribut-2'),
          memorize('java-d-attribut'),
        ],
      },
    ],
  },

  /* ---------------------- 11. Constructeurs -------------------------- */
  {
    id: 'java-ch11-constructeurs',
    title: '11. Constructeurs',
    description: 'Créer un objet déjà valide, et comprendre this.',
    lessons: [
      {
        id: 'java-l-constructeurs',
        title: 'Le constructeur et le mot-clé this',
        summary: 'Initialiser un objet à sa création, et lever l’ambiguïté entre deux noms identiques.',
        minutes: 9,
        difficulty: 'moyen',
        requires: ['java-l-attributs'],
        concepts: ['constructeur', 'this'],
        definitions: [
          {
            id: 'java-d-constructeur',
            title: 'Constructeur',
            text: "Un constructeur est une méthode spéciale utilisée pour initialiser un objet au moment de sa création. Il porte exactement le nom de la classe, ne déclare aucun type de retour, et il est appelé automatiquement par le mot-clé new.",
            tags: ['java', 'poo'],
          },
        ],
        blocks: [
          def(
            'Constructeur',
            "Un constructeur est une méthode spéciale utilisée pour initialiser un objet au moment de sa création. Il porte exactement le nom de la classe, ne déclare aucun type de retour, et il est appelé automatiquement par le mot-clé new.",
          ),
          code(
            'java',
            `public class Personne {

    String nom;
    int age;

    public Personne(String nom, int age) {
        this.nom = nom;
        this.age = age;
    }
}`,
            { caption: 'Un constructeur à deux paramètres' },
          ),
          code(
            'java',
            `Personne p = new Personne("Said", 30);`,
            { caption: 'L’objet naît déjà complet' },
          ),
          text("Arrêtons-nous sur la ligne qui intrigue tout le monde : this.nom = nom;"),
          codeExplain([
            ['public Personne(String nom, int age)', 'Le paramètre s’appelle nom. À l’intérieur du constructeur, écrire nom tout court désigne désormais ce paramètre, pas l’attribut : le paramètre masque l’attribut.'],
            ['this', 'Une référence vers l’objet en cours de construction — « moi ».'],
            ['this.nom', 'Sans ambiguïté possible : l’attribut nom de cet objet.'],
            ['this.nom = nom;', 'Se lit « mon attribut nom reçoit la valeur du paramètre nom ». À gauche l’attribut, à droite le paramètre.'],
          ]),
          why(
            'Pourquoi deux « nom » plutôt que deux noms différents ?',
            "On pourrait écrire Personne(String unNom) et faire nom = unNom;, et cela fonctionnerait. Mais le paramètre d’un constructeur porte presque toujours le nom de l’attribut qu’il remplit, parce que c’est ce que le lecteur attend : la signature devient une documentation. this est justement l’outil qui rend cette convention possible sans ambiguïté.",
          ),
          warn(
            "Oublier this donne nom = nom;. Le code compile, mais il affecte le paramètre à lui-même : l’attribut reste à null. C’est un bug silencieux, et les outils d’analyse le signalent sous le nom de « self-assignment ».",
          ),
          text("Si tu n’écris aucun constructeur, Java en fournit un sans paramètre. Mais dès que tu en écris un, ce constructeur par défaut disparaît."),
          code(
            'java',
            `public class Personne {
    String nom;

    public Personne(String nom) {
        this.nom = nom;
    }
}

// Personne p = new Personne();   // ne compile plus`,
            { caption: 'Le constructeur par défaut n’est plus fourni' },
          ),
          why(
            'Pourquoi utiliser un constructeur plutôt que d’affecter les attributs après coup ?',
            "Pour qu’un objet ne puisse jamais exister dans un état incomplet. Avec new Personne() suivi de p.nom = ..., il existe un instant où la personne n’a pas de nom — et si quelqu’un oublie la deuxième ligne, l’objet reste cassé pour toujours. Le constructeur transforme « il faudra penser à remplir le nom » en règle vérifiée par le compilateur.",
          ),
          exercise({
            title: 'Un constructeur pour Voiture',
            statement: 'Ajoute à la classe Voiture un constructeur recevant la marque et la couleur, et initialisant la vitesse à 0.',
            language: 'java',
            starterCode: `public class Voiture {
    String marque;
    String couleur;
    int vitesse;

    // ajoute le constructeur ici
}`,
            hint: 'Le constructeur porte le nom de la classe et n’a aucun type de retour, pas même void.',
            solution: `public class Voiture {
    String marque;
    String couleur;
    int vitesse;

    public Voiture(String marque, String couleur) {
        this.marque = marque;
        this.couleur = couleur;
        this.vitesse = 0;
    }
}`,
          }),
          quiz('java-q-constructeur-1'),
          quiz('java-q-constructeur-2'),
          memorize('java-d-constructeur'),
        ],
      },
    ],
  },

  /* ---------------------- 12. Encapsulation -------------------------- */
  {
    id: 'java-ch12-encapsulation',
    title: '12. Encapsulation',
    description: 'Protéger l’état d’un objet et contrôler qui peut le changer.',
    lessons: [
      {
        id: 'java-l-encapsulation',
        title: 'Encapsuler les données',
        summary: 'private, getters, setters — et surtout la règle métier qu’ils permettent d’imposer.',
        minutes: 9,
        difficulty: 'moyen',
        requires: ['java-l-constructeurs'],
        concepts: ['encapsulation'],
        definitions: [
          {
            id: 'java-d-encapsulation',
            title: 'Encapsulation',
            text: "L'encapsulation consiste à protéger les données internes d'un objet et à contrôler leur accès. Les attributs sont déclarés private, et les seules modifications possibles passent par des méthodes publiques qui peuvent vérifier la validité de l'opération.",
            tags: ['java', 'poo'],
          },
        ],
        blocks: [
          def(
            'Encapsulation',
            "L'encapsulation consiste à protéger les données internes d'un objet et à contrôler leur accès. Les attributs sont déclarés private, et les seules modifications possibles passent par des méthodes publiques qui peuvent vérifier la validité de l'opération.",
          ),
          code(
            'java',
            `public class Compte {

    private double solde;

    public double getSolde() {
        return solde;
    }

    public void deposer(double montant) {
        if (montant > 0) {
            solde += montant;
        }
    }
}`,
            { caption: 'Un solde qu’on ne peut pas corrompre' },
          ),
          codeExplain([
            ['private double solde;', 'Personne, en dehors de la classe Compte, ne peut lire ni écrire directement ce champ.'],
            ['public double getSolde()', 'Une lecture autorisée. Le solde sort, mais rien n’entre par ici.'],
            ['public void deposer(double montant)', 'La seule porte d’entrée pour modifier le solde.'],
            ['if (montant > 0)', 'La règle métier. Elle est appliquée systématiquement, parce qu’aucun autre chemin n’existe.'],
          ]),
          why(
            'Pourquoi private double solde est-il préférable à public double solde ?',
            "Parce qu’avec un champ public, n’importe quel code du programme peut écrire compte.solde = -5000; et la classe Compte ne peut rien y faire. La règle « un solde ne se modifie que par un dépôt d’un montant positif » n’existerait que dans la tête des développeurs. En rendant le champ private, la classe redevient la seule responsable de son propre état : le compilateur garantit que tout passage se fait par deposer, donc que la vérification a bien lieu. Sans cela, il faudrait chercher dans tout le projet qui a bien pu mettre ce solde à une valeur absurde.",
          ),
          warn(
            "Un getter et un setter pour chaque attribut, sans aucune règle dedans, ne sont pas de l’encapsulation : c’est un champ public déguisé, en trois fois plus de lignes. L’encapsulation commence quand la méthode refuse quelque chose.",
          ),
          badGood({
            language: 'java',
            title: 'Encapsulation réelle ou décorative',
            bad: `public class Compte {
    private double solde;

    public void setSolde(double solde) {
        this.solde = solde;
    }
}`,
            good: `public class Compte {
    private double solde;

    public void deposer(double montant) {
        if (montant <= 0) {
            throw new IllegalArgumentException("Montant invalide");
        }
        solde += montant;
    }
}`,
            why: "À gauche, setSolde autorise exactement ce que le champ public autorisait. À droite, la méthode porte le nom de l’opération métier et impose sa règle : l’objet ne peut plus entrer dans un état invalide.",
          }),
          keypoints([
            'Les attributs sont private par défaut ; on n’ouvre que ce qui doit l’être.',
            'Un getter expose une lecture, il n’oblige pas à fournir un setter.',
            'Nomme les méthodes d’après l’opération métier (deposer, retirer) plutôt que d’après le champ (setSolde).',
            'Un objet dont l’état ne change jamais après construction est dit immuable : c’est la forme la plus sûre d’encapsulation.',
          ]),
          question(
            'Pourquoi getSolde existe-t-il alors qu’il n’y a pas de setSolde ?',
            "Parce que lire un solde est sans danger, alors que l’écrire librement casserait la cohérence du compte. L’encapsulation ne consiste pas à tout fermer, mais à n’ouvrir que ce qui est sûr.",
          ),
          quiz('java-q-encapsulation-1'),
          quiz('java-q-encapsulation-2'),
          memorize('java-d-encapsulation'),
        ],
      },
    ],
  },

  /* ---------------------- 13. Modificateurs d'accès ------------------ */
  {
    id: 'java-ch13-modificateurs',
    title: '13. Modificateurs d’accès',
    description: 'Les quatre niveaux de visibilité, et final sur les membres.',
    lessons: [
      {
        id: 'java-l-modificateurs',
        title: 'public, protected, package, private',
        summary: 'Qui a le droit de voir quoi, du plus ouvert au plus fermé.',
        minutes: 7,
        difficulty: 'moyen',
        requires: ['java-l-encapsulation'],
        concepts: ['visibilité'],
        blocks: [
          text("Java propose quatre niveaux de visibilité. Ils s’appliquent aux classes, aux attributs et aux méthodes."),
          compare(
            ['Modificateur', 'Visible depuis'],
            [
              ['public', 'Tout le programme', 'L’API que tu assumes de maintenir'],
              ['protected', 'Le package et les sous-classes', 'Ce qu’une classe fille a le droit de réutiliser'],
              ['(aucun)', 'Le package uniquement', 'Le défaut, souvent appelé package-private'],
              ['private', 'La classe elle-même', 'Tout le reste, par défaut'],
            ],
            'Du plus ouvert au plus fermé',
          ),
          code(
            'java',
            `public class Compte {
    public    String numero;    // visible partout
    protected double plafond;   // package + sous-classes
              int    agence;    // package uniquement
    private   double solde;     // classe uniquement
}`,
            { caption: 'Les quatre niveaux, sur une même classe' },
          ),
          why(
            'Pourquoi ne pas tout mettre en public, ce serait plus simple ?',
            "Parce que tout ce qui est public devient une promesse. Dès qu’un autre morceau du programme s’appuie dessus, le modifier casse son code. Ce qui est private peut être renommé, restructuré ou supprimé sans prévenir personne : c’est là que se trouve ta liberté de faire évoluer la classe. Commencer private et n’ouvrir qu’au besoin, c’est garder cette liberté aussi longtemps que possible.",
          ),
          tip("Règle pratique : déclare tout en private, puis ouvre uniquement ce qu’un autre code doit réellement appeler. Faire l’inverse — tout ouvrir puis refermer — n’arrive jamais, car on ne sait plus qui dépend de quoi."),
          text("Le mot-clé final s’applique lui aussi aux membres, avec un sens différent selon l’endroit."),
          keypoints([
            'final sur un attribut : sa valeur ne peut plus changer après le constructeur.',
            'final sur une méthode : une sous-classe ne peut plus la redéfinir.',
            'final sur une classe : on ne peut plus en hériter. String est déclarée ainsi.',
          ]),
          warn(
            "final sur une référence fige la référence, pas l’objet pointé. private final List<String> noms = new ArrayList<>(); interdit de remplacer la liste, mais autorise parfaitement noms.add(...).",
          ),
          question(
            'Pourquoi la classe String est-elle final ?',
            "Pour garantir son immuabilité. Si l’on pouvait hériter de String, une sous-classe pourrait redéfinir ses méthodes et rendre son contenu modifiable — ce qui ruinerait la sécurité et le partage de chaînes sur lesquels la JVM s’appuie.",
          ),
          quiz('java-q-visibilite-1'),
          quiz('java-q-visibilite-2'),
        ],
      },
    ],
  },
  /* ---------------------- 14. Héritage ------------------------------- */
  {
    id: 'java-ch14-heritage',
    title: '14. Héritage',
    description: 'Réutiliser une classe existante et exprimer une relation « est un ».',
    lessons: [
      {
        id: 'java-l-heritage',
        title: 'extends, classe parent et classe enfant',
        summary: 'Récupérer les attributs et méthodes d’une autre classe sans les réécrire.',
        minutes: 9,
        difficulty: 'moyen',
        requires: ['java-l-modificateurs'],
        concepts: ['héritage'],
        definitions: [
          {
            id: 'java-d-heritage',
            title: 'Héritage',
            text: "L'héritage permet à une classe enfant de récupérer les attributs et les méthodes d'une classe parent. La classe enfant peut ensuite ajouter ses propres comportements, ou redéfinir ceux qu'elle a reçus.",
            tags: ['java', 'poo'],
          },
        ],
        blocks: [
          def(
            'Héritage',
            "L'héritage permet à une classe enfant de récupérer les attributs et les méthodes d'une classe parent. La classe enfant peut ensuite ajouter ses propres comportements, ou redéfinir ceux qu'elle a reçus.",
          ),
          code(
            'java',
            `public class Animal {

    public void manger() {
        System.out.println("Je mange");
    }
}

public class Chien extends Animal {

    public void aboyer() {
        System.out.println("Wouf");
    }
}`,
            { caption: 'Une classe parent, une classe enfant' },
          ),
          code(
            'java',
            `Chien chien = new Chien();

chien.manger();   // Je mange  — hérité d'Animal
chien.aboyer();   // Wouf      — propre à Chien`,
            { caption: 'L’enfant dispose des deux', runnable: true },
          ),
          codeExplain([
            ['public class Animal', 'La classe parent, aussi appelée super-classe. Elle porte ce qui est commun.'],
            ['public void manger()', 'Un comportement commun à tous les animaux : il est écrit une seule fois.'],
            ['extends Animal', 'Le mot-clé qui établit le lien. Chien devient une sous-classe d’Animal et reçoit tout ce qu’Animal expose.'],
            ['public void aboyer()', 'Un ajout propre à Chien. Animal ne le connaît pas.'],
          ]),
          question(
            'Pourquoi chien.manger() fonctionne-t-il alors que manger n’est pas déclarée dans Chien ?',
            "Parce que Chien hérite de la méthode manger() d’Animal. Quand la JVM ne trouve pas une méthode dans la classe de l’objet, elle la cherche dans la classe parent, puis dans le parent de celle-ci, jusqu’à Object.",
          ),
          question(
            'Un Animal peut-il appeler aboyer() ?',
            "Non. aboyer() appartient à Chien. L’héritage descend : l’enfant reçoit du parent, jamais l’inverse. Animal a = new Animal(); a.aboyer(); ne compile pas.",
          ),
          why(
            'Pourquoi utiliser l’héritage ?',
            "Pour deux raisons distinctes qu’il ne faut pas confondre. La première est la réutilisation : manger() est écrite une fois et servie à Chien, Chat, Oiseau. La seconde, plus importante, est de rendre ces classes interchangeables : partout où le code attend un Animal, on peut fournir un Chien. C’est ce second point qui ouvre le polymorphisme, la notion suivante.",
          ),
          warn(
            "L’héritage n’a de sens que si la phrase « un Chien est un Animal » est vraie. Faire hériter Voiture de Moteur parce qu’une voiture a un moteur est une faute classique : c’est une relation « a un », qui se traduit par un attribut, pas par extends.",
          ),
          text("Java n’autorise l’héritage que d’une seule classe. Une classe peut en revanche implémenter autant d’interfaces qu’elle veut — on y vient au chapitre 17."),
          quiz('java-q-heritage-1'),
          quiz('java-q-heritage-2'),
          memorize('java-d-heritage'),
        ],
      },
      {
        id: 'java-l-super-object',
        title: 'super, Object, toString, equals et hashCode',
        summary: 'Remonter vers le parent, et redéfinir les trois méthodes que toute classe possède déjà.',
        minutes: 10,
        difficulty: 'difficile',
        requires: ['java-l-heritage'],
        concepts: ['héritage', 'equals', 'hashCode'],
        blocks: [
          text("Le mot-clé super désigne la classe parent. Il sert à appeler son constructeur, ou à réutiliser une méthode qu’on est en train de redéfinir."),
          code(
            'java',
            `public class Animal {
    protected String nom;

    public Animal(String nom) {
        this.nom = nom;
    }
}

public class Chien extends Animal {
    private String race;

    public Chien(String nom, String race) {
        super(nom);        // construit d'abord la partie Animal
        this.race = race;
    }
}`,
            { caption: 'super dans un constructeur' },
          ),
          codeExplain([
            ['super(nom);', 'Appelle le constructeur d’Animal. Obligatoirement la première instruction du constructeur : la partie parent doit exister avant qu’on complète la partie enfant.'],
            ['this.race = race;', 'Une fois le parent construit, l’enfant initialise ce qui lui est propre.'],
          ]),
          warn(
            "Si le parent n’a pas de constructeur sans paramètre et que l’enfant n’appelle pas super(...) explicitement, la compilation échoue. Java tente alors d’insérer super() tout seul, et ne le trouve pas.",
          ),
          text("Toute classe Java hérite implicitement d’Object, même sans extends. Trois de ses méthodes méritent presque toujours d’être redéfinies."),
          code(
            'java',
            `public class Personne {
    private final String nom;
    private final int age;

    public Personne(String nom, int age) {
        this.nom = nom;
        this.age = age;
    }

    @Override
    public String toString() {
        return "Personne{nom='" + nom + "', age=" + age + "}";
    }

    @Override
    public boolean equals(Object autre) {
        if (this == autre) return true;
        if (!(autre instanceof Personne p)) return false;
        return age == p.age && Objects.equals(nom, p.nom);
    }

    @Override
    public int hashCode() {
        return Objects.hash(nom, age);
    }
}`,
            { caption: 'Les trois méthodes d’Object, redéfinies' },
          ),
          codeExplain([
            ['@Override', 'Une annotation de sécurité : elle demande au compilateur de vérifier qu’on redéfinit bien une méthode existante. Une faute de frappe devient une erreur au lieu d’une nouvelle méthode inutile.'],
            ['toString()', 'Ce qu’affiche System.out.println(objet). Sans redéfinition, on obtient Personne@1b6d3586, illisible dans un log.'],
            ['this == autre', 'Raccourci : le même objet est forcément égal à lui-même.'],
            ['autre instanceof Personne p', 'Teste le type et déclare la variable p au passage. Cette forme est disponible depuis Java 16.'],
            ['Objects.hash(nom, age)', 'Calcule un code de hachage à partir des mêmes champs que equals. C’est la règle à ne jamais enfreindre.'],
          ]),
          why(
            'Pourquoi faut-il redéfinir hashCode dès qu’on redéfinit equals ?',
            "Parce que HashMap et HashSet cherchent en deux temps : ils calculent d’abord hashCode pour trouver le casier, puis comparent avec equals à l’intérieur. Si deux objets égaux ont des hashCode différents, ils atterrissent dans des casiers différents et ne se rencontrent jamais. Concrètement, tu ranges une clé dans une HashMap, tu la recherches avec une clé égale, et tu obtiens null. Le contrat est simple : deux objets égaux doivent avoir le même hashCode.",
          ),
          warn(
            "L’inverse n’est pas exigé : deux objets peuvent partager un hashCode sans être égaux. C’est une collision, et c’est normal — equals tranche ensuite.",
          ),
          question(
            'Que se passe-t-il si l’on redéfinit equals sans hashCode et qu’on utilise la classe comme clé de HashMap ?',
            "La recherche échoue silencieusement. Les deux objets égaux ont des hashCode différents, donc la HashMap les range dans des casiers distincts et ne trouve rien. Aucune exception n’est levée : c’est un bug muet.",
          ),
          quiz('java-q-super-1'),
          quiz('java-q-equals-1'),
        ],
      },
    ],
  },

  /* ---------------------- 15. Polymorphisme -------------------------- */
  {
    id: 'java-ch15-polymorphisme',
    title: '15. Polymorphisme',
    description: 'Un même appel, des comportements différents selon l’objet réel.',
    lessons: [
      {
        id: 'java-l-polymorphisme',
        title: 'Polymorphisme et dispatch dynamique',
        summary: 'Pourquoi une référence Animal contenant un Chien affiche « Wouf ».',
        minutes: 10,
        difficulty: 'difficile',
        requires: ['java-l-heritage'],
        concepts: ['polymorphisme'],
        definitions: [
          {
            id: 'java-d-polymorphisme',
            title: 'Polymorphisme',
            text: "Le polymorphisme permet d'utiliser une référence d'un type parent pour manipuler plusieurs types d'objets enfants. La méthode réellement exécutée est celle de l'objet, déterminée pendant l'exécution et non à la compilation.",
            tags: ['java', 'poo'],
          },
        ],
        blocks: [
          def(
            'Polymorphisme',
            "Le polymorphisme permet d'utiliser une référence d'un type parent pour manipuler plusieurs types d'objets enfants. La méthode réellement exécutée est celle de l'objet, déterminée pendant l'exécution et non à la compilation.",
          ),
          code(
            'java',
            `public class Animal {
    public void parler() {
        System.out.println("Animal");
    }
}

public class Chien extends Animal {
    @Override
    public void parler() {
        System.out.println("Wouf");
    }
}

public class Chat extends Animal {
    @Override
    public void parler() {
        System.out.println("Miaou");
    }
}`,
            { caption: 'Trois classes, une méthode redéfinie deux fois' },
          ),
          code(
            'java',
            `Animal animal = new Chien();
animal.parler();`,
            { caption: 'Le code qui étonne', runnable: true },
          ),
          text("Le résultat est : Wouf. Pas « Animal ». Voici exactement pourquoi."),
          codeExplain([
            ['Animal animal', 'Le type déclaré de la variable. Il détermine ce que le compilateur t’autorise à appeler : ici, uniquement les méthodes connues d’Animal.'],
            ['new Chien()', 'Le type réel de l’objet créé en mémoire. C’est un Chien, et il le restera quoi qu’en dise la variable qui le référence.'],
            ['animal.parler()', 'À la compilation, javac vérifie seulement qu’Animal possède bien une méthode parler(). Il ne choisit pas laquelle sera exécutée.'],
          ]),
          why(
            'Pourquoi « Wouf » et non « Animal » ? Le dispatch dynamique',
            "Parce que le choix de la méthode se fait à l’exécution, pas à la compilation. Le compilateur se contente de valider que l’appel est légal d’après le type déclaré. C’est ensuite la JVM qui, au moment de l’appel, regarde le type réel de l’objet pointé — un Chien — et cherche parler() en partant de cette classe. Elle trouve la version de Chien et l’exécute. Ce mécanisme s’appelle le dispatch dynamique, ou liaison tardive. La variable dit ce que tu as le droit de demander ; l’objet décide comment il y répond.",
          ),
          code(
            'java',
            `List<Animal> animaux = List.of(new Chien(), new Chat(), new Chien());

for (Animal a : animaux) {
    a.parler();     // Wouf, Miaou, Wouf
}`,
            { caption: 'Là où le polymorphisme devient utile', runnable: true },
          ),
          why(
            'Pourquoi c’est là que réside tout l’intérêt',
            "Cette boucle ne connaît ni Chien ni Chat. Elle ne contient aucun if sur le type. Ajouter demain une classe Oiseau qui redéfinit parler() la fait fonctionner immédiatement, sans toucher une ligne de cette boucle. Sans polymorphisme, il faudrait une cascade de if (a instanceof Chien) à modifier à chaque nouvel animal — et à modifier partout où ce test existe.",
          ),
          warn(
            "Le type déclaré limite ce que tu peux appeler. Animal animal = new Chien(); animal.aboyer(); ne compile pas, car Animal ignore aboyer(). L’objet sait aboyer, la variable ne le sait pas.",
          ),
          compare(
            ['Surcharge (overload)', 'Redéfinition (override)'],
            [
              ['Même nom', 'Oui', 'Oui'],
              ['Paramètres', 'Différents', 'Identiques'],
              ['Choix de la méthode', 'À la compilation, d’après les arguments', 'À l’exécution, d’après le type réel de l’objet'],
              ['Relation de classes', 'Aucune, même classe', 'Entre parent et enfant'],
            ],
            'Deux mécanismes qu’on confond souvent',
          ),
          question(
            'Que produit Animal a = new Chat(); a.parler(); ?',
            "Miaou. Le type déclaré Animal autorise l’appel, mais c’est le type réel — Chat — qui détermine la méthode exécutée.",
          ),
          quiz('java-q-polymorphisme-1'),
          quiz('java-q-polymorphisme-2'),
          memorize('java-d-polymorphisme'),
        ],
      },
    ],
  },

  /* ---------------------- 16. Abstraction ---------------------------- */
  {
    id: 'java-ch16-abstraction',
    title: '16. Abstraction',
    description: 'Imposer un comportement sans dire comment il est réalisé.',
    lessons: [
      {
        id: 'java-l-abstraction',
        title: 'Classes et méthodes abstraites',
        summary: 'Décrire ce que tout enfant doit savoir faire, sans l’implémenter soi-même.',
        minutes: 8,
        difficulty: 'difficile',
        requires: ['java-l-polymorphisme'],
        concepts: ['abstraction'],
        definitions: [
          {
            id: 'java-d-abstraction',
            title: 'Abstraction',
            text: "L'abstraction consiste à montrer ce qui est important tout en cachant les détails d'implémentation. Une classe abstraite déclare des méthodes sans corps, que chaque classe enfant est obligée de fournir.",
            tags: ['java', 'poo'],
          },
        ],
        blocks: [
          def(
            'Abstraction',
            "L'abstraction consiste à montrer ce qui est important tout en cachant les détails d'implémentation. Une classe abstraite déclare des méthodes sans corps, que chaque classe enfant est obligée de fournir.",
          ),
          code(
            'java',
            `public abstract class Animal {

    public abstract void parler();

    public void dormir() {
        System.out.println("Je dors");
    }
}`,
            { caption: 'Une classe abstraite mélange les deux' },
          ),
          codeExplain([
            ['abstract class Animal', 'On ne peut plus écrire new Animal(). La classe existe pour être héritée, pas instanciée.'],
            ['public abstract void parler();', 'Une méthode sans corps, terminée par un point-virgule. Toute classe enfant concrète devra la fournir.'],
            ['public void dormir() { … }', 'Une méthode ordinaire, avec son corps. Les enfants en héritent telle quelle.'],
          ]),
          code(
            'java',
            `public class Chien extends Animal {

    @Override
    public void parler() {
        System.out.println("Wouf");
    }
}`,
            { caption: 'L’enfant est obligé de fournir parler()' },
          ),
          why(
            'Pourquoi déclarer une méthode abstraite plutôt que de lui donner un corps vide ?',
            "Parce qu’un corps vide serait hérité silencieusement. Une classe Oiseau qui oublierait de redéfinir parler() compilerait sans rien dire, et resterait muette à l’exécution — un bug à chercher à la main. Déclarée abstraite, la méthode devient une obligation vérifiée par le compilateur : l’oubli devient impossible.",
          ),
          why(
            'Pourquoi interdire new Animal() ?',
            "Parce qu’un « animal » générique n’existe pas concrètement : on ne saurait pas quoi lui faire dire. La classe abstraite capture ce qui est commun sans prétendre représenter quoi que ce soit à elle seule.",
          ),
          text("Une classe abstraite peut parfaitement avoir des attributs et un constructeur : le constructeur sera appelé par ses enfants via super."),
          question(
            'Une classe abstraite peut-elle n’avoir aucune méthode abstraite ?',
            "Oui. Elle reste non instanciable, ce qui est parfois exactement le but : signaler qu’elle n’a de sens que comme base commune.",
          ),
          quiz('java-q-abstraction-1'),
          memorize('java-d-abstraction'),
        ],
      },
    ],
  },

  /* ---------------------- 17. Interfaces ----------------------------- */
  {
    id: 'java-ch17-interfaces',
    title: '17. Interfaces',
    description: 'Le contrat, et pourquoi il vaut souvent mieux que l’héritage.',
    lessons: [
      {
        id: 'java-l-interfaces',
        title: 'Interface et contrat',
        summary: 'Ce qu’une classe promet de savoir faire, indépendamment de son ascendance.',
        minutes: 9,
        difficulty: 'difficile',
        requires: ['java-l-abstraction'],
        concepts: ['interface'],
        definitions: [
          {
            id: 'java-d-interface',
            title: 'Interface',
            text: "Une interface définit un contrat que les classes peuvent implémenter. Elle énumère des méthodes sans les réaliser ; toute classe qui l'implémente s'engage à fournir ces méthodes. Une classe peut implémenter plusieurs interfaces alors qu'elle ne peut hériter que d'une seule classe.",
            tags: ['java', 'poo'],
          },
        ],
        blocks: [
          def(
            'Interface',
            "Une interface définit un contrat que les classes peuvent implémenter. Elle énumère des méthodes sans les réaliser ; toute classe qui l'implémente s'engage à fournir ces méthodes. Une classe peut implémenter plusieurs interfaces alors qu'elle ne peut hériter que d'une seule classe.",
          ),
          code(
            'java',
            `public interface Volant {
    void voler();
}

public class Oiseau implements Volant {

    @Override
    public void voler() {
        System.out.println("L'oiseau vole");
    }
}`,
            { caption: 'Un contrat, et une classe qui le respecte' },
          ),
          codeExplain([
            ['public interface Volant', 'Une interface. Elle ne décrit aucun état, seulement des capacités.'],
            ['void voler();', 'Une méthode du contrat, sans corps. Elle est implicitement public et abstract.'],
            ['implements Volant', 'L’engagement. La classe promet de fournir toutes les méthodes de l’interface, sinon elle ne compile pas.'],
          ]),
          why(
            'Pourquoi utiliser une interface ?',
            "Pour découpler ce dont ton code a besoin de la manière dont c’est fait. Une méthode qui déclare recevoir un Volant fonctionne avec un Oiseau, un Avion ou un Drone, sans rien connaître d’eux. Le jour où tu ajoutes une classe, tu n’as rien à modifier chez l’appelant. C’est aussi ce qui rend les tests praticables : on fournit une implémentation factice à la place de la vraie base de données, sans changer le code testé.",
          ),
          text("Une classe ne peut hériter que d’une seule classe, mais implémenter autant d’interfaces qu’elle veut — c’est souvent ce qui tranche."),
          code(
            'java',
            `public class Canard extends Animal implements Volant, Nageur {

    @Override public void voler() { System.out.println("Le canard vole"); }
    @Override public void nager() { System.out.println("Le canard nage"); }
}`,
            { caption: 'Une classe parent, deux contrats' },
          ),
          compare(
            ['Héritage (extends)', 'Interface (implements)'],
            [
              ['Exprime', 'Une relation « est un »', 'Une capacité « sait faire »'],
              ['Nombre possible', 'Une seule classe parent', 'Autant d’interfaces que nécessaire'],
              ['Peut porter un état', 'Oui, des attributs', 'Non, hors constantes'],
              ['Réutilise du code', 'Oui, méthodes concrètes héritées', 'Seulement via des méthodes default'],
              ['À choisir quand', 'Les classes partagent une vraie nature commune', 'Des classes sans lien doivent être interchangeables'],
            ],
            'Héritage ou interface ?',
          ),
          text("Depuis Java 8, une interface peut fournir un corps par défaut avec le mot-clé default. Cela permet d’enrichir une interface existante sans casser toutes les classes qui l’implémentent déjà."),
          code(
            'java',
            `public interface Volant {
    void voler();

    default void atterrir() {
        System.out.println("Atterrissage");
    }
}`,
            { caption: 'Une méthode default, depuis Java 8' },
          ),
          question(
            'Interface ou classe abstraite : comment choisir ?',
            "Pose-toi la question du lien. Si les classes partagent une vraie nature commune et du code d’implémentation, la classe abstraite convient. Si elles n’ont rien en commun sinon savoir faire quelque chose, c’est une interface. Dans le doute, préfère l’interface : elle n’épuise pas l’unique droit d’héritage de la classe.",
          ),
          quiz('java-q-interface-1'),
          quiz('java-q-interface-2'),
          memorize('java-d-interface'),
        ],
      },
      {
        id: 'java-l-composition',
        title: 'Composition, agrégation et SOLID',
        summary: 'Pourquoi « a un » bat souvent « est un », et les cinq principes qui en découlent.',
        minutes: 10,
        difficulty: 'expert',
        requires: ['java-l-interfaces'],
        concepts: ['composition', 'SOLID'],
        blocks: [
          techDef(
            'Composition',
            "La composition consiste à construire un objet à partir d'autres objets qu'il détient en attributs, plutôt qu'à hériter d'eux. Elle exprime une relation « a un » là où l'héritage exprime « est un ».",
          ),
          code(
            'java',
            `public class Moteur {
    public void demarrer() { System.out.println("Vroum"); }
}

public class Voiture {
    private final Moteur moteur = new Moteur();   // a un moteur

    public void demarrer() {
        moteur.demarrer();
    }
}`,
            { caption: 'Une voiture a un moteur — elle n’en est pas un' },
          ),
          why(
            'Pourquoi préférer la composition à l’héritage ?',
            "Parce que l’héritage lie définitivement l’enfant à l’implémentation du parent. Modifier une méthode du parent peut casser des enfants écrits ailleurs, sans que rien ne l’annonce. La composition, elle, ne dépend que d’une interface publique : on peut remplacer le composant sans toucher au contenant. Elle autorise aussi le changement à l’exécution — une voiture peut changer de moteur, une classe ne peut pas changer de parent.",
          ),
          keypoints([
            'Composition : le composant n’existe pas sans son contenant. Détruire la commande détruit ses lignes de commande.',
            'Agrégation : le composant survit à son contenant. Fermer une équipe ne supprime pas les personnes qui la composaient.',
            'Les deux se codent de la même façon en Java, par un attribut. La différence est dans le cycle de vie, pas dans la syntaxe.',
          ]),
          text("Les cinq principes SOLID formalisent ce que tout ce chapitre a montré en pratique."),
          compare(
            ['Principe', 'Ce qu’il demande'],
            [
              ['S — Responsabilité unique', 'Une classe n’a qu’une seule raison de changer', 'Ne mélange pas calcul métier et accès base'],
              ['O — Ouvert/fermé', 'Ouverte à l’extension, fermée à la modification', 'Ajouter Oiseau sans toucher à la boucle'],
              ['L — Substitution de Liskov', 'Un enfant doit pouvoir remplacer son parent', 'Un Chien tient partout où un Animal est attendu'],
              ['I — Ségrégation des interfaces', 'Plusieurs petites interfaces valent mieux qu’une grosse', 'Volant et Nageur séparés'],
              ['D — Inversion des dépendances', 'Dépendre d’abstractions, pas d’implémentations', 'Le service dépend d’une interface Repository'],
            ],
            'SOLID en une page',
          ),
          question(
            'Voiture doit-elle hériter de Moteur ?',
            "Non. Une voiture n’est pas un moteur, elle en a un. La bonne traduction est un attribut de type Moteur, pas un extends. Le test est toujours le même : si la phrase « X est un Y » sonne faux, l’héritage est une erreur.",
          ),
          tip("Ne cherche pas à appliquer SOLID d’emblée sur tout. Ces principes sont des remèdes à des douleurs précises ; les appliquer sans douleur produit des couches d’abstraction inutiles."),
          quiz('java-q-composition-1'),
        ],
      },
    ],
  },

];

export const objetChapters = chapters;

export const objetCourse: CourseSpec = {
  id: 'java-c2-objet',
  pathId: 'java-path-objet',
  title: 'Java — Programmation objet',
  description: 'Classes, objets, encapsulation, héritage, polymorphisme, interfaces.',
  icon: '🧩',
  level: 'debutant',
  tags: ['java', 'poo', 'objet'],
  chapters,
};
