import type { QuizQuestion } from '@/models';
import { fillBlank, mcq, trueFalse } from '../builders';
import { D } from './shared';

const C = 'java-c1-debutant';

/**
 * Questions du cours 1. Chaque question porte son `lessonId` : c'est ce lien qui
 * permet à l'état de maîtrise de savoir quelles réponses concernent quelle leçon.
 */
export const debutantQuestions: QuizQuestion[] = [
  mcq({
    id: 'java-q-introduction-1',
    domainId: D, courseId: C, lessonId: 'java-l-introduction',
    topic: 'Java',
    prompt: 'Qu’est-ce qui rend un programme Java exécutable sur Windows comme sur Linux ?',
    options: [
      'La JVM, qui exécute le même bytecode sur chaque système',
      'Le compilateur, qui produit un exécutable par système',
      'Le système d’exploitation, qui comprend nativement Java',
      'Une recompilation automatique au démarrage',
    ],
    answerIndex: 0,
    explanation:
      'javac produit un bytecode unique, indépendant du système. Chaque système dispose de sa propre JVM, qui traduit ce bytecode pour son processeur.',
    tags: ['java', 'portabilité'],
  }),
  trueFalse({
    id: 'java-q-introduction-2',
    domainId: D, courseId: C, lessonId: 'java-l-introduction',
    topic: 'Java',
    prompt: 'Java est un langage faiblement typé : une variable peut changer de type en cours de route.',
    answer: false,
    explanation:
      'Java est fortement typé. Le type est fixé à la déclaration et vérifié à la compilation ; une variable int contiendra toujours un entier.',
    tags: ['java', 'typage'],
  }),
  mcq({
    id: 'java-q-usages-1',
    domainId: D, courseId: C, lessonId: 'java-l-ou-sert-java',
    topic: 'Java',
    prompt: 'Dans quel domaine Java est-il le plus présent aujourd’hui ?',
    options: [
      'Les applications d’entreprise et les API côté serveur',
      'Les feuilles de style des sites web',
      'Les systèmes d’exploitation embarqués en temps réel dur',
      'Les tableurs bureautiques',
    ],
    answerIndex: 0,
    explanation:
      'Java domine le back-end d’entreprise : API REST, traitement de données, systèmes bancaires. Il est aussi très présent sur Android.',
    tags: ['java'],
  }),

  mcq({
    id: 'java-q-jvm-1',
    domainId: D, courseId: C, lessonId: 'java-l-jvm',
    topic: 'JVM',
    prompt: 'Que contient le fichier Main.class produit par javac ?',
    options: [
      'Du bytecode, un format intermédiaire commun à tous les systèmes',
      'Du code machine prêt pour le processeur de la machine',
      'Le code source compressé',
      'Un script exécuté par le système d’exploitation',
    ],
    answerIndex: 0,
    explanation:
      'Le .class contient du bytecode. Ce n’est ni du source lisible ni du code machine : c’est la JVM qui le traduit en instructions natives à l’exécution.',
    tags: ['jvm', 'bytecode'],
  }),
  fillBlank({
    id: 'java-q-jvm-2',
    domainId: D, courseId: C, lessonId: 'java-l-jvm',
    topic: 'JVM',
    prompt: 'Complète : le code source est compilé en ______, puis la JVM l’exécute.',
    answer: 'bytecode',
    accepted: ['bytecode', 'byte code', 'du bytecode'],
    explanation: 'Code source → javac → bytecode (.class) → JVM → code machine exécuté par le processeur.',
    tags: ['jvm'],
  }),

  mcq({
    id: 'java-q-jdk-1',
    domainId: D, courseId: C, lessonId: 'java-l-jdk-jre',
    topic: 'JDK',
    prompt: 'Tu veux compiler un projet Java. Que dois-tu installer ?',
    options: [
      'Le JDK, car lui seul contient javac',
      'Le JRE, qui suffit pour toute opération Java',
      'La JVM seule',
      'N’importe lequel des trois, ils sont équivalents',
    ],
    answerIndex: 0,
    explanation:
      'Le JRE sait exécuter, pas compiler. Seul le JDK fournit javac. C’est pour cela qu’on installe un JDK sur un poste de développement.',
    tags: ['jdk', 'jre'],
  }),
  trueFalse({
    id: 'java-q-jdk-2',
    domainId: D, courseId: C, lessonId: 'java-l-jdk-jre',
    topic: 'JDK',
    prompt: 'Aujourd’hui encore, on installe un JRE seul sur les serveurs de production.',
    answer: false,
    explanation:
      'Ce fut vrai historiquement. Oracle ne distribue plus de JRE séparé depuis Java 11 : on installe un JDK, ou l’on construit un runtime sur mesure avec jlink.',
    tags: ['jre'],
  }),

  mcq({
    id: 'java-q-main-1',
    domainId: D, courseId: C, lessonId: 'java-l-premier-programme',
    topic: 'main',
    prompt: 'Pourquoi la méthode main doit-elle être déclarée static ?',
    options: [
      'Parce qu’aucun objet n’existe encore quand le programme démarre',
      'Parce que static rend la méthode plus rapide',
      'Parce que main ne renvoie rien',
      'Parce que static est obligatoire sur toute méthode publique',
    ],
    answerIndex: 0,
    explanation:
      'Une méthode non statique s’appelle sur un objet. Au démarrage, aucun objet n’existe : static permet à la JVM d’appeler main directement sur la classe.',
    tags: ['main', 'static'],
  }),
  mcq({
    id: 'java-q-main-2',
    domainId: D, courseId: C, lessonId: 'java-l-premier-programme',
    topic: 'main',
    prompt: 'Que produit ce programme ?',
    code: `public class Main {
    public static void main(String[] args) {
        System.out.print("A");
        System.out.println("B");
        System.out.print("C");
    }
}`,
    language: 'java',
    type: 'code_output',
    options: ['AB puis C sur la ligne suivante', 'A B C sur trois lignes', 'ABC sur une seule ligne', 'Une erreur de compilation'],
    answerIndex: 0,
    explanation:
      'print n’ajoute pas de retour à la ligne, println si. On obtient donc « AB », un saut de ligne, puis « C ».',
    tags: ['main'],
  }),

  mcq({
    id: 'java-q-package-1',
    domainId: D, courseId: C, lessonId: 'java-l-packages-imports',
    topic: 'package',
    prompt: 'Pourquoi System.out.println fonctionne-t-il sans aucun import ?',
    options: [
      'Parce que les classes de java.lang sont importées automatiquement',
      'Parce que System est un mot-clé du langage',
      'Parce que les imports sont facultatifs en Java',
      'Parce que javac ajoute l’import à la compilation',
    ],
    answerIndex: 0,
    explanation:
      'java.lang (String, System, Integer, Math…) est importé implicitement dans tout fichier Java. Les autres packages demandent un import explicite.',
    tags: ['package', 'import'],
  }),
  mcq({
    id: 'java-q-compilation-1',
    domainId: D, courseId: C, lessonId: 'java-l-compiler-executer',
    topic: 'compilation',
    prompt: 'Quelle commande lance un programme déjà compilé ?',
    options: ['java Main', 'java Main.class', 'javac Main', 'javac Main.class'],
    answerIndex: 0,
    explanation:
      'java attend un nom de classe, pas un nom de fichier : on écrit java Main. javac, lui, sert à compiler et attend le fichier source Main.java.',
    tags: ['compilation'],
  }),

  mcq({
    id: 'java-q-variable-1',
    domainId: D, courseId: C, lessonId: 'java-l-variables',
    topic: 'variable',
    prompt: 'À quoi sert le mot-clé final sur une variable ?',
    options: [
      'À interdire toute réaffectation après l’initialisation',
      'À rendre la variable visible partout dans le programme',
      'À libérer la mémoire dès la fin du bloc',
      'À convertir automatiquement le type',
    ],
    answerIndex: 0,
    explanation:
      'final fige la référence : le compilateur refuse toute nouvelle affectation. C’est une contrainte vérifiée avant l’exécution, et une information pour qui relit le code.',
    tags: ['variable', 'final'],
  }),

  mcq({
    id: 'java-q-types-1',
    domainId: D, courseId: C, lessonId: 'java-l-types-primitifs',
    topic: 'types primitifs',
    prompt: 'Que faut-il utiliser pour représenter un montant d’argent ?',
    options: [
      'BigDecimal, ou des entiers en centimes',
      'double, qui gère les décimales',
      'float, plus léger que double',
      'String, pour garder le format exact',
    ],
    answerIndex: 0,
    explanation:
      'double et float sont des approximations binaires : 0.1 + 0.2 ne vaut pas 0.3. Pour de l’argent, on utilise BigDecimal ou l’on raisonne en centimes entiers.',
    tags: ['types', 'double'],
  }),
  mcq({
    id: 'java-q-types-2',
    domainId: D, courseId: C, lessonId: 'java-l-types-primitifs',
    topic: 'types primitifs',
    prompt: 'Que produit cette ligne ?',
    code: 'System.out.println(7 / 2);',
    language: 'java',
    type: 'code_output',
    options: ['3', '3.5', '4', 'Une erreur de compilation'],
    answerIndex: 0,
    explanation:
      'Les deux opérandes sont des int, donc Java fait une division entière et jette la partie décimale. Pour obtenir 3.5, il faut écrire 7.0 / 2.',
    tags: ['types', 'division'],
  }),

  mcq({
    id: 'java-q-string-1',
    domainId: D, courseId: C, lessonId: 'java-l-string',
    topic: 'String',
    prompt: 'Que produit ce programme ?',
    code: `String texte = "Java";
texte.concat(" 21");
System.out.println(texte);`,
    language: 'java',
    type: 'code_output',
    options: ['Java', 'Java 21', ' 21', 'Une erreur de compilation'],
    answerIndex: 0,
    explanation:
      'Une String est immuable. concat renvoie une nouvelle chaîne au lieu de modifier l’originale, et ce retour n’est récupéré nulle part. Il faut écrire texte = texte.concat(" 21").',
    tags: ['string', 'immutabilité'],
  }),
  mcq({
    id: 'java-q-string-2',
    domainId: D, courseId: C, lessonId: 'java-l-string',
    topic: 'String',
    prompt: 'Pourquoi utiliser StringBuilder pour concaténer dans une boucle ?',
    options: [
      'Parce que + crée une nouvelle String à chaque tour, ce qui devient coûteux',
      'Parce que + ne compile pas dans une boucle',
      'Parce que StringBuilder trie les chaînes automatiquement',
      'Parce que StringBuilder évite les caractères accentués',
    ],
    answerIndex: 0,
    explanation:
      'Les String étant immuables, chaque + alloue un nouvel objet. StringBuilder écrit dans un tampon réutilisé et ne produit la chaîne finale qu’une fois.',
    tags: ['string', 'performance'],
  }),

  mcq({
    id: 'java-q-wrapper-1',
    domainId: D, courseId: C, lessonId: 'java-l-wrappers',
    topic: 'autoboxing',
    prompt: 'Que se passe-t-il à l’exécution ?',
    code: `Integer total = null;
int resultat = total + 1;`,
    language: 'java',
    type: 'code_output',
    options: [
      'Une NullPointerException à l’unboxing',
      'resultat vaut 1',
      'resultat vaut 0',
      'Une erreur de compilation',
    ],
    answerIndex: 0,
    explanation:
      'Pour additionner, Java doit extraire l’int contenu dans l’Integer : c’est l’unboxing. Sur un null, cette extraction lance une NullPointerException.',
    tags: ['autoboxing', 'null'],
  }),
  mcq({
    id: 'java-q-wrapper-2',
    domainId: D, courseId: C, lessonId: 'java-l-wrappers',
    topic: 'autoboxing',
    prompt: 'Pourquoi ne faut-il pas comparer deux Integer avec == ?',
    options: [
      'Parce que == compare les références, et le cache des petites valeurs rend le résultat trompeur',
      'Parce que == ne compile pas sur des Integer',
      'Parce que == compare toujours les valeurs, ce qui est trop lent',
      'Parce que Integer n’a pas de méthode equals',
    ],
    answerIndex: 0,
    explanation:
      'Java met en cache les Integer de -128 à 127 : la comparaison semble fonctionner sur de petites valeurs puis échoue au-delà. equals compare les contenus, c’est la bonne méthode.',
    tags: ['autoboxing', 'égalité'],
  }),

  mcq({
    id: 'java-q-operateurs-1',
    domainId: D, courseId: C, lessonId: 'java-l-operateurs',
    topic: 'opérateurs',
    prompt: 'Que produit ce code ?',
    code: `int x = 5;
System.out.println(x++);
System.out.println(x);`,
    language: 'java',
    type: 'code_output',
    options: ['5 puis 6', '6 puis 6', '5 puis 5', '6 puis 7'],
    answerIndex: 0,
    explanation:
      'x++ en version postfixée renvoie la valeur d’avant l’incrément, donc 5, puis incrémente. La ligne suivante affiche 6.',
    tags: ['opérateurs'],
  }),
  fillBlank({
    id: 'java-q-operateurs-2',
    domainId: D, courseId: C, lessonId: 'java-l-operateurs',
    topic: 'opérateurs',
    prompt: 'Quel opérateur donne le reste d’une division entière ? Écris juste le symbole.',
    answer: '%',
    accepted: ['%', 'modulo', 'le modulo'],
    explanation: 'L’opérateur % renvoie le reste : 10 % 3 vaut 1. Il sert surtout à tester la divisibilité.',
    tags: ['opérateurs'],
  }),
  mcq({
    id: 'java-q-logique-1',
    domainId: D, courseId: C, lessonId: 'java-l-comparaison-logique',
    topic: 'opérateurs',
    prompt: 'Pourquoi if (nom != null && nom.length() > 3) est-il sûr même si nom vaut null ?',
    options: [
      'Parce que && n’évalue le second test que si le premier est vrai',
      'Parce que length() renvoie 0 sur un null',
      'Parce que Java ignore les conditions sur null',
      'Parce que l’ordre des tests n’a aucune importance',
    ],
    answerIndex: 0,
    explanation:
      'C’est l’évaluation paresseuse : si nom vaut null, le premier test est faux et le second n’est jamais évalué. Inverser les deux provoquerait une NullPointerException.',
    tags: ['logique', 'null'],
  }),

  mcq({
    id: 'java-q-conditions-1',
    domainId: D, courseId: C, lessonId: 'java-l-conditions',
    topic: 'conditions',
    prompt: 'Qu’affiche ce code si note vaut 18 ?',
    code: `if (note >= 12) {
    System.out.println("Bien");
} else if (note >= 16) {
    System.out.println("Très bien");
}`,
    language: 'java',
    type: 'code_output',
    options: ['Bien', 'Très bien', 'Bien puis Très bien', 'Rien'],
    answerIndex: 0,
    explanation:
      'L’ordre des branches est faux. 18 satisfait déjà note >= 12, donc la seconde branche n’est jamais atteinte : elle est morte. Il faut tester le seuil le plus élevé en premier.',
    tags: ['conditions'],
  }),
  mcq({
    id: 'java-q-conditions-2',
    domainId: D, courseId: C, lessonId: 'java-l-conditions',
    topic: 'conditions',
    prompt: 'Où est l’erreur ?',
    code: `int x = 5;
if (x = 5) {
    System.out.println("Cinq");
}`,
    language: 'java',
    type: 'find_bug',
    options: [
      'x = 5 est une affectation ; if attend un boolean, il faut x == 5',
      'Il manque un point-virgule après if',
      'x doit être déclaré final',
      'println n’accepte pas de chaîne littérale',
    ],
    answerIndex: 0,
    explanation:
      '= affecte, == compare. if exige un boolean, or une affectation d’int produit un int : le code ne compile pas. En C il compilerait et serait toujours vrai — Java bloque ce piège.',
    tags: ['conditions', 'bug'],
  }),
  mcq({
    id: 'java-q-switch-1',
    domainId: D, courseId: C, lessonId: 'java-l-switch',
    topic: 'switch',
    prompt: 'Que se passe-t-il si on oublie un break dans un switch classique ?',
    options: [
      'L’exécution continue dans le cas suivant',
      'Le code ne compile pas',
      'Le switch s’arrête immédiatement',
      'Le cas default est exécuté à la place',
    ],
    answerIndex: 0,
    explanation:
      'C’est la chute d’un cas dans le suivant. Parfois volontaire pour grouper deux cas, elle est le plus souvent un bug silencieux. La forme à flèche de Java 14 supprime ce risque.',
    tags: ['switch'],
  }),

  mcq({
    id: 'java-q-boucles-1',
    domainId: D, courseId: C, lessonId: 'java-l-boucles',
    topic: 'boucles',
    prompt: 'Combien de tours effectue cette boucle ?',
    code: 'for (int i = 0; i < 5; i++) { }',
    language: 'java',
    type: 'code_output',
    options: ['5', '4', '6', 'Une infinité'],
    answerIndex: 0,
    explanation:
      'i prend les valeurs 0, 1, 2, 3, 4 : cinq tours. À i valant 5 la condition i < 5 devient fausse et la boucle s’arrête.',
    tags: ['boucles'],
  }),
  mcq({
    id: 'java-q-boucles-2',
    domainId: D, courseId: C, lessonId: 'java-l-boucles',
    topic: 'boucles',
    prompt: 'Quand faut-il préférer for-each à une boucle for classique ?',
    options: [
      'Quand on veut simplement parcourir chaque élément sans avoir besoin de l’indice',
      'Quand on veut parcourir la collection à l’envers',
      'Quand on veut supprimer des éléments pendant le parcours',
      'Quand on veut avancer de deux en deux',
    ],
    answerIndex: 0,
    explanation:
      'for-each supprime l’indice, donc les erreurs de borne. Les trois autres cas ont justement besoin de l’indice ou d’un itérateur explicite.',
    tags: ['boucles'],
  }),
  mcq({
    id: 'java-q-break-1',
    domainId: D, courseId: C, lessonId: 'java-l-break-continue',
    topic: 'boucles',
    prompt: 'Quelle est la différence entre break et continue ?',
    options: [
      'break sort de la boucle, continue passe au tour suivant',
      'break passe au tour suivant, continue sort de la boucle',
      'Les deux sortent de la boucle, break est plus rapide',
      'continue ne fonctionne que dans un switch',
    ],
    answerIndex: 0,
    explanation:
      'break interrompt la boucle entièrement, continue abandonne seulement le tour en cours. Les deux ne concernent que la boucle la plus proche.',
    tags: ['boucles'],
  }),

  mcq({
    id: 'java-q-methodes-1',
    domainId: D, courseId: C, lessonId: 'java-l-methodes',
    topic: 'méthode',
    prompt: 'Complète la signature : public static ______ getNom() { return nom; } où nom est une String.',
    options: ['String', 'void', 'int', 'char'],
    answerIndex: 0,
    explanation:
      'Le type de retour doit correspondre à ce que renvoie return. La méthode renvoie une String, donc le type déclaré est String. void signifierait qu’elle ne renvoie rien.',
    tags: ['méthode'],
  }),
  mcq({
    id: 'java-q-methodes-2',
    domainId: D, courseId: C, lessonId: 'java-l-methodes',
    topic: 'méthode',
    prompt: 'Pourquoi découper un programme en méthodes ?',
    options: [
      'Pour éviter la répétition, nommer l’intention et pouvoir tester chaque partie',
      'Parce que Java limite la taille d’une méthode à 50 lignes',
      'Pour que le programme démarre plus vite',
      'Parce que la JVM refuse les méthodes longues',
    ],
    answerIndex: 0,
    explanation:
      'Trois gains : ne pas répéter, expliciter l’intention par un nom, et rendre chaque traitement testable isolément.',
    tags: ['méthode'],
  }),
  mcq({
    id: 'java-q-surcharge-1',
    domainId: D, courseId: C, lessonId: 'java-l-surcharge',
    topic: 'surcharge',
    prompt: 'Peut-on distinguer deux surcharges uniquement par leur type de retour ?',
    options: [
      'Non : int calculer() et double calculer() ne compilent pas ensemble',
      'Oui, le compilateur choisit d’après le type attendu',
      'Oui, mais seulement pour les types primitifs',
      'Oui, à condition de les déclarer static',
    ],
    answerIndex: 0,
    explanation:
      'La signature retenue pour distinguer deux surcharges est le nom plus les types de paramètres. Le type de retour n’en fait pas partie : à l’appel, rien ne permettrait de choisir.',
    tags: ['surcharge'],
  }),
];
