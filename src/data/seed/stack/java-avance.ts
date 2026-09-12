import {
  badGood,
  code,
  codeExplain,
  compare,
  def,
  flow,
  interview,
  keypoints,
  memorize,
  question,
  quiz,
  step,
  steps,
  techDef,
  text,
  tip,
  warn,
  why,
  type CourseSpec,
} from '../builders';

/**
 * Java avancé : ce que le langage ne montre pas.
 *
 * Le domaine `java` couvre déjà la syntaxe, la POO, les collections et les
 * streams. Ce cours part de là et descend d'un étage : comment le code devient
 * exécutable, où vivent les objets, pourquoi deux objets « égaux » ne le sont
 * pas, et ce qui distingue réellement deux implémentations de `List`.
 */
export const javaAvanceCourse: CourseSpec = {
  id: 'stack-c-java-avance',
  title: 'Java avancé',
  description: 'Bytecode, JVM, mémoire, égalité, collections en profondeur, generics et versions.',
  icon: 'code',
  level: 'avance',
  tags: ['java', 'jvm', 'collections'],
  pathId: 'stack-path-java-avance',
  chapters: [
    {
      id: 'stack-ch-compilation',
      title: 'De la source au code exécuté',
      description: 'Ce qui se passe entre le fichier .java et la machine.',
      lessons: [
        {
          id: 'stack-l-bytecode',
          title: 'Bytecode : le format intermédiaire',
          summary: 'Pourquoi Java ne compile pas directement vers le processeur.',
          minutes: 9,
          difficulty: 'moyen',
          requires: ['java-l-jvm', 'java-l-compiler-executer'],
          concepts: ['jvm', 'compilation'],
          blocks: [
            why(
              'Pourquoi un format intermédiaire plutôt que du code machine ?',
              'Le code machine est propre à un processeur et à un système. Si `javac` produisait directement du code x86, il faudrait recompiler pour ARM, pour un Mac, pour un serveur Linux. Le bytecode est un format unique que chaque JVM sait traduire pour sa propre machine : on compile une fois, on exécute partout où une JVM existe.',
            ),
            def(
              'Bytecode',
              'Le bytecode est le jeu d’instructions produit par le compilateur Java et compris par la JVM. Ce n’est ni du texte lisible ni du code machine : c’est un format intermédiaire, indépendant du processeur.',
            ),
            techDef(
              'Fichier .class',
              'Un fichier `.class` contient le bytecode d’un seul type compilé, accompagné de sa table de constantes, de la signature de ses membres et de ses métadonnées. C’est l’unité que le ClassLoader charge à l’exécution.',
            ),
            flow(
              [
                step(
                  'Fichier .java',
                  'Le code que tu écris',
                  'Du texte, soumis aux règles de syntaxe et de typage de Java. Il ne s’exécute pas.',
                  'Sans source, rien à compiler — mais la JVM sait exécuter un .class dont on a perdu la source.',
                ),
                step(
                  'javac',
                  'Le compilateur',
                  'Il vérifie la syntaxe et les types, refuse le code invalide, et traduit chaque type en bytecode. C’est lui qui attrape les erreurs dites « de compilation ».',
                  'Sans compilation, aucune vérification statique : toutes les erreurs de type se découvriraient en production.',
                  'D’autres langages (Kotlin, Scala, Groovy) ont leur propre compilateur qui vise le même bytecode.',
                ),
                step(
                  'Fichier .class (bytecode)',
                  'Le format portable',
                  'Le résultat de la compilation, indépendant de la machine. C’est ce qu’on empaquette dans un JAR.',
                  'Sans format intermédiaire, il faudrait un binaire par plateforme.',
                ),
                step(
                  'ClassLoader',
                  'Le chargeur de classes',
                  'Il localise le .class, le lit, le vérifie et construit la représentation du type en mémoire — à la demande, la première fois que le type est utilisé.',
                  'Sans lui, pas de chargement dynamique : ni plugins, ni frameworks qui découvrent des classes au démarrage.',
                ),
                step(
                  'Interprétation puis JIT',
                  'L’exécution',
                  'La JVM commence par interpréter le bytecode, mesure ce qui est appelé souvent, puis fait compiler ces portions en code machine optimisé.',
                  'Sans JIT, tout resterait interprété : correct, mais nettement plus lent sur du code chaud.',
                ),
                step(
                  'Code machine',
                  'Ce que le processeur exécute',
                  'Les instructions natives réellement exécutées, produites à la volée pour cette machine précise.',
                  'C’est le bout de la chaîne : il n’y a rien après.',
                ),
              ],
              'De .java à l’exécution',
            ),
            tip(
              'Le raccourci « Java est un langage interprété » est faux, et « Java est compilé » l’est tout autant. Java est compilé en bytecode, puis ce bytecode est interprété **et** compilé à chaud. Dire les deux moitiés est ce qui fait la différence en entretien.',
            ),
            memorize('stack-d-bytecode'),
            quiz('stack-q-bytecode-1'),
            interview({
              question: 'Que se passe-t-il entre le moment où tu écris du code Java et son exécution ?',
              short:
                '`javac` compile le .java en bytecode dans un .class. Ce bytecode est portable : il ne vise aucun processeur en particulier. À l’exécution, le ClassLoader charge la classe, puis la JVM interprète le bytecode et fait compiler en code machine par le JIT les portions les plus sollicitées.',
              detailed:
                'La compilation est statique : `javac` vérifie la syntaxe et les types, refuse ce qui ne compile pas, et produit un fichier .class par type, contenant du bytecode et une table de constantes. Ce bytecode ne dépend d’aucune plateforme, c’est ce qui rend le JAR portable. À l’exécution, la JVM ne charge pas tout d’un coup : le ClassLoader résout chaque classe à sa première utilisation, la vérifie, et l’initialise. Le bytecode est d’abord interprété, ce qui démarre vite mais s’exécute lentement. En parallèle la JVM compte les appels ; au-delà d’un seuil, le JIT compile la méthode en code machine optimisé, en s’appuyant sur ce qu’il a réellement observé à l’exécution — quel type concret passe dans telle méthode, quelle branche est prise. C’est pour ça qu’une application Java est plus lente pendant ses premières secondes, et pourquoi un benchmark sans échauffement ne veut rien dire.',
              followUps: [
                [
                  'Pourquoi le JIT peut-il produire du code plus rapide qu’une compilation statique ?',
                  'Parce qu’il optimise sur des informations que le compilateur statique n’a pas : le type réel observé à cet appel, la branche effectivement prise, la valeur en pratique constante. Il peut alors inliner une méthode virtuelle ou supprimer une branche morte. Si l’hypothèse se révèle fausse, il déoptimise et recompile.',
                ],
                [
                  'À quel moment une classe est-elle chargée ?',
                  'À sa première utilisation active — création d’une instance, accès à un membre statique, appel d’une méthode statique — pas au démarrage de l’application. C’est pour ça qu’une erreur de classpath peut n’apparaître qu’après plusieurs minutes de fonctionnement.',
                ],
              ],
            }),
          ],
          definitions: [
            {
              id: 'stack-d-bytecode',
              title: 'Bytecode',
              text: 'Le bytecode est le jeu d’instructions produit par le compilateur Java et compris par la machine virtuelle. Il ne vise aucun processeur en particulier, ce qui rend le même fichier compilé exécutable sur toute machine disposant d’une JVM.',
              tags: ['java', 'jvm'],
            },
          ],
        },
        {
          id: 'stack-l-jit',
          title: 'JIT et code chaud',
          summary: 'Pourquoi une application Java accélère après quelques secondes.',
          minutes: 8,
          difficulty: 'difficile',
          requires: ['stack-l-bytecode'],
          concepts: ['jvm', 'performance'],
          blocks: [
            def(
              'Compilation à la volée',
              'La compilation à la volée est la traduction du bytecode en code machine pendant que le programme tourne. La machine virtuelle ne traduit que le code réellement sollicité, au lieu de tout traduire à l’avance.',
            ),
            techDef(
              'JIT',
              'Le compilateur JIT compile en code natif les méthodes dont le compteur d’invocations dépasse un seuil, en s’appuyant sur le profil d’exécution observé. Il pratique des optimisations spéculatives — inlining, élimination de branches, désvirtualisation — assorties de points de déoptimisation si l’hypothèse devient fausse.',
            ),
            why(
              'Pourquoi ne pas tout compiler au démarrage ?',
              'Parce que la plus grande partie du code d’une application ne s’exécute presque jamais : initialisation, gestion de cas d’erreur, branches rares. Tout compiler coûterait un démarrage très long pour un gain nul. La JVM parie donc sur l’inverse : démarrer en interprétant, et n’investir la compilation que là où elle sera rentabilisée.',
            ),
            keypoints(
              [
                'Le code « chaud » est le code exécuté souvent ; c’est lui que le JIT compile.',
                'Les premières exécutions sont les plus lentes : c’est l’échauffement.',
                'Un microbenchmark sans échauffement mesure l’interpréteur, pas l’application.',
                'Les optimisations sont spéculatives : la JVM peut revenir en arrière si son pari est démenti.',
              ],
              'Ce qu’il faut retenir du JIT',
            ),
            warn(
              'Ne conclus jamais à un problème de performance sur la base des toutes premières requêtes après un démarrage. Laisse l’application chauffer, puis mesure. Beaucoup de « régressions » rapportées en recette sont un échauffement mal interprété.',
            ),
            memorize('stack-d-jit'),
            quiz('stack-q-jit-1'),
          ],
          definitions: [
            {
              id: 'stack-d-jit',
              title: 'Compilation à la volée (JIT)',
              text: 'La compilation à la volée traduit en code machine les méthodes que la machine virtuelle voit s’exécuter souvent. Elle démarre en interprétant le bytecode, puis investit la compilation uniquement là où le code est réellement sollicité.',
              tags: ['java', 'jvm', 'performance'],
            },
          ],
        },
      ],
    },
    {
      id: 'stack-ch-memoire',
      title: 'Mémoire de la JVM',
      description: 'Où vivent les objets et qui les efface.',
      lessons: [
        {
          id: 'stack-l-heap-stack',
          title: 'Heap et Stack',
          summary: 'Deux zones, deux durées de vie, deux erreurs différentes.',
          minutes: 10,
          difficulty: 'moyen',
          requires: ['stack-l-bytecode', 'java-l-methodes'],
          concepts: ['jvm', 'memoire'],
          blocks: [
            def(
              'Tas (heap)',
              'Le tas est la zone de mémoire où la machine virtuelle place les objets. Tous les threads y accèdent, et un objet y reste tant que quelque chose le référence encore.',
            ),
            def(
              'Pile (stack)',
              'La pile est la zone propre à chaque thread où s’empilent les appels de méthodes. Chaque appel y pose un cadre contenant ses variables locales, et ce cadre disparaît dès que la méthode rend la main.',
            ),
            compare(
              ['Pile (stack)', 'Tas (heap)'],
              [
                ['Contenu', 'Cadres d’appel, variables locales, références', 'Les objets eux-mêmes'],
                ['Portée', 'Un par thread, privé', 'Partagé par tous les threads'],
                ['Libération', 'Automatique au retour de la méthode', 'Par le ramasse-miettes, quand plus rien ne référence'],
                ['Taille', 'Petite, réglée par -Xss', 'Grande, réglée par -Xmx'],
                ['Erreur typique', 'StackOverflowError', 'OutOfMemoryError: Java heap space'],
              ],
              'Les deux zones ne se confondent pas',
            ),
            codeExplain(
              [
                ['void traiter() {', 'Un cadre est posé sur la pile du thread courant.'],
                ['  int total = 0;', '`total` est une variable locale : sa valeur vit dans le cadre, sur la pile.'],
                ['  List<String> lignes = new ArrayList<>();', 'La **liste** est créée sur le tas. Seule la référence `lignes` est sur la pile.'],
                ['  lignes.add("a");', 'On manipule l’objet du tas à travers la référence.'],
                ['}', 'Le cadre est dépilé : `total` et la référence disparaissent. L’objet ArrayList devient inatteignable et sera ramassé.'],
              ],
              'Qui vit où',
            ),
            warn(
              'Une variable locale de type objet n’est pas l’objet. Si tu passes `lignes` à une autre méthode qui la stocke dans un champ, l’objet survivra à la fin de `traiter()` : c’est la référence qui a disparu, pas forcément l’objet.',
            ),
            memorize('stack-d-heap'),
            memorize('stack-d-stack'),
            quiz('stack-q-memoire-1'),
          ],
          definitions: [
            {
              id: 'stack-d-heap',
              title: 'Tas (heap)',
              text: 'Le tas est la zone de mémoire partagée où la machine virtuelle place tous les objets créés par le programme. Un objet y survit tant qu’une référence permet encore de l’atteindre, et disparaît quand le ramasse-miettes constate que plus personne ne peut y accéder.',
              tags: ['java', 'jvm', 'memoire'],
            },
            {
              id: 'stack-d-stack',
              title: 'Pile d’exécution (stack)',
              text: 'La pile d’exécution est la zone propre à chaque thread où s’empilent les cadres des appels de méthodes. Chaque cadre contient les variables locales de la méthode et disparaît automatiquement dès que celle-ci rend la main.',
              tags: ['java', 'jvm', 'memoire'],
            },
          ],
        },
        {
          id: 'stack-l-gc',
          title: 'Le ramasse-miettes',
          summary: 'Ce qu’il fait vraiment, et pourquoi il n’empêche pas les fuites.',
          minutes: 10,
          difficulty: 'difficile',
          requires: ['stack-l-heap-stack'],
          concepts: ['jvm', 'memoire', 'performance'],
          blocks: [
            def(
              'Ramasse-miettes',
              'Le ramasse-miettes est le mécanisme qui libère automatiquement les objets devenus inatteignables. Il part des racines du programme et conserve tout ce qu’il peut atteindre ; le reste est considéré comme perdu et récupéré.',
            ),
            why(
              'Pourquoi une fuite mémoire reste possible malgré lui ?',
              'Le ramasse-miettes ne libère pas ce qui est « inutile », il libère ce qui est **inatteignable**. Une entrée oubliée dans une `Map` statique, un écouteur jamais désinscrit, un cache sans limite de taille : ces objets sont parfaitement atteignables, donc conservés, même si plus aucune logique ne s’en sert. C’est exactement le scénario d’une mémoire qui monte lentement jusqu’à l’OutOfMemoryError.',
            ),
            badGood({
              language: 'java',
              title: 'Un cache maison qui ne rend jamais la mémoire',
              bad: `public class Cache {\n    private static final Map<String, Rapport> CACHE = new HashMap<>();\n\n    public static Rapport get(String cle) {\n        return CACHE.computeIfAbsent(cle, Cache::charger);\n    }\n}`,
              good: `public class Cache {\n    private static final Cache<String, Rapport> CACHE = Caffeine.newBuilder()\n            .maximumSize(10_000)\n            .expireAfterWrite(Duration.ofMinutes(10))\n            .build();\n\n    public static Rapport get(String cle) {\n        return CACHE.get(cle, Cache::charger);\n    }\n}`,
              why: 'La première version grandit indéfiniment : la Map est statique, donc une racine, donc tout ce qu’elle contient reste atteignable pour toujours. La seconde borne explicitement la taille et la durée de vie. Un cache sans limite n’est pas un cache, c’est une fuite avec un nom rassurant.',
            }),
            steps(
              [
                'Le ramasse-miettes part des racines : variables sur les piles des threads, champs statiques, références JNI.',
                'Il marque tout objet atteignable depuis ces racines, de proche en proche.',
                'Les objets non marqués sont inatteignables : personne ne peut plus les lire.',
                'Il récupère leur mémoire, et selon l’algorithme, compacte le tas pour éviter la fragmentation.',
                'Certaines phases suspendent brièvement les threads applicatifs : ce sont les pauses.',
              ],
              'Comment il décide',
            ),
            tip(
              'Ne cherche pas à « aider » le ramasse-miettes en appelant `System.gc()` : c’est une suggestion, pas un ordre, et dans une application qui va mal cela aggrave généralement les pauses. Si la mémoire pose problème, mesure d’abord avec les métriques de la JVM et un histogramme du tas.',
            ),
            memorize('stack-d-gc'),
            quiz('stack-q-gc-1'),
            interview({
              question: 'Si Java a un ramasse-miettes, comment une fuite mémoire est-elle possible ?',
              short:
                'Parce que le ramasse-miettes libère ce qui est inatteignable, pas ce qui est inutile. Tant qu’une référence existe — typiquement une collection statique ou un cache sans limite — l’objet reste atteignable et n’est jamais libéré, même si plus personne ne s’en sert.',
              detailed:
                'Le ramasse-miettes fonctionne par atteignabilité : il part d’un ensemble de racines — les piles des threads, les champs statiques, quelques références natives — et conserve tout ce qu’il peut atteindre en suivant les références. Une fuite en Java n’est donc jamais un oubli de `free`, c’est une référence involontairement conservée. Les cas classiques : une `Map` statique utilisée comme cache sans taille maximale ni expiration, un écouteur enregistré et jamais désinscrit, une `ThreadLocal` non nettoyée sur un pool de threads qui recycle ses threads, une collection à laquelle on ajoute sans jamais retirer. Le symptôme est caractéristique : la mémoire après chaque cycle complet de ramassage monte en escalier au lieu de redescendre au même niveau, et finit en OutOfMemoryError. Pour le diagnostiquer, on regarde le tas après collecte plutôt que la mémoire instantanée, puis on prend un cliché du tas et on cherche quel objet retient le plus de mémoire et par quelle chaîne de références.',
              followUps: [
                [
                  'Comment distingues-tu une fuite d’une simple charge élevée ?',
                  'Par la forme de la courbe du tas **après** ramassage complet. Sous forte charge, elle monte puis redescend au même plancher. En cas de fuite, le plancher lui-même monte à chaque cycle et ne redescend jamais.',
                ],
                [
                  'Qu’est-ce qu’une pause du ramasse-miettes et pourquoi s’en soucier ?',
                  'Certaines phases suspendent les threads applicatifs. Si ces pauses durent, elles se voient directement dans la latence des requêtes — et souvent, une longue pause n’est pas un problème de réglage mais le signe d’un tas trop rempli, donc d’un problème d’allocation ou de rétention en amont.',
                ],
              ],
            }),
          ],
          definitions: [
            {
              id: 'stack-d-gc',
              title: 'Ramasse-miettes',
              text: 'Le ramasse-miettes libère automatiquement la mémoire des objets devenus inatteignables depuis les racines du programme. Il ne supprime pas ce qui est inutile mais ce qui est inaccessible, raison pour laquelle une référence oubliée dans une collection statique provoque une fuite malgré lui.',
              tags: ['java', 'jvm', 'memoire'],
            },
          ],
        },
      ],
    },
    {
      id: 'stack-ch-egalite',
      title: 'Égalité et identité',
      description: 'Le contrat equals/hashCode, et les bugs quand il est rompu.',
      lessons: [
        {
          id: 'stack-l-equals-hashcode',
          title: 'equals() et hashCode()',
          summary: 'Le contrat que HashMap et HashSet supposent respecté.',
          minutes: 12,
          difficulty: 'difficile',
          requires: ['java-l-classes', 'java-l-collections'],
          concepts: ['collections', 'egalite'],
          blocks: [
            text(
              'Deux objets peuvent être le même objet, ou bien deux objets différents porteurs de la même valeur. Java distingue les deux, et c’est cette distinction qui fait fonctionner — ou échouer — les collections à base de hachage.',
            ),
            def(
              'Identité',
              'Deux références sont identiques quand elles désignent le même objet en mémoire. C’est ce que compare l’opérateur `==` entre deux objets.',
            ),
            def(
              'Égalité',
              'Deux objets sont égaux quand la méthode `equals` les déclare équivalents selon leur contenu. C’est à la classe de définir ce que « même valeur » signifie pour elle.',
            ),
            compare(
              ['==', 'equals()'],
              [
                ['Compare', 'Les références', 'Le contenu, selon la classe'],
                ['Redéfinissable', 'Non, c’est un opérateur', 'Oui, et c’est souvent nécessaire'],
                ['Sur les primitifs', 'Compare les valeurs, c’est correct', 'N’existe pas'],
                ['Sur String', 'Vrai seulement si c’est le même objet', 'Vrai si les caractères sont les mêmes'],
                ['Bon réflexe', 'Réservé aux primitifs et aux enums', 'Par défaut pour tout le reste'],
              ],
            ),
            why(
              'Pourquoi hashCode doit changer en même temps qu’equals ?',
              'Une `HashMap` ne compare pas ta clé à toutes les autres : ce serait linéaire. Elle calcule d’abord `hashCode()` pour choisir un compartiment, et ne compare avec `equals` que les clés de ce compartiment. Si deux objets égaux renvoient des hachages différents, ils atterrissent dans deux compartiments distincts et ne se rencontrent jamais. La map contient alors la clé, mais `get` renvoie `null`.',
            ),
            code(
              'java',
              `record Point(int x, int y) {}

class PointCasse {
    final int x, y;
    PointCasse(int x, int y) { this.x = x; this.y = y; }

    @Override
    public boolean equals(Object o) {
        return o instanceof PointCasse p && p.x == x && p.y == y;
    }
    // hashCode() n'est pas redéfini : il reste celui d'Object.
}`,
              { caption: 'Une classe où equals est redéfini, mais pas hashCode' },
            ),
            codeExplain(
              [
                ['Set<PointCasse> set = new HashSet<>();', 'Un ensemble à base de hachage.'],
                ['set.add(new PointCasse(1, 2));', 'L’objet est rangé dans le compartiment dicté par le hachage d’Object, qui dépend de l’instance.'],
                ['set.contains(new PointCasse(1, 2));', 'Un **nouvel** objet, donc un hachage différent, donc un autre compartiment. Résultat : `false`.'],
                ['set.add(new PointCasse(1, 2));', 'Il est ajouté une seconde fois : l’ensemble contient maintenant deux points « identiques ».'],
                ['// Avec le record Point, les deux méthodes sont générées ensemble : tout fonctionne.', 'C’est la raison pratique de préférer un `record` pour un porteur de valeurs.'],
              ],
              'Le bug, étape par étape',
            ),
            keypoints(
              [
                'Objets égaux ⇒ hachages obligatoirement égaux.',
                'Hachages égaux ⇏ objets égaux : c’est une collision, et c’est normal.',
                'Redéfinir l’un sans l’autre casse HashMap, HashSet et `distinct()` sur un Stream.',
                'Un champ mutable utilisé dans equals/hashCode rend l’objet introuvable après modification.',
                'Un `record` génère les deux de façon cohérente à partir de ses composants.',
              ],
              'Le contrat',
            ),
            warn(
              'Ne mets jamais dans `equals`/`hashCode` un champ que tu modifieras après avoir inséré l’objet dans un `HashSet` ou comme clé d’une `HashMap`. Le hachage change, l’objet reste dans son ancien compartiment, et il devient introuvable — y compris par lui-même.',
            ),
            memorize('stack-d-equals'),
            memorize('stack-d-hashcode'),
            quiz('stack-q-equals-1'),
            quiz('stack-q-equals-2'),
            interview({
              question: 'Pourquoi equals et hashCode sont-ils importants ?',
              short:
                'Parce que toutes les collections à base de hachage s’appuient dessus. `hashCode` choisit le compartiment, `equals` tranche à l’intérieur. Si deux objets égaux renvoient des hachages différents, la HashMap les range à deux endroits et `get` ne retrouve plus la valeur.',
              detailed:
                'Le contrat tient en une phrase : si `a.equals(b)` est vrai, alors `a.hashCode() == b.hashCode()` doit l’être aussi. L’inverse n’est pas exigé — deux objets différents peuvent partager un hachage, c’est une collision, et la HashMap la gère en comparant avec `equals` les clés du même compartiment. Le cas qui casse est donc toujours le même : on redéfinit `equals` pour comparer le contenu, on oublie `hashCode`, qui reste celui d’`Object` et dépend de l’instance. Deux objets porteurs de la même valeur tombent alors dans des compartiments différents ; `contains` renvoie faux sur un objet pourtant présent, un `HashSet` accepte des doublons, `distinct()` sur un Stream ne déduplique plus. Le second piège est la mutabilité : si un champ utilisé dans le calcul change après insertion, l’objet reste physiquement dans l’ancien compartiment alors que son hachage en désigne un autre — il devient introuvable. En pratique, on utilise un `record` quand la classe est un simple porteur de valeurs, ce qui génère les deux méthodes de façon cohérente, et on limite le calcul aux champs qui définissent réellement l’identité métier.',
              followUps: [
                [
                  'Que se passe-t-il en cas de collision dans une HashMap ?',
                  'Les entrées partagent un compartiment, chaînées entre elles. La recherche y compare les clés avec `equals`. Si le compartiment devient trop chargé et que les clés sont comparables, l’implémentation le convertit en arbre pour éviter de dégrader la recherche en parcours linéaire.',
                ],
                [
                  'Quelle est la complexité moyenne d’un get sur une HashMap ?',
                  'Constante en moyenne, tant que la fonction de hachage répartit bien. Le pire cas se dégrade si tous les éléments tombent dans le même compartiment — typiquement avec un `hashCode` qui renvoie une constante.',
                ],
                [
                  'Une HashMap est-elle thread-safe ?',
                  'Non. En accès concurrent avec écriture, elle peut se corrompre ou renvoyer des résultats incohérents. Il faut une `ConcurrentHashMap`, qui verrouille par segments plutôt que la structure entière.',
                ],
              ],
            }),
          ],
          definitions: [
            {
              id: 'stack-d-equals',
              title: 'equals()',
              text: 'La méthode equals définit ce que « deux objets de même valeur » signifie pour une classe donnée. Sans redéfinition elle compare les références, c’est-à-dire qu’un objet n’est égal qu’à lui-même.',
              tags: ['java', 'collections'],
            },
            {
              id: 'stack-d-hashcode',
              title: 'hashCode()',
              text: 'La méthode hashCode renvoie un entier utilisé par les collections à base de hachage pour choisir le compartiment d’un objet. Deux objets égaux doivent impérativement renvoyer le même entier, sinon la table les range séparément et ne les retrouve plus.',
              tags: ['java', 'collections'],
            },
          ],
        },
        {
          id: 'stack-l-reference-reel',
          title: 'Type de référence et type réel',
          summary: 'Pourquoi Animal a = new Chien() marche, et l’inverse non.',
          minutes: 10,
          difficulty: 'difficile',
          requires: ['java-l-polymorphisme', 'java-l-heritage'],
          concepts: ['poo', 'polymorphisme'],
          blocks: [
            text(
              'Une variable a deux types : celui écrit à gauche, qui décide de ce que le compilateur autorise, et celui de l’objet réellement créé, qui décide de ce qui s’exécute. Tout le polymorphisme tient dans cet écart.',
            ),
            code(
              'java',
              `Animal animal = new Chien();   // valide
animal.crier();                // exécute Chien.crier()
// animal.rapporter();         // refusé : Animal ne déclare pas rapporter()

Chien chien = new Animal();    // refusé à la compilation`,
              { caption: 'Les deux sens ne sont pas symétriques' },
            ),
            codeExplain(
              [
                ['Animal animal = new Chien();', 'Le type de référence est `Animal`, le type réel est `Chien`. Tout `Chien` **est** un `Animal`, donc l’affectation est sûre.'],
                ['animal.crier();', 'Le compilateur vérifie que `Animal` déclare `crier()`. À l’exécution, la JVM appelle la version du type réel : celle de `Chien`. C’est le dispatch dynamique.'],
                ['// animal.rapporter();', 'Refusé : le compilateur ne connaît que le type de référence, et `Animal` ne promet pas `rapporter()`. L’objet en est pourtant capable.'],
                ['Chien chien = new Animal();', 'Refusé, et c’est heureux : tout `Animal` n’est pas un `Chien`. Autoriser cela laisserait appeler `rapporter()` sur un objet qui ne sait pas le faire.'],
                ['if (animal instanceof Chien c) c.rapporter();', 'La bonne façon de récupérer les capacités du type réel : on vérifie, et la variable `c` est directement typée.'],
              ],
              'Ligne par ligne',
            ),
            def(
              'Dispatch dynamique',
              'Le dispatch dynamique est le choix de la méthode à exécuter en fonction du type réel de l’objet, et non du type de la variable qui le référence. C’est ce qui fait qu’une méthode redéfinie est bien celle qui s’exécute.',
            ),
            why(
              'Pourquoi cet écart est utile plutôt que gênant ?',
              'Parce qu’il permet d’écrire du code qui manipule des `Animal` sans rien savoir des espèces existantes. Ajouter un `Chat` demain n’oblige à modifier aucune des méthodes qui prennent un `Animal` en paramètre. Le type de référence définit le contrat minimal ; le type réel apporte le comportement.',
            ),
            badGood({
              language: 'java',
              title: 'Récupérer le type réel',
              bad: `Chien chien = (Chien) animal;   // ClassCastException si ce n'est pas un Chien
chien.rapporter();`,
              good: `if (animal instanceof Chien chien) {
    chien.rapporter();
}`,
              why: 'Le transtypage direct fait confiance sans vérifier : si l’objet est un `Chat`, l’exécution s’arrête sur une `ClassCastException`. La seconde forme teste et déclare la variable en une fois, et ne fait rien si le type ne correspond pas. Un transtypage fréquent est d’ailleurs souvent le signe qu’une méthode manque dans le type parent.',
            }),
            memorize('stack-d-dispatch'),
            quiz('stack-q-dispatch-1'),
            interview({
              question: 'Pourquoi `Animal a = new Chien()` compile-t-il alors que `Chien c = new Animal()` non ?',
              short:
                'Parce que la relation d’héritage n’est vraie que dans un sens : tout `Chien` est un `Animal`, donc l’affectation est sûre ; mais tout `Animal` n’est pas un `Chien`. Le compilateur refuse la seconde car elle laisserait appeler sur l’objet des méthodes qu’il ne possède pas.',
              detailed:
                'Une variable porte deux types. Le type de référence, écrit à gauche, est ce que le compilateur utilise pour décider quelles méthodes sont appelables. Le type réel est la classe effectivement instanciée, et c’est lui que la JVM utilise à l’exécution pour choisir l’implémentation — c’est le dispatch dynamique. `Animal a = new Chien()` est accepté parce que l’objet respecte au moins le contrat `Animal` : tout ce que le compilateur autorisera existe bien sur l’objet. L’inverse violerait ce raisonnement : le compilateur autoriserait `rapporter()` sur un objet qui ne l’implémente pas. Conséquence pratique : avec `Animal a = new Chien()`, appeler `crier()` exécute la version de `Chien` même si la variable est déclarée `Animal`, mais `rapporter()` reste inaccessible sans vérification. Pour y accéder on utilise `instanceof` avec liaison de variable, jamais un transtypage aveugle, qui échouerait en `ClassCastException`.',
              followUps: [
                [
                  'Quelle différence entre surcharge et redéfinition de ce point de vue ?',
                  'La redéfinition est résolue à l’exécution sur le type réel. La surcharge est résolue à la compilation sur les types déclarés des arguments. C’est pourquoi une méthode surchargée peut sembler « choisir la mauvaise version » quand on lui passe une variable déclarée avec un type parent.',
                ],
                [
                  'Que trahit un code plein de instanceof ?',
                  'Généralement une abstraction incomplète : le comportement qu’on va chercher par test de type devrait être une méthode du type parent, redéfinie par chaque sous-classe. Le polymorphisme est justement là pour éviter ces enchaînements de tests.',
                ],
              ],
            }),
          ],
          definitions: [
            {
              id: 'stack-d-dispatch',
              title: 'Dispatch dynamique',
              text: 'Le dispatch dynamique est le choix de la méthode exécutée en fonction du type réel de l’objet plutôt que du type de la variable qui le référence. C’est lui qui fait qu’une méthode redéfinie dans une sous-classe s’exécute bien, même à travers une variable déclarée avec le type parent.',
              tags: ['java', 'poo'],
            },
          ],
        },
      ],
    },
    {
      id: 'stack-ch-collections-profondeur',
      title: 'Collections en profondeur',
      description: 'Choisir une implémentation sur des critères, pas par habitude.',
      lessons: [
        {
          id: 'stack-l-list-implementations',
          title: 'ArrayList ou LinkedList',
          summary: 'Deux façons de tenir une liste, deux profils de coût.',
          minutes: 10,
          difficulty: 'moyen',
          requires: ['java-l-collections', 'java-l-implementations'],
          concepts: ['collections', 'complexite'],
          blocks: [
            why(
              'Pourquoi deux implémentations pour la même interface ?',
              'Parce que `List` décrit un contrat — une séquence ordonnée avec accès par indice — sans dire comment le tenir. Un tableau redimensionnable et une chaîne de maillons respectent tous deux ce contrat, mais leurs coûts sont opposés. Programmer contre `List` permet de choisir la structure sans changer le code qui l’utilise.',
            ),
            compare(
              ['ArrayList', 'LinkedList'],
              [
                ['Structure', 'Tableau redimensionné quand il est plein', 'Maillons chaînés, chacun pointant le suivant'],
                ['get(i)', 'Constant : un calcul d’adresse', 'Linéaire : il faut parcourir depuis un bout'],
                ['add en fin', 'Constant amorti, sauf lors d’un redimensionnement', 'Constant'],
                ['add/remove au milieu', 'Linéaire : décalage des éléments suivants', 'Constant **si** on est déjà positionné dessus'],
                ['Mémoire', 'Compacte, bonne localité pour le processeur', 'Un surcoût par élément pour les liens'],
                ['En pratique', 'Le choix par défaut', 'Rarement le bon choix ; une ArrayDeque est souvent meilleure'],
              ],
              'Le vrai arbitrage',
            ),
            tip(
              'La `LinkedList` est souvent citée comme « meilleure pour les insertions ». C’est vrai seulement si tu es déjà positionné à l’endroit de l’insertion, avec un itérateur. Si tu fais `list.add(i, x)`, il faut d’abord parcourir jusqu’à `i` : tu paies le parcours, et tu perds le bénéfice. Pour une file, `ArrayDeque` bat les deux.',
            ),
            keypoints(
              [
                'Par défaut, prends `ArrayList`.',
                'Besoin d’ajouter et retirer aux deux bouts : `ArrayDeque`.',
                'Le parcours séquentiel est plus rapide sur `ArrayList` grâce à la localité mémoire.',
                'Si tu connais la taille finale, `new ArrayList<>(taille)` évite les redimensionnements.',
              ],
              'Comment choisir',
            ),
            memorize('stack-d-arraylist'),
            quiz('stack-q-list-1'),
          ],
          definitions: [
            {
              id: 'stack-d-arraylist',
              title: 'ArrayList',
              text: 'Une ArrayList tient ses éléments dans un tableau qu’elle remplace par un plus grand lorsqu’il est plein. L’accès par indice y est immédiat, mais insérer ailleurs qu’à la fin oblige à décaler tous les éléments suivants.',
              tags: ['java', 'collections'],
            },
          ],
        },
        {
          id: 'stack-l-set-map',
          title: 'Set et Map : ordre, unicité, tri',
          summary: 'HashSet, LinkedHashSet, TreeSet, HashMap, LinkedHashMap, TreeMap.',
          minutes: 12,
          difficulty: 'moyen',
          requires: ['stack-l-equals-hashcode', 'stack-l-list-implementations'],
          concepts: ['collections', 'complexite'],
          blocks: [
            def(
              'Ensemble (Set)',
              'Un ensemble est une collection qui refuse les doublons. Ce qu’il considère comme un doublon dépend de son implémentation : l’égalité pour les versions à hachage, l’ordre de comparaison pour les versions triées.',
            ),
            def(
              'Dictionnaire (Map)',
              'Un dictionnaire associe des clés à des valeurs, chaque clé n’apparaissant qu’une fois. Ce n’est pas une Collection : on n’y range pas des éléments mais des couples.',
            ),
            compare(
              ['Set', 'Map'],
              [
                ['On y range', 'Des éléments', 'Des couples clé → valeur'],
                ['Unicité', 'Des éléments', 'Des clés seulement ; les valeurs peuvent se répéter'],
                ['Hérite de Collection', 'Oui', 'Non — c’est une hiérarchie distincte'],
                ['Question à se poser', '« Cet élément est-il déjà là ? »', '« Que vaut cette clé ? »'],
              ],
            ),
            compare(
              ['Version à hachage', 'Version triée'],
              [
                ['Set', 'HashSet — aucun ordre garanti', 'TreeSet — ordre de comparaison'],
                ['Set avec ordre d’insertion', 'LinkedHashSet — l’ordre où tu as ajouté', '—'],
                ['Map', 'HashMap — aucun ordre garanti', 'TreeMap — clés triées'],
                ['Map avec ordre d’insertion', 'LinkedHashMap', '—'],
                ['Coût moyen', 'Constant', 'Logarithmique'],
                ['Exige de l’élément', 'equals et hashCode cohérents', 'Comparable, ou un Comparator'],
              ],
              'Trois familles, deux critères',
            ),
            warn(
              'L’ordre d’une `HashMap` n’est pas aléatoire mais il n’est pas garanti, et il peut changer entre deux versions de Java ou après un redimensionnement. Ne construis jamais une logique métier — ni un test — sur l’ordre de parcours d’une HashMap. Si l’ordre compte, dis-le en choisissant `LinkedHashMap` ou `TreeMap`.',
            ),
            question(
              'Tu dois garder la liste des identifiants déjà traités, et vérifier très souvent si un identifiant en fait partie. Quelle structure ?',
              'Un `HashSet`. La question posée est « est-ce déjà là ? », donc un ensemble ; la vérification est fréquente et l’ordre n’a aucune importance, donc la version à hachage, dont le test d’appartenance est à coût constant. Une `List` obligerait à parcourir tous les éléments à chaque vérification.',
            ),
            memorize('stack-d-set'),
            memorize('stack-d-map'),
            quiz('stack-q-set-1'),
            quiz('stack-q-map-1'),
            interview({
              question: 'Quelle est la différence entre List et Set ?',
              short:
                'Une `List` est une séquence ordonnée qui accepte les doublons et donne un accès par indice. Un `Set` garantit l’unicité de ses éléments et n’a pas d’indice. Le choix se fait donc sur deux questions : ai-je besoin de doublons, et l’ordre a-t-il un sens ?',
              detailed:
                'Les deux sont des `Collection`, mais leur contrat diffère. `List` conserve l’ordre d’insertion, autorise les répétitions et adresse par position : `ArrayList` pour l’accès par indice, `LinkedList` quand on manipule les extrémités, même si `ArrayDeque` la surpasse presque toujours pour cet usage. `Set` refuse les doublons, et la façon dont il les détecte dépend de l’implémentation : `HashSet` s’appuie sur `equals` et `hashCode` et ne garantit aucun ordre de parcours ; `LinkedHashSet` ajoute la conservation de l’ordre d’insertion pour un surcoût mémoire faible ; `TreeSet` maintient les éléments triés selon leur ordre naturel ou un comparateur, avec un coût logarithmique au lieu de constant, mais permet en retour les requêtes par intervalle. Le point à ne pas manquer, c’est que l’unicité d’un `HashSet` repose entièrement sur le contrat `equals`/`hashCode` : si la classe stockée le respecte mal, l’ensemble accepte des doublons apparents.',
              followUps: [
                [
                  'Et si j’ai besoin d’unicité tout en conservant l’ordre d’arrivée ?',
                  '`LinkedHashSet`. Il combine la table de hachage pour l’unicité et une liste chaînée pour l’ordre d’insertion, ce qui coûte un peu de mémoire mais garde le test d’appartenance à coût constant.',
                ],
                [
                  'Quelle différence entre Collection et Collections ?',
                  '`Collection` est l’interface racine des listes, ensembles et files. `Collections` est une classe utilitaire faite uniquement de méthodes statiques — `sort`, `unmodifiableList`, `emptyList`. La proximité des noms est purement malheureuse.',
                ],
                [
                  'Pourquoi Map n’hérite-t-elle pas de Collection ?',
                  'Parce que les contrats ne se rejoignent pas : une `Collection` manipule des éléments, une `Map` des associations. `add(E)` n’aurait aucun sens sur une Map. Elle expose en revanche des vues qui sont, elles, des Collections : `keySet()`, `values()`, `entrySet()`.',
                ],
              ],
            }),
          ],
          definitions: [
            {
              id: 'stack-d-set',
              title: 'Ensemble (Set)',
              text: 'Un ensemble est une collection qui refuse les doublons et ne propose pas d’accès par indice. Les versions à hachage détectent les doublons par equals et hashCode, tandis que les versions triées les détectent par comparaison.',
              tags: ['java', 'collections'],
            },
            {
              id: 'stack-d-map',
              title: 'Dictionnaire (Map)',
              text: 'Un dictionnaire associe chaque clé unique à une valeur, et permet de retrouver cette valeur à partir de la clé. Il ne descend pas de Collection car il range des couples plutôt que des éléments isolés.',
              tags: ['java', 'collections'],
            },
          ],
        },
      ],
    },
    {
      id: 'stack-ch-exceptions-avancees',
      title: 'Exceptions : la hiérarchie et le contrat',
      description: 'throw, throws, checked, unchecked, et quand ne pas attraper.',
      lessons: [
        {
          id: 'stack-l-hierarchie-exceptions',
          title: 'Throwable, Error, Exception',
          summary: 'Ce qui se rattrape, ce qui ne se rattrape pas.',
          minutes: 10,
          difficulty: 'moyen',
          requires: ['java-l-exceptions', 'java-l-checked-unchecked'],
          concepts: ['exceptions'],
          blocks: [
            steps(
              [
                '`Throwable` est la racine : tout ce qui peut être lancé en descend.',
                '`Error` signale un problème dont l’application ne peut normalement pas se remettre : OutOfMemoryError, StackOverflowError. On ne l’attrape pas.',
                '`Exception` signale une condition anormale mais gérable.',
                '`RuntimeException` et ses filles sont non contrôlées : le compilateur n’exige rien.',
                'Les autres filles d’`Exception` sont contrôlées : il faut les attraper ou les déclarer.',
              ],
              'La hiérarchie, de haut en bas',
            ),
            compare(
              ['Contrôlée (checked)', 'Non contrôlée (unchecked)'],
              [
                ['Exemples', 'IOException, SQLException', 'NullPointerException, IllegalArgumentException'],
                ['Le compilateur', 'Exige catch ou throws', 'N’exige rien'],
                ['Signale plutôt', 'Un aléa externe prévisible', 'Un défaut de programmation ou d’usage'],
                ['Réaction attendue', 'Prévoir un comportement de repli', 'Corriger le code ou valider l’entrée'],
              ],
            ),
            compare(
              ['throw', 'throws'],
              [
                ['Nature', 'Une instruction', 'Une clause de signature'],
                ['Où', 'Dans le corps de la méthode', 'Après la liste des paramètres'],
                ['Rôle', 'Lance effectivement une exception, maintenant', 'Annonce ce que la méthode peut laisser remonter'],
                ['Exemple', '`throw new IllegalStateException("...")`', '`void lire() throws IOException`'],
              ],
              'Deux mots proches, deux rôles opposés',
            ),
            badGood({
              language: 'java',
              title: 'Attraper pour faire taire',
              bad: `try {
    return service.charger(id);
} catch (Exception e) {
    return null;
}`,
              good: `try {
    return service.charger(id);
} catch (SQLException e) {
    throw new ChargementException("Chargement impossible pour " + id, e);
}`,
              why: 'La première version attrape tout, y compris ce qu’elle n’avait pas prévu, perd la cause et renvoie `null` — l’appelant récoltera une NullPointerException très loin du vrai problème. La seconde attrape un type précis, conserve la cause originale et remonte une exception qui a du sens pour l’appelant. Un `catch` qui ne fait ni traitement de repli ni journalisation ni renvoi ne fait qu’effacer l’information.',
            }),
            warn(
              'Ne mets pas un `try/catch` pour éviter un plantage sans savoir ce que tu attrapes. Une NullPointerException attrapée et ignorée ne disparaît pas : elle se transforme en donnée fausse, plus tard, ailleurs, sans trace. Le bon réflexe est de se demander d’abord pourquoi la référence est nulle.',
            ),
            memorize('stack-d-checked'),
            quiz('stack-q-exception-1'),
            quiz('stack-q-exception-2'),
            interview({
              question: 'Quelle différence entre une exception contrôlée et non contrôlée ?',
              short:
                'Une exception contrôlée doit être attrapée ou déclarée dans la signature : le compilateur l’exige. Une non contrôlée, qui descend de `RuntimeException`, n’impose rien. Les premières signalent un aléa externe prévisible, les secondes un défaut de programmation ou d’usage.',
              detailed:
                'La hiérarchie part de `Throwable`, qui se sépare en `Error` et `Exception`. `Error` couvre ce dont l’application ne se remet pas — OutOfMemoryError, StackOverflowError — et ne s’attrape pas en pratique. Sous `Exception`, la branche `RuntimeException` est non contrôlée, tout le reste est contrôlé. La distinction est un choix de conception : une `IOException` est contrôlée parce qu’un fichier peut légitimement être absent et qu’il faut prévoir ce cas ; une `IllegalArgumentException` est non contrôlée parce qu’un argument invalide est un bug de l’appelant, pas un aléa à gérer. En pratique, la tendance des frameworks modernes est d’envelopper les exceptions contrôlées en non contrôlées — Spring traduit ainsi les `SQLException` en `DataAccessException` — pour ne pas forcer chaque couche à propager une clause `throws` qui ne la concerne pas. Le piège récurrent n’est d’ailleurs pas dans le choix du type mais dans le traitement : attraper `Exception` pour renvoyer `null` supprime l’information et déplace le problème.',
              followUps: [
                [
                  'Quand ne faut-il surtout pas mettre de try/catch ?',
                  'Quand on n’a aucun comportement de repli à offrir. Attraper pour journaliser et continuer comme si de rien n’était produit des données incohérentes. Mieux vaut laisser remonter jusqu’à une couche capable de décider — typiquement un gestionnaire d’erreurs global qui traduit en réponse HTTP.',
                ],
                [
                  'À quoi sert try-with-resources ?',
                  'À fermer automatiquement toute ressource qui implémente `AutoCloseable`, y compris si une exception survient. Il évite l’oubli de `finally` et supprime le cas où une exception dans la fermeture masque l’exception d’origine.',
                ],
              ],
            }),
          ],
          definitions: [
            {
              id: 'stack-d-checked',
              title: 'Exception contrôlée',
              text: 'Une exception contrôlée doit être attrapée ou déclarée dans la signature de la méthode, faute de quoi le code ne compile pas. Elle signale un aléa extérieur prévisible, comme un fichier absent ou une base injoignable, pour lequel l’appelant est censé prévoir un comportement.',
              tags: ['java', 'exceptions'],
            },
          ],
        },
      ],
    },
    {
      id: 'stack-ch-generics',
      title: 'Generics et jokers',
      description: 'Du type sûr aux wildcards, dans cet ordre.',
      lessons: [
        {
          id: 'stack-l-generics-wildcards',
          title: 'T, E, K, V et le joker ?',
          summary: 'Pourquoi List<Chien> n’est pas une List<Animal>.',
          minutes: 12,
          difficulty: 'expert',
          requires: ['java-l-generics', 'stack-l-reference-reel'],
          concepts: ['generics'],
          blocks: [
            why(
              'Pourquoi des types paramétrés ?',
              'Avant les generics, une `List` contenait des `Object` : on y mettait n’importe quoi, et on transtypait à la sortie en espérant ne pas se tromper. L’erreur ne se voyait qu’à l’exécution, en `ClassCastException`. Les generics déplacent cette vérification à la compilation : `List<String>` ne peut recevoir qu’une chaîne, et ce qui en sort est déjà une chaîne.',
            ),
            text(
              'Les lettres ne sont qu’une convention de lecture : `T` pour un type quelconque, `E` pour l’élément d’une collection, `K` et `V` pour la clé et la valeur d’un dictionnaire, `R` pour un résultat. Le compilateur ne leur donne aucun sens particulier.',
            ),
            code(
              'java',
              `List<Chien> chiens = new ArrayList<>();
// List<Animal> animaux = chiens;   // refusé`,
              { caption: 'Ce refus surprend, et il est volontaire' },
            ),
            codeExplain(
              [
                ['// Supposons l’affectation autorisée...', 'On veut comprendre pourquoi Java l’interdit.'],
                ['List<Animal> animaux = chiens;', 'La même liste, vue comme une liste d’Animal.'],
                ['animaux.add(new Chat());', 'Parfaitement légal sur une `List<Animal>` : un chat est un animal.'],
                ['Chien c = chiens.get(0);', 'Mais `chiens` et `animaux` sont le **même** objet : on vient d’y glisser un chat. Explosion.'],
                ['// D’où l’interdiction à la source.', 'Les types paramétrés ne sont pas covariants, précisément pour rendre ce scénario impossible.'],
              ],
              'Le scénario que l’interdiction empêche',
            ),
            compare(
              ['? extends T', '? super T'],
              [
                ['Lecture', 'On peut lire, le résultat est un T', 'On lit des Object seulement'],
                ['Écriture', 'Interdite (sauf null)', 'On peut écrire un T ou un sous-type'],
                ['Signifie', 'T ou n’importe lequel de ses sous-types', 'T ou n’importe lequel de ses super-types'],
                ['Usage typique', 'Une source dont on consomme les éléments', 'Une destination où l’on dépose des éléments'],
              ],
              'Les deux jokers bornés',
            ),
            code(
              'java',
              `// Source : on ne fait que lire des Animal
double poidsTotal(List<? extends Animal> animaux) {
    return animaux.stream().mapToDouble(Animal::poids).sum();
}

// Destination : on ne fait qu'écrire des Chien
void ajouterChiens(List<? super Chien> cible) {
    cible.add(new Chien("Rex"));
}`,
              { caption: 'Producteur : extends. Consommateur : super.' },
            ),
            tip(
              'La règle mnémotechnique « PECS » — *Producer Extends, Consumer Super* — se retient mieux à l’envers : demande-toi d’abord si le paramètre est une **source** dont tu lis, ou une **destination** où tu écris. Source : `extends`. Destination : `super`. Si tu fais les deux, n’utilise pas de joker.',
            ),
            memorize('stack-d-generics'),
            quiz('stack-q-generics-1'),
          ],
          definitions: [
            {
              id: 'stack-d-generics',
              title: 'Type paramétré',
              text: 'Un type paramétré permet de préciser quel type une structure contient, comme une liste de chaînes plutôt qu’une liste d’objets quelconques. Le compilateur vérifie alors les usages à la compilation, ce qui supprime les transtypages et les erreurs de type découvertes à l’exécution.',
              tags: ['java', 'generics'],
            },
          ],
        },
      ],
    },
    {
      id: 'stack-ch-versions',
      title: 'Les versions qui comptent',
      description: 'Java 8, 11, 17, 21 : ce qu’on attend réellement de toi.',
      lessons: [
        {
          id: 'stack-l-versions-java',
          title: 'Java 8, 11, 17, 21',
          summary: 'Les versions au support long et ce qu’elles ont apporté.',
          minutes: 12,
          difficulty: 'moyen',
          requires: ['java-l-versions'],
          concepts: ['java', 'versions'],
          blocks: [
            def(
              'Version au support long (LTS)',
              'Une version au support long est une version que les éditeurs s’engagent à corriger pendant plusieurs années. Ce sont celles que les entreprises déploient, les versions intermédiaires servant surtout à livrer les nouveautés progressivement.',
            ),
            compare(
              ['Version', 'Ce qui compte'],
              [
                ['Java 8 — 2014', 'La rupture', 'Lambdas, Streams, Optional, interfaces avec méthodes par défaut, nouvelle API de dates java.time.'],
                ['Java 11 — 2018', 'La LTS de transition', 'Client HTTP standardisé, méthodes de String (isBlank, strip, lines, repeat), Files.readString, var utilisable dans les paramètres de lambda, retrait des modules Java EE et CORBA.'],
                ['Java 17 — 2021', 'La consolidation', 'Classes scellées finalisées ; records, pattern matching pour instanceof, expressions switch et blocs de texte finalisés dans les versions précédentes et disponibles ici.'],
                ['Java 21 — 2023', 'La concurrence repensée', 'Threads virtuels, pattern matching pour switch, motifs d’enregistrement, collections séquencées.'],
              ],
              'Les quatre versions au support long récentes',
            ),
            warn(
              'Attention à l’amalgame courant en entretien : les `record` ne sont pas « une nouveauté de Java 17 ». Ils ont été finalisés en Java 16. Java 17 est la première LTS qui les embarque, ce qui est la raison pour laquelle la plupart des équipes les ont découverts là. Dire « finalisés en 16, largement adoptés à partir de la LTS 17 » est plus juste et se remarque.',
            ),
            why(
              'Pourquoi tant de projets restent-ils en Java 8 ou 11 ?',
              'Parce que monter de version coûte : dépendances à mettre à jour, modules retirés en 11 qu’il faut remplacer, outillage et images de conteneurs à reprendre. Le gain est réel — performances du ramasse-miettes, démarrage, threads virtuels en 21 — mais il se planifie. En entretien, savoir dire ce que coûte une montée de version vaut mieux que réciter la liste des nouveautés.',
            ),
            memorize('stack-d-lts'),
            quiz('stack-q-versions-1'),
            interview({
              question: 'Quelles évolutions importantes retiens-tu entre Java 8 et Java 21 ?',
              short:
                'Java 8 a introduit les lambdas, les Streams, Optional et la nouvelle API de dates. Java 11 a standardisé le client HTTP et enrichi String. Java 17 a consolidé records, pattern matching et classes scellées. Java 21 apporte les threads virtuels et le pattern matching pour switch.',
              detailed:
                'Java 8 reste la rupture majeure : il fait entrer le style fonctionnel avec les lambdas et les Streams, corrige la gestion des absences avec `Optional`, remplace `Date` et `Calendar` par `java.time`, et autorise les méthodes par défaut dans les interfaces, ce qui a permis d’en faire évoluer sans casser les implémentations existantes. Java 11 est une LTS de transition : client HTTP standard, méthodes utilitaires sur `String`, lecture de fichier en une ligne, mais aussi le retrait des modules Java EE et CORBA, qui est concrètement le point douloureux des migrations depuis 8. Java 17 ne crée pas grand-chose ex nihilo mais stabilise : les records, le pattern matching pour `instanceof`, les expressions `switch` et les blocs de texte ont été finalisés dans les versions 14 à 16 ; 17 finalise les classes scellées et surtout rassemble le tout dans une LTS, ce qui explique son adoption. Java 21 est la plus intéressante côté architecture : les threads virtuels rendent viable le modèle « un thread par requête » pour des charges massivement bloquantes, sans passer par la programmation réactive, et le pattern matching pour `switch` avec les motifs d’enregistrement rend lisible le traitement de hiérarchies de types.',
              followUps: [
                [
                  'Qu’est-ce qu’un thread virtuel change concrètement ?',
                  'Un thread de plateforme correspond à un thread du système et coûte cher, ce qui plafonne le nombre de requêtes bloquantes simultanées. Les threads virtuels sont gérés par la JVM et se comptent en centaines de milliers : un code bloquant écrit simplement redevient tenable en charge, sans réécriture réactive. Le goulot se déplace alors vers les ressources en aval, pool de connexions en tête.',
                ],
                [
                  'Pourquoi un record plutôt qu’une classe ?',
                  'Parce qu’un porteur de valeurs a besoin d’être immuable et d’avoir `equals`, `hashCode` et `toString` cohérents. Le record génère tout cela à partir de ses composants, ce qui supprime précisément le code où l’on oublie `hashCode`.',
                ],
              ],
            }),
          ],
          definitions: [
            {
              id: 'stack-d-lts',
              title: 'Version au support long',
              text: 'Une version au support long est une version de Java que les éditeurs s’engagent à corriger pendant plusieurs années après sa sortie. Les entreprises déploient presque toujours ces versions, les intermédiaires servant à livrer les nouveautés au fil de l’eau.',
              tags: ['java', 'versions'],
            },
          ],
        },
      ],
    },
  ],
};
