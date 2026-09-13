import type { QuizQuestion } from '@/models';
import { fillBlank, mcq, trueFalse } from '../builders';
import { D } from './shared';

const C = 'java-c2-objet';

export const objetQuestions: QuizQuestion[] = [
  mcq({
    id: 'java-q-poo-1',
    domainId: D, courseId: C, lessonId: 'java-l-poo',
    topic: 'POO',
    prompt: 'Que regroupe un objet en programmation orientée objet ?',
    options: [
      'Des données (attributs) et des comportements (méthodes) qui agissent sur elles',
      'Uniquement des fonctions, sans état',
      'Uniquement des données, sans traitement',
      'Des fichiers de configuration',
    ],
    answerIndex: 0,
    explanation:
      'C’est le principe : l’état et les comportements qui le manipulent vivent au même endroit. accelerer() modifie la vitesse de sa propre voiture sans qu’on la lui passe.',
    tags: ['poo'],
  }),
  mcq({
    id: 'java-q-classe-1',
    domainId: D, courseId: C, lessonId: 'java-l-classes',
    topic: 'classe',
    prompt: 'Quelle est la différence entre une classe et un objet ?',
    options: [
      'La classe est le modèle, l’objet est un exemplaire créé d’après ce modèle',
      'L’objet est le modèle, la classe est un exemplaire',
      'Ce sont deux mots pour la même chose',
      'La classe contient les valeurs, l’objet contient les méthodes',
    ],
    answerIndex: 0,
    explanation:
      'La classe est le plan de l’architecte, l’objet la maison bâtie d’après lui. Un plan, autant de maisons que l’on veut, chacune avec ses propres valeurs.',
    tags: ['classe', 'objet'],
  }),
  mcq({
    id: 'java-q-objet-1',
    domainId: D, courseId: C, lessonId: 'java-l-classes',
    topic: 'objet',
    prompt: 'Que produit ce code ?',
    code: `Personne p1 = new Personne();
Personne p2 = new Personne();
p1.nom = "Said";
p2.nom = "Ali";
System.out.println(p1.nom);`,
    language: 'java',
    type: 'code_output',
    options: ['Said', 'Ali', 'null', 'Une erreur de compilation'],
    answerIndex: 0,
    explanation:
      'Chaque new crée un objet distinct avec ses propres attributs. Modifier p2 ne touche jamais p1.',
    tags: ['objet'],
  }),

  mcq({
    id: 'java-q-attribut-1',
    domainId: D, courseId: C, lessonId: 'java-l-attributs',
    topic: 'attribut',
    prompt: 'Pourquoi chaque objet Voiture possède-t-il sa propre vitesse ?',
    options: [
      'Parce qu’un attribut d’instance est stocké dans l’objet lui-même, pas dans la classe',
      'Parce que la JVM copie la classe à chaque appel de méthode',
      'Parce que vitesse est déclarée static',
      'Parce que Java interdit le partage de variables',
    ],
    answerIndex: 0,
    explanation:
      'new réserve un emplacement mémoire propre à chaque objet. Sans cela, accélérer une voiture accélérerait toutes les autres.',
    tags: ['attribut'],
  }),
  mcq({
    id: 'java-q-attribut-2',
    domainId: D, courseId: C, lessonId: 'java-l-attributs',
    topic: 'attribut',
    prompt: 'Une méthode static peut-elle lire un attribut d’instance ?',
    options: [
      'Non, car elle s’exécute sans objet de rattachement',
      'Oui, Java choisit automatiquement le premier objet créé',
      'Oui, à condition que l’attribut soit public',
      'Oui, mais seulement dans le constructeur',
    ],
    answerIndex: 0,
    explanation:
      'Une méthode static appartient à la classe. Aucun objet ne lui est associé, donc aucun attribut d’instance à lire : « non-static variable cannot be referenced from a static context ».',
    tags: ['static'],
  }),

  mcq({
    id: 'java-q-constructeur-1',
    domainId: D, courseId: C, lessonId: 'java-l-constructeurs',
    topic: 'constructeur',
    prompt: 'Dans this.nom = nom;, que désigne chaque partie ?',
    options: [
      'this.nom est l’attribut de l’objet, nom est le paramètre du constructeur',
      'this.nom est le paramètre, nom est l’attribut',
      'Les deux désignent le même attribut',
      'this.nom est une variable locale temporaire',
    ],
    answerIndex: 0,
    explanation:
      'Le paramètre masque l’attribut à l’intérieur du constructeur. this lève l’ambiguïté : à gauche l’attribut de l’objet, à droite la valeur reçue.',
    tags: ['constructeur', 'this'],
  }),
  mcq({
    id: 'java-q-constructeur-2',
    domainId: D, courseId: C, lessonId: 'java-l-constructeurs',
    topic: 'constructeur',
    prompt: 'Où est le problème ?',
    code: `public class Personne {
    private String nom;

    public Personne(String nom) {
        nom = nom;
    }
}`,
    language: 'java',
    type: 'find_bug',
    options: [
      'Il manque this : nom = nom affecte le paramètre à lui-même et laisse l’attribut à null',
      'Le constructeur doit déclarer un type de retour',
      'Le constructeur ne peut pas être public',
      'Il manque un appel à super()',
    ],
    answerIndex: 0,
    explanation:
      'Le code compile mais ne fait rien : les deux nom désignent le paramètre. Il faut écrire this.nom = nom. Les analyseurs signalent cette « self-assignment ».',
    tags: ['constructeur', 'bug'],
  }),

  mcq({
    id: 'java-q-encapsulation-1',
    domainId: D, courseId: C, lessonId: 'java-l-encapsulation',
    topic: 'encapsulation',
    prompt: 'Pourquoi private double solde est-il préférable à public double solde ?',
    options: [
      'Parce que la classe reste seule responsable de son état et peut imposer ses règles',
      'Parce que private accélère l’accès au champ',
      'Parce que public est interdit sur les nombres à virgule',
      'Parce que private réduit la mémoire occupée',
    ],
    answerIndex: 0,
    explanation:
      'Avec un champ public, n’importe quel code peut écrire compte.solde = -5000. En private, tout passage se fait par deposer, donc la vérification a toujours lieu.',
    tags: ['encapsulation'],
  }),
  trueFalse({
    id: 'java-q-encapsulation-2',
    domainId: D, courseId: C, lessonId: 'java-l-encapsulation',
    topic: 'encapsulation',
    prompt: 'Générer un getter et un setter pour chaque attribut suffit à encapsuler une classe.',
    answer: false,
    explanation:
      'Un setter sans règle autorise exactement ce que le champ public autorisait : c’est un champ public déguisé. L’encapsulation commence quand la méthode refuse quelque chose.',
    tags: ['encapsulation'],
  }),

  mcq({
    id: 'java-q-visibilite-1',
    domainId: D, courseId: C, lessonId: 'java-l-modificateurs',
    topic: 'visibilité',
    prompt: 'Depuis où un membre protected est-il visible ?',
    options: [
      'Depuis le même package et depuis les sous-classes',
      'Depuis la classe uniquement',
      'Depuis tout le programme',
      'Depuis les sous-classes uniquement, jamais depuis le package',
    ],
    answerIndex: 0,
    explanation:
      'protected couvre le package plus les sous-classes, y compris celles d’un autre package. Sans modificateur, la visibilité se limite au package.',
    tags: ['visibilité'],
  }),
  trueFalse({
    id: 'java-q-visibilite-2',
    domainId: D, courseId: C, lessonId: 'java-l-modificateurs',
    topic: 'visibilité',
    prompt: 'private final List<String> noms = new ArrayList<>(); interdit d’ajouter un élément à la liste.',
    answer: false,
    explanation:
      'final fige la référence, pas le contenu. Remplacer la liste est interdit, mais noms.add("Said") reste parfaitement autorisé. Pour un contenu figé, il faut List.copyOf ou une liste non modifiable.',
    tags: ['final'],
  }),

  mcq({
    id: 'java-q-heritage-1',
    domainId: D, courseId: C, lessonId: 'java-l-heritage',
    topic: 'héritage',
    prompt: 'Pourquoi chien.manger() fonctionne-t-il alors que manger n’est pas déclarée dans Chien ?',
    options: [
      'Parce que Chien hérite de manger() via extends Animal',
      'Parce que Java copie les méthodes du parent dans l’enfant à la compilation',
      'Parce que manger est static',
      'Parce que Chien et Animal sont dans le même package',
    ],
    answerIndex: 0,
    explanation:
      'La JVM cherche la méthode dans la classe de l’objet, puis remonte de parent en parent jusqu’à Object. Elle trouve manger() dans Animal.',
    tags: ['héritage'],
  }),
  mcq({
    id: 'java-q-heritage-2',
    domainId: D, courseId: C, lessonId: 'java-l-heritage',
    topic: 'héritage',
    prompt: 'Voiture doit-elle hériter de Moteur ?',
    options: [
      'Non : une voiture a un moteur, elle n’en est pas un. C’est un attribut, pas un extends',
      'Oui, cela évite de réécrire les méthodes du moteur',
      'Oui, si Moteur est déclarée abstract',
      'Oui, à condition d’ajouter une interface',
    ],
    answerIndex: 0,
    explanation:
      'Le test est toujours « X est un Y ». « Une voiture est un moteur » sonne faux : c’est une relation « a un », qui se traduit par la composition.',
    tags: ['héritage', 'composition'],
  }),
  mcq({
    id: 'java-q-super-1',
    domainId: D, courseId: C, lessonId: 'java-l-super-object',
    topic: 'héritage',
    prompt: 'Où doit se trouver l’appel à super(...) dans un constructeur ?',
    options: [
      'En toute première instruction du constructeur',
      'En dernière instruction, une fois l’enfant initialisé',
      'N’importe où dans le constructeur',
      'Dans la déclaration de la classe, après extends',
    ],
    answerIndex: 0,
    explanation:
      'La partie parent doit exister avant qu’on complète la partie enfant. Si tu ne l’écris pas, Java tente d’insérer super() sans paramètre — et échoue si le parent n’en a pas.',
    tags: ['super'],
  }),
  mcq({
    id: 'java-q-equals-1',
    domainId: D, courseId: C, lessonId: 'java-l-super-object',
    topic: 'equals',
    prompt: 'Que se passe-t-il si l’on redéfinit equals sans redéfinir hashCode, puis qu’on utilise la classe comme clé de HashMap ?',
    options: [
      'La recherche échoue silencieusement : deux objets égaux tombent dans des casiers différents',
      'Le code ne compile pas',
      'Une exception est levée à l’insertion',
      'Rien, hashCode n’intervient pas dans une HashMap',
    ],
    answerIndex: 0,
    explanation:
      'HashMap cherche d’abord le casier par hashCode, puis compare par equals à l’intérieur. Des hashCode différents empêchent les deux objets de se rencontrer. Aucune erreur n’est signalée : c’est un bug muet.',
    tags: ['equals', 'hashCode'],
  }),

  mcq({
    id: 'java-q-polymorphisme-1',
    domainId: D, courseId: C, lessonId: 'java-l-polymorphisme',
    topic: 'polymorphisme',
    prompt: 'Que produit ce code, sachant que Chien redéfinit parler() ?',
    code: `Animal animal = new Chien();
animal.parler();`,
    language: 'java',
    type: 'code_output',
    options: ['Wouf', 'Animal', 'Une erreur de compilation', 'Rien'],
    answerIndex: 0,
    explanation:
      'C’est le dispatch dynamique. Le compilateur vérifie seulement qu’Animal possède parler(). À l’exécution, la JVM regarde le type réel de l’objet — un Chien — et exécute sa version.',
    tags: ['polymorphisme'],
  }),
  mcq({
    id: 'java-q-polymorphisme-2',
    domainId: D, courseId: C, lessonId: 'java-l-polymorphisme',
    topic: 'polymorphisme',
    prompt: 'Que se passe-t-il avec Animal animal = new Chien(); animal.aboyer(); ?',
    options: [
      'Erreur de compilation : le type déclaré Animal ne connaît pas aboyer()',
      'Affiche Wouf, car l’objet est un Chien',
      'Compile mais lève une exception à l’exécution',
      'Affiche Animal',
    ],
    answerIndex: 0,
    explanation:
      'Le type déclaré fixe ce que tu as le droit d’appeler ; le type réel fixe la version exécutée. L’objet sait aboyer, la variable ne le sait pas.',
    tags: ['polymorphisme'],
  }),

  mcq({
    id: 'java-q-abstraction-1',
    domainId: D, courseId: C, lessonId: 'java-l-abstraction',
    topic: 'abstraction',
    prompt: 'Pourquoi déclarer parler() abstraite plutôt que lui donner un corps vide ?',
    options: [
      'Pour que le compilateur oblige chaque enfant à la fournir',
      'Pour que la méthode s’exécute plus rapidement',
      'Parce qu’un corps vide est interdit en Java',
      'Pour pouvoir instancier Animal directement',
    ],
    answerIndex: 0,
    explanation:
      'Un corps vide serait hérité en silence : une classe qui oublie de le redéfinir compilerait et resterait muette. Abstraite, la méthode devient une obligation vérifiée.',
    tags: ['abstraction'],
  }),

  mcq({
    id: 'java-q-interface-1',
    domainId: D, courseId: C, lessonId: 'java-l-interfaces',
    topic: 'interface',
    prompt: 'Quelle est la différence structurelle majeure entre héritage et interface ?',
    options: [
      'On n’hérite que d’une seule classe, mais on implémente autant d’interfaces qu’on veut',
      'Une interface peut contenir des attributs d’instance, pas une classe abstraite',
      'L’héritage est vérifié à l’exécution, l’interface à la compilation',
      'Une interface ne peut pas être utilisée comme type de variable',
    ],
    answerIndex: 0,
    explanation:
      'C’est souvent ce qui tranche : l’unique droit d’héritage est précieux, alors que les interfaces se cumulent. Une classe peut extends Animal implements Volant, Nageur.',
    tags: ['interface', 'héritage'],
  }),
  fillBlank({
    id: 'java-q-interface-2',
    domainId: D, courseId: C, lessonId: 'java-l-interfaces',
    topic: 'interface',
    prompt: 'Quel mot-clé une classe utilise-t-elle pour s’engager à respecter une interface ?',
    answer: 'implements',
    accepted: ['implements'],
    explanation:
      'extends sert à hériter d’une classe, implements à respecter une interface. Une interface, elle, peut extends une autre interface.',
    tags: ['interface'],
  }),

  mcq({
    id: 'java-q-composition-1',
    domainId: D, courseId: C, lessonId: 'java-l-composition',
    topic: 'composition',
    prompt: 'Pourquoi préférer souvent la composition à l’héritage ?',
    options: [
      'Parce qu’elle ne dépend que d’une interface publique, et que le composant reste remplaçable',
      'Parce qu’elle consomme moins de mémoire',
      'Parce que l’héritage est déprécié depuis Java 17',
      'Parce que la composition évite d’écrire des interfaces',
    ],
    answerIndex: 0,
    explanation:
      'L’héritage lie l’enfant à l’implémentation du parent : la modifier peut casser des enfants écrits ailleurs. La composition dépend d’un contrat public et autorise le remplacement, même à l’exécution.',
    tags: ['composition', 'SOLID'],
  }),
];
