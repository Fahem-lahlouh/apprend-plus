import type { ChapterSpec, CourseSpec } from '../builders';
import {
  badGood,
  code,
  codeExplain,
  compare,
  def,
  exercise,
  keypoints,
  memorize,
  question,
  quiz,
  steps,
  text,
  tip,
  warn,
  why,
} from '../builders';

/* =====================================================================
   Cours 3 - Java intermédiaire et moderne
   Chapitres 18 à 27 : collections, exceptions, generics, lambdas,
   streams, Optional, temps, fichiers, threads, Java 8 à 21.
   ===================================================================== */

const chapters: ChapterSpec[] = [
  /* ---------------------- 18. Collections ---------------------------- */
  {
    id: 'java-ch18-collections',
    title: '18. Collections',
    description: 'Ranger plusieurs valeurs : List, Set, Map.',
    lessons: [
      {
        id: 'java-l-collections',
        title: 'List, Set et Map',
        summary: 'Les trois familles, et le critère qui décide laquelle choisir.',
        minutes: 10,
        difficulty: 'moyen',
        requires: ['java-l-interfaces'],
        concepts: ['collections'],
        definitions: [
          {
            id: 'java-d-collection',
            title: 'Collection',
            text: "Une collection est un objet qui contient plusieurs éléments. Java en distingue trois familles : la List conserve l'ordre et accepte les doublons, le Set refuse les doublons, la Map associe une clé unique à une valeur.",
            tags: ['java', 'collections'],
          },
        ],
        blocks: [
          def(
            'Collection',
            "Une collection est un objet qui contient plusieurs éléments. Java en distingue trois familles : la List conserve l'ordre et accepte les doublons, le Set refuse les doublons, la Map associe une clé unique à une valeur.",
          ),
          code(
            'java',
            `List<String> noms = new ArrayList<>();

noms.add("Said");
noms.add("Ali");

for (String nom : noms) {
    System.out.println(nom);
}`,
            { caption: 'Une List : ordonnée, doublons acceptés', runnable: true },
          ),
          codeExplain([
            ['List<String>', 'Le type déclaré est l’interface, pas l’implémentation. Cela permet de changer d’implémentation plus tard sans toucher au reste du code.'],
            ['new ArrayList<>()', 'L’implémentation concrète. Les chevrons vides suffisent : Java déduit String du type déclaré à gauche.'],
            ['noms.add("Said")', 'Ajoute en fin de liste. L’ordre d’insertion est conservé.'],
            ['for (String nom : noms)', 'Parcours for-each : aucun indice à gérer, donc aucun débordement possible.'],
          ]),
          code(
            'java',
            `Set<String> villes = new HashSet<>();

villes.add("Paris");
villes.add("Lyon");
villes.add("Paris");     // ignoré, déjà présent

System.out.println(villes.size());   // 2`,
            { caption: 'Un Set : pas de doublon, pas d’ordre garanti', runnable: true },
          ),
          code(
            'java',
            `Map<String, Integer> ages = new HashMap<>();

ages.put("Said", 30);
ages.put("Ali", 25);

int age = ages.get("Said");   // 30`,
            { caption: 'Une Map : une clé, une valeur' },
          ),
          codeExplain([
            ['Map<String, Integer>', 'Deux types : celui de la clé d’abord, celui de la valeur ensuite.'],
            ['ages.put("Said", 30)', 'Associe la valeur 30 à la clé « Said ». Remettre la même clé écrase l’ancienne valeur.'],
            ['ages.get("Said")', 'Retrouve la valeur à partir de la clé, presque instantanément quelle que soit la taille de la map.'],
          ]),
          compare(
            ['Structure', 'À choisir quand'],
            [
              ['List', 'L’ordre compte, les doublons sont possibles', 'Un panier, un historique'],
              ['Set', 'Chaque élément doit être unique', 'Les tags d’un article, des identifiants vus'],
              ['Map', 'On cherche par clé', 'Un annuaire, un cache, un compteur par catégorie'],
            ],
            'Le critère de choix',
          ),
          why(
            'Pourquoi utiliser une HashMap plutôt qu’une liste de paires ?',
            "Parce que la recherche ne coûte pas la même chose. Dans une liste, retrouver l’âge de « Said » oblige à parcourir les éléments un par un : sur un million d’entrées, c’est un million de comparaisons dans le pire cas. Une HashMap calcule le code de hachage de la clé, en déduit directement le casier où regarder, et compare une poignée d’éléments seulement. Le temps de recherche reste à peu près constant quelle que soit la taille.",
          ),
          warn(
            "get renvoie null quand la clé est absente. Sur une Map<String, Integer>, int age = ages.get(« inconnu »); lance une NullPointerException à l’unboxing. Utilise getOrDefault, ou teste avec containsKey.",
          ),
          text("Depuis Java 9, List.of, Set.of et Map.of créent des collections non modifiables en une ligne — pratiques pour des constantes."),
          code(
            'java',
            `List<String> noms = List.of("Said", "Ali", "Samir");
// noms.add("Karim");   // UnsupportedOperationException`,
            { caption: 'Collections figées, depuis Java 9' },
          ),
          question(
            'Quelle structure pour compter combien de fois chaque mot apparaît dans un texte ?',
            "Une Map<String, Integer> : le mot est la clé, le compteur la valeur. La méthode merge est faite pour cela : compteurs.merge(mot, 1, Integer::sum).",
          ),
          quiz('java-q-collections-1'),
          quiz('java-q-collections-2'),
          memorize('java-d-collection'),
        ],
      },
      {
        id: 'java-l-implementations',
        title: 'ArrayList ou LinkedList, HashMap en détail',
        summary: 'Ce qui se passe réellement sous l’interface, et le coût de chaque opération.',
        minutes: 9,
        difficulty: 'difficile',
        requires: ['java-l-collections'],
        concepts: ['collections', 'performance'],
        blocks: [
          compare(
            ['ArrayList', 'LinkedList'],
            [
              ['Structure interne', 'Un tableau redimensionné au besoin', 'Une chaîne de maillons liés'],
              ['Accès par indice', 'Immédiat', 'Il faut parcourir depuis le début'],
              ['Ajout en fin', 'Très rapide en moyenne', 'Très rapide'],
              ['Insertion au milieu', 'Décale tous les éléments suivants', 'Rebranche deux maillons'],
              ['Mémoire', 'Compacte', 'Un objet supplémentaire par élément'],
            ],
          ),
          tip("En pratique, choisis ArrayList par défaut. LinkedList n’est vraiment gagnante que sur des insertions et suppressions massives en tête de liste, et son surcoût mémoire annule souvent l’avantage théorique."),
          text("Comprendre le fonctionnement d’une HashMap sert bien au-delà de Java : c’est une question d’entretien récurrente."),
          steps([
            'hashCode() est appelé sur la clé et produit un entier.',
            'Cet entier est transformé en indice de casier — on parle de buckets.',
            'Si le casier est vide, la paire clé-valeur y est rangée.',
            'S’il contient déjà quelque chose, c’est une collision : equals compare les clés une à une dans ce casier.',
            'Quand un casier devient trop chargé, Java le réorganise en arbre pour que la recherche reste rapide.',
            'Quand la map se remplit trop, elle double sa capacité et redistribue tout : c’est le redimensionnement.',
          ], 'Comment une HashMap retrouve une valeur'),
          why(
            'Pourquoi une clé de HashMap devrait-elle être immuable ?',
            "Parce que le casier est choisi à l’insertion, d’après le hashCode d’alors. Si tu modifies ensuite un champ de la clé qui entre dans le calcul, son hashCode change — mais l’objet, lui, reste dans l’ancien casier. La map ira désormais chercher dans le nouveau casier et ne trouvera rien. L’entrée devient inaccessible tout en occupant de la place. C’est pourquoi String, parfaitement immuable, est la clé idéale.",
          ),
          warn(
            "Modifier une collection pendant qu’on la parcourt lève une ConcurrentModificationException. Pour supprimer en cours de route, utilise removeIf, ou un Iterator explicite et sa méthode remove.",
          ),
          badGood({
            language: 'java',
            title: 'Supprimer pendant un parcours',
            bad: `for (String nom : noms) {
    if (nom.isBlank()) {
        noms.remove(nom);   // ConcurrentModificationException
    }
}`,
            good: `noms.removeIf(nom -> nom.isBlank());`,
            why: "Le for-each s’appuie sur un itérateur qui détecte toute modification faite dans son dos et refuse de continuer. removeIf effectue la suppression à travers l’itérateur, ce qui reste cohérent.",
          }),
          quiz('java-q-hashmap-1'),
          quiz('java-q-arraylist-1'),
        ],
      },
    ],
  },

  /* ---------------------- 19. Exceptions ----------------------------- */
  {
    id: 'java-ch19-exceptions',
    title: '19. Exceptions',
    description: 'Signaler et traiter ce qui se passe mal, sans masquer le problème.',
    lessons: [
      {
        id: 'java-l-exceptions',
        title: 'try, catch, finally',
        summary: 'Intercepter une erreur d’exécution et garantir le nettoyage.',
        minutes: 9,
        difficulty: 'moyen',
        requires: ['java-l-methodes'],
        concepts: ['exceptions'],
        definitions: [
          {
            id: 'java-d-exception',
            title: 'Exception',
            text: "Une exception représente une erreur ou une situation anormale qui se produit pendant l'exécution du programme. Elle interrompt le déroulement normal et remonte la pile des appels jusqu'à ce qu'un bloc catch la traite, ou que le programme s'arrête.",
            tags: ['java', 'exceptions'],
          },
        ],
        blocks: [
          def(
            'Exception',
            "Une exception représente une erreur ou une situation anormale qui se produit pendant l'exécution du programme. Elle interrompt le déroulement normal et remonte la pile des appels jusqu'à ce qu'un bloc catch la traite, ou que le programme s'arrête.",
          ),
          code(
            'java',
            `try {

    int resultat = 10 / 0;

} catch (ArithmeticException e) {

    System.out.println("Erreur : " + e.getMessage());

} finally {

    System.out.println("Toujours exécuté");
}`,
            { caption: 'Les trois blocs', runnable: true },
          ),
          codeExplain([
            ['try {', 'Le code susceptible d’échouer. Dès qu’une exception survient, le reste du bloc est abandonné.'],
            ['catch (ArithmeticException e)', 'Attrape ce type précis d’exception. e contient le message et la pile d’appels.'],
            ['finally {', 'Exécuté dans tous les cas : succès, échec attrapé, ou même exception relancée. C’est là qu’on libère les ressources.'],
          ]),
          keypoints([
            'Plusieurs catch peuvent se succéder, du type le plus précis au plus général.',
            'catch (Exception e) attrape presque tout — et c’est rarement une bonne idée.',
            'finally s’exécute même après un return dans le try.',
            'throw lance une exception, throws l’annonce dans la signature d’une méthode.',
          ]),
          warn(
            "Un catch vide est la pire ligne de code qu’on puisse écrire. L’erreur disparaît, le programme continue dans un état incohérent, et le bug se manifestera plus tard, ailleurs, sans aucune trace de son origine.",
          ),
          badGood({
            language: 'java',
            title: 'Traiter une exception',
            bad: `try {
    traiter(commande);
} catch (Exception e) {
    // on ignore
}`,
            good: `try {
    traiter(commande);
} catch (StockInsuffisantException e) {
    log.warn("Stock insuffisant pour {}", commande.id(), e);
    notifierClient(commande);
}`,
            why: "À gauche, l’information est perdue et l’on ne sait même pas ce qui a échoué. À droite, on attrape le cas précis qu’on sait traiter, on garde la trace complète, et on prend une décision métier.",
          }),
          question(
            'Que se passe-t-il si aucun catch ne correspond à l’exception levée ?',
            "L’exception remonte à la méthode appelante, puis à la sienne, et ainsi de suite. Si personne ne l’attrape, le thread s’arrête et la JVM affiche la pile d’appels complète.",
          ),
          quiz('java-q-exception-1'),
          memorize('java-d-exception'),
        ],
      },
      {
        id: 'java-l-checked-unchecked',
        title: 'Checked et unchecked',
        summary: 'Les deux familles d’exceptions et laquelle utiliser dans ton propre code.',
        minutes: 8,
        difficulty: 'difficile',
        requires: ['java-l-exceptions'],
        concepts: ['exceptions'],
        blocks: [
          compare(
            ['Checked', 'Unchecked'],
            [
              ['Hérite de', 'Exception (hors RuntimeException)', 'RuntimeException'],
              ['Le compilateur', 'Impose de l’attraper ou de la déclarer', 'N’impose rien'],
              ['Représente', 'Un événement externe prévisible', 'Une erreur de programmation ou une règle métier violée'],
              ['Exemples', 'IOException, SQLException', 'NullPointerException, IllegalArgumentException'],
            ],
          ),
          code(
            'java',
            `// checked : le compilateur exige de traiter le cas
public String lire(Path chemin) throws IOException {
    return Files.readString(chemin);
}

// unchecked : rien n'est imposé
public void deposer(double montant) {
    if (montant <= 0) {
        throw new IllegalArgumentException("Montant invalide : " + montant);
    }
}`,
            { caption: 'Les deux familles à l’usage' },
          ),
          codeExplain([
            ['throws IOException', 'La méthode annonce qu’elle peut échouer ainsi. Tout appelant devra attraper ou propager à son tour.'],
            ['throw new IllegalArgumentException(...)', 'Lance immédiatement. throw agit, throws annonce — un s de différence, deux rôles opposés.'],
          ]),
          why(
            'Pourquoi utiliser une exception plutôt que renvoyer un code d’erreur ?',
            "Parce qu’un code d’erreur peut être ignoré, alors qu’une exception ne peut pas l’être silencieusement. Une méthode qui renvoie -1 en cas d’échec compte sur la discipline de l’appelant ; s’il oublie de tester, le programme continue avec une valeur fausse. Une exception interrompt le flot et remonte jusqu’à quelqu’un capable de décider. Elle sépare aussi le chemin normal du chemin d’erreur : le code principal reste lisible, sans un test après chaque ligne.",
          ),
          tip("Dans une application moderne, on privilégie les exceptions unchecked pour le métier. Les checked obligent chaque couche intermédiaire à les déclarer, ce qui pollue les signatures sans rien apporter quand personne ne sait quoi en faire à ce niveau."),
          warn(
            "N’utilise jamais une exception pour un cas normal. « L’utilisateur n’existe pas » lors d’une recherche n’est pas une anomalie : renvoie un Optional. Les exceptions coûtent cher, et surtout elles brouillent la lecture quand elles décrivent le comportement attendu.",
          ),
          text("Créer sa propre exception est une simple classe qui hérite de RuntimeException."),
          code(
            'java',
            `public class StockInsuffisantException extends RuntimeException {
    public StockInsuffisantException(String message) {
        super(message);
    }
}`,
            { caption: 'Une exception métier' },
          ),
          question(
            'Quelle différence entre throw et throws ?',
            "throw lance effectivement une exception, à l’intérieur du code. throws figure dans la signature de la méthode et annonce simplement qu’elle peut en lancer une, sans rien lancer par elle-même.",
          ),
          quiz('java-q-checked-1'),
          quiz('java-q-checked-2'),
        ],
      },
    ],
  },

  /* ---------------------- 20. Generics ------------------------------- */
  {
    id: 'java-ch20-generics',
    title: '20. Generics',
    description: 'Écrire du code qui marche pour n’importe quel type, sans perdre le typage.',
    lessons: [
      {
        id: 'java-l-generics',
        title: 'Les types génériques',
        summary: 'Ce que signifient les chevrons, et pourquoi ils existent.',
        minutes: 9,
        difficulty: 'difficile',
        requires: ['java-l-collections'],
        concepts: ['generics'],
        definitions: [
          {
            id: 'java-d-generics',
            title: 'Generics',
            text: "Les generics permettent de paramétrer une classe ou une méthode par un type, écrit entre chevrons. Le compilateur vérifie alors la cohérence des types, ce qui évite les conversions manuelles et déplace les erreurs de l'exécution vers la compilation.",
            tags: ['java', 'generics'],
          },
        ],
        blocks: [
          def(
            'Generics',
            "Les generics permettent de paramétrer une classe ou une méthode par un type, écrit entre chevrons. Le compilateur vérifie alors la cohérence des types, ce qui évite les conversions manuelles et déplace les erreurs de l'exécution vers la compilation.",
          ),
          badGood({
            language: 'java',
            title: 'Avant et après les generics',
            bad: `List noms = new ArrayList();
noms.add("Said");
noms.add(42);                        // accepté !

String nom = (String) noms.get(1);   // ClassCastException`,
            good: `List<String> noms = new ArrayList<>();
noms.add("Said");
// noms.add(42);                     // refusé à la compilation

String nom = noms.get(0);            // aucun cast`,
            why: "Sans generics, la liste accepte tout et l’erreur n’apparaît qu’à l’exécution, souvent loin de sa cause. Avec, le compilateur refuse l’ajout fautif immédiatement et le cast devient inutile.",
          }),
          why(
            'Pourquoi les generics existent-ils ?',
            "Pour transformer une erreur d’exécution en erreur de compilation. Une ClassCastException se découvre en production, sur un cas de données particulier ; une erreur de compilation se découvre en écrivant le code. Ils suppriment aussi les casts, qui alourdissent la lecture et qu’on finit par écrire mécaniquement sans vérifier.",
          ),
          text("On peut aussi rendre ses propres classes génériques."),
          code(
            'java',
            `public class Boite<T> {

    private T contenu;

    public void ranger(T contenu) {
        this.contenu = contenu;
    }

    public T sortir() {
        return contenu;
    }
}`,
            { caption: 'Une classe générique' },
          ),
          codeExplain([
            ['class Boite<T>', 'T est un paramètre de type. Il sera remplacé par un type réel à l’utilisation.'],
            ['private T contenu;', 'L’attribut a le type qu’on fournira, quel qu’il soit.'],
            ['public T sortir()', 'Le retour est correctement typé : aucun cast n’est nécessaire chez l’appelant.'],
          ]),
          code(
            'java',
            `Boite<String> boite = new Boite<>();
boite.ranger("Said");
String valeur = boite.sortir();   // String garanti, sans cast`,
            { caption: 'À l’usage' },
          ),
          tip("Les lettres sont conventionnelles : T pour type, E pour élément, K et V pour clé et valeur, R pour résultat. Ce ne sont que des conventions, n’importe quel nom fonctionnerait."),
          warn(
            "Les generics sont effacés à la compilation : à l’exécution, une List<String> est simplement une List. C’est le type erasure. Il explique qu’on ne puisse pas écrire new T() ni tester obj instanceof List<String>.",
          ),
          quiz('java-q-generics-1'),
          memorize('java-d-generics'),
        ],
      },
    ],
  },
  /* ---------------------- 21. Lambda --------------------------------- */
  {
    id: 'java-ch21-lambda',
    title: '21. Lambda',
    description: 'Passer un comportement en paramètre, pas seulement une valeur.',
    lessons: [
      {
        id: 'java-l-lambda',
        title: 'Lambdas et interfaces fonctionnelles',
        summary: 'Une syntaxe courte pour une interface à une seule méthode.',
        minutes: 9,
        difficulty: 'difficile',
        requires: ['java-l-interfaces'],
        concepts: ['lambda'],
        definitions: [
          {
            id: 'java-d-lambda',
            title: 'Lambda',
            text: "Une lambda est une fonction écrite directement à l'endroit où on l'utilise, sans lui donner de nom ni créer de classe. Elle implémente une interface fonctionnelle, c'est-à-dire une interface ne déclarant qu'une seule méthode abstraite.",
            tags: ['java', 'lambda'],
          },
        ],
        blocks: [
          def(
            'Lambda',
            "Une lambda est une fonction écrite directement à l'endroit où on l'utilise, sans lui donner de nom ni créer de classe. Elle implémente une interface fonctionnelle, c'est-à-dire une interface ne déclarant qu'une seule méthode abstraite.",
          ),
          badGood({
            language: 'java',
            title: 'Trier une liste, avant et après Java 8',
            bad: `Collections.sort(noms, new Comparator<String>() {
    @Override
    public int compare(String a, String b) {
        return a.length() - b.length();
    }
});`,
            good: `noms.sort((a, b) -> a.length() - b.length());`,
            why: "Les deux font exactement la même chose. À gauche, six lignes de cérémonie pour une seule ligne utile. La lambda garde le comportement et jette le reste : c’est la même interface Comparator qui est implémentée.",
          }),
          codeExplain([
            ['(a, b)', 'Les paramètres. Leurs types sont déduits du contexte, inutile de les écrire.'],
            ['->', 'La flèche sépare les paramètres du corps.'],
            ['a.length() - b.length()', 'Le corps. Sur une seule expression, le return est implicite.'],
          ]),
          text("La forme varie légèrement selon le nombre de paramètres et la longueur du corps."),
          code(
            'java',
            `() -> System.out.println("Rien en entrée")

nom -> nom.toUpperCase()          // un paramètre : parenthèses facultatives

(a, b) -> a + b                   // deux paramètres

(a, b) -> {                       // corps sur plusieurs lignes
    int somme = a + b;
    return somme * 2;             // return devient obligatoire
}`,
            { caption: 'Les quatre formes' },
          ),
          why(
            'Pourquoi passer un comportement en paramètre ?',
            "Parce que cela évite d’écrire une méthode par variante. Sans lambda, trier par longueur, par ordre alphabétique et par ordre inverse demanderait trois méthodes de tri, ou trois classes Comparator. Avec, la méthode de tri est écrite une fois et reçoit le critère de comparaison comme n’importe quel autre argument. C’est ce qui rend les streams possibles.",
          ),
          text("Java fournit un jeu d’interfaces fonctionnelles prêtes à l’emploi ; il est rare d’avoir à en écrire une."),
          compare(
            ['Interface', 'Signature et usage'],
            [
              ['Predicate<T>', 'T → boolean', 'Filtrer : nom -> nom.startsWith("S")'],
              ['Function<T,R>', 'T → R', 'Transformer : nom -> nom.length()'],
              ['Consumer<T>', 'T → rien', 'Agir : nom -> System.out.println(nom)'],
              ['Supplier<T>', 'rien → T', 'Fournir : () -> new ArrayList<>()'],
            ],
          ),
          tip("Quand la lambda ne fait qu’appeler une méthode existante, la référence de méthode est plus courte : String::toUpperCase remplace s -> s.toUpperCase()."),
          question(
            'Qu’est-ce qu’une interface fonctionnelle ?',
            "Une interface qui ne déclare qu’une seule méthode abstraite. C’est ce qui rend la lambda non ambiguë : le compilateur sait quelle méthode elle implémente. L’annotation @FunctionalInterface demande au compilateur de vérifier cette contrainte.",
          ),
          quiz('java-q-lambda-1'),
          memorize('java-d-lambda'),
        ],
      },
    ],
  },

  /* ---------------------- 22. Streams -------------------------------- */
  {
    id: 'java-ch22-streams',
    title: '22. Streams',
    description: 'Décrire un traitement de collection au lieu de le dérouler à la main.',
    lessons: [
      {
        id: 'java-l-streams',
        title: 'Le premier stream',
        summary: 'filter, map, toList : lire une chaîne de traitement comme une phrase.',
        minutes: 10,
        difficulty: 'difficile',
        requires: ['java-l-lambda', 'java-l-collections'],
        concepts: ['streams'],
        definitions: [
          {
            id: 'java-d-stream',
            title: 'Stream',
            text: "Un stream est une suite d'éléments sur laquelle on enchaîne des opérations de traitement. Il ne stocke rien et ne modifie pas la collection d'origine : il décrit ce qu'il faut faire, et ne l'exécute qu'au moment de l'opération finale.",
            tags: ['java', 'streams'],
          },
        ],
        blocks: [
          def(
            'Stream',
            "Un stream est une suite d'éléments sur laquelle on enchaîne des opérations de traitement. Il ne stocke rien et ne modifie pas la collection d'origine : il décrit ce qu'il faut faire, et ne l'exécute qu'au moment de l'opération finale.",
          ),
          code(
            'java',
            `List<String> noms = List.of(
    "Said",
    "Ali",
    "Samir"
);

List<String> resultat = noms.stream()
    .filter(nom -> nom.startsWith("S"))
    .toList();

System.out.println(resultat);   // [Said, Samir]`,
            { caption: 'Le stream le plus simple', runnable: true },
          ),
          codeExplain([
            ['noms.stream()', 'Ouvre un flux sur la liste. La liste d’origine n’est ni copiée ni modifiée.'],
            ['.filter(nom -> nom.startsWith("S"))', 'Ne laisse passer que les éléments pour lesquels la lambda renvoie true. C’est une opération intermédiaire : rien n’est encore calculé.'],
            ['nom -> nom.startsWith("S")', 'La lambda. nom est chaque élément à son tour ; le résultat est un booléen.'],
            ['.toList()', 'L’opération terminale. C’est elle qui déclenche réellement le parcours et produit la liste finale. Disponible depuis Java 16.'],
          ]),
          badGood({
            language: 'java',
            title: 'Le même traitement, deux écritures',
            bad: `List<String> resultat = new ArrayList<>();
for (String nom : noms) {
    if (nom.startsWith("S")) {
        resultat.add(nom);
    }
}`,
            good: `List<String> resultat = noms.stream()
    .filter(nom -> nom.startsWith("S"))
    .toList();`,
            why: "À gauche on décrit comment faire : créer une liste, boucler, tester, ajouter. À droite on décrit quoi obtenir. Sur un seul filtre la différence est mince ; enchaîne un filtre, une transformation et un tri, et la version boucle devient trois fois plus longue.",
          }),
          why(
            'Pourquoi un stream ne fait-il rien avant l’opération terminale ?',
            "C’est l’évaluation paresseuse, et elle permet une optimisation réelle. Sur un million d’éléments, un filter suivi d’un limit(10) ne parcourt pas le million : dès que dix éléments sont retenus, le traitement s’arrête. Chaque élément traverse aussi toute la chaîne d’un coup, plutôt que de faire un passage complet par opération.",
          ),
          warn("Un stream se consomme une seule fois. Réutiliser la même variable après une opération terminale lève IllegalStateException : il faut rappeler .stream() sur la collection."),
          question(
            'La liste noms est-elle modifiée par ce traitement ?',
            "Non, jamais. Un stream produit un nouveau résultat et laisse la source intacte. C’est justement ce qui le rend sûr à enchaîner et à lire.",
          ),
          quiz('java-q-stream-1'),
          quiz('java-q-stream-2'),
          memorize('java-d-stream'),
        ],
      },
      {
        id: 'java-l-streams-avances',
        title: 'map, sorted, distinct, limit et collect',
        summary: 'Les opérations qu’on enchaîne réellement dans du code de production.',
        minutes: 10,
        difficulty: 'difficile',
        requires: ['java-l-streams'],
        concepts: ['streams'],
        blocks: [
          compare(
            ['Opération', 'Ce qu’elle fait'],
            [
              ['filter', 'Garde les éléments qui satisfont une condition', 'Intermédiaire'],
              ['map', 'Transforme chaque élément en autre chose', 'Intermédiaire'],
              ['sorted', 'Trie les éléments', 'Intermédiaire'],
              ['distinct', 'Supprime les doublons, via equals', 'Intermédiaire'],
              ['limit', 'Ne garde que les n premiers', 'Intermédiaire'],
              ['collect / toList', 'Rassemble le résultat', 'Terminale'],
              ['count / anyMatch / findFirst', 'Produit un nombre, un booléen, un Optional', 'Terminale'],
            ],
          ),
          code(
            'java',
            `List<String> resultat = personnes.stream()
    .filter(p -> p.age() >= 18)
    .map(Personne::nom)
    .distinct()
    .sorted()
    .limit(10)
    .toList();`,
            { caption: 'Une chaîne réaliste' },
          ),
          codeExplain([
            ['.filter(p -> p.age() >= 18)', 'On ne garde que les majeurs. On travaille encore sur des Personne.'],
            ['.map(Personne::nom)', 'Chaque Personne devient son nom : le stream passe de Stream<Personne> à Stream<String>. C’est map qui change le type.'],
            ['.distinct()', 'Supprime les noms en double, en s’appuyant sur equals.'],
            ['.sorted()', 'Trie par ordre naturel — alphabétique pour des String.'],
            ['.limit(10)', 'Ne garde que les dix premiers. Grâce à la paresse, le traitement s’arrête dès qu’ils sont trouvés.'],
          ]),
          text("collect couvre les cas que toList ne suffit pas à exprimer : regrouper, joindre, compter par catégorie."),
          code(
            'java',
            `Map<String, List<Personne>> parVille = personnes.stream()
    .collect(Collectors.groupingBy(Personne::ville));

String liste = noms.stream()
    .collect(Collectors.joining(", "));`,
            { caption: 'Regrouper et joindre' },
          ),
          warn(
            "Ne modifie pas une variable extérieure depuis une lambda de stream. Le compilateur l’interdit d’ailleurs pour les variables locales, qui doivent être effectivement finales. Si tu veux accumuler, utilise reduce ou un collector — c’est la seule façon qui reste correcte en parallèle.",
          ),
          tip("Un stream n’est pas toujours plus rapide qu’une boucle : sur de petites collections, il est même légèrement plus lent. On l’utilise pour la lisibilité, et pour la possibilité de paralléliser quand c’est réellement justifié."),
          exercise({
            title: 'Les noms longs, triés',
            statement: 'À partir d’une List<String> noms, produis la liste triée des noms de plus de 4 caractères, en majuscules.',
            language: 'java',
            starterCode: `List<String> noms = List.of("Said", "Ali", "Samir", "Karim");

List<String> resultat = noms.stream()
    // à toi de jouer
    .toList();`,
            hint: 'Enchaîne filter, map et sorted avant toList.',
            solution: `List<String> resultat = noms.stream()
    .filter(nom -> nom.length() > 4)
    .map(String::toUpperCase)
    .sorted()
    .toList();   // [KARIM, SAMIR]`,
          }),
          quiz('java-q-stream-3'),
        ],
      },
    ],
  },

  /* ---------------------- 23. Optional ------------------------------- */
  {
    id: 'java-ch23-optional',
    title: '23. Optional',
    description: 'Rendre l’absence de valeur visible dans le type.',
    lessons: [
      {
        id: 'java-l-optional',
        title: 'Optional plutôt que null',
        summary: 'Dire explicitement « il peut n’y avoir aucun résultat ».',
        minutes: 8,
        difficulty: 'difficile',
        requires: ['java-l-streams'],
        concepts: ['Optional'],
        definitions: [
          {
            id: 'java-d-optional',
            title: 'Optional',
            text: "Optional est un conteneur qui représente une valeur éventuellement absente. Il rend l'absence visible dans la signature d'une méthode, ce qui oblige l'appelant à traiter ce cas au lieu de l'oublier.",
            tags: ['java', 'optional'],
          },
        ],
        blocks: [
          def(
            'Optional',
            "Optional est un conteneur qui représente une valeur éventuellement absente. Il rend l'absence visible dans la signature d'une méthode, ce qui oblige l'appelant à traiter ce cas au lieu de l'oublier.",
          ),
          badGood({
            language: 'java',
            title: 'Signaler qu’aucun résultat n’a été trouvé',
            bad: `public Utilisateur trouver(Long id) {
    return repository.get(id);   // peut renvoyer null
}

// chez l'appelant, rien ne rappelle qu'il faut tester
utilisateur.getNom();            // NullPointerException un jour`,
            good: `public Optional<Utilisateur> trouver(Long id) {
    return Optional.ofNullable(repository.get(id));
}

String nom = trouver(id)
    .map(Utilisateur::getNom)
    .orElse("Inconnu");`,
            why: "La signature de gauche ment par omission : elle promet un Utilisateur et peut rendre null. Celle de droite dit la vérité, et le compilateur force l’appelant à décider quoi faire de l’absence.",
          }),
          why(
            'Pourquoi Optional plutôt que null ?',
            "Parce que null ne se voit pas dans un type. Rien, dans « cette méthode renvoie un Utilisateur », n’avertit qu’elle peut ne rien renvoyer : il faut lire son code ou se faire surprendre en production. Optional<Utilisateur> déplace l’information dans la signature, là où on la lit forcément. L’oubli devient impossible, parce qu’on ne peut pas appeler getNom() directement sur un Optional.",
          ),
          code(
            'java',
            `Optional<Utilisateur> resultat = trouver(10L);

resultat.map(Utilisateur::getNom).orElse("Inconnu");   // valeur de repli
resultat.ifPresent(u -> envoyerMail(u));               // agir si présent
resultat.orElseThrow();                                // exiger la présence`,
            { caption: 'Les trois usages courants' },
          ),
          warn(
            "N’utilise pas Optional partout. Il est fait pour un type de retour. Comme paramètre de méthode ou comme attribut, il alourdit sans rien garantir — et il n’est pas sérialisable, ce qui pose problème dans une entité.",
          ),
          warn("optional.get() sans vérification préalable reproduit exactement le problème du null, avec une NoSuchElementException à la place. Préfère orElse, orElseThrow avec un message, ou ifPresent."),
          question(
            'Optional supprime-t-il les NullPointerException ?',
            "Non, il les rend évitables. Il rend l’absence visible dans le type, donc impossible à ignorer par inadvertance. Mais un Optional mal utilisé — get() sans test — échoue tout autant.",
          ),
          quiz('java-q-optional-1'),
          memorize('java-d-optional'),
        ],
      },
    ],
  },

  /* ---------------------- 24. Dates et temps ------------------------- */
  {
    id: 'java-ch24-dates',
    title: '24. Dates et temps',
    description: 'L’API java.time, et pourquoi l’ancienne est à éviter.',
    lessons: [
      {
        id: 'java-l-dates',
        title: 'LocalDate, LocalDateTime, Instant',
        summary: 'Choisir le bon type selon qu’on parle d’un jour, d’un horaire ou d’un instant absolu.',
        minutes: 8,
        difficulty: 'moyen',
        requires: ['java-l-collections'],
        concepts: ['java.time'],
        blocks: [
          text("java.time, arrivé avec Java 8, remplace Date et Calendar. Ses types sont immuables, ce qui supprime toute une famille de bugs."),
          compare(
            ['Type', 'Ce qu’il représente'],
            [
              ['LocalDate', 'Une date sans heure', 'Une date de naissance'],
              ['LocalTime', 'Une heure sans date', 'L’heure d’ouverture'],
              ['LocalDateTime', 'Date et heure, sans fuseau', 'Un rendez-vous local'],
              ['Instant', 'Un point précis sur la ligne du temps, en UTC', 'Un horodatage de log'],
              ['Duration / Period', 'Un écart de temps / de dates', 'Une durée, un âge'],
            ],
          ),
          code(
            'java',
            `LocalDate naissance = LocalDate.of(1995, 3, 14);
LocalDate aujourdhui = LocalDate.now();

int age = Period.between(naissance, aujourdhui).getYears();

LocalDate dansUnMois = aujourdhui.plusMonths(1);`,
            { caption: 'Calculs de dates' },
          ),
          codeExplain([
            ['LocalDate.of(1995, 3, 14)', 'Le mois se lit naturellement : 3 est mars. L’ancienne API comptait les mois à partir de 0, source d’erreurs constantes.'],
            ['Period.between(...)', 'Calcule l’écart en années, mois et jours — la bonne façon de calculer un âge.'],
            ['aujourdhui.plusMonths(1)', 'Renvoie une nouvelle date ; aujourdhui n’est pas modifiée. Tous ces types sont immuables.'],
          ]),
          why(
            'Pourquoi stocker un Instant plutôt qu’un LocalDateTime pour un horodatage ?',
            "Parce qu’un LocalDateTime ne porte aucun fuseau : « 14 h » ne veut rien dire sans savoir où. Deux serveurs dans deux pays produiraient des valeurs incomparables. Instant est un point absolu, exprimé en UTC : il ordonne correctement les événements quel que soit l’endroit où ils ont été enregistrés. On convertit vers le fuseau de l’utilisateur seulement au moment de l’affichage.",
          ),
          warn("Date, Calendar et SimpleDateFormat sont à éviter dans du code neuf : mutables, comptage des mois à partir de zéro, et SimpleDateFormat n’est pas utilisable depuis plusieurs threads. DateTimeFormatter, lui, est sûr."),
          quiz('java-q-dates-1'),
        ],
      },
    ],
  },

  /* ---------------------- 25. Fichiers ------------------------------- */
  {
    id: 'java-ch25-fichiers',
    title: '25. Fichiers',
    description: 'Lire, écrire, et surtout refermer ce qu’on a ouvert.',
    lessons: [
      {
        id: 'java-l-fichiers',
        title: 'Lire et écrire un fichier',
        summary: 'L’API Files, et le try-with-resources qui garantit la fermeture.',
        minutes: 8,
        difficulty: 'moyen',
        requires: ['java-l-exceptions'],
        concepts: ['fichiers', 'IO'],
        blocks: [
          code(
            'java',
            `Path chemin = Path.of("donnees.txt");

String contenu = Files.readString(chemin);
List<String> lignes = Files.readAllLines(chemin);

Files.writeString(chemin, "Bonjour");`,
            { caption: 'Les cas simples, depuis Java 11' },
          ),
          tip("Files.readString et Files.writeString existent depuis Java 11. Avant, il fallait passer par des flux et gérer l’encodage à la main."),
          warn("readAllLines charge tout le fichier en mémoire. Sur un fichier de plusieurs gigaoctets, c’est un OutOfMemoryError garanti : utilise Files.lines, qui produit un stream paresseux."),
          code(
            'java',
            `try (Stream<String> lignes = Files.lines(chemin)) {
    long erreurs = lignes
        .filter(ligne -> ligne.contains("ERROR"))
        .count();
    System.out.println(erreurs);
}`,
            { caption: 'Lire un gros fichier sans le charger entièrement' },
          ),
          codeExplain([
            ['try (Stream<String> lignes = ...)', 'Le try-with-resources. La ressource déclarée entre parenthèses sera fermée automatiquement à la sortie du bloc.'],
            ['Files.lines(chemin)', 'Ouvre le fichier et produit un stream paresseux : les lignes sont lues au fur et à mesure, pas toutes d’un coup.'],
            ['}', 'À l’accolade fermante, le fichier est refermé — que le bloc se soit terminé normalement ou sur une exception.'],
          ]),
          why(
            'Pourquoi le try-with-resources plutôt qu’un finally ?',
            "Parce qu’un finally qui ferme correctement plusieurs ressources est étonnamment difficile à écrire : il faut gérer le cas où la fermeture elle-même échoue, et celui où une exception survient pendant qu’une autre est déjà en cours. Le try-with-resources fait tout cela correctement, ferme les ressources dans l’ordre inverse d’ouverture, et tient en une ligne. Toute classe implémentant AutoCloseable en bénéficie.",
          ),
          warn("Un fichier non fermé garde un descripteur ouvert. Dans un serveur qui traite des milliers de requêtes, cela finit par « Too many open files » — une panne dont la cause est difficile à relier au code fautif."),
          quiz('java-q-fichiers-1'),
        ],
      },
    ],
  },

  /* ---------------------- 26. Multithreading ------------------------- */
  {
    id: 'java-ch26-threads',
    title: '26. Multithreading',
    description: 'Faire plusieurs choses à la fois, et les dangers que cela crée.',
    lessons: [
      {
        id: 'java-l-threads',
        title: 'Threads et état partagé',
        summary: 'Pourquoi un simple compteur devient faux quand deux threads y touchent.',
        minutes: 9,
        difficulty: 'expert',
        requires: ['java-l-attributs'],
        concepts: ['threads', 'concurrence'],
        definitions: [
          {
            id: 'java-d-thread',
            title: 'Thread',
            text: "Un thread est un fil d'exécution qui progresse indépendamment des autres au sein du même programme. Plusieurs threads partagent la même mémoire, ce qui les rend rapides à communiquer mais dangereux dès qu'ils modifient une même donnée.",
            tags: ['java', 'threads'],
          },
        ],
        blocks: [
          def(
            'Thread',
            "Un thread est un fil d'exécution qui progresse indépendamment des autres au sein du même programme. Plusieurs threads partagent la même mémoire, ce qui les rend rapides à communiquer mais dangereux dès qu'ils modifient une même donnée.",
          ),
          code(
            'java',
            `public class Compteur {
    private int valeur = 0;

    public void incrementer() {
        valeur++;      // n'est pas une seule opération
    }
}`,
            { caption: 'Le compteur qui perd des incréments' },
          ),
          why(
            'Pourquoi valeur++ n’est-il pas sûr entre plusieurs threads ?',
            "Parce que cette écriture compacte cache trois étapes : lire la valeur, ajouter un, réécrire. Si deux threads lisent 5 en même temps, tous deux calculent 6 et tous deux écrivent 6. Deux incréments ont eu lieu, un seul est comptabilisé. On appelle cela une condition de course, et elle est redoutable parce qu’elle ne se produit qu’occasionnellement : le test passe, la production échoue une fois sur mille.",
          ),
          text("Trois réponses possibles, de la plus simple à la plus générale."),
          keypoints([
            'Ne rien partager : la solution la plus sûre est qu’aucune donnée mutable ne soit commune à deux threads.',
            'Rendre l’objet immuable : une valeur qui ne change jamais se lit sans risque depuis n’importe où.',
            'Synchroniser : AtomicInteger pour un compteur, synchronized ou un verrou pour une section critique.',
          ]),
          code(
            'java',
            `private final AtomicInteger valeur = new AtomicInteger();

public void incrementer() {
    valeur.incrementAndGet();   // atomique : les trois étapes sont indivisibles
}`,
            { caption: 'La version correcte' },
          ),
          warn(
            "Ne synchronise pas « au cas où ». Chaque verrou coûte du temps et crée un risque d’interblocage : deux threads qui attendent chacun le verrou détenu par l’autre bloquent définitivement. Réduis d’abord le partage, synchronise ensuite ce qui reste.",
          ),
          question(
            'Pourquoi une condition de course est-elle si difficile à diagnostiquer ?',
            "Parce qu’elle dépend de l’ordonnancement des threads, qui varie à chaque exécution. Le bug n’apparaît que sous charge, ne se reproduit pas en local, et disparaît quand on ajoute des logs — parce que ceux-ci changent justement le timing.",
          ),
          quiz('java-q-threads-1'),
          memorize('java-d-thread'),
        ],
      },
      {
        id: 'java-l-executor',
        title: 'ExecutorService, CompletableFuture et threads virtuels',
        summary: 'Ne crée plus de threads à la main : confie-les à un pool.',
        minutes: 9,
        difficulty: 'expert',
        requires: ['java-l-threads'],
        concepts: ['threads', 'concurrence'],
        blocks: [
          badGood({
            language: 'java',
            title: 'Lancer mille traitements',
            bad: `for (Commande c : commandes) {
    new Thread(() -> traiter(c)).start();
}`,
            good: `try (ExecutorService pool = Executors.newFixedThreadPool(8)) {
    for (Commande c : commandes) {
        pool.submit(() -> traiter(c));
    }
}`,
            why: "À gauche, mille threads système sont créés. Chacun coûte de la mémoire et le processeur passe son temps à basculer de l’un à l’autre : au-delà d’un certain nombre, la machine ralentit au lieu d’accélérer. À droite, huit threads traitent la file d’attente les uns après les autres.",
          }),
          code(
            'java',
            `CompletableFuture<String> resultat = CompletableFuture
    .supplyAsync(() -> appelerServiceA())
    .thenApply(donnees -> transformer(donnees))
    .exceptionally(erreur -> "valeur de repli");`,
            { caption: 'Enchaîner des traitements asynchrones' },
          ),
          codeExplain([
            ['supplyAsync(...)', 'Lance le traitement sur un pool et rend la main immédiatement, sans attendre le résultat.'],
            ['thenApply(...)', 'Décrit ce qu’il faudra faire du résultat quand il arrivera. Rien ne bloque ici.'],
            ['exceptionally(...)', 'Le chemin d’erreur : si l’une des étapes échoue, cette valeur de repli est utilisée.'],
          ]),
          text("Java 21 introduit les threads virtuels, qui changent l’arbitrage précédent."),
          def(
            'Thread virtuel',
            "Un thread virtuel est un fil d'exécution géré par la JVM plutôt que par le système d'exploitation. Sa création coûte très peu, ce qui permet d'en avoir des centaines de milliers, et il libère automatiquement son thread système pendant une attente d'entrée-sortie.",
          ),
          code(
            'java',
            `try (var pool = Executors.newVirtualThreadPerTaskExecutor()) {
    for (Commande c : commandes) {
        pool.submit(() -> traiter(c));
    }
}`,
            { caption: 'Un thread virtuel par tâche, depuis Java 21' },
          ),
          why(
            'Pourquoi les threads virtuels changent la donne pour une API',
            "Parce qu’une API passe l’essentiel de son temps à attendre : la base de données, un service externe, le réseau. Avec des threads système, chaque requête en attente immobilise un thread coûteux, ce qui plafonne le nombre de requêtes simultanées. Un thread virtuel bloqué en attente rend son thread porteur à la JVM, qui le réutilise pour une autre requête. On peut donc écrire du code bloquant, simple à lire, tout en tenant une charge qui exigeait auparavant une programmation asynchrone complexe.",
          ),
          tip("Les threads virtuels ne rendent pas le code plus rapide sur du calcul pur : ils aident quand le programme attend. Pour du calcul intensif, un pool dimensionné sur le nombre de cœurs reste la bonne réponse."),
          quiz('java-q-executor-1'),
        ],
      },
    ],
  },

  /* ---------------------- 27. Java moderne --------------------------- */
  {
    id: 'java-ch27-java-moderne',
    title: '27. Java moderne',
    description: 'enum, record, annotations, et ce que chaque version a réellement apporté.',
    lessons: [
      {
        id: 'java-l-enum-record',
        title: 'enum, record et objets immuables',
        summary: 'Deux types faits pour remplacer des classes entières de code répétitif.',
        minutes: 9,
        difficulty: 'difficile',
        requires: ['java-l-encapsulation'],
        concepts: ['enum', 'record'],
        definitions: [
          {
            id: 'java-d-record',
            title: 'Record',
            text: "Un record est une classe dont le seul rôle est de porter des données immuables. Le compilateur génère automatiquement le constructeur, les accesseurs, equals, hashCode et toString à partir de la liste de ses composants.",
            tags: ['java', 'record'],
          },
        ],
        blocks: [
          text("Un enum représente un ensemble fermé de valeurs connues à l’avance. Il remplace avantageusement des constantes entières ou textuelles."),
          code(
            'java',
            `public enum Statut {
    EN_ATTENTE,
    VALIDEE,
    EXPEDIEE,
    ANNULEE
}

Statut statut = Statut.VALIDEE;

switch (statut) {
    case VALIDEE  -> preparer();
    case EXPEDIEE -> notifier();
    default       -> {}
}`,
            { caption: 'Un enum et son switch' },
          ),
          why(
            'Pourquoi un enum plutôt qu’une String ?',
            "Parce qu’une String accepte n’importe quoi. Écrire « VALIDÉE » avec un accent, ou « validee » en minuscules, compile parfaitement et échoue à l’exécution. Un enum limite les valeurs possibles à celles qui existent : la faute de frappe devient une erreur de compilation. Le switch peut même être vérifié comme exhaustif.",
          ),
          def(
            'Record',
            "Un record est une classe dont le seul rôle est de porter des données immuables. Le compilateur génère automatiquement le constructeur, les accesseurs, equals, hashCode et toString à partir de la liste de ses composants.",
          ),
          badGood({
            language: 'java',
            title: 'Une classe porteuse de données',
            bad: `public class Point {
    private final int x;
    private final int y;

    public Point(int x, int y) { this.x = x; this.y = y; }
    public int getX() { return x; }
    public int getY() { return y; }

    @Override public boolean equals(Object o) { /* 8 lignes */ return false; }
    @Override public int hashCode() { return Objects.hash(x, y); }
    @Override public String toString() { return "Point[x=" + x + ", y=" + y + "]"; }
}`,
            good: `public record Point(int x, int y) {}`,
            why: "Les deux produisent la même chose. Le record génère constructeur, accesseurs x() et y(), equals, hashCode et toString. Il y a moins de code à lire, et surtout plus aucune occasion d’oublier hashCode en modifiant equals.",
          }),
          keypoints([
            'Les champs d’un record sont finaux : un record est immuable par construction.',
            'Les accesseurs s’appellent x() et non getX() — c’est la convention des records.',
            'Un record peut ajouter des méthodes et valider ses arguments dans un constructeur compact.',
            'Les records sont standards depuis Java 16.',
          ]),
          code(
            'java',
            `public record Montant(BigDecimal valeur, String devise) {
    public Montant {
        if (valeur.signum() < 0) {
            throw new IllegalArgumentException("Montant négatif");
        }
    }
}`,
            { caption: 'Un constructeur compact valide les données' },
          ),
          why(
            'Pourquoi préférer un objet immuable ?',
            "Parce qu’une valeur qui ne change jamais élimine des catégories entières de problèmes. Personne ne peut la modifier dans ton dos après que tu l’as passée à une méthode. Elle se partage entre threads sans aucune synchronisation. Et elle fait une clé de HashMap sûre, puisque son hashCode ne peut plus changer.",
          ),
          quiz('java-q-record-1'),
          quiz('java-q-enum-1'),
          memorize('java-d-record'),
        ],
      },
      {
        id: 'java-l-versions',
        title: 'Java 8, 11, 17, 21 : ce qui a vraiment changé',
        summary: 'Les apports réels de chaque version LTS, sans les approximations habituelles.',
        minutes: 9,
        difficulty: 'moyen',
        requires: ['java-l-enum-record'],
        concepts: ['versions Java'],
        blocks: [
          text("Les versions LTS — support long terme — sont celles que les entreprises adoptent. Voici ce que chacune a apporté, vérifié version par version."),
          compare(
            ['Année', 'Apports marquants'],
            [
              ['Java 8', '2014', 'Lambdas, Streams, Optional, java.time, méthodes default dans les interfaces'],
              ['Java 11', '2018', 'HttpClient standard, String.isBlank/lines/strip/repeat, Files.readString, lancement direct d’un fichier source'],
              ['Java 17', '2021', 'Sealed classes, messages de NullPointerException détaillés ; records et blocs de texte, stabilisés en 15 et 16, y sont acquis'],
              ['Java 21', '2023', 'Threads virtuels, pattern matching pour switch, record patterns, collections séquencées'],
            ],
          ),
          warn(
            "Deux corrections fréquentes. Le mot-clé var est arrivé en Java 10, pas en 11 ; Java 11 y a seulement ajouté son usage dans les paramètres de lambda. Et les records sont standards depuis Java 16, pas 17 — Java 17 est simplement la première LTS qui les contient.",
          ),
          code(
            'java',
            `// Java 16+ : instanceof avec liaison de variable
if (objet instanceof Personne p && p.age() >= 18) {
    System.out.println(p.nom());
}

// Java 21 : pattern matching pour switch
String description = switch (forme) {
    case Cercle c      -> "Cercle de rayon " + c.rayon();
    case Rectangle r   -> "Rectangle " + r.largeur() + "x" + r.hauteur();
    default            -> "Forme inconnue";
};`,
            { caption: 'Le pattern matching, étape par étape' },
          ),
          why(
            'Pourquoi rester sur une version LTS ?',
            "Parce qu’elle reçoit des correctifs de sécurité pendant des années, alors qu’une version intermédiaire est abandonnée au bout de six mois. Une application d’entreprise ne peut pas changer de version tous les semestres : elle vise une LTS et y reste jusqu’à la suivante.",
          ),
          tip("Pour savoir précisément ce qu’apporte une version, la source de vérité est la liste des JEP de cette version. Les articles de blog attribuent régulièrement une fonctionnalité à la mauvaise version."),
          quiz('java-q-versions-1'),
        ],
      },
    ],
  },

];

export const moderneChapters = chapters;

export const moderneCourse: CourseSpec = {
  id: 'java-c3-moderne',
  pathId: 'java-path-moderne',
  title: 'Java — Intermédiaire et moderne',
  description: 'Collections, exceptions, generics, lambdas, streams, Optional, temps, fichiers, threads.',
  icon: '🚀',
  level: 'intermediaire',
  tags: ['java', 'collections', 'streams'],
  chapters,
};
