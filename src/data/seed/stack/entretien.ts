import {
  badGood,
  compare,
  def,
  interview,
  keypoints,
  memorize,
  openQuestion,
  quiz,
  steps,
  text,
  tip,
  warn,
  why,
  type CourseSpec,
} from '../builders';
import type { QuizQuestion } from '@/models';
import { D } from './shared';

const C = 'stack-c-entretien';

/**
 * Entretien technique.
 *
 * Ce cours ne porte sur aucune technologie : il porte sur la façon de répondre.
 * Il vient en dernier parce qu'il suppose le reste acquis — on ne structure bien
 * que ce qu'on a compris.
 */
export const entretienCourse: CourseSpec = {
  id: C,
  title: 'Tenir une discussion technique',
  description: 'Structurer une réponse, encaisser les relances, et savoir dire ce qu’on ne sait pas.',
  icon: 'chat',
  level: 'avance',
  tags: ['entretien', 'communication'],
  pathId: 'stack-path-entretien',
  chapters: [
    {
      id: 'stack-ch-repondre',
      title: 'Structurer une réponse',
      description: 'Deux niveaux, et ce qui se passe après.',
      lessons: [
        {
          id: 'stack-l-structurer-reponse',
          title: 'Réponse courte, puis développement',
          summary: 'Pourquoi commencer court fait gagner l’échange.',
          minutes: 10,
          difficulty: 'moyen',
          requires: ['stack-l-chaine-complete'],
          concepts: ['entretien'],
          blocks: [
            why(
              'Pourquoi ne pas répondre tout de suite en détail ?',
              'Parce que l’interlocuteur ne sait pas encore si tu as compris la question. Une réponse de trois minutes qui commence par des détails donne l’impression de réciter et l’empêche de te relancer là où ça l’intéresse. Une réponse de trente secondes qui répond exactement à la question lui rend la main : c’est lui qui choisit d’approfondir, et l’échange devient une conversation plutôt qu’un exposé.',
            ),
            steps(
              [
                'Reformuler en une phrase si la question est ambiguë — cela évite de répondre à côté pendant deux minutes.',
                'Donner la réponse directe en vingt à trente secondes : le cœur, sans les détails.',
                'Marquer une pause. Souvent l’interlocuteur relance lui-même, et tu sais alors où aller.',
                'Développer si on t’y invite : mécanisme, cas d’usage, limites.',
                'Terminer sur une nuance ou un contre-exemple : c’est ce qui distingue une réponse apprise d’une réponse vécue.',
              ],
              'La structure en cinq temps',
            ),
            badGood({
              language: 'text',
              title: 'La même question, deux réponses',
              bad: `« C'est quoi une HashMap ? »

« Alors, une HashMap ça implémente l'interface Map,
il y a un tableau de buckets, un facteur de charge de 0.75,
quand ça dépasse ça redimensionne, et depuis Java 8
les buckets trop remplis deviennent des arbres rouge-noir... »`,
              good: `« C'est quoi une HashMap ? »

« C'est une structure qui associe des clés à des valeurs,
avec un accès en temps constant en moyenne. Elle s'appuie
sur hashCode pour trouver le compartiment et equals pour
trancher dedans. »

[pause — l'interlocuteur relance sur ce qui l'intéresse]`,
              why: 'La première réponse est exacte mais elle noie la définition sous l’implémentation, et surtout elle ne laisse aucune prise : l’interlocuteur ne sait plus quoi demander. La seconde répond à la question posée, place les deux notions qui appellent naturellement une relance — hashCode et equals — et rend la main. Tout ce qui a été dit dans la première réponse pourra être dit ensuite, mais à la demande.',
            }),
            keypoints(
              [
                'Réponds à la question posée, pas à celle que tu aurais préféré.',
                'Trente secondes d’abord : le détail vient sur relance.',
                'Place volontairement un ou deux mots qui appellent une relance que tu maîtrises.',
                'Une nuance en fin de réponse vaut mieux qu’une affirmation absolue.',
              ],
              'À retenir',
            ),
            memorize('stack-d-reponse-courte'),
            quiz('stack-q-entretien-1'),
          ],
          definitions: [
            {
              id: 'stack-d-reponse-courte',
              title: 'Réponse courte',
              text: 'Une réponse courte est la formulation tenable en vingt à trente secondes qui répond exactement à la question posée, sans les détails d’implémentation. Elle rend la main à l’interlocuteur, qui choisit alors d’approfondir là où cela l’intéresse.',
              tags: ['entretien'],
            },
          ],
        },
        {
          id: 'stack-l-pieges-entretien',
          title: 'Les formulations qui coûtent cher',
          summary: 'Les raccourcis qui trahissent une compréhension de surface.',
          minutes: 11,
          difficulty: 'moyen',
          requires: ['stack-l-structurer-reponse'],
          concepts: ['entretien'],
          blocks: [
            text(
              'Certaines phrases sont exactes en apparence et signalent pourtant qu’on n’a pas pratiqué. Elles reviennent si souvent qu’elles servent de filtre.',
            ),
            compare(
              ['À éviter', 'Ce qu’il vaut mieux dire'],
              [
                [
                  '« Redis, c’est un cache »',
                  'Réduit l’outil à un usage',
                  '« Un stockage clé-valeur en mémoire, dont l’usage le plus courant est le cache — il sert aussi de compteur, de verrou distribué ou de stockage de sessions. »',
                ],
                [
                  '« Spring Boot, c’est la nouvelle version de Spring »',
                  'Faux, et très repéré',
                  '« Une couche au-dessus de Spring, qui l’utilise et supprime la configuration répétitive. »',
                ],
                [
                  '« Kafka, c’est une file de messages »',
                  'Rate la différence de modèle',
                  '« Une plateforme de flux : le message reste dans un journal et c’est le consommateur qui suit sa position, ce qui permet plusieurs groupes et la relecture. »',
                ],
                [
                  '« Les records sont arrivés en Java 17 »',
                  'Confond finalisation et LTS',
                  '« Finalisés en 16 ; largement adoptés à partir de la LTS 17, qui est la première à les embarquer. »',
                ],
                [
                  '« C’est lent, on a mis du cache »',
                  'Signale qu’on n’a pas mesuré',
                  '« On a mesuré la répartition du temps, corrigé un N+1, et le cache est venu après sur ce qui restait coûteux. »',
                ],
                [
                  '« Kafka garantit exactly-once »',
                  'Vrai seulement dans son périmètre',
                  '« À l’intérieur de Kafka oui ; dès qu’il y a un effet de bord externe on retombe sur du au moins une fois et on rend le traitement idempotent. »',
                ],
                [
                  '« Java est un langage interprété »',
                  'Moitié de la vérité',
                  '« Compilé en bytecode, puis interprété et compilé à chaud par le JIT. »',
                ],
              ],
              'Sept raccourcis fréquents',
            ),
            warn(
              'Le plus coûteux n’est pas de ne pas savoir, c’est d’affirmer avec assurance quelque chose de faux. Un interlocuteur technique repère immédiatement une certitude mal placée, et il doutera ensuite de tout le reste — y compris de ce que tu maîtrisais.',
            ),
            def(
              'Aveu maîtrisé',
              'Un aveu maîtrisé consiste à reconnaître ce qu’on ne sait pas tout en montrant comment on s’y prendrait. Il remplace une invention risquée par une démonstration de méthode, ce qui est généralement mieux reçu que la réponse elle-même.',
            ),
            badGood({
              language: 'text',
              title: 'Quand tu ne sais pas',
              bad: `« Le ClassLoader ? Euh... oui, ça charge les classes,
je crois que ça les met en cache et que ça optimise
la mémoire, enfin je dirais que c'est lié au GC... »`,
              good: `« Je sais qu'il charge les classes à la demande,
à leur première utilisation, et que c'est ce qui permet
le chargement dynamique. Le détail de la délégation entre
chargeurs, je ne l'ai jamais manipulé directement —
je l'ai croisé sur des conflits de dépendances,
où deux versions d'une même classe étaient présentes. »`,
              why: 'La première réponse improvise et se contredit : « lié au GC » est faux, et l’hésitation contamine tout. La seconde délimite exactement ce qui est su, le dit sans s’excuser, et rattache le reste à une situation concrète. Elle donne plus confiance qu’une réponse complète récitée.',
            }),
            tip(
              'Prépare deux ou trois exemples tirés de ton expérience réelle — un incident que tu as diagnostiqué, un choix technique que tu as défendu, une erreur que tu as commise et corrigée. Une réponse ancrée dans un fait vécu est impossible à réciter, et c’est exactement ce que l’interlocuteur cherche à entendre.',
            ),
            memorize('stack-d-aveu'),
            quiz('stack-q-entretien-2'),
            interview({
              question: 'Quelle est ta plus grande difficulté technique rencontrée récemment ?',
              short:
                'Je choisis un incident précis, daté, que j’ai réellement diagnostiqué. Je dis le symptôme, ce que j’ai mesuré, la fausse piste que j’ai suivie, la cause racine, et comment j’ai vérifié la correction. La fausse piste compte autant que la solution : elle montre une démarche, pas un résultat.',
              detailed:
                'Le piège de cette question est de raconter une réussite lisse, qui sonne préparée et n’apprend rien à l’interlocuteur. Une bonne réponse suit la démarche réelle. On pose le symptôme de façon factuelle — une API passée de 200 ms à 12 secondes, un pod redémarrant toutes les cinq minutes. On dit ce qu’on a mesuré en premier et pourquoi, ce qui montre qu’on ne part pas du code. On mentionne la fausse piste, parce que c’est elle qui prouve qu’on a réellement enquêté : « j’ai d’abord soupçonné la base, la répartition du temps montrait bien 8 secondes côté base, mais le nombre de requêtes m’a fait comprendre que c’était un N+1 et pas une requête lente ». On donne la cause racine, la correction, et surtout la validation : la nouvelle mesure dans les mêmes conditions, et la vérification qu’aucune autre route ne s’est dégradée. Si on a aussi corrigé ce qui a permis au problème de passer inaperçu — un test manquant, une métrique absente, une alerte mal réglée — c’est le meilleur moment pour le dire, parce que cela distingue quelqu’un qui corrige un bug de quelqu’un qui ferme un incident.',
              followUps: [
                [
                  'Qu’aurais-tu fait différemment ?',
                  'Réponse à préparer honnêtement : souvent, mesurer plus tôt au lieu de partir sur une intuition, ou instrumenter avant d’avoir besoin de l’instrumentation. Répondre « rien » à cette question est toujours perçu comme une esquive.',
                ],
                [
                  'Comment as-tu évité que ça se reproduise ?',
                  'Un test qui reproduit le cas, une alerte sur l’indicateur qui aurait prévenu, ou une correction du processus — par exemple aligner le volume de recette sur celui de production si l’écart avait masqué le problème.',
                ],
              ],
            }),
          ],
          definitions: [
            {
              id: 'stack-d-aveu',
              title: 'Aveu maîtrisé',
              text: 'Un aveu maîtrisé consiste à délimiter précisément ce qu’on sait, à reconnaître ce qu’on ignore, et à montrer comment on s’y prendrait pour le découvrir. Il inspire davantage confiance qu’une réponse inventée, qu’un interlocuteur technique repère presque toujours.',
              tags: ['entretien'],
            },
          ],
        },
      ],
    },
  ],
};

/**
 * Questions ouvertes du mode entretien.
 *
 * Le tag `entretien` est posé par `openQuestion` : l'écran de jeu sélectionne
 * dessus, sans rien savoir du domaine. Chacune porte une réponse courte, une
 * réponse de référence et les relances qui tombent juste après.
 */
export const stackEntretienQuestions: QuizQuestion[] = [
  openQuestion({
    id: 'stack-e-jvm',
    domainId: D,
    courseId: 'stack-c-java-avance',
    lessonId: 'stack-l-bytecode',
    topic: 'JVM',
    prompt: 'Que se passe-t-il entre l’écriture du code Java et son exécution ?',
    short:
      '`javac` compile le .java en bytecode portable. À l’exécution, le ClassLoader charge la classe à sa première utilisation, la JVM interprète le bytecode, et le JIT compile en code machine les méthodes les plus sollicitées.',
    answer:
      'La compilation est statique : javac vérifie types et syntaxe et produit un .class par type, contenant du bytecode indépendant de la plateforme. À l’exécution, le ClassLoader résout chaque classe à sa première utilisation active. Le bytecode est d’abord interprété — démarrage rapide, exécution lente — puis le JIT compile les méthodes chaudes en s’appuyant sur le profil réellement observé, ce qui lui permet d’optimiser mieux qu’un compilateur statique. D’où l’échauffement des premières secondes.',
    followUps: [
      [
        'Pourquoi le JIT peut-il battre une compilation statique ?',
        'Il optimise sur des faits observés : le type réel qui passe à cet appel, la branche réellement prise. Il peut inliner une méthode virtuelle, et déoptimise si l’hypothèse devient fausse.',
      ],
      ['À quel moment une classe est-elle chargée ?', 'À sa première utilisation active, pas au démarrage — d’où des erreurs de classpath qui n’apparaissent qu’après des minutes de fonctionnement.'],
    ],
  }),
  openQuestion({
    id: 'stack-e-gc',
    domainId: D,
    courseId: 'stack-c-java-avance',
    lessonId: 'stack-l-gc',
    topic: 'JVM',
    prompt: 'Si Java a un ramasse-miettes, comment une fuite mémoire est-elle possible ?',
    short:
      'Parce qu’il libère ce qui est inatteignable, pas ce qui est inutile. Une référence conservée — cache statique sans limite, écouteur jamais désinscrit — garde l’objet atteignable, donc vivant.',
    answer:
      'Le ramasse-miettes part des racines — piles des threads, champs statiques — et conserve tout ce qu’il atteint. Une fuite en Java est donc toujours une référence involontairement retenue : Map statique sans taille maximale, écouteur non désinscrit, ThreadLocal non nettoyée sur un pool qui recycle ses threads. Le symptôme est la montée en escalier du tas après chaque collecte complète, jusqu’à l’OutOfMemoryError. On diagnostique en regardant le tas après ramassage, puis avec un cliché du tas pour identifier quel objet retient et par quelle chaîne.',
    followUps: [
      ['Fuite ou simple charge, comment trancher ?', 'Par la courbe du tas après ramassage complet : sous charge elle redescend au même plancher ; en cas de fuite le plancher lui-même monte.'],
      ['Pourquoi ne pas appeler System.gc() ?', 'C’est une suggestion, pas un ordre, et sur une application en difficulté cela allonge généralement les pauses au lieu d’aider.'],
    ],
  }),
  openQuestion({
    id: 'stack-e-equals',
    domainId: D,
    courseId: 'stack-c-java-avance',
    lessonId: 'stack-l-equals-hashcode',
    topic: 'Collections',
    prompt: 'Pourquoi equals et hashCode sont-ils si importants ?',
    short:
      'Parce que les collections à base de hachage s’appuient dessus : hashCode choisit le compartiment, equals tranche dedans. Deux objets égaux avec des hachages différents sont rangés séparément, et la map ne les retrouve plus.',
    answer:
      'Le contrat impose que deux objets égaux aient le même hachage ; l’inverse n’est pas exigé, une collision étant normale et gérée par comparaison dans le compartiment. Le cas qui casse est toujours le même : equals redéfini, hashCode oublié, qui reste celui d’Object et dépend de l’instance. Conséquences : contains faux sur un objet présent, doublons dans un HashSet, distinct() inopérant. Second piège, la mutabilité : modifier un champ utilisé dans le calcul après insertion rend l’objet introuvable, puisqu’il reste dans son ancien compartiment. Un record génère les deux de façon cohérente.',
    followUps: [
      ['Que se passe-t-il en cas de collision ?', 'Les entrées partagent un compartiment et sont comparées avec equals. Si le compartiment se charge trop et que les clés sont comparables, l’implémentation le convertit en arbre.'],
      ['Une HashMap est-elle thread-safe ?', 'Non : en écriture concurrente elle peut se corrompre. Il faut une ConcurrentHashMap, qui verrouille par segments.'],
    ],
  }),
  openQuestion({
    id: 'stack-e-list-set',
    domainId: D,
    courseId: 'stack-c-java-avance',
    lessonId: 'stack-l-set-map',
    topic: 'Collections',
    prompt: 'Quelle est la différence entre List et Set ?',
    short:
      'Une List est ordonnée, accepte les doublons et donne un accès par indice. Un Set garantit l’unicité et n’a pas d’indice. Le choix se fait sur deux questions : ai-je besoin de doublons, et l’ordre a-t-il un sens ?',
    answer:
      'Les deux sont des Collection. List conserve l’ordre d’insertion et adresse par position : ArrayList par défaut, ArrayDeque plutôt que LinkedList pour manipuler les extrémités. Set refuse les doublons, et la détection dépend de l’implémentation : HashSet via equals et hashCode, sans ordre garanti ; LinkedHashSet conserve l’ordre d’insertion pour un faible surcoût ; TreeSet maintient un ordre de comparaison, en logarithmique, mais permet les requêtes par intervalle. Point souvent manqué : l’unicité d’un HashSet repose entièrement sur le contrat equals/hashCode de la classe stockée.',
    followUps: [
      ['Unicité et ordre d’arrivée ensemble ?', 'LinkedHashSet : table de hachage pour l’unicité, liste chaînée pour l’ordre, test d’appartenance toujours à coût constant.'],
      ['Collection ou Collections ?', 'Collection est l’interface racine ; Collections est une classe utilitaire statique — sort, unmodifiableList. La proximité des noms est malheureuse.'],
    ],
  }),
  openQuestion({
    id: 'stack-e-exceptions',
    domainId: D,
    courseId: 'stack-c-java-avance',
    lessonId: 'stack-l-hierarchie-exceptions',
    topic: 'Exceptions',
    prompt: 'Checked ou unchecked : quelle différence, et quand ne pas mettre de try/catch ?',
    short:
      'Une checked doit être attrapée ou déclarée, le compilateur l’exige ; une unchecked descend de RuntimeException et n’impose rien. Et on ne met pas de try/catch quand on n’a aucun comportement de repli à offrir.',
    answer:
      'Throwable se sépare en Error — dont on ne se remet pas, qu’on n’attrape pas — et Exception. Sous Exception, RuntimeException est non contrôlée, le reste est contrôlé. La distinction est un choix de conception : IOException est contrôlée car un fichier absent est un aléa prévisible ; IllegalArgumentException ne l’est pas car c’est un bug de l’appelant. Les frameworks modernes tendent à envelopper les checked en unchecked — Spring traduit SQLException en DataAccessException — pour ne pas imposer une clause throws à des couches que cela ne concerne pas. Le vrai piège est le traitement : attraper Exception pour renvoyer null efface l’information et déplace le problème.',
    followUps: [
      ['throw ou throws ?', 'throw est une instruction qui lance maintenant ; throws est une clause de signature qui annonce ce que la méthode peut laisser remonter.'],
      ['À quoi sert try-with-resources ?', 'À fermer automatiquement tout AutoCloseable, même en cas d’exception, et à éviter qu’une exception de fermeture masque celle d’origine.'],
    ],
  }),
  openQuestion({
    id: 'stack-e-di',
    domainId: D,
    courseId: 'stack-c-spring',
    lessonId: 'stack-l-injection',
    topic: 'Spring',
    prompt: 'Qu’est-ce que l’injection de dépendances, et pourquoi par constructeur ?',
    short:
      'La classe reçoit ses dépendances de l’extérieur au lieu de les construire. Par constructeur, parce que cela permet des champs final, fait échouer au démarrage si une dépendance manque, et rend la classe testable sans conteneur.',
    answer:
      'Une classe qui fait new sur ses dépendances les choisit définitivement : intestable sans la vraie base, impossible à reconfigurer. L’injection inverse la dépendance : la classe dépend d’une interface et reçoit l’implémentation. C’est un cas d’inversion de contrôle, où le conteneur crée et assemble les objets — un bean par définition, singleton par défaut, résolution par type puis par nom. Le constructeur est la bonne forme : immuabilité des champs, échec au démarrage plutôt qu’un champ nul en production, instanciation directe en test, et visibilité de l’excès de dépendances qu’un empilement de champs masquerait.',
    followUps: [
      ['Deux beans du même type ?', 'Le conteneur échoue au démarrage. On lève l’ambiguïté avec @Qualifier, ou on désigne un défaut avec @Primary.'],
      ['Une dépendance circulaire ?', 'Avec l’injection par constructeur, l’application refuse de démarrer — et c’est une bonne nouvelle : le cycle est un défaut de conception, mieux vaut le voir au démarrage.'],
    ],
  }),
  openQuestion({
    id: 'stack-e-requete-spring',
    domainId: D,
    courseId: 'stack-c-spring',
    lessonId: 'stack-l-couches-spring',
    topic: 'Spring',
    prompt: 'Décris le trajet d’une requête dans une application Spring Boot.',
    short:
      'Le DispatcherServlet reçoit la requête, trouve la méthode de contrôleur et convertit le corps. Le contrôleur valide et délègue au service, qui porte la règle et la transaction. Le dépôt passe par JPA, qui produit le SQL. Le résultat remonte sérialisé avec un code de statut.',
    answer:
      'Le conteneur de servlets remet la requête au DispatcherServlet, point d’entrée unique de Spring MVC, qui résout le contrôleur à partir des correspondances construites au démarrage, désérialise le corps et applique la validation déclarée. Le contrôleur traduit seulement : appel métier, choix du code, construction de la réponse. Le service porte les règles et délimite la transaction par @Transactional. Les dépôts, dont Spring Data génère l’implémentation, s’appuient sur JPA, qui gère le cache de premier niveau et l’écriture différée — ce qui explique qu’un save ne produise pas forcément un INSERT immédiat. À la sortie de la méthode transactionnelle, validation ou annulation selon qu’une exception non contrôlée est remontée.',
    followUps: [
      ['Que fait le DispatcherServlet ?', 'Il centralise routage, conversion du corps, invocation, sérialisation et gestion des erreurs — sinon chaque contrôleur referait ce travail.'],
      ['Pourquoi un DTO plutôt que l’entité ?', 'Pour ne pas souder le contrat de l’API au schéma de base, ne pas exposer de champs sensibles, et éviter les chargements paresseux déclenchés à la sérialisation.'],
    ],
  }),
  openQuestion({
    id: 'stack-e-transactional',
    domainId: D,
    courseId: 'stack-c-spring',
    lessonId: 'stack-l-jpa-transaction',
    topic: 'Spring',
    prompt: 'Quel est le rôle de @Transactional, et quels sont ses pièges ?',
    short:
      'Elle délimite une unité de travail : tout réussit ou tout est annulé. Deux pièges : l’annulation n’a lieu par défaut que sur exception non contrôlée, et un appel interne à la même classe ne passe pas par le mandataire, donc l’annotation est sans effet.',
    answer:
      'Spring entoure le bean d’un mandataire qui ouvre la transaction à l’entrée, valide à la sortie, annule sur exception non contrôlée. Le premier piège est la règle d’annulation : une exception contrôlée valide, et attraper sans relancer valide aussi — d’où des données à moitié écrites. Le second est le passage par le mandataire : un appel interne invoque directement la méthode, silencieusement sans transaction. Sur le placement, la transaction appartient au service, qui seul sait ce qu’est une opération métier complète ; dans le dépôt elle ne protège plus rien, dans le contrôleur elle dure pendant la sérialisation. Enfin elle retient une connexion du pool : jamais d’appel HTTP externe à l’intérieur.',
    followUps: [
      ['Chargement paresseux ou immédiat ?', 'Le paresseux évite de rapatrier l’inutile mais provoque le N+1 en boucle, et échoue si on y accède hors transaction. L’immédiat charge tout, y compris ce dont on n’a pas besoin.'],
      ['Comment repérer un N+1 ?', 'Journaliser le SQL et compter les requêtes d’un appel : une requête suivie de N identiques à un identifiant près. Chaque requête est rapide — c’est leur nombre qui coûte.'],
    ],
  }),
  openQuestion({
    id: 'stack-e-idempotence',
    domainId: D,
    courseId: 'stack-c-api',
    lessonId: 'stack-l-idempotence',
    topic: 'API REST',
    prompt: 'Qu’est-ce que l’idempotence et pourquoi ça compte ?',
    short:
      'Une opération idempotente donne le même état final qu’on l’exécute une ou dix fois. C’est ce qui rend un réessai sûr quand une réponse se perd et que le client ignore si l’opération a eu lieu.',
    answer:
      'GET, PUT et DELETE sont idempotentes par définition du protocole, POST ne l’est pas, PATCH dépend du contenu. L’enjeu est concret : dans toute intégration, un client finit par ne pas recevoir de réponse et doit choisir entre risquer un doublon et ne rien faire. Pour les créations, on utilise une clé d’idempotence : le client génère un identifiant de tentative en en-tête, le serveur mémorise la clé avec son résultat et renvoie la réponse d’origine si la clé revient. Il faut alors décider de la rétention et du comportement si la même clé arrive avec un corps différent — en général un conflit.',
    followUps: [
      ['Idempotent et sûr, est-ce pareil ?', 'Non. Sûr signifie sans modification : seul GET l’est. DELETE est idempotente mais pas sûre.'],
      ['Quel code sur un second DELETE ?', 'Les deux se défendent : 204 systématiquement, ou 404 au second appel. L’essentiel est de trancher et de le documenter — l’idempotence porte sur l’état, pas sur le code.'],
    ],
  }),
  openQuestion({
    id: 'stack-e-rest-soap',
    domainId: D,
    courseId: 'stack-c-api',
    lessonId: 'stack-l-soap',
    topic: 'API SOAP',
    prompt: 'REST ou SOAP : comment choisis-tu ?',
    short:
      'REST par défaut pour le web et le mobile : léger, JSON, verbes HTTP, évolutif. SOAP quand le contexte impose un contrat formel via WSDL, une sécurité au niveau du message, ou l’intégration avec un existant qui ne parle que ça.',
    answer:
      'Ce ne sont pas deux choses de même nature : REST est un style d’architecture sur HTTP, SOAP un protocole à enveloppe XML indépendant du transport. REST apporte légèreté, outillage universel et souplesse d’évolution ; ses limites sont l’absence de contrat exécutable et une sécurité qui s’arrête au transport. SOAP apporte l’inverse : le WSDL est vérifiable et opposable, WS-Security signe ou chiffre le message lui-même — ce qui compte quand il traverse des intermédiaires — et le transport peut être une file plutôt qu’HTTP. En pratique, dans la banque ou l’assurance, la question n’est pas de choisir mais d’exposer du REST tout en consommant du SOAP existant.',
    followUps: [
      ['Peut-on faire du REST sans JSON ?', 'Oui : la négociation de contenu permet XML, CSV ou binaire. JSON est un usage dominant, pas une règle du style.'],
      ['WS-Security face à TLS ?', 'TLS protège la connexion entre deux points, le message étant en clair aux extrémités. WS-Security protège le message lui-même, qui reste couvert en traversant des intermédiaires.'],
    ],
  }),
  openQuestion({
    id: 'stack-e-async',
    domainId: D,
    courseId: 'stack-c-messaging',
    lessonId: 'stack-l-sync-async',
    topic: 'Messaging',
    prompt: 'Quand choisis-tu l’asynchrone plutôt qu’un appel synchrone ?',
    short:
      'Quand le client n’a pas besoin du résultat pour continuer. Ce qui conditionne la réponse reste synchrone ; ce qui en découle — notification, export, propagation — part en message, pour ne pas dépendre de la disponibilité des autres.',
    answer:
      'Le critère est le couplage temporel. En synchrone, la disponibilité est le produit de celle de toute la chaîne, et la lenteur d’un maillon immobilise les threads jusqu’à saturation. En asynchrone, l’émetteur dépose un message durable et répond aussitôt ; le consommateur travaille à son rythme et peut être arrêté sans perte. Le coût est réel : le client n’a plus la réponse, il faut donc un suivi ; on hérite du au moins une fois, donc de doublons, donc du besoin d’idempotence ; l’ordre n’est garanti que sous conditions ; et le diagnostic exige du traçage. En pratique on découpe dans la requête : valider et enregistrer restent synchrones, le courriel et l’indexation partent en message.',
    followUps: [
      ['Quel code HTTP pour une opération asynchrone ?', '202 Accepted, avec un identifiant de suivi et idéalement une URL pour consulter l’avancement.'],
      ['Si le consommateur échoue en plein traitement ?', 'Le message n’est pas acquitté et revient, d’où l’exigence d’idempotence. Après plusieurs échecs on l’écarte vers une file de rebut pour ne pas bloquer les suivants.'],
    ],
  }),
  openQuestion({
    id: 'stack-e-kafka',
    domainId: D,
    courseId: 'stack-c-messaging',
    lessonId: 'stack-l-kafka',
    topic: 'Kafka',
    prompt: 'Quelle différence entre Kafka et une file JMS ?',
    short:
      'Une file JMS retire le message une fois acquitté et c’est le broker qui suit la progression. Kafka écrit dans un journal conservé, et c’est le consommateur qui mémorise sa position — d’où plusieurs groupes indépendants et la possibilité de rejouer.',
    answer:
      'Il faut d’abord situer les noms : JMS est une spécification, EMS ou ActiveMQ des brokers qui l’implémentent, Kafka une plateforme de flux au modèle de journal. Un topic Kafka est découpé en partitions, chacune strictement ordonnée ; l’ordre est garanti dans une partition, jamais entre elles, et la clé détermine la partition — c’est ainsi qu’on ordonne par client. Chaque groupe mémorise un offset par partition, ce qui permet de reprendre et de reculer. Kafka attribue chaque partition à un seul membre du groupe, ce qui répartit la charge, tandis que deux groupes lisent indépendamment — file et sujet réunis. En contrepartie : parallélisme plafonné par les partitions, pas d’ordre global, pas de file de rebut native.',
    followUps: [
      ['Comment garantir l’ordre pour un client ?', 'En prenant son identifiant comme clé : tous ses messages tombent dans la même partition. Chercher un ordre global reviendrait à n’avoir qu’une partition, donc aucun parallélisme.'],
      ['Exactly-once, c’est possible ?', 'À l’intérieur de Kafka, avec production transactionnelle et offsets validés dans la même transaction. Dès qu’il y a un effet hors Kafka, on retombe sur du au moins une fois avec traitement idempotent.'],
    ],
  }),
  openQuestion({
    id: 'stack-e-cache',
    domainId: D,
    courseId: 'stack-c-cache',
    lessonId: 'stack-l-pieges-cache',
    topic: 'Cache',
    prompt: 'Quels problèmes un cache introduit-il ?',
    short:
      'Une copie de la vérité, donc la possibilité qu’elle diverge. Trois problèmes : données périmées si l’invalidation est oubliée, ruée quand une clé chaude expire et que tout le monde reconstruit, et cache inutile si la donnée change trop souvent.',
    answer:
      'L’obsolescence d’abord : la question n’est pas de l’éviter mais de décider combien de temps on l’accepte. On combine une durée de vie explicite, qui borne le pire cas, et une invalidation à l’écriture. Se reposer sur la seule invalidation est fragile : un chemin d’écriture oublié — batch, correction manuelle, autre service — sert une valeur fausse indéfiniment. La ruée ensuite : une clé très lue expire et toutes les requêtes reconstruisent ensemble ; on l’atténue par un écart aléatoire sur les durées de vie, une reconstruction sous verrou, ou un rafraîchissement en arrière-plan. Enfin le cache inutile, dont le taux de succès reste bas : on paie un aller-retour sans rien économiser — d’où l’importance de mesurer ce taux.',
    followUps: [
      ['Comment choisis-tu la durée de vie ?', 'Par la tolérance métier : combien de temps une valeur fausse est-elle acceptable ici ? Un catalogue supporte une heure, un solde quelques secondes. C’est une décision métier.'],
      ['Cache local ou distribué ?', 'Le local est plus rapide mais propre à chaque instance : incohérent en cluster, perdu au redémarrage. Le distribué ajoute un aller-retour et donne une vue commune.'],
    ],
  }),
  openQuestion({
    id: 'stack-e-pod',
    domainId: D,
    courseId: 'stack-c-devops',
    lessonId: 'stack-l-pod',
    topic: 'Kubernetes',
    prompt: 'Qu’est-ce qu’un pod, et pourquoi en déployer plusieurs ?',
    short:
      'La plus petite unité déployable de Kubernetes : un ou plusieurs conteneurs partageant réseau et volumes. Plusieurs exemplaires pour la disponibilité, pour répartir la charge, et pour déployer sans coupure en les remplaçant un par un.',
    answer:
      'Kubernetes ne manipule jamais un conteneur isolé. Le pod est jetable : il reçoit une IP à sa création et la perd à sa disparition, d’où deux objets nécessaires. Le Deployment déclare l’état souhaité et son contrôleur corrige l’écart en permanence, recréant les pods morts. Le Service donne une adresse stable devant l’ensemble et répartit le trafic, puisqu’on ne peut appeler une IP changeante. Le nombre d’exemplaires répond à trois besoins simultanés : rester disponible malgré une perte, encaisser la charge, et permettre le remplacement progressif — ce dernier reposant entièrement sur la sonde de readiness. Tout cela suppose une application sans état local.',
    followUps: [
      ['Liveness ou readiness ?', 'La liveness tue et recrée le conteneur ; la readiness le retire simplement du trafic. Une liveness qui teste la base transforme une base lente en boucle de redémarrages.'],
      ['Kubernetes ou OpenShift ?', 'OpenShift est une distribution de Kubernetes : même socle et mêmes objets, plus l’authentification intégrée, les Routes, la construction d’images et une console.'],
    ],
  }),
  openQuestion({
    id: 'stack-e-docker',
    domainId: D,
    courseId: 'stack-c-devops',
    lessonId: 'stack-l-docker',
    topic: 'Docker',
    prompt: 'Quelle différence entre une image et un conteneur ?',
    short:
      'L’image est un modèle figé en lecture seule contenant l’application et son environnement ; le conteneur en est une exécution. Comme une classe et un objet : une image, autant de conteneurs qu’on veut.',
    answer:
      'L’image se construit depuis un Dockerfile, en couches empilées, et elle est immuable : la même empreinte donne le même contenu partout, ce qui rend le déploiement reproductible. Le conteneur y ajoute une couche modifiable qui disparaît à son arrêt, d’où les volumes pour ce qui doit survivre. Deux conséquences pratiques : la configuration ne doit jamais être dans l’image, sinon il faut une image par environnement et on déploie en production quelque chose de jamais testé ; et le conteneur doit être jetable, donc l’application sans état local — ce que Kubernetes suppose ensuite pour déplacer ou redémarrer librement.',
    followUps: [
      ['Pourquoi une image multi-étapes ?', 'Pour ne pas livrer l’outillage de compilation : un étage construit avec le JDK complet, l’autre ne garde que l’archive sur une base à runtime Java. Image plus petite, surface d’attaque réduite.'],
      ['Différence avec une machine virtuelle ?', 'Une VM embarque un système complet sur un hyperviseur ; un conteneur partage le noyau de l’hôte et n’isole que processus et ressources. Démarrage en une seconde, isolation plus faible.'],
    ],
  }),
  openQuestion({
    id: 'stack-e-cicd',
    domainId: D,
    courseId: 'stack-c-devops',
    lessonId: 'stack-l-cicd',
    topic: 'CI/CD',
    prompt: 'Décris la chaîne qui mène d’un commit à une application déployée.',
    short:
      'Le push déclenche compilation, tests et analyse. Si tout passe, une image étiquetée par l’empreinte du commit est publiée au registre, puis le Deployment est mis à jour, ce qui remplace progressivement les pods.',
    answer:
      'Le crochet sur le push rend la vérification systématique plutôt que dépendante de la discipline. Suivent la compilation, les tests unitaires et d’intégration — seule étape qui atteste du comportement — puis l’analyse de qualité avec ses seuils bloquants. L’artefact est empaqueté dans une image étiquetée par l’empreinte du commit, ce qui permet de savoir exactement ce qui tourne et de revenir en arrière sans ambiguïté. Le déploiement consiste à mettre à jour le Deployment ; le contrôleur remplace les pods progressivement en s’appuyant sur la readiness. Point de méthode essentiel : on ne reconstruit jamais pour la production — la même image traverse les environnements, seule la configuration change.',
    followUps: [
      ['Livraison ou déploiement continu ?', 'La livraison rend chaque version déployable en un clic, une personne décidant du moment. Le déploiement continu va jusqu’en production sans intervention, ce qui suppose une grande confiance dans les tests.'],
      ['Comment revenir en arrière ?', 'En redéployant l’étiquette précédente, toujours présente au registre — immédiat. Le point délicat est la base : une migration de schéma ne se défait pas aussi simplement.'],
    ],
  }),
  openQuestion({
    id: 'stack-e-observabilite',
    domainId: D,
    courseId: 'stack-c-observabilite',
    lessonId: 'stack-l-piliers',
    topic: 'Observabilité',
    prompt: 'Quelle différence entre logging, monitoring et observabilité ?',
    short:
      'Les journaux racontent ce qui s’est passé pour une exécution précise. La supervision surveille des indicateurs connus et alerte. L’observabilité est la capacité à répondre à des questions non anticipées, en recoupant journaux, métriques et traces.',
    answer:
      'Les journaux donnent le détail d’une exécution mais aucune vue d’ensemble : on ne sait pas si l’erreur touche un utilisateur ou la moitié du trafic. Les métriques sont agrégées — taux d’erreur, latence par centile, débit, saturation — et montrent ampleur et tendance sans nommer de cause. Les traces suivent une requête à travers les services et découpent sa durée par étape. La supervision est l’usage de ces signaux sur des seuils décidés d’avance, ce qui marche pour l’anticipé. L’observabilité permet d’enquêter sur l’imprévu sans redéployer : elle suppose des journaux structurés, des identifiants de corrélation et assez de cardinalité pour filtrer par client ou par version. On constate avec les métriques, on localise avec les traces, on comprend avec les journaux.',
    followUps: [
      ['Pourquoi des journaux structurés ?', 'Une ligne de texte libre ne se cherche que par mot-clé. En JSON avec des champs nommés on filtre, on agrège et on compte — combien de fois, sur quel client, depuis quelle version.'],
      ['Qu’est-ce qu’un identifiant de corrélation ?', 'Un identifiant unique attribué à la requête en entrée et propagé partout. Il rassemble les journaux dispersés sur dix pods en une seule histoire et relie une trace à ses journaux.'],
    ],
  }),
  openQuestion({
    id: 'stack-e-erreur-prod',
    domainId: D,
    courseId: 'stack-c-observabilite',
    lessonId: 'stack-l-elk',
    topic: 'Diagnostic',
    prompt: 'Comment retrouves-tu la cause d’une erreur 500 en production ?',
    short:
      'Je pars de l’heure et du chemin, je récupère l’identifiant de corrélation, et je filtre les journaux centralisés dessus. Je remonte à la première erreur de la chaîne — pas la dernière —, j’ouvre la pile d’appels, puis je vérifie combien de requêtes sont touchées.',
    answer:
      'Le point de départ est un fait daté. L’identifiant de corrélation est la première chose à récupérer : il rassemble l’histoire complète de la requête tous services confondus, ce qui est impossible avec des journaux locaux à des pods jetables. On lit en ordre chronologique en cherchant la première erreur : celle qui remonte à l’utilisateur est souvent une conséquence — une NPE à la sérialisation alors que la vraie cause est un délai dépassé trois appels plus tôt. La pile donne classe, méthode et ligne, mais il faut se méfier de confondre lieu du symptôme et lieu de la cause. Vient enfin l’ampleur : une occurrence, un client, ou tout le trafic depuis un déploiement ? C’est cette question qui distingue un bug fonctionnel d’une régression.',
    followUps: [
      ['Et si les journaux ne suffisent pas ?', 'On passe aux traces pour la répartition du temps et aux métriques pour l’ampleur et la corrélation avec un déploiement. Si rien ne ressort, c’est qu’il manque de l’instrumentation — conclusion d’incident légitime.'],
      ['Faut-il tout envoyer dans Elasticsearch ?', 'Non : le stockage coûte et un DEBUG permanent noie l’utile. INFO et au-dessus en production, traces échantillonnées, DEBUG activé temporairement et ciblé.'],
    ],
  }),
  openQuestion({
    id: 'stack-e-api-lente',
    domainId: D,
    courseId: 'stack-c-performance',
    lessonId: 'stack-l-methode-perf',
    topic: 'Performance',
    prompt: 'Pourquoi mon API Spring Boot est-elle lente ? Comment procèdes-tu ?',
    short:
      'Je reproduis, puis je mesure la répartition du temps entre front, réseau, contrôleur, service, base et appels externes. Je ne touche à rien avant de savoir où sont les secondes. J’analyse la couche qui concentre le temps, je corrige une chose, et je re-mesure.',
    answer:
      'Le principe est de refuser d’agir sur une hypothèse. Je reproduis, sinon je ne pourrai pas vérifier la correction. Je mesure ensuite la répartition — les traces la donnent directement. De façon constante, le temps est dans la base ou dans un appel externe, presque jamais dans le code Java. Sur la base, la première question est le nombre de requêtes et non leur durée : une requête à huit secondes et mille à huit millisecondes appellent des corrections opposées, plan d’exécution et index d’un côté, suppression d’un N+1 de l’autre. Sur les appels externes, je regarde s’ils sont en série alors qu’ils pourraient être parallèles, et surtout s’ils ont un délai d’attente — sans lui, la lenteur d’une dépendance immobilise mes threads. Je corrige une seule chose, je re-mesure dans les mêmes conditions, et je vérifie l’absence de régression : un index accélère les lectures et ralentit les écritures. Le cache vient à la fin, jamais à la place d’une correction.',
    followUps: [
      ['Et si tu ne peux pas reproduire ?', 'La production devient l’environnement d’observation : j’isole les cas lents par les traces et je cherche ce qu’ils ont en commun — un client, un volume, une plage horaire. Souvent une donnée particulière.'],
      ['Pourquoi les centiles plutôt que la moyenne ?', 'La moyenne dilue les cas extrêmes, qui sont ceux dont les utilisateurs se plaignent. Une moyenne à 200 ms est compatible avec 5 % de requêtes à 8 secondes.'],
      ['Quand l’optimisation est-elle terminée ?', 'Quand l’objectif chiffré fixé au départ est atteint et vérifié par une nouvelle mesure. Sans objectif, chaque optimisation supplémentaire coûte plus en complexité qu’elle ne rapporte.'],
    ],
  }),
  openQuestion({
    id: 'stack-e-pod-redemarre',
    domainId: D,
    courseId: 'stack-c-performance',
    lessonId: 'stack-l-incidents-infra',
    topic: 'Diagnostic',
    prompt: 'Un pod redémarre toutes les cinq minutes. Comment procèdes-tu ?',
    short:
      'Je lis d’abord le motif du dernier arrêt : OOMKilled, échec de sonde ou sortie applicative mènent à trois enquêtes différentes. Puis les journaux du conteneur précédent, la mémoire avant l’arrêt comparée à la limite, et ce que teste réellement la liveness.',
    answer:
      'Le motif d’arrêt fait gagner le plus de temps et on l’oublie souvent. OOMKilled signale un dépassement de la limite mémoire : la cause classique est une JVM autorisée à allouer autant que la limite du conteneur, tuée avant qu’un ramassage complet n’ait pu libérer — le tas maximal doit rester nettement sous la limite, car la JVM consomme aussi hors tas. Un échec de liveness pose la question de ce qu’elle teste : si elle interroge la base, une base lente fait tuer le pod, qui redémarre et rouvre ses connexions, aggravant la charge — la boucle s’auto-entretient. La liveness teste le processus, la readiness les dépendances. Troisième cas très courant : un démarrage plus lent que le délai accordé, reconnaissable à des redémarrages parfaitement réguliers avant tout trafic ; la sonde de startup existe pour ça. Et si c’est bien la mémoire, je distingue fuite et dimensionnement par le tas après ramassage complet.',
    followUps: [
      ['Pourquoi le tas maximal sous la limite du conteneur ?', 'Parce que la JVM consomme hors tas : métaespace, piles de threads, tampons, code compilé. Si le tas égale la limite, ce hors-tas fait dépasser et le conteneur est tué sans aucune erreur Java — diagnostic très déroutant.'],
      ['Comment éviter qu’une dépendance lente provoque ça ?', 'Séparer strictement les sondes, mettre des délais d’attente sur tous les appels sortants, et ajouter un disjoncteur pour cesser d’appeler une dépendance en échec.'],
    ],
  }),
  openQuestion({
    id: 'stack-e-architecture',
    domainId: D,
    courseId: 'stack-c-architecture',
    lessonId: 'stack-l-chaine-complete',
    topic: 'Architecture',
    prompt: 'Décris l’architecture d’une application sur laquelle tu as travaillé.',
    short:
      'Une API REST Spring Boot en trois couches, en plusieurs pods sur OpenShift derrière une Route et un Service. Chemin synchrone du contrôleur au service, puis cache Redis et base via JPA. Le travail annexe part en événement sur Kafka. Logs, métriques et traces centralisés.',
    answer:
      'Je la décris en suivant une requête. Entrée par une Route qui termine le TLS, vers un Service qui répartit sur plusieurs pods — pour la disponibilité, la charge et le déploiement progressif. Dans le pod : contrôleur pour la traduction HTTP, service pour les règles et la transaction, Redis avant la base pour les lectures coûteuses et stables, sinon dépôt et JPA. Ce qui n’est pas nécessaire à la réponse — courriel, indexation, analytique, notification partenaire — est publié sur Kafka et traité par des consommateurs séparés, pour ne pas faire dépendre la validation d’une commande d’un serveur de messagerie. Côté livraison, un push déclenche compilation, tests, analyse, image étiquetée par commit, registre, mise à jour du Deployment. La configuration reste hors de l’image, en ConfigMap et Secrets. Côté exploitation, journaux structurés centralisés, métriques sur latence et taux d’erreur, traces pour la répartition du temps.',
    followUps: [
      ['Pourquoi plusieurs pods plutôt qu’un plus gros ?', 'Un exemplaire unique est un point de panne unique et empêche tout déploiement sans coupure. Plusieurs permettent d’en perdre un, de répartir, et de remplacer progressivement — au prix d’une application sans état local.'],
      ['Comment garantis-tu la cohérence entre base et événements ?', 'Écrire en base puis publier n’est pas atomique. Le motif de la boîte d’envoi écrit l’événement dans une table dans la même transaction, un processus séparé le publie ensuite ; on accepte le doublon et on rend les consommateurs idempotents.'],
      ['Que changerais-tu ?', 'C’est la vraie question : il faut savoir nommer une limite. Par exemple un cache sans invalidation explicite, reposant seulement sur des durées de vie, avec des fenêtres d’incohérence gênantes — et dire ce qu’on aurait mis à la place.'],
    ],
  }),
];
