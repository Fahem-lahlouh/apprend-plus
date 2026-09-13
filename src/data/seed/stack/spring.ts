import {
  badGood,
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
  techDef,
  text,
  tip,
  warn,
  why,
  type CourseSpec,
} from '../builders';

/**
 * Spring et Spring Boot.
 *
 * L'ordre est celui du raisonnement et non celui de la documentation : on part
 * du problème que l'injection de dépendances résout, avant de nommer les
 * annotations. Le chapitre final relie tout par la traversée d'une requête, qui
 * est la question d'entretien la plus fréquente sur le sujet.
 */
export const springCourse: CourseSpec = {
  id: 'stack-c-spring',
  title: 'Spring et Spring Boot',
  description: 'Inversion de contrôle, injection de dépendances, MVC, JPA et le trajet d’une requête.',
  icon: 'sparkle',
  level: 'intermediaire',
  tags: ['spring', 'java', 'backend'],
  pathId: 'stack-path-ecosysteme',
  chapters: [
    {
      id: 'stack-ch-ioc',
      title: 'Inversion de contrôle',
      description: 'Le problème d’abord, le vocabulaire ensuite.',
      lessons: [
        {
          id: 'stack-l-injection',
          title: 'Injection de dépendances',
          summary: 'Pourquoi une classe ne devrait pas construire ce dont elle dépend.',
          minutes: 11,
          difficulty: 'moyen',
          requires: ['java-l-classes', 'java-l-interfaces'],
          concepts: ['spring', 'conception'],
          blocks: [
            why(
              'Quel problème ça résout ?',
              'Une classe qui fait `new` sur ses dépendances les choisit définitivement. Impossible de lui donner une autre implémentation, impossible de la tester sans la vraie base de données, impossible de changer la configuration sans recompiler. L’injection retourne la responsabilité : la classe déclare ce dont elle a besoin, quelqu’un d’autre le lui fournit.',
            ),
            badGood({
              language: 'java',
              title: 'Construire ou recevoir',
              bad: `public class CommandeService {
    private final CommandeRepository repository = new JpaCommandeRepository();

    public Commande valider(Long id) { ... }
}`,
              good: `public class CommandeService {
    private final CommandeRepository repository;

    public CommandeService(CommandeRepository repository) {
        this.repository = repository;
    }

    public Commande valider(Long id) { ... }
}`,
              why: 'Dans la première version, le service est soudé à une implémentation précise : un test unitaire ouvrirait une vraie connexion. Dans la seconde, il dépend de l’interface et reçoit l’implémentation de l’extérieur ; en test on lui passe un faux dépôt, en production Spring lui passe le vrai. Le code du service n’a pas changé.',
            }),
            def(
              'Inversion de contrôle',
              'L’inversion de contrôle consiste à confier à un cadre applicatif la création et l’assemblage des objets, plutôt que de les construire soi-même. Le code déclare ce dont il a besoin et c’est le cadre qui décide quand et comment le fournir.',
            ),
            techDef(
              'Conteneur',
              'Le conteneur Spring instancie les composants déclarés, résout leurs dépendances par type puis par nom, gère leur cycle de vie et les expose via l’ApplicationContext. Par défaut une seule instance partagée est créée par définition de composant.',
            ),
            def(
              'Bean',
              'Un bean est un objet dont le cycle de vie est géré par le conteneur Spring. Il est créé, assemblé avec ses dépendances et rendu disponible aux autres composants sans que le code n’ait à l’instancier.',
            ),
            compare(
              ['Injection par constructeur', 'Injection par champ'],
              [
                ['Écriture', 'Un paramètre de constructeur', '`@Autowired` sur l’attribut'],
                ['Champ final', 'Possible', 'Impossible'],
                ['Dépendance oubliée', 'Impossible à instancier : détecté tout de suite', 'Champ nul découvert à l’exécution'],
                ['Test unitaire', 'On passe les doubles au constructeur', 'Il faut de la réflexion ou un conteneur'],
                ['Dépendances trop nombreuses', 'Visible : le constructeur devient énorme', 'Invisible : les champs s’accumulent'],
                ['Recommandation', 'Par défaut', 'À éviter'],
              ],
              'Les deux formes, et pourquoi une seule est recommandée',
            ),
            tip(
              'Avec un constructeur unique, `@Autowired` est inutile depuis Spring 4.3 : le conteneur l’utilise automatiquement. Un constructeur nu est donc la forme la plus propre — et elle rend la classe utilisable sans Spring du tout.',
            ),
            memorize('stack-d-ioc'),
            memorize('stack-d-bean'),
            quiz('stack-q-di-1'),
            interview({
              question: 'Qu’est-ce que l’injection de dépendances ?',
              short:
                'C’est le fait qu’une classe reçoive ses dépendances de l’extérieur au lieu de les construire elle-même. Elle déclare ce dont elle a besoin, généralement dans son constructeur, et le conteneur le lui fournit. On peut alors changer d’implémentation ou tester la classe isolément sans la modifier.',
              detailed:
                'Le point de départ est le couplage. Une classe qui fait `new JpaCommandeRepository()` décide seule de son implémentation : on ne peut plus la tester sans base réelle, ni lui substituer une autre source de données. L’injection inverse le sens de la dépendance : la classe dépend d’une interface et reçoit l’implémentation par son constructeur. C’est un cas particulier de l’inversion de contrôle, où le cadre applicatif prend en charge la création et l’assemblage des objets. Concrètement, Spring scanne les classes annotées, crée un bean par définition — une seule instance partagée par défaut —, résout chaque dépendance par type puis par nom en cas d’ambiguïté, et expose le tout via l’ApplicationContext. La forme à privilégier est le constructeur : elle permet des champs `final`, donc immuables ; elle échoue au démarrage plutôt qu’à l’exécution si une dépendance manque ; elle rend la classe instanciable en test sans conteneur ; et elle rend visible l’excès de dépendances, un constructeur à huit paramètres signalant une classe qui en fait trop. L’injection par champ masque tout cela.',
              followUps: [
                [
                  'Que se passe-t-il si deux beans du même type existent ?',
                  'Le conteneur ne peut plus trancher par type et échoue au démarrage. On lève l’ambiguïté avec `@Qualifier` pour désigner le bean voulu, ou `@Primary` pour désigner celui à retenir par défaut.',
                ],
                [
                  'Qu’est-ce que la portée d’un bean ?',
                  'La règle qui décide du nombre d’instances. Par défaut `singleton` : une seule instance partagée par le conteneur. `prototype` en crée une à chaque demande, et dans une application web `request` ou `session` lient l’instance à la requête ou à la session.',
                ],
                [
                  'Une dépendance circulaire, ça donne quoi ?',
                  'Avec l’injection par constructeur, l’application refuse de démarrer, car aucun des deux beans ne peut être construit en premier. C’est une bonne nouvelle : le cycle est un défaut de conception, et il vaut mieux le voir au démarrage qu’en production.',
                ],
              ],
            }),
          ],
          definitions: [
            {
              id: 'stack-d-ioc',
              title: 'Inversion de contrôle',
              text: 'L’inversion de contrôle consiste à laisser un cadre applicatif créer les objets et les relier entre eux, au lieu que chaque classe construise elle-même ce dont elle dépend. Le code se contente de déclarer ses besoins, ce qui permet de changer d’implémentation ou de tester une classe isolément sans la modifier.',
              tags: ['spring', 'conception'],
            },
            {
              id: 'stack-d-bean',
              title: 'Bean Spring',
              text: 'Un bean est un objet dont la création et le cycle de vie sont pris en charge par le conteneur Spring. Le conteneur l’instancie, lui fournit ses dépendances et le met à disposition des autres composants, qui n’ont donc jamais à l’instancier eux-mêmes.',
              tags: ['spring'],
            },
          ],
        },
        {
          id: 'stack-l-spring-vs-boot',
          title: 'Spring ou Spring Boot',
          summary: 'Deux choses différentes, souvent confondues en entretien.',
          minutes: 9,
          difficulty: 'facile',
          requires: ['stack-l-injection'],
          concepts: ['spring'],
          blocks: [
            text(
              'La confusion est si fréquente qu’elle sert de question filtre : Spring Boot n’est pas une version récente de Spring, ni un remplacement. C’est une couche posée dessus, qui supprime la configuration répétitive.',
            ),
            compare(
              ['Spring Framework', 'Spring Boot'],
              [
                ['Nature', 'Le socle : conteneur, MVC, transactions', 'Une couche au-dessus du socle'],
                ['Apporte', 'L’inversion de contrôle et les modules', 'Configuration automatique, dépendances groupées, serveur intégré'],
                ['Configuration', 'Explicite, XML ou Java', 'Déduite de ce qui est présent dans le classpath, surchargeable'],
                ['Livraison', 'Un WAR déposé dans un serveur d’applications', 'Un JAR exécutable, serveur compris'],
                ['Remplace l’autre ?', '—', 'Non : il l’utilise'],
              ],
            ),
            def(
              'Configuration automatique',
              'La configuration automatique est le mécanisme par lequel Spring Boot déduit des bibliothèques présentes ce qu’il doit préparer. Trouver un pilote de base de données et une URL suffit à lui faire construire une source de données, tant qu’on ne l’a pas définie soi-même.',
            ),
            why(
              'Pourquoi c’est plus qu’un confort ?',
              'Parce que la configuration répétitive est du code que personne ne relit et où les erreurs se cachent. Réduire une source de données à trois lignes de propriétés supprime une classe de bugs entière. Le prix à payer est qu’il faut savoir ce que Boot a décidé à ta place : c’est exactement ce que montre le rapport de configuration automatique au démarrage.',
            ),
            tip(
              'Lancer l’application avec `--debug` affiche le rapport de configuration automatique : ce qui a été appliqué, et surtout ce qui ne l’a pas été avec la raison. C’est le premier réflexe quand un bean attendu n’existe pas.',
            ),
            memorize('stack-d-spring-boot'),
            quiz('stack-q-boot-1'),
            interview({
              question: 'Quelle différence entre Spring et Spring Boot ?',
              short:
                'Spring est le socle : le conteneur d’inversion de contrôle et ses modules — MVC, transactions, sécurité. Spring Boot est une couche posée dessus qui supprime la configuration répétitive par de la configuration automatique, fournit des groupes de dépendances cohérents et embarque un serveur, ce qui donne un JAR exécutable.',
              detailed:
                'Spring Framework fournit le conteneur, l’injection de dépendances et l’essentiel des modules. Il n’impose aucune façon de démarrer : historiquement on écrivait la configuration à la main, on assemblait ses dépendances soi-même et on déployait un WAR dans un serveur d’applications. Ce travail était long et surtout répétitif d’un projet à l’autre. Spring Boot ne réimplémente rien de tout cela : il l’utilise, en ajoutant trois choses. La configuration automatique déduit du classpath ce qu’il faut préparer — un pilote de base et une URL suffisent à obtenir une source de données, sauf si on en déclare une, auquel cas la sienne s’efface. Les starters regroupent des dépendances aux versions compatibles, ce qui supprime les conflits de versions. Le serveur embarqué produit un JAR autonome, ce qui colle au déploiement en conteneur où l’on veut un artefact exécutable plutôt qu’un serveur à administrer. La contrepartie est qu’il faut savoir inspecter ce que Boot a décidé, et le rapport de configuration automatique est fait pour ça.',
              followUps: [
                [
                  'Comment surcharger une configuration automatique ?',
                  'En déclarant soi-même le bean : la configuration automatique est conditionnelle et s’efface dès qu’une définition explicite existe. Sinon on ajuste par propriétés, ou on exclut explicitement une classe de configuration.',
                ],
                [
                  'À quoi sert application.properties, et les profils ?',
                  'C’est le fichier de propriétés externalisées : URL de base, ports, seuils. Les profils permettent d’avoir un jeu par environnement — `application-prod.yml` — activé au lancement, ce qui évite de recompiler pour changer d’environnement, et empêche qu’un secret de production traîne dans le code.',
                ],
              ],
            }),
          ],
          definitions: [
            {
              id: 'stack-d-spring-boot',
              title: 'Spring Boot',
              text: 'Spring Boot est une couche posée sur Spring qui supprime la configuration répétitive en déduisant des dépendances présentes ce qu’il faut préparer. Il fournit aussi des groupes de dépendances cohérents et un serveur embarqué, ce qui permet de livrer une application sous forme de simple archive exécutable.',
              tags: ['spring'],
            },
          ],
        },
      ],
    },
    {
      id: 'stack-ch-couches',
      title: 'Les couches et la traversée d’une requête',
      description: 'Controller, Service, Repository : qui fait quoi, et pourquoi.',
      lessons: [
        {
          id: 'stack-l-couches-spring',
          title: 'Controller, Service, Repository',
          summary: 'Trois responsabilités, et ce qui arrive quand on les mélange.',
          minutes: 12,
          difficulty: 'moyen',
          requires: ['stack-l-spring-vs-boot', 'java-l-architecture-api'],
          concepts: ['spring', 'architecture'],
          blocks: [
            compare(
              ['Couche', 'Sa seule responsabilité'],
              [
                ['@RestController', 'Traduire', 'Reçoit la requête HTTP, valide la forme des entrées, appelle le service, traduit le résultat en réponse et en code de statut. Aucune règle métier.'],
                ['@Service', 'Décider', 'Porte les règles métier, orchestre plusieurs dépôts, délimite la transaction. Ne connaît ni HTTP ni SQL.'],
                ['@Repository', 'Accéder', 'Lit et écrit les données. Ne décide de rien et ne connaît pas les règles métier.'],
                ['@Component', 'Le cas général', 'Tout autre bean géré par le conteneur. Les trois précédentes en sont des spécialisations qui portent une intention.'],
              ],
              'La séparation des responsabilités',
            ),
            why(
              'Pourquoi ne pas appeler le dépôt directement depuis le contrôleur ?',
              'Parce que la règle métier n’aurait plus de domicile. Elle se retrouverait dupliquée dans chaque contrôleur qui en a besoin, et deviendrait inaccessible à tout ce qui n’est pas HTTP — un traitement planifié, un consommateur de messages, un import de fichier. La couche service existe pour que la règle soit écrite une fois et appelable depuis n’importe quelle entrée.',
            ),
            badGood({
              language: 'java',
              title: 'Où mettre la règle',
              bad: `@RestController
public class CommandeController {
    private final CommandeRepository repository;

    @PostMapping("/commandes/{id}/valider")
    public Commande valider(@PathVariable Long id) {
        Commande c = repository.findById(id).orElseThrow();
        if (c.getMontant() > 1000) c.setStatut("A_VERIFIER");
        else c.setStatut("VALIDEE");
        return repository.save(c);
    }
}`,
              good: `@RestController
public class CommandeController {
    private final CommandeService service;

    @PostMapping("/commandes/{id}/valider")
    public ResponseEntity<CommandeDto> valider(@PathVariable Long id) {
        return ResponseEntity.ok(CommandeDto.de(service.valider(id)));
    }
}`,
              why: 'Le seuil de 1000 est une règle métier. Dans le contrôleur, elle n’est applicable que par HTTP et sera recopiée le jour où un batch doit valider des commandes. Dans le service, elle est écrite une fois, testable sans serveur web, et le contrôleur se limite à traduire — ce qui est son rôle. Au passage, renvoyer l’entité directement expose le modèle de persistance : le DTO découple le contrat de l’API du schéma de la base.',
            }),
            flow(
              [
                step(
                  'Client',
                  'Navigateur, application mobile, autre service',
                  'Émet une requête HTTP : une méthode, une URI, des en-têtes, parfois un corps JSON.',
                  'Sans client, pas de requête — c’est le point de départ de toute la chaîne.',
                ),
                step(
                  'DispatcherServlet',
                  'Le point d’entrée unique de Spring MVC',
                  'Reçoit toutes les requêtes, consulte les correspondances déclarées pour trouver la méthode de contrôleur visée, convertit le corps en objet Java, invoque la méthode puis sérialise le retour.',
                  'Sans lui, chaque contrôleur devrait gérer lui-même le routage, la conversion et la gestion des erreurs.',
                ),
                step(
                  'Controller',
                  'La traduction HTTP ↔ métier',
                  'Valide la forme des entrées, appelle le service, choisit le code de statut et construit la réponse.',
                  'Sans lui, le métier devrait comprendre HTTP, et ne serait plus appelable autrement.',
                ),
                step(
                  'Service',
                  'La décision métier',
                  'Applique les règles, orchestre plusieurs dépôts, ouvre et referme la transaction.',
                  'Sans lui, la règle se duplique dans chaque point d’entrée et devient intestable sans serveur.',
                ),
                step(
                  'Repository',
                  'L’accès aux données',
                  'Traduit une intention — chercher, enregistrer — en opération de persistance. Avec Spring Data, l’implémentation est générée à partir de la signature.',
                  'Sans lui, le SQL se répand dans le service et le change de base devient un chantier.',
                ),
                step(
                  'JPA / Hibernate',
                  'La correspondance objet ↔ table',
                  'Transforme les entités en requêtes SQL, gère le cache de premier niveau, le suivi des modifications et l’écriture différée en fin de transaction.',
                  'Sans lui, il faut écrire et maintenir le SQL et la conversion à la main — parfois le bon choix pour des requêtes très particulières.',
                  'JDBC direct, ou un outil léger comme JdbcTemplate ou jOOQ quand on veut garder la main sur le SQL.',
                ),
                step(
                  'Base de données',
                  'Là où vivent les données',
                  'Exécute le SQL, applique ses index et ses contraintes, garantit la cohérence transactionnelle.',
                  'C’est le bout de la chaîne — et, dans la majorité des applications lentes, l’endroit où se trouve le temps perdu.',
                ),
              ],
              'Le trajet complet d’une requête',
            ),
            memorize('stack-d-dispatcher'),
            quiz('stack-q-couches-1'),
            interview({
              question: 'Décris le trajet d’une requête dans une application Spring Boot.',
              short:
                'La requête arrive sur le DispatcherServlet, qui trouve la méthode de contrôleur correspondant à la méthode HTTP et à l’URI, puis convertit le corps en objet. Le contrôleur valide et délègue au service, qui porte la règle métier et la transaction. Le service passe par le dépôt, JPA traduit en SQL, la base répond, et le résultat remonte sérialisé en JSON avec un code de statut.',
              detailed:
                'Le client émet une requête HTTP. Côté serveur, le conteneur de servlets la remet au DispatcherServlet, point d’entrée unique de Spring MVC. Celui-ci consulte les correspondances construites au démarrage à partir des annotations pour désigner la méthode visée, convertit le corps JSON en objet Java, applique la validation déclarée, et invoque la méthode. Le contrôleur ne fait que traduire : il transforme l’entrée en appel métier et le résultat en réponse, en choisissant le code de statut. Le service porte les règles et délimite la transaction, généralement par `@Transactional` : c’est là que commence et se termine l’unité de travail. Il s’appuie sur des dépôts, dont Spring Data génère l’implémentation à partir des signatures. JPA traduit alors les opérations sur les entités en SQL — avec son cache de premier niveau et son écriture différée, ce qui explique qu’un `save` ne déclenche pas forcément un `INSERT` immédiat. La base répond, les entités remontent, le service applique ce qu’il doit, le contrôleur convertit en DTO et le sérialiseur produit le JSON. À la sortie de la méthode transactionnelle, la transaction est validée ou annulée selon qu’une exception non contrôlée est remontée.',
              followUps: [
                [
                  'Que fait exactement le DispatcherServlet ?',
                  'Il centralise la réception de toutes les requêtes : résolution du contrôleur visé, conversion du corps, invocation, sérialisation du retour et prise en charge des erreurs. Sans lui, chaque contrôleur referait ce travail.',
                ],
                [
                  'Pourquoi un DTO plutôt que l’entité ?',
                  'Parce qu’exposer l’entité soude le contrat de l’API au schéma de la base : renommer une colonne casse les clients. Le DTO permet aussi de ne pas exposer de champs sensibles et d’éviter les chargements paresseux déclenchés au moment de la sérialisation.',
                ],
                [
                  'Où la validation doit-elle se faire ?',
                  'La validation de forme — champ obligatoire, format, longueur — au contrôleur, avec `@Valid`, pour renvoyer un 400 immédiatement. La validation métier — ce client a-t-il le droit, ce stock est-il suffisant — dans le service, car elle dépend de l’état du système.',
                ],
              ],
            }),
          ],
          definitions: [
            {
              id: 'stack-d-dispatcher',
              title: 'DispatcherServlet',
              text: 'Le DispatcherServlet est le point d’entrée unique par lequel Spring MVC fait passer toutes les requêtes HTTP. Il trouve la méthode de contrôleur correspondante, convertit le corps de la requête en objet Java, invoque la méthode puis sérialise le résultat en réponse.',
              tags: ['spring', 'mvc'],
            },
          ],
        },
        {
          id: 'stack-l-jpa-transaction',
          title: 'JPA, Hibernate et @Transactional',
          summary: 'Une spécification, une implémentation, et une frontière.',
          minutes: 12,
          difficulty: 'difficile',
          requires: ['stack-l-couches-spring', 'java-l-n-plus-1'],
          concepts: ['spring', 'persistance'],
          blocks: [
            compare(
              ['JPA', 'Hibernate'],
              [
                ['Nature', 'Une spécification : interfaces et contrat', 'Une implémentation de cette spécification'],
                ['Fournit', 'EntityManager, annotations, JPQL', 'Le moteur qui exécute tout cela, et des extensions propres'],
                ['Interchangeable', 'Oui, c’est son but', 'On peut lui substituer EclipseLink'],
                ['Analogie', 'Comme JMS pour le messaging', 'Comme un broker qui met JMS en œuvre'],
              ],
              'La même relation que partout dans l’écosystème Java',
            ),
            def(
              'Transaction',
              'Une transaction est un ensemble d’opérations qui réussissent ou échouent comme un tout. Si l’une échoue, les précédentes sont annulées, de sorte que la base ne conserve jamais un état à moitié appliqué.',
            ),
            codeExplain(
              [
                ['@Transactional', 'Spring enveloppe la méthode dans un mandataire : une transaction est ouverte avant l’appel.'],
                ['public void transferer(Long de, Long vers, BigDecimal montant) {', 'Tout ce qui suit appartient à la même unité de travail.'],
                ['    Compte source = repository.findById(de).orElseThrow();', 'Chargé et suivi par le contexte de persistance.'],
                ['    source.debiter(montant);', 'Aucun UPDATE immédiat : Hibernate note la modification.'],
                ['    Compte cible = repository.findById(vers).orElseThrow();', 'Même chose pour le second compte.'],
                ['    cible.crediter(montant);', 'Toujours rien envoyé en base.'],
                ['}', 'À la sortie, Hibernate écrit les modifications puis Spring valide. Si une exception non contrôlée était remontée, tout serait annulé — jamais un compte débité sans l’autre crédité.'],
              ],
              'Ce que @Transactional fait réellement',
            ),
            warn(
              'Par défaut, Spring annule la transaction sur une exception **non contrôlée** et la valide sur une exception contrôlée. Attraper une exception à l’intérieur de la méthode transactionnelle sans la relancer valide donc la transaction, même si le traitement a échoué. C’est une source classique de données à moitié écrites.',
            ),
            warn(
              'L’annotation passe par un mandataire : un appel d’une méthode de la classe vers une autre méthode de la **même** classe ne traverse pas le mandataire, et l’annotation est alors sans effet. Si la transaction doit s’appliquer, l’appel doit venir de l’extérieur du bean.',
            ),
            question(
              'Tu ajoutes @Transactional sur une méthode privée. Que se passe-t-il ?',
              'Rien. Le mandataire ne peut intercepter que les appels qui passent par lui, c’est-à-dire les méthodes publiques appelées depuis l’extérieur du bean. Une méthode privée — ou appelée depuis la même classe — est invoquée directement et l’annotation est ignorée silencieusement, ce qui est le pire des cas : aucun message d’erreur, et aucune transaction.',
            ),
            tip(
              'Le problème N+1 se manifeste typiquement ici : charger cent commandes puis accéder à leur client déclenche cent requêtes supplémentaires. La solution n’est pas de passer tout en chargement immédiat, qui déplace le problème, mais de charger explicitement ce dont on a besoin avec une jointure — `JOIN FETCH` ou un graphe d’entité — pour la requête concernée.',
            ),
            keypoints(
              [
                'JPA est la spécification, Hibernate l’implémentation la plus répandue.',
                'La transaction se délimite dans le service, pas dans le dépôt ni le contrôleur.',
                'Annulation par défaut sur exception non contrôlée uniquement.',
                'Une transaction longue tient un verrou et une connexion : garde-la courte.',
                'N’appelle jamais un service externe lent depuis l’intérieur d’une transaction.',
              ],
              'À retenir',
            ),
            memorize('stack-d-transaction'),
            quiz('stack-q-transaction-1'),
            interview({
              question: 'Quel est le rôle de @Transactional ?',
              short:
                'Elle délimite une unité de travail : tout ce qui se passe dans la méthode réussit ensemble ou est annulé ensemble. Spring ouvre la transaction avant l’appel et la valide à la sortie, ou l’annule si une exception non contrôlée remonte.',
              detailed:
                'Spring implémente cela par un mandataire qui entoure le bean : à l’entrée de la méthode il obtient une connexion et ouvre une transaction, à la sortie il valide, et en cas d’exception non contrôlée il annule. Deux détails font la différence en pratique. D’abord la règle d’annulation : par défaut seules les exceptions non contrôlées provoquent un retour arrière ; une exception contrôlée valide la transaction, ce qui surprend, et attraper une exception sans la relancer valide également. Ensuite le passage par le mandataire : un appel interne d’une méthode de la classe vers une autre méthode de la même classe ne traverse pas le mandataire, donc l’annotation n’a aucun effet, silencieusement. Sur le placement, la transaction appartient au service : c’est lui qui sait ce qui constitue une opération métier complète. La mettre dans le dépôt donne une transaction par requête, ce qui ne protège plus rien ; la mettre dans le contrôleur la fait durer pendant la sérialisation. Enfin une transaction retient une connexion du pool : la garder ouverte pendant un appel HTTP externe est le meilleur moyen d’épuiser le pool sous charge.',
              followUps: [
                [
                  'Quelle est la différence entre chargement paresseux et immédiat ?',
                  'Le paresseux ne charge l’association qu’au premier accès, l’immédiat la charge avec l’entité. Le paresseux évite de rapatrier des données inutiles mais provoque le N+1 si on y accède en boucle, et une erreur si on y accède après la fermeture de la transaction.',
                ],
                [
                  'Comment repères-tu un problème N+1 ?',
                  'En activant la journalisation du SQL et en comptant les requêtes pour un appel : une requête suivie de N requêtes identiques ne différant que par un identifiant. Les métriques sont trompeuses ici, car chaque requête est rapide — c’est leur nombre qui coûte.',
                ],
              ],
            }),
          ],
          definitions: [
            {
              id: 'stack-d-transaction',
              title: 'Transaction',
              text: 'Une transaction regroupe plusieurs opérations qui doivent réussir ou échouer ensemble. Si l’une échoue, toutes les précédentes sont annulées, ce qui évite que la base conserve un état à moitié appliqué.',
              tags: ['spring', 'persistance'],
            },
          ],
        },
      ],
    },
  ],
};
