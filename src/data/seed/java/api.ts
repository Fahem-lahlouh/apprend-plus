import type { ChapterSpec, CourseSpec } from '../builders';
import {
  badGood,
  code,
  codeExplain,
  compare,
  def,
  example,
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
   Cours 4 - API et architecture
   Chapitres 28 à 32.
   ===================================================================== */

const chapters: ChapterSpec[] = [
  /* ---------------------- 28. Introduction aux API ------------------- */
  {
    id: 'java-ch28-intro-api',
    title: '28. Introduction aux API',
    description: 'Ce qu’est une API, avant même de parler de REST.',
    lessons: [
      {
        id: 'java-l-api',
        title: 'Qu’est-ce qu’une API ?',
        summary: 'Le point de rencontre entre deux applications qui ne se connaissent pas.',
        minutes: 8,
        difficulty: 'facile',
        requires: ['java-l-interfaces'],
        concepts: ['API'],
        definitions: [
          {
            id: 'java-d-api',
            title: 'API',
            text: "Une API est une interface qui permet à deux applications ou systèmes de communiquer entre eux. Elle expose un ensemble d'opérations et le format des échanges, sans révéler comment ces opérations sont réalisées à l'intérieur.",
            tags: ['api'],
          },
        ],
        blocks: [
          def(
            'API',
            "Une API est une interface qui permet à deux applications ou systèmes de communiquer entre eux. Elle expose un ensemble d'opérations et le format des échanges, sans révéler comment ces opérations sont réalisées à l'intérieur.",
          ),
          code(
            'text',
            `Application mobile
        |
        v
      API           <- le contrat public
        |
        v
     Serveur        <- la logique métier
        |
        v
  Base de données`,
            { caption: 'Où l’API se situe' },
          ),
          why(
            'Pourquoi utiliser une API ?',
            "Parce qu’aucune application ne vit seule. Ton application mobile n’a pas le droit de se connecter directement à la base de données : ce serait exposer les identifiants sur des milliers de téléphones, et lui laisser écrire n’importe quoi. L’API s’interpose et devient le seul chemin. Elle applique les règles métier, vérifie les droits, et ne laisse sortir que les données autorisées. Elle permet aussi de refaire complètement le serveur sans toucher au téléphone, tant que le contrat ne change pas.",
          ),
          example(
            "Tu ouvres ton application bancaire. Elle ne lit pas la base de la banque : elle appelle une API qui vérifie ton jeton d’authentification, contrôle que ce compte est bien le tien, puis renvoie uniquement les lignes qui te concernent.",
          ),
          text("Un échange se déroule toujours en deux temps : une requête, puis une réponse."),
          code(
            'text',
            `Requête   ->  GET /api/users/10

Réponse   <-  200 OK
              {
                  "id": 10,
                  "name": "Said"
              }`,
            { caption: 'Un aller-retour complet' },
          ),
          codeExplain([
            ['GET', 'La méthode HTTP. Elle annonce l’intention : ici, lire.'],
            ['/api/users/10', 'L’endpoint, c’est-à-dire l’adresse de la ressource demandée. 10 identifie l’utilisateur voulu.'],
            ['200 OK', 'Le code de statut. Il dit si la demande a abouti, avant même de lire le corps.'],
            ['{ "id": 10, "name": "Said" }', 'Le corps de la réponse, au format JSON — un format texte que tous les langages savent lire.'],
          ]),
          keypoints([
            'HTTP est le protocole de transport : il porte la requête et la réponse.',
            'JSON est le format des données échangées, lisible par un humain comme par une machine.',
            'Un endpoint est une adresse exposée par l’API.',
            'Le contrat, c’est l’ensemble des endpoints, des formats et des codes de retour. C’est lui qu’on s’engage à ne pas casser.',
          ]),
          question(
            'Pourquoi ne pas laisser l’application mobile parler directement à la base ?',
            "Pour trois raisons : la sécurité, puisqu’il faudrait distribuer les identifiants de la base sur tous les téléphones ; les règles métier, qui seraient réécrites dans chaque application cliente au lieu d’être appliquées une fois ; et l’évolution, car changer la structure des tables casserait toutes les applications déjà installées.",
          ),
          quiz('java-q-api-1'),
          memorize('java-d-api'),
        ],
      },
    ],
  },

  /* ---------------------- 29. API REST ------------------------------- */
  {
    id: 'java-ch29-rest',
    title: '29. API REST',
    description: 'Les verbes, les URLs, les codes de statut — et le choix de la technologie.',
    lessons: [
      {
        id: 'java-l-api-rest',
        title: 'REST : ressources et verbes',
        summary: 'Organiser une API autour de ce qu’on manipule, pas de ce qu’on fait.',
        minutes: 9,
        difficulty: 'moyen',
        requires: ['java-l-api'],
        concepts: ['REST'],
        definitions: [
          {
            id: 'java-d-rest',
            title: 'API REST',
            text: "Une API REST est une API qui utilise généralement HTTP et organise les échanges autour de ressources identifiées par des URLs. La méthode HTTP indique l'action à effectuer, et l'URL désigne la ressource concernée.",
            tags: ['api', 'rest'],
          },
        ],
        blocks: [
          def(
            'API REST',
            "Une API REST est une API qui utilise généralement HTTP et organise les échanges autour de ressources identifiées par des URLs. La méthode HTTP indique l'action à effectuer, et l'URL désigne la ressource concernée.",
          ),
          compare(
            ['Méthode', 'Exemple et effet'],
            [
              ['GET', 'GET /users — lister', 'Lecture seule, ne modifie rien'],
              ['GET', 'GET /users/10 — lire un élément', 'Lecture seule'],
              ['POST', 'POST /users — créer', 'Crée une ressource, renvoie son identifiant'],
              ['PUT', 'PUT /users/10 — remplacer', 'Remplace la ressource entière'],
              ['PATCH', 'PATCH /users/10 — modifier', 'Ne change que les champs fournis'],
              ['DELETE', 'DELETE /users/10 — supprimer', 'Supprime la ressource'],
            ],
            'Les cinq méthodes du quotidien',
          ),
          why(
            'Pourquoi nommer les URLs avec des noms et non des verbes ?',
            "Parce que le verbe est déjà porté par la méthode HTTP. Écrire POST /createUser répète l’action deux fois et oblige à inventer un nom d’endpoint pour chaque opération : /createUser, /updateUser, /deleteUser. Avec POST, PUT et DELETE sur /users, la même URL couvre tout le cycle de vie, et n’importe quel développeur devine l’API sans documentation.",
          ),
          badGood({
            language: 'text',
            title: 'Nommer les endpoints',
            bad: `POST /createUser
POST /updateUser
POST /deleteUserById
POST /getUserList`,
            good: `POST   /users
PUT    /users/10
DELETE /users/10
GET    /users`,
            why: "À droite, l’URL désigne la ressource et la méthode dit quoi en faire. C’est prévisible : connaître une ressource suffit à deviner ses six opérations.",
          }),
          text("Deux propriétés reviennent constamment dans les discussions sur REST, et il vaut mieux les comprendre tôt."),
          keypoints([
            'GET est sûr : il ne modifie rien. Un navigateur ou un cache peut le rejouer librement.',
            'PUT et DELETE sont idempotents : les rejouer donne le même état final. Supprimer deux fois la même ressource laisse le même résultat.',
            'POST n’est pas idempotent : deux envois créent deux ressources. C’est pour cela qu’un double clic peut produire deux commandes.',
          ]),
          question(
            'PUT ou PATCH pour changer uniquement l’adresse email d’un utilisateur ?',
            "PATCH. PUT remplace la ressource entière : les champs non transmis seraient effacés. PATCH n’applique que les champs fournis et laisse le reste intact.",
          ),
          quiz('java-q-rest-1'),
          quiz('java-q-rest-2'),
          memorize('java-d-rest'),
        ],
      },
      {
        id: 'java-l-codes-http',
        title: 'Les codes de statut HTTP',
        summary: 'Répondre juste : la différence entre « tu t’es trompé » et « je me suis trompé ».',
        minutes: 8,
        difficulty: 'moyen',
        requires: ['java-l-api-rest'],
        concepts: ['REST', 'HTTP'],
        blocks: [
          text("Le code de statut est la première information de la réponse. Bien choisi, il évite au client d’avoir à lire le corps pour savoir ce qui s’est passé."),
          compare(
            ['Code', 'Sens et quand l’utiliser'],
            [
              ['200 OK', 'Succès', 'Une lecture ou une modification a abouti'],
              ['201 Created', 'Créé', 'Après un POST ; renvoie l’adresse de la nouvelle ressource'],
              ['204 No Content', 'Succès sans corps', 'Après un DELETE réussi'],
              ['400 Bad Request', 'Requête mal formée', 'Un champ manque ou n’a pas le bon format'],
              ['401 Unauthorized', 'Non authentifié', 'Jeton absent, invalide ou expiré'],
              ['403 Forbidden', 'Authentifié mais interdit', 'On sait qui tu es, tu n’as pas le droit'],
              ['404 Not Found', 'Ressource inexistante', 'L’identifiant demandé ne correspond à rien'],
              ['409 Conflict', 'Conflit d’état', 'Cet email est déjà utilisé'],
              ['500 Internal Server Error', 'Erreur du serveur', 'Un bug côté serveur, pas la faute du client'],
            ],
          ),
          why(
            'Pourquoi distinguer 401 et 403 ?',
            "Parce que les deux appellent des réactions opposées du côté client. Un 401 signifie « je ne sais pas qui tu es » : l’application doit renvoyer l’utilisateur vers la page de connexion ou rafraîchir son jeton. Un 403 signifie « je sais qui tu es, et tu n’as pas le droit » : se reconnecter n’y changera rien, il faut afficher un message. Renvoyer 401 dans les deux cas envoie l’utilisateur en boucle sur un écran de connexion qui ne résoudra jamais son problème.",
          ),
          why(
            'Pourquoi la famille 4xx et la famille 5xx ne se confondent pas',
            "4xx accuse le client : sa requête est fautive, la rejouer telle quelle échouera pareil. 5xx accuse le serveur : la requête était valable, c’est le traitement qui a échoué, et un nouvel essai peut réussir. Cette distinction pilote les alertes en production — on se réveille la nuit pour un pic de 500, jamais pour des 404.",
          ),
          warn(
            "Renvoyer 200 avec un corps { \"error\": \"not found\" } est un anti-patron courant. Les caches, les passerelles et les outils de supervision ne lisent que le code : pour eux, tout va bien. Le taux d’erreur affiché reste à zéro pendant que l’API échoue.",
          ),
          question(
            'Quel code renvoyer après un POST qui a créé une ressource ?',
            "201 Created, accompagné d’un en-tête Location indiquant l’URL de la ressource créée. 200 fonctionnerait, mais 201 dit précisément ce qui s’est passé.",
          ),
          quiz('java-q-http-1'),
          quiz('java-q-http-2'),
        ],
      },
      {
        id: 'java-l-meilleure-api',
        title: 'Quelle est la meilleure API ?',
        summary: 'Une question mal posée — et la bonne façon de la reformuler.',
        minutes: 9,
        difficulty: 'moyen',
        requires: ['java-l-api-rest'],
        concepts: ['API', 'architecture'],
        blocks: [
          text(
            "Il n’existe pas de « meilleure API ». La question telle quelle n’a pas de réponse, parce qu’elle omet l’essentiel : pour quel besoin ? Reformulée en « quelle technologie convient à ce que je dois faire », elle devient traitable.",
          ),
          compare(
            ['Technologie', 'Ce qui la caractérise'],
            [
              ['REST', 'HTTP et JSON, très répandu, simple à déboguer', 'Le défaut raisonnable'],
              ['GraphQL', 'Le client choisit exactement les champs qu’il veut', 'Évite le sur-chargement de données'],
              ['gRPC', 'Protobuf sur HTTP/2, binaire et compact', 'Très performant entre services'],
              ['WebSocket', 'Connexion maintenue ouverte, échanges dans les deux sens', 'Temps réel'],
            ],
          ),
          steps([
            'CRUD web classique, application mobile, intégration avec des partenaires — REST.',
            'Communication interne entre microservices, avec un fort volume et une latence critique — gRPC.',
            'Notifications instantanées, chat, cotations en direct, collaboration — WebSocket.',
            'Clients très divers qui ont chacun besoin d’un sous-ensemble différent des données — GraphQL.',
          ], 'Du besoin vers la technologie'),
          why(
            'Pourquoi REST reste le choix par défaut',
            "Parce que ses coûts cachés sont les plus faibles. N’importe quel outil sait l’appeler, un navigateur suffit à l’inspecter, les caches HTTP fonctionnent sans configuration, et tout développeur le connaît déjà. GraphQL apporte de la souplesse au client mais déplace la complexité côté serveur — requêtes imprévisibles, cache difficile, risque de requêtes trop coûteuses. gRPC est excellent entre services mais illisible sans outillage. On choisit ces alternatives quand un besoin précis le justifie, pas par principe.",
          ),
          warn(
            "Méfie-toi des comparatifs de performance brute. Une API REST bien conçue avec des index corrects et une pagination sera plus rapide qu’une API gRPC qui fait cent requêtes SQL inutiles. Le protocole compte bien moins que ce que l’API fait à l’intérieur.",
          ),
          question(
            'Ton équipe hésite entre REST et GraphQL pour une application mobile interne. Que demander avant de trancher ?',
            "Est-ce que les écrans ont réellement besoin de sous-ensembles très différents des mêmes données ? Si oui, GraphQL évite de multiplier les endpoints spécialisés. Sinon, REST suffira et coûtera moins cher en outillage, en cache et en formation.",
          ),
          quiz('java-q-choix-api-1'),
        ],
      },
    ],
  },

  /* ---------------------- 30. Extension d'API ------------------------ */
  {
    id: 'java-ch30-extension',
    title: '30. Extension d’API',
    description: 'Un terme dont le sens dépend de la plateforme.',
    lessons: [
      {
        id: 'java-l-extension-api',
        title: 'Ce qu’on appelle une extension d’API',
        summary: 'Ajouter des endpoints à une API existante, selon ce que la plateforme permet.',
        minutes: 8,
        difficulty: 'moyen',
        requires: ['java-l-api-rest'],
        concepts: ['API', 'extension'],
        blocks: [
          warn(
            "Avant tout : « extension d’API » n’est pas un terme standard de Java. Son sens dépend entièrement de la plateforme dont on parle. Si quelqu’un l’emploie sans préciser le contexte, demande lequel — vous ne parlez probablement pas de la même chose.",
          ),
          techDef(
            'Extension d’API',
            "Une extension d'API est un composant ajouté à une API existante pour lui apporter de nouveaux endpoints ou de nouvelles capacités, sans modifier le produit qui l'héberge. Le mécanisme et le format dépendent de la plateforme concernée.",
          ),
          text("Le cas le plus courant en entreprise est celui d’un progiciel qui expose sa propre API et prévoit un point d’extension pour la logique spécifique au client. Bonita fonctionne ainsi avec ses REST API Extensions."),
          code(
            'text',
            `GET /API/extension/rechercheTiers?nom=Dupont
        |
        v
  Extension Java ou Groovy      <- ton code
        |
        v
  Traitement métier
        |
        v
  Base / BDM / service externe
        |
        v
  Réponse JSON`,
            { caption: 'Le trajet d’un appel vers une extension' },
          ),
          why(
            'Pourquoi passer par une extension plutôt que modifier le produit ?',
            "Parce que modifier le produit lui-même rend toute mise à jour douloureuse : à chaque montée de version, il faut reporter les changements et vérifier qu’ils n’ont rien cassé. Une extension vit dans son propre artefact, se déploie séparément, et survit aux mises à jour du socle. C’est le même principe qu’un plugin.",
          ),
          keypoints([
            'Une extension expose un ou plusieurs endpoints supplémentaires sous l’URL du produit hôte.',
            'Elle s’exécute dans le contexte du produit, donc avec ses droits et sa session.',
            'Elle reste soumise aux mêmes règles qu’une API classique : codes de statut corrects, pagination, gestion des erreurs.',
            'Le terme change selon la plateforme : plugin, module, extension, fonction personnalisée.',
          ]),
          tip("Le fait qu’une extension soit rapide à écrire ne la dispense d’aucune bonne pratique. Une extension qui charge toute une table sans pagination pose exactement les mêmes problèmes qu’un endpoint mal conçu ailleurs."),
          question(
            'Un collègue te parle d’« extension d’API ». Que demandes-tu ?',
            "Sur quelle plateforme. Le terme peut désigner une REST API Extension Bonita, un plugin d’une passerelle d’API, un module d’un CMS, ou simplement l’ajout de nouveaux endpoints à une API maison. Les contraintes techniques n’ont rien à voir d’un cas à l’autre.",
          ),
          quiz('java-q-extension-1'),
        ],
      },
    ],
  },

  /* ---------------------- 31. Architecture d'une API ----------------- */
  {
    id: 'java-ch31-architecture',
    title: '31. Architecture d’une API',
    description: 'Les couches, et le DTO qui protège la frontière.',
    lessons: [
      {
        id: 'java-l-architecture-api',
        title: 'Controller, Service, Repository',
        summary: 'Trois couches, trois responsabilités qui ne doivent pas se mélanger.',
        minutes: 9,
        difficulty: 'difficile',
        requires: ['java-l-api-rest', 'java-l-interfaces'],
        concepts: ['architecture'],
        blocks: [
          code(
            'text',
            `Requête HTTP
     |
     v
Controller     <- traduit HTTP <-> objets Java, ne décide rien
     |
     v
Service        <- les règles métier, les transactions
     |
     v
Repository     <- l'accès aux données, et rien d'autre
     |
     v
Base de données`,
            { caption: 'Les trois couches classiques' },
          ),
          compare(
            ['Couche', 'Ce qu’elle fait / ne fait pas'],
            [
              ['Controller', 'Lit la requête, valide le format, renvoie le bon code', 'Aucune règle métier, aucun SQL'],
              ['Service', 'Applique les règles, orchestre, gère la transaction', 'Ne connaît ni HTTP ni les codes de statut'],
              ['Repository', 'Lit et écrit en base', 'Ne prend aucune décision métier'],
            ],
          ),
          why(
            'Pourquoi séparer en couches ?',
            "Pour que chaque partie puisse changer sans entraîner les autres. Si la règle métier vit dans le controller, elle devient inaccessible depuis un traitement planifié ou une consommation de file de messages : il faut la dupliquer. Elle devient aussi intestable sans monter un serveur HTTP complet. Un service isolé se teste en quelques millisecondes, et se réutilise partout. La séparation ne sert pas à faire joli : elle rend le code testable et réutilisable.",
          ),
          badGood({
            language: 'java',
            title: 'Où placer la règle métier',
            bad: `@PostMapping("/commandes")
public ResponseEntity<?> creer(@RequestBody CommandeDto dto) {
    if (dto.quantite() > stockRepository.stockDe(dto.produitId())) {
        return ResponseEntity.badRequest().build();
    }
    commandeRepository.save(new Commande(dto));
    return ResponseEntity.ok().build();
}`,
            good: `@PostMapping("/commandes")
public ResponseEntity<CommandeDto> creer(@RequestBody @Valid CommandeDto dto) {
    Commande creee = commandeService.creer(dto.produitId(), dto.quantite());
    return ResponseEntity.status(HttpStatus.CREATED).body(CommandeDto.from(creee));
}`,
            why: "À gauche, la règle « on ne commande pas plus que le stock » n’existe que dans ce controller : un import de fichier ou un message asynchrone la contournerait. À droite, elle vit dans le service, qui la porte pour tous les points d’entrée présents et futurs.",
          }),
          tip("Le controller doit rester ennuyeux. S’il contient un if métier, une boucle sur des entités ou une requête, c’est que quelque chose est mal placé."),
          quiz('java-q-architecture-1'),
        ],
      },
      {
        id: 'java-l-dto',
        title: 'DTO : ne pas exposer ses entités',
        summary: 'Transporter exactement ce qu’il faut, ni plus ni moins.',
        minutes: 8,
        difficulty: 'difficile',
        requires: ['java-l-architecture-api', 'java-l-enum-record'],
        concepts: ['DTO', 'architecture'],
        definitions: [
          {
            id: 'java-d-dto',
            title: 'DTO',
            text: "DTO signifie Data Transfer Object. Un DTO est un objet utilisé pour transporter uniquement les données nécessaires entre différentes couches ou entre deux systèmes. Il sépare la représentation exposée par l'API de la structure interne des entités.",
            tags: ['api', 'dto'],
          },
        ],
        blocks: [
          def(
            'DTO',
            "DTO signifie Data Transfer Object. Un DTO est un objet utilisé pour transporter uniquement les données nécessaires entre différentes couches ou entre deux systèmes. Il sépare la représentation exposée par l'API de la structure interne des entités.",
          ),
          code(
            'java',
            `public record UserDto(
    Long id,
    String name
) {}`,
            { caption: 'Un DTO, en une ligne utile' },
          ),
          badGood({
            language: 'java',
            title: 'Ce que l’endpoint renvoie',
            bad: `@GetMapping("/users/{id}")
public User get(@PathVariable Long id) {
    return userRepository.findById(id).orElseThrow();
}`,
            good: `@GetMapping("/users/{id}")
public UserDto get(@PathVariable Long id) {
    User user = userRepository.findById(id).orElseThrow();
    return new UserDto(user.getId(), user.getName());
}`,
            why: "À gauche, l’entité complète part vers le client : mot de passe haché, jeton de réinitialisation, indicateurs internes, et toutes les relations que le sérialiseur ira chercher au passage. À droite, seuls deux champs sortent, choisis explicitement.",
          }),
          why(
            'Pourquoi utiliser un DTO ?',
            "Quatre raisons, dans l’ordre d’importance. La sécurité d’abord : une entité contient des champs qui n’ont rien à faire dans une réponse, et il suffit qu’on en ajoute un demain pour qu’il fuite sans que personne ne s’en aperçoive. La performance ensuite : sérialiser une entité déclenche le chargement de ses relations, ce qui produit des requêtes en cascade. La stabilité du contrat : renommer une colonne en base ne doit pas casser les applications clientes, et le DTO absorbe ce changement. La clarté enfin : en lisant le DTO, on sait exactement ce que l’API expose.",
          ),
          warn(
            "Exposer une entité JPA est la cause la plus fréquente de fuites de données et de requêtes N+1 accidentelles dans une API Spring. Le sérialiseur parcourt les relations et déclenche des chargements paresseux que personne n’avait demandés.",
          ),
          tip("Un record est le format naturel d’un DTO : immuable, concis, avec equals et toString gratuits."),
          question(
            'Faut-il un DTO différent en entrée et en sortie ?',
            "Souvent oui. En création, le client envoie un nom et un mot de passe mais pas d’identifiant ; en lecture, l’API renvoie un identifiant et un nom mais jamais le mot de passe. Un seul DTO pour les deux forcerait à rendre des champs facultatifs partout et à documenter lesquels servent quand.",
          ),
          quiz('java-q-dto-1'),
          quiz('java-q-dto-2'),
          memorize('java-d-dto'),
        ],
      },
    ],
  },

  /* ---------------------- 32. Performance d'une API ------------------ */
  {
    id: 'java-ch32-performance-api',
    title: '32. Performance d’une API',
    description: 'Ce qui rend une API rapide, et la méthode pour diagnostiquer une API lente.',
    lessons: [
      {
        id: 'java-l-api-performante',
        title: 'Qu’est-ce qui rend une API performante ?',
        summary: 'Les leviers réels, du plus rentable au plus marginal.',
        minutes: 10,
        difficulty: 'difficile',
        requires: ['java-l-architecture-api'],
        concepts: ['performance', 'API'],
        definitions: [
          {
            id: 'java-d-api-performante',
            title: 'API performante',
            text: "Une API performante répond rapidement, utilise efficacement les ressources, et reste stable lorsque le nombre de requêtes augmente. La rapidité seule ne suffit pas : une API qui répond vite à dix requêtes et s'effondre à mille n'est pas performante.",
            tags: ['api', 'performance'],
          },
        ],
        blocks: [
          def(
            'API performante',
            "Une API performante répond rapidement, utilise efficacement les ressources, et reste stable lorsque le nombre de requêtes augmente. La rapidité seule ne suffit pas : une API qui répond vite à dix requêtes et s'effondre à mille n'est pas performante.",
          ),
          text("Les leviers ne se valent pas. Voici les principaux, regroupés par famille, du plus rentable au plus marginal."),
          keypoints([
            'Requêtes SQL optimisées et index adaptés — c’est presque toujours là que se trouve le temps perdu.',
            'Supprimer les appels inutiles, notamment les requêtes en boucle et le problème N+1.',
            'Pagination : ne jamais renvoyer une collection dont la taille dépend des données.',
            'Cache sur ce qui est coûteux à produire et rarement modifié.',
          ], 'Les leviers majeurs'),
          keypoints([
            'Taille des réponses : ne transporter que les champs utiles, via des DTO.',
            'Pool de connexions correctement dimensionné, ni trop petit ni trop grand.',
            'Compression des réponses volumineuses.',
            'Asynchronisme quand un traitement peut réellement être différé.',
            'Algorithmes : une HashMap au lieu d’un parcours de liste dans une boucle.',
          ], 'Les leviers secondaires'),
          keypoints([
            'Monitoring et traces, pour savoir où le temps passe avant de toucher au code.',
            'Scalabilité horizontale et répartition de charge, quand une seule instance ne suffit plus.',
            'Architecture adaptée : découper seulement quand le monolithe devient le problème.',
          ], 'Le cadre autour'),
          why(
            'Pourquoi mesurer avant d’optimiser ?',
            "Parce que l’intuition se trompe presque toujours. Un développeur passera une journée à optimiser une boucle Java qui consomme 30 millisecondes, pendant qu’une requête SQL sans index en consomme 8 000. Sans mesure, tu optimises ce que tu comprends le mieux, pas ce qui coûte le plus cher. La règle est constante : mesurer, identifier le goulot d’étranglement, corriger celui-là, remesurer.",
          ),
          warn(
            "Une optimisation non mesurée est un pari. Elle ajoute de la complexité — un cache à invalider, une requête plus difficile à lire — pour un gain inconnu. Si tu ne peux pas chiffrer l’avant et l’après, ne la fais pas.",
          ),
          quiz('java-q-perf-api-1'),
          memorize('java-d-api-performante'),
        ],
      },
      {
        id: 'java-l-api-lente',
        title: 'Une API met 10 secondes à répondre. Que fais-tu ?',
        summary: 'Une méthode reproductible, et des scénarios pour l’appliquer.',
        minutes: 10,
        difficulty: 'expert',
        requires: ['java-l-api-performante'],
        concepts: ['performance', 'diagnostic'],
        blocks: [
          text(
            "La question revient à chaque entretien, et surtout à chaque incident. Ce qui est évalué n’est pas ta connaissance d’une astuce, mais ta méthode. Voici celle qui fonctionne.",
          ),
          steps([
            'Mesurer le temps total, et vérifier qu’il est reproductible — un cas isolé n’est pas un problème de performance.',
            'Découper ce temps par étape : temps passé en base, en appels externes, en traitement Java, en sérialisation.',
            'Lire les logs et les traces sur une requête lente réelle, pas sur un cas de test.',
            'Compter le nombre de requêtes SQL émises pour un seul appel — c’est là que se cache le N+1.',
            'Regarder le volume de données ramené : combien de lignes, combien de champs, quelle taille de réponse.',
            'Vérifier les index sur les colonnes utilisées par les filtres et les jointures.',
            'Vérifier les appels externes : leur temps de réponse et leur nombre.',
            'Vérifier les ressources de la machine : processeur, mémoire, pauses du ramasse-miettes, saturation du pool de connexions.',
            'Identifier le goulot d’étranglement — celui qui représente la plus grosse part du temps.',
            'Corriger uniquement celui-là, puis remesurer.',
          ], 'La méthode, dans l’ordre'),
          example(
            "Premier scénario. Temps total 10 s, dont SQL 8,5 s, traitement Java 500 ms, appel externe 300 ms. Où chercher en priorité ? Dans le SQL : il représente 85 % du temps. Optimiser le code Java, même parfaitement, ferait passer la réponse de 10 s à 9,5 s.",
          ),
          example(
            "Deuxième scénario. Temps total 9 s, dont SQL 100 ms, appel à un service externe 8 s. Le problème n’est pas dans ton code. Les pistes deviennent : mettre le résultat en cache, appeler le service en parallèle plutôt qu’en série, poser un délai d’expiration avec une valeur de repli, ou rendre le traitement asynchrone.",
          ),
          example(
            "Troisième scénario. Temps total 7 s, dont SQL 6 s réparti sur 240 requêtes de 25 ms. Aucune requête n’est lente individuellement : c’est leur nombre qui tue. Signature typique du problème N+1.",
          ),
          why(
            'Pourquoi cet ordre plutôt qu’un autre',
            "Parce qu’il va du symptôme mesurable vers la cause, sans jamais supposer. Commencer par « je pense que c’est la base » conduit à ajouter des index au hasard. Commencer par mesurer la répartition du temps désigne le coupable en quelques minutes, et rend l’effort d’optimisation vérifiable : tu sais ce que tu as gagné.",
          ),
          warn(
            "Ne corrige jamais deux choses à la fois. Si tu ajoutes un index et un cache dans le même déploiement, tu ne sauras pas lequel a produit le gain — ni lequel a introduit le bug de données périmées.",
          ),
          question(
            'L’API met 10 secondes, le SQL 200 millisecondes. Où regardes-tu ?',
            "Pas dans les requêtes elles-mêmes. Il reste 9,8 secondes ailleurs : un appel externe lent, une sérialisation de réponse énorme, un traitement Java coûteux, une attente sur le pool de connexions, ou des pauses du ramasse-miettes. Le découpage du temps par étape désigne lequel.",
          ),
          quiz('java-q-diagnostic-1'),
          quiz('java-q-diagnostic-2'),
        ],
      },
    ],
  },
];

export const apiChapters = chapters;

export const apiCourse: CourseSpec = {
  id: 'java-c4-api',
  pathId: 'java-path-api',
  title: 'API et architecture',
  description: 'Ce qu’est une API, REST, extensions, couches, DTO et diagnostic de lenteur.',
  icon: '🔌',
  level: 'intermediaire',
  tags: ['api', 'rest', 'architecture'],
  chapters,
};
