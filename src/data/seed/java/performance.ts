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
   Cours 5 - Performance et qualité
   Chapitres 33 à 40.
   ===================================================================== */

const chapters: ChapterSpec[] = [
  /* ---------------------- 33. Optimisation Java ---------------------- */
  {
    id: 'java-ch33-optimisation-java',
    title: '33. Optimisation Java',
    description: 'Mesurer avant de toucher au code, et savoir ce que coûte un algorithme.',
    lessons: [
      {
        id: 'java-l-optimisation-java',
        title: 'Mesurer avant d’optimiser',
        summary: 'Le profilage, et la règle qui évite de perdre des journées.',
        minutes: 9,
        difficulty: 'difficile',
        requires: ['java-l-api-performante'],
        concepts: ['performance', 'profiling'],
        blocks: [
          text(
            "Optimiser sans mesurer, c’est deviner. Et l’intuition d’un développeur sur l’endroit où passe le temps est mauvaise, pour une raison simple : on soupçonne le code qu’on a écrit, pas celui qu’on appelle.",
          ),
          steps([
            'Reproduire la lenteur, et savoir la déclencher à volonté.',
            'Profiler : quelles méthodes consomment le processeur, où le programme attend, ce qui alloue de la mémoire.',
            'Identifier le goulot d’étranglement — celui qui représente la plus grosse part du temps.',
            'Corriger une seule chose.',
            'Remesurer, et chiffrer le gain réel.',
          ], 'La boucle d’optimisation'),
          keypoints([
            'Un profileur montre où va le temps processeur et où le programme attend.',
            'Un APM suit une requête à travers toutes les couches en production.',
            'Les métriques JVM révèlent la mémoire, les pauses du ramasse-miettes et l’état des threads.',
            'Les logs horodatés suffisent souvent à découper le temps par étape, sans outil supplémentaire.',
          ]),
          badGood({
            language: 'java',
            title: 'L’optimisation qui rapporte le plus souvent',
            bad: `for (Long id : ids) {
    Utilisateur u = repository.findById(id);
    traiter(u);
}`,
            good: `List<Utilisateur> utilisateurs = repository.findAllById(ids);
for (Utilisateur u : utilisateurs) {
    traiter(u);
}`,
            why: "Sur 500 identifiants, la version de gauche fait 500 allers-retours réseau vers la base. À 2 millisecondes chacun, cela fait une seconde perdue en pure latence. La version de droite fait un seul aller-retour et ramène les mêmes données. Le gain vient du nombre d’appels, pas de la vitesse du code Java.",
          }),
          why(
            'Pourquoi un appel dans une boucle coûte-t-il si cher ?',
            "Parce que chaque appel réseau paie un coût fixe indépendant de la quantité de données : établir la communication, transmettre, attendre, analyser la réponse. Ce coût fixe, multiplié par le nombre d’éléments, écrase tout le reste. Une seule requête ramenant 500 lignes coûte à peine plus qu’une requête en ramenant une.",
          ),
          warn(
            "Une optimisation prématurée coûte deux fois : elle complique le code maintenant, et elle porte presque toujours sur le mauvais endroit. Écris d’abord du code clair ; optimise quand une mesure désigne un problème.",
          ),
          quiz('java-q-optim-1'),
        ],
      },
      {
        id: 'java-l-complexite',
        title: 'Complexité algorithmique',
        summary: 'O(1), O(log n), O(n), O(n²) : ce que cela change réellement.',
        minutes: 9,
        difficulty: 'difficile',
        requires: ['java-l-collections'],
        concepts: ['complexité', 'performance'],
        definitions: [
          {
            id: 'java-d-complexite',
            title: 'Complexité algorithmique',
            text: "La complexité algorithmique décrit comment le temps de calcul évolue lorsque la quantité de données augmente. Elle ne mesure pas une durée en secondes, mais la forme de la courbe : un algorithme en O(n) double de coût quand les données doublent, un algorithme en O(n²) est quatre fois plus long.",
            tags: ['performance', 'algorithmes'],
          },
        ],
        blocks: [
          def(
            'Complexité algorithmique',
            "La complexité algorithmique décrit comment le temps de calcul évolue lorsque la quantité de données augmente. Elle ne mesure pas une durée en secondes, mais la forme de la courbe : un algorithme en O(n) double de coût quand les données doublent, un algorithme en O(n²) est quatre fois plus long.",
          ),
          compare(
            ['Notation', 'Exemple Java concret'],
            [
              ['O(1)', 'Temps constant', 'map.get(cle), list.get(3)'],
              ['O(log n)', 'Croît très lentement', 'Recherche dans un TreeMap trié'],
              ['O(n)', 'Proportionnel', 'list.contains(x), un parcours complet'],
              ['O(n log n)', 'Un peu plus qu’un parcours', 'Un tri : list.sort(...)'],
              ['O(n²)', 'Explosif', 'Deux boucles imbriquées sur la même liste'],
            ],
          ),
          code(
            'java',
            `// O(1) — le temps ne dépend pas de la taille
Integer age = ages.get("Said");

// O(n) — il faut parcourir jusqu'à trouver
boolean present = noms.contains("Said");

// O(n²) — pour chaque élément, on reparcourt toute la liste
for (String a : noms) {
    for (String b : noms) {
        if (a.equals(b)) { /* ... */ }
    }
}`,
            { caption: 'Les trois cas qu’on rencontre le plus' },
          ),
          example(
            "Sur 1 000 éléments : O(1) fait 1 opération, O(n) en fait 1 000, O(n²) en fait 1 000 000. Sur 10 000 éléments, O(n) passe à 10 000 — dix fois plus — pendant que O(n²) passe à 100 000 000, soit cent fois plus. C’est pour cela qu’un traitement qui marchait en recette s’effondre en production.",
          ),
          badGood({
            language: 'java',
            title: 'Croiser deux listes',
            bad: `for (Commande c : commandes) {
    for (Client cl : clients) {
        if (cl.id().equals(c.clientId())) {
            c.setClient(cl);
        }
    }
}`,
            good: `Map<Long, Client> parId = clients.stream()
    .collect(Collectors.toMap(Client::id, c -> c));

for (Commande c : commandes) {
    c.setClient(parId.get(c.clientId()));
}`,
            why: "À gauche, 10 000 commandes et 5 000 clients font 50 millions de comparaisons. À droite, on construit une map en 5 000 opérations, puis chaque commande trouve son client en temps constant : 15 000 opérations au total. On passe de O(n×m) à O(n+m).",
          }),
          why(
            'Pourquoi une HashMap trouve-t-elle en temps constant ?',
            "Parce qu’elle ne cherche pas. Elle calcule le code de hachage de la clé, en déduit directement le casier à ouvrir, et n’examine que le contenu de ce casier. Le nombre d’éléments dans la map n’intervient pas dans ce calcul : qu’elle contienne dix ou un million d’entrées, le travail est le même.",
          ),
          question(
            'Une double boucle imbriquée est-elle toujours à éviter ?',
            "Non. Sur dix éléments, O(n²) fait cent opérations : c’est instantané et parfaitement lisible. Le problème apparaît quand la taille peut grandir — surtout quand elle dépend des données de production, qui grossissent toujours plus que prévu.",
          ),
          quiz('java-q-complexite-1'),
          quiz('java-q-complexite-2'),
          memorize('java-d-complexite'),
        ],
      },
      {
        id: 'java-l-memoire-jvm',
        title: 'Mémoire, ramasse-miettes et JIT',
        summary: 'Pile et tas, ce que fait le GC, et pourquoi la JVM accélère avec le temps.',
        minutes: 9,
        difficulty: 'expert',
        requires: ['java-l-jvm', 'java-l-optimisation-java'],
        concepts: ['JVM', 'mémoire'],
        blocks: [
          compare(
            ['Pile (stack)', 'Tas (heap)'],
            [
              ['Contient', 'Variables locales, appels de méthode', 'Tous les objets créés par new'],
              ['Portée', 'Un thread, une méthode', 'Partagé par tout le programme'],
              ['Libération', 'Automatique à la fin de la méthode', 'Par le ramasse-miettes'],
              ['Taille', 'Petite, quelques mégaoctets', 'Grande, réglée par -Xmx'],
              ['Erreur typique', 'StackOverflowError, récursion infinie', 'OutOfMemoryError'],
            ],
          ),
          code(
            'java',
            `public void demo() {
    int compteur = 0;                    // sur la pile
    Personne p = new Personne("Said");   // la référence sur la pile,
                                         // l'objet sur le tas
}   // ici, la pile est dépilée ; l'objet devient candidat au ramassage`,
            { caption: 'Où vit quoi' },
          ),
          text("Le ramasse-miettes libère les objets que plus personne n’atteint. C’est ce qui dispense d’écrire free() — et ce qui provoque parfois des pauses."),
          why(
            'Pourquoi une pause du ramasse-miettes ralentit-elle une API ?',
            "Parce que certaines phases du ramassage suspendent l’application entière, le temps de parcourir les objets vivants. Sur un tas de quelques centaines de mégaoctets, ces pauses restent de l’ordre de la milliseconde. Sur un tas très grand, ou quand l’application alloue frénétiquement, elles peuvent atteindre plusieurs centaines de millisecondes — et se voient directement dans les temps de réponse, sous forme de pics inexpliqués sans aucun changement de code.",
          ),
          keypoints([
            'Moins on alloue, moins le ramasse-miettes travaille. Éviter les objets jetables dans les boucles chaudes est le levier principal.',
            'Augmenter le tas ne règle pas une fuite mémoire : cela retarde seulement l’OutOfMemoryError.',
            'Une vraie fuite en Java vient d’une référence conservée — un cache statique sans limite, un listener jamais retiré.',
          ]),
          techDef(
            'Compilation JIT',
            "Le compilateur JIT (Just-In-Time) traduit en code machine natif les portions de bytecode les plus exécutées, pendant que le programme tourne. Il s'appuie sur ce qu'il observe réellement à l'exécution pour optimiser plus agressivement qu'un compilateur classique ne le pourrait.",
          ),
          why(
            'Pourquoi une application Java est-elle plus lente à ses premières requêtes ?',
            "Parce que la JVM commence par interpréter le bytecode. Ce n’est qu’après avoir vu une méthode s’exécuter de nombreuses fois qu’elle la fait compiler en code natif par le JIT, avec des optimisations fondées sur ce qu’elle a observé. C’est le temps de chauffe. Il explique aussi pourquoi une mesure de performance faite sur les dix premières requêtes ne veut rien dire.",
          ),
          tip("Le chargeur de classes charge chaque classe à sa première utilisation, pas au démarrage. Cela contribue aussi à la lenteur des premiers appels, et explique qu’une erreur de dépendance manquante n’apparaisse parfois qu’en cours d’exécution."),
          quiz('java-q-memoire-1'),
        ],
      },
    ],
  },

  /* ---------------------- 34. Optimisation base de données ----------- */
  {
    id: 'java-ch34-base-donnees',
    title: '34. Optimisation base de données',
    description: 'Les index, et le problème N+1 qui ruine les API.',
    lessons: [
      {
        id: 'java-l-index-sql',
        title: 'Les index',
        summary: 'Pourquoi une requête passe de 8 secondes à 5 millisecondes.',
        minutes: 8,
        difficulty: 'difficile',
        requires: ['java-l-complexite'],
        concepts: ['SQL', 'index'],
        definitions: [
          {
            id: 'java-d-index',
            title: 'Index SQL',
            text: "Un index est une structure de données annexe qui permet à la base de retrouver rapidement les lignes correspondant à un critère, sans parcourir toute la table. Il accélère la lecture et ralentit légèrement l'écriture, puisqu'il doit être tenu à jour.",
            tags: ['sql', 'performance'],
          },
        ],
        blocks: [
          def(
            'Index SQL',
            "Un index est une structure de données annexe qui permet à la base de retrouver rapidement les lignes correspondant à un critère, sans parcourir toute la table. Il accélère la lecture et ralentit légèrement l'écriture, puisqu'il doit être tenu à jour.",
          ),
          example(
            "Un index est l’index alphabétique d’un livre. Sans lui, retrouver toutes les pages qui parlent d’un mot oblige à lire le livre en entier. Avec lui, on va directement à l’entrée et on lit les numéros de page.",
          ),
          code(
            'sql',
            `-- sans index : la base lit les 5 000 000 de lignes
SELECT * FROM commandes WHERE client_id = 4213;

CREATE INDEX idx_commandes_client ON commandes (client_id);

-- avec index : elle va directement aux lignes concernées`,
            { caption: 'Le même besoin, deux coûts très différents' },
          ),
          keypoints([
            'Indexe les colonnes utilisées dans les WHERE, les JOIN et les ORDER BY fréquents.',
            'Les clés primaires sont indexées automatiquement ; les clés étrangères ne le sont pas toujours.',
            'Un index composite (a, b) sert aussi les recherches sur a seul, mais pas sur b seul.',
            'Chaque index occupe de l’espace et ralentit les INSERT et UPDATE : n’indexe pas tout.',
          ]),
          warn(
            "Une fonction appliquée à la colonne empêche l’index de servir. WHERE UPPER(nom) = 'DUPONT' ignore l’index sur nom. Il faut soit comparer sans transformer, soit créer un index sur l’expression elle-même.",
          ),
          why(
            'Pourquoi ne pas indexer toutes les colonnes ?',
            "Parce qu’un index est une structure à maintenir. Chaque insertion et chaque mise à jour doit modifier tous les index de la table concernés. Sur une table très écrite, dix index inutiles transforment une insertion rapide en opération coûteuse — et occupent parfois plus de place que les données elles-mêmes.",
          ),
          tip("EXPLAIN devant une requête montre le plan choisi par la base : parcours complet de table ou usage d’index. C’est la première chose à regarder devant une requête lente, avant de supposer quoi que ce soit."),
          quiz('java-q-index-1'),
          memorize('java-d-index'),
        ],
      },
      {
        id: 'java-l-n-plus-1',
        title: 'Le problème N+1',
        summary: '101 requêtes là où une seule suffisait.',
        minutes: 9,
        difficulty: 'expert',
        requires: ['java-l-index-sql', 'java-l-dto'],
        concepts: ['SQL', 'performance', 'N+1'],
        definitions: [
          {
            id: 'java-d-n-plus-1',
            title: 'Problème N+1',
            text: "Le problème N+1 survient lorsqu'une première requête ramène N éléments, puis qu'une requête supplémentaire est émise pour chacun d'eux. Le nombre total de requêtes devient N+1 au lieu d'une seule, et le temps de réponse croît avec le volume de données.",
            tags: ['sql', 'performance'],
          },
        ],
        blocks: [
          def(
            'Problème N+1',
            "Le problème N+1 survient lorsqu'une première requête ramène N éléments, puis qu'une requête supplémentaire est émise pour chacun d'eux. Le nombre total de requêtes devient N+1 au lieu d'une seule, et le temps de réponse croît avec le volume de données.",
          ),
          code(
            'text',
            `1 requête   ->  récupérer 100 commandes
100 requêtes ->  pour chaque commande, récupérer son client
------------
101 requêtes pour afficher une liste`,
            { caption: 'D’où vient le nom' },
          ),
          why(
            'Pourquoi 101 requêtes ralentissent autant, alors qu’aucune n’est lente ?',
            "Parce que le coût ne vient pas de l’exécution mais de l’aller-retour. Chaque requête paie la latence réseau, l’analyse par la base et le retour du résultat — mettons 25 millisecondes. Une requête à 25 ms ne se remarque pas. Cent une requêtes à 25 ms font 2,5 secondes, et le profil est trompeur : la base signale des requêtes rapides, les logs ne montrent rien d’anormal, et pourtant l’API rampe. Pire encore, le problème grandit avec les données : cinq commandes en recette, deux mille en production.",
          ),
          text("La cause la plus fréquente en Java est le chargement paresseux d’une relation, déclenché sans qu’on l’ait demandé."),
          code(
            'java',
            `List<Commande> commandes = commandeRepository.findAll();   // 1 requête

for (Commande c : commandes) {
    System.out.println(c.getClient().getNom());   // 1 requête par commande
}`,
            { caption: 'Le déclencheur, souvent invisible à la lecture' },
          ),
          compare(
            ['Solution', 'Quand la choisir'],
            [
              ['JOIN FETCH', 'Charge la relation dans la même requête', 'La solution la plus directe'],
              ['EntityGraph', 'Déclare les relations à charger, par cas d’usage', 'Quand la même entité sert à plusieurs écrans'],
              ['Projection DTO', 'La requête ne ramène que les champs voulus', 'La plus efficace en lecture pure'],
              ['Batch fetching', 'Regroupe les chargements par paquets', 'Quand on ne peut pas modifier les requêtes'],
            ],
          ),
          code(
            'java',
            `@Query("select c from Commande c join fetch c.client")
List<Commande> findAllAvecClient();`,
            { caption: 'JOIN FETCH : une seule requête' },
          ),
          steps([
            'Activer le journal des requêtes SQL en développement.',
            'Appeler l’endpoint suspect une seule fois.',
            'Compter les requêtes émises. Un nombre proportionnel au nombre de lignes affichées signe le N+1.',
            'Charger la relation explicitement, ou ne ramener que les champs nécessaires via une projection.',
            'Recompter : on doit être passé à une requête, deux au plus.',
          ], 'Comment le détecter'),
          warn(
            "Renvoyer directement une entité JPA depuis un controller provoque ce problème sans qu’aucune ligne de ton code ne le montre : c’est le sérialiseur JSON qui parcourt les relations et déclenche les chargements. C’est une raison de plus d’utiliser un DTO.",
          ),
          question(
            'Une API renvoie 200 lignes en 6 secondes, et le journal montre 201 requêtes de 25 ms. Quel est le problème ?',
            "Un N+1 caractéristique. Aucune requête n’est lente ; c’est leur nombre qui coûte. La correction consiste à charger la relation en une fois, par JOIN FETCH ou par une projection DTO.",
          ),
          quiz('java-q-nplus1-1'),
          quiz('java-q-nplus1-2'),
          memorize('java-d-n-plus-1'),
        ],
      },
    ],
  },

  /* ---------------------- 35. Cache ---------------------------------- */
  {
    id: 'java-ch35-cache',
    title: '35. Cache',
    description: 'Éviter de refaire un travail coûteux — et savoir quand ne pas le faire.',
    lessons: [
      {
        id: 'java-l-cache',
        title: 'Mettre en cache, et invalider',
        summary: 'Le gain est facile, la difficulté est de ne pas servir des données périmées.',
        minutes: 9,
        difficulty: 'difficile',
        requires: ['java-l-api-performante'],
        concepts: ['cache', 'performance'],
        definitions: [
          {
            id: 'java-d-cache',
            title: 'Cache',
            text: "Le cache permet de conserver temporairement un résultat afin d'éviter de refaire un traitement coûteux. Le premier appel calcule et enregistre le résultat ; les appels suivants le relisent directement, tant qu'il est considéré comme valide.",
            tags: ['cache', 'performance'],
          },
        ],
        blocks: [
          def(
            'Cache',
            "Le cache permet de conserver temporairement un résultat afin d'éviter de refaire un traitement coûteux. Le premier appel calcule et enregistre le résultat ; les appels suivants le relisent directement, tant qu'il est considéré comme valide.",
          ),
          code(
            'java',
            `@Cacheable("users")
public User getUser(Long id) {
    return userRepository.findById(id)
        .orElseThrow();
}`,
            { caption: 'Le cas le plus simple' },
          ),
          codeExplain([
            ['@Cacheable("users")', 'Au premier appel avec un id donné, la méthode s’exécute et son résultat est rangé dans le cache nommé « users ».'],
            ['getUser(10L) — premier appel', 'Le cache est vide : la méthode va en base, et le résultat est mémorisé.'],
            ['getUser(10L) — appels suivants', 'La méthode n’est plus exécutée du tout. Le résultat vient du cache.'],
          ]),
          why(
            'Pourquoi utiliser un cache ?',
            "Parce que certaines données coûtent cher à produire et changent rarement. Un référentiel de pays, un barème tarifaire, le profil d’un utilisateur consulté à chaque requête : les recalculer des milliers de fois par minute est un gaspillage pur. Le cache transforme un accès base en accès mémoire, soit un rapport de mille à un sur le temps.",
          ),
          warn(
            "Le vrai sujet n’est pas de remplir le cache, c’est de le vider au bon moment. Un utilisateur change son nom, la base est à jour, et l’API continue de renvoyer l’ancien pendant une heure. C’est l’invalidation de cache — le problème le plus sous-estimé du sujet.",
          ),
          code(
            'java',
            `@CacheEvict(value = "users", key = "#user.id")
public User mettreAJour(User user) {
    return userRepository.save(user);
}`,
            { caption: 'Invalider à l’écriture' },
          ),
          keypoints([
            'Mets en cache ce qui est coûteux à produire et rarement modifié.',
            'Fixe toujours une durée de vie : elle borne l’ampleur d’une incohérence.',
            'Fixe une taille maximale : un cache sans limite est une fuite mémoire déguisée.',
            'Invalide à l’écriture quand la fraîcheur compte vraiment.',
            'Ne mets jamais en cache une donnée dépendant de l’utilisateur sans inclure son identité dans la clé.',
          ]),
          warn(
            "L’erreur de sécurité classique : mettre en cache une réponse personnalisée avec une clé qui ne contient pas l’identifiant de l’utilisateur. Le deuxième utilisateur reçoit alors les données du premier.",
          ),
          question(
            'Faut-il mettre en cache le solde d’un compte bancaire ?',
            "Non, ou avec une durée de vie de quelques secondes tout au plus. Une donnée dont la fraîcheur est critique et qui change à chaque opération est le pire candidat : le gain est faible et le risque d’afficher un montant faux est inacceptable.",
          ),
          quiz('java-q-cache-1'),
          quiz('java-q-cache-2'),
          memorize('java-d-cache'),
        ],
      },
    ],
  },

  /* ---------------------- 36. Pagination ----------------------------- */
  {
    id: 'java-ch36-pagination',
    title: '36. Pagination',
    description: 'Ne jamais renvoyer une liste dont la taille dépend des données.',
    lessons: [
      {
        id: 'java-l-pagination',
        title: 'Paginer une API',
        summary: 'L’endpoint qui fonctionne en recette et tombe en production.',
        minutes: 8,
        difficulty: 'moyen',
        requires: ['java-l-architecture-api'],
        concepts: ['pagination', 'performance'],
        definitions: [
          {
            id: 'java-d-pagination',
            title: 'Pagination',
            text: "La pagination consiste à ne renvoyer qu'une tranche de résultats à la fois, définie par un numéro de page et une taille. Elle garantit que le coût d'une requête reste borné quel que soit le volume de données stockées.",
            tags: ['api', 'performance'],
          },
        ],
        blocks: [
          def(
            'Pagination',
            "La pagination consiste à ne renvoyer qu'une tranche de résultats à la fois, définie par un numéro de page et une taille. Elle garantit que le coût d'une requête reste borné quel que soit le volume de données stockées.",
          ),
          badGood({
            language: 'java',
            title: 'Le même endpoint, avant et après',
            bad: `@GetMapping("/users")
public List<User> getUsers() {
    return userRepository.findAll();
}`,
            good: `@GetMapping("/users")
public Page<User> getUsers(Pageable pageable) {
    return userRepository.findAll(pageable);
}`,
            why: "À gauche, l’endpoint marche parfaitement avec 50 utilisateurs en développement. Avec un million, il charge un million d’objets en mémoire, les sérialise en JSON, et produit une réponse de plusieurs centaines de mégaoctets. À droite, la base ne remonte que 20 lignes, quoi qu’il arrive.",
          }),
          why(
            'Pourquoi la pagination améliore-t-elle les performances ?',
            "Parce qu’elle agit à quatre endroits en même temps. La base lit moins de lignes. Le serveur alloue moins d’objets, donc le ramasse-miettes travaille moins. La sérialisation JSON, proportionnelle au volume, devient négligeable. Et le réseau transporte quelques kilooctets au lieu de centaines de mégaoctets. Surtout, le coût devient constant : que la table contienne mille ou dix millions de lignes, une page reste une page.",
          ),
          code(
            'text',
            `GET /users?page=0&size=20&sort=nom,asc

{
    "content": [ ... 20 éléments ... ],
    "totalElements": 1043201,
    "totalPages": 52161,
    "number": 0
}`,
            { caption: 'Le contrat d’un endpoint paginé' },
          ),
          keypoints([
            'Impose une taille de page maximale côté serveur : sans cela, un client demandera size=1000000.',
            'Un tri stable est indispensable, sinon un même élément peut apparaître sur deux pages.',
            'Le compte total coûte une requête supplémentaire ; sur de très grosses tables, on l’omet parfois volontairement.',
            'Pour un défilement infini, la pagination par curseur est plus robuste que par numéro de page.',
          ]),
          warn(
            "Paginer en mémoire ne sert à rien : findAll() suivi d’un subList charge quand même tout. La tranche doit être demandée à la base, dans la requête elle-même.",
          ),
          question(
            'Pourquoi la pagination par numéro de page devient-elle lente sur les pages lointaines ?',
            "Parce que OFFSET oblige la base à parcourir puis jeter toutes les lignes précédentes. Demander la page 50 000 revient à lire un million de lignes pour en renvoyer vingt. La pagination par curseur — « les éléments après cet identifiant » — évite ce parcours.",
          ),
          quiz('java-q-pagination-1'),
          memorize('java-d-pagination'),
        ],
      },
    ],
  },

  /* ---------------------- 37. Logs et monitoring --------------------- */
  {
    id: 'java-ch37-logs',
    title: '37. Logs et monitoring',
    description: 'Savoir ce qui se passe en production, avant que l’utilisateur ne le signale.',
    lessons: [
      {
        id: 'java-l-logs-monitoring',
        title: 'Journaliser utilement',
        summary: 'Des logs qui servent au diagnostic, et des métriques qui alertent.',
        minutes: 8,
        difficulty: 'moyen',
        requires: ['java-l-exceptions'],
        concepts: ['logs', 'monitoring'],
        blocks: [
          badGood({
            language: 'java',
            title: 'Écrire un log',
            bad: `System.out.println("erreur");

try {
    traiter(commande);
} catch (Exception e) {
    System.out.println("Erreur : " + e.getMessage());
}`,
            good: `private static final Logger log = LoggerFactory.getLogger(CommandeService.class);

try {
    traiter(commande);
} catch (StockInsuffisantException e) {
    log.warn("Stock insuffisant commande={} produit={}", commande.id(), produitId, e);
}`,
            why: "À gauche : aucun horodatage, aucun niveau, aucun contexte, et surtout la pile d’appels est perdue — getMessage() ne donne que la dernière ligne. À droite, on sait quand, à quel niveau de gravité, sur quelle commande, et l’exception complète est conservée.",
          }),
          keypoints([
            'ERROR : quelque chose est cassé et demande une intervention.',
            'WARN : anormal mais absorbé, à surveiller.',
            'INFO : les événements métier marquants, peu nombreux.',
            'DEBUG : le détail, activé ponctuellement pour diagnostiquer.',
          ]),
          why(
            'Pourquoi passer l’exception en dernier argument plutôt que de la concaténer ?',
            "Parce que le framework de journalisation sait alors qu’il s’agit d’une exception et écrit la pile d’appels complète. Concaténer e.getMessage() ne conserve qu’une phrase, souvent « null » pour une NullPointerException — précisément le cas où la pile est indispensable.",
          ),
          warn(
            "Ne journalise jamais un mot de passe, un jeton, un numéro de carte ou des données personnelles complètes. Les logs sont copiés, archivés et lus par beaucoup de monde : ce sont des données qui fuitent facilement.",
          ),
          text("Les logs racontent ce qui s’est passé ; les métriques disent si tout va bien, en continu."),
          keypoints([
            'Taux d’erreur : la proportion de réponses 5xx.',
            'Latence, lue en percentiles — le p95 et le p99 comptent bien plus que la moyenne.',
            'Débit : le nombre de requêtes par seconde.',
            'Saturation : processeur, mémoire, pool de connexions, files d’attente.',
          ]),
          why(
            'Pourquoi la moyenne des temps de réponse est-elle trompeuse ?',
            "Parce qu’elle dilue les cas graves. Si 95 requêtes répondent en 50 ms et 5 en 10 secondes, la moyenne affiche 550 ms — un chiffre qui ne correspond à l’expérience de personne. Le p99, lui, dit que 1 % des utilisateurs attendent 10 secondes, ce qui est l’information utile.",
          ),
          question(
            'Un identifiant de corrélation, à quoi sert-il ?',
            "À suivre une même requête à travers tous les services et tous les logs qu’elle traverse. Sans lui, retrouver ce qu’a fait une requête précise dans des millions de lignes de journal est pratiquement impossible.",
          ),
          quiz('java-q-logs-1'),
        ],
      },
    ],
  },

  /* ---------------------- 38. Sécurité ------------------------------- */
  {
    id: 'java-ch38-securite',
    title: '38. Sécurité',
    description: 'Les fautes qui coûtent le plus cher, et comment les éviter.',
    lessons: [
      {
        id: 'java-l-securite',
        title: 'Les erreurs de sécurité courantes',
        summary: 'Injection SQL, contrôle d’accès, secrets : les trois qui reviennent toujours.',
        minutes: 9,
        difficulty: 'difficile',
        requires: ['java-l-architecture-api'],
        concepts: ['sécurité'],
        blocks: [
          badGood({
            language: 'java',
            title: 'Construire une requête à partir d’une saisie',
            bad: `String sql = "SELECT * FROM users WHERE nom = '" + nom + "'";
statement.executeQuery(sql);`,
            good: `String sql = "SELECT * FROM users WHERE nom = ?";
PreparedStatement ps = connexion.prepareStatement(sql);
ps.setString(1, nom);`,
            why: "À gauche, si nom vaut ' OR '1'='1, la requête renvoie toute la table ; avec un peu plus d’imagination, elle en supprime le contenu. À droite, la valeur est transmise séparément de la requête : la base ne l’interprète jamais comme du SQL, quel que soit son contenu.",
          }),
          why(
            'Pourquoi une requête paramétrée est-elle sûre, alors qu’échapper les caractères ne l’est pas vraiment ?',
            "Parce qu’elle sépare structurellement le code de la donnée. La base reçoit d’abord la requête, l’analyse et fixe son plan ; la valeur arrive ensuite, et ne peut plus modifier cette structure. L’échappement manuel, lui, suppose qu’on a pensé à tous les cas — encodages, guillemets imbriqués, particularités du moteur. Il suffit d’en oublier un.",
          ),
          keypoints([
            'Authentification : qui es-tu. Autorisation : as-tu le droit de faire ceci. Ce sont deux vérifications distinctes.',
            'Vérifie l’autorisation sur la ressource, pas seulement sur l’endpoint : un utilisateur connecté ne doit pas lire la commande d’un autre en changeant l’identifiant dans l’URL.',
            'Ne mets jamais un secret dans le code source ni dans un dépôt Git : variables d’environnement ou coffre-fort dédié.',
            'Ne renvoie jamais une pile d’appels au client : elle révèle la structure interne et les versions utilisées.',
            'Valide toute entrée côté serveur ; la validation du client est un confort d’affichage, pas une protection.',
          ]),
          warn(
            "L’accès direct à un objet par son identifiant est la faille la plus fréquente et la plus simple à exploiter. GET /commandes/1234 doit vérifier que la commande 1234 appartient bien à l’utilisateur authentifié. Un contrôle qui ne teste que « es-tu connecté » ne suffit pas.",
          ),
          question(
            'Un utilisateur authentifié appelle GET /factures/9981, qui appartient à quelqu’un d’autre. Que doit répondre l’API ?',
            "404 le plus souvent, plutôt que 403. Répondre 403 confirme que la facture 9981 existe, ce qui permet à un attaquant de cartographier les identifiants valides. 404 ne divulgue rien.",
          ),
          quiz('java-q-securite-1'),
          quiz('java-q-securite-2'),
        ],
      },
    ],
  },

  /* ---------------------- 39. Tests ---------------------------------- */
  {
    id: 'java-ch39-tests',
    title: '39. Tests',
    description: 'JUnit et Mockito : vérifier que le code fait ce qu’on croit.',
    lessons: [
      {
        id: 'java-l-tests',
        title: 'Tests unitaires et doublures',
        summary: 'Structurer un test, et remplacer ce qui ralentit ou dépend de l’extérieur.',
        minutes: 9,
        difficulty: 'difficile',
        requires: ['java-l-architecture-api'],
        concepts: ['tests'],
        blocks: [
          code(
            'java',
            `@Test
void refuse_une_commande_superieure_au_stock() {
    // Arrange
    when(stockRepository.stockDe(42L)).thenReturn(3);

    // Act & Assert
    assertThatThrownBy(() -> service.creer(42L, 10))
        .isInstanceOf(StockInsuffisantException.class);
}`,
            { caption: 'Un test unitaire complet' },
          ),
          codeExplain([
            ['@Test', 'Marque la méthode comme un test exécutable par JUnit.'],
            ['void refuse_une_commande_superieure_au_stock()', 'Le nom décrit la règle métier vérifiée. Quand le test casse, ce nom suffit à comprendre ce qui est cassé.'],
            ['when(...).thenReturn(3)', 'Une doublure Mockito : le dépôt renverra 3 sans toucher à une base de données.'],
            ['assertThatThrownBy(...)', 'Vérifie que l’appel lève bien l’exception attendue.'],
          ]),
          why(
            'Pourquoi remplacer la base de données par une doublure ?',
            "Pour trois raisons. La vitesse : un test en mémoire s’exécute en une milliseconde, un test avec base réelle en centaines. L’isolation : un test qui échoue doit accuser le code testé, pas une base mal réinitialisée par le test précédent. Et la maîtrise des cas limites : simuler une base indisponible ou un stock exactement à zéro est trivial avec une doublure, pénible avec une vraie base.",
          ),
          compare(
            ['Type de test', 'Ce qu’il vérifie'],
            [
              ['Unitaire', 'Une classe isolée, dépendances simulées', 'Très rapide, très nombreux'],
              ['Intégration', 'Plusieurs composants ensemble, base réelle', 'Plus lents, moins nombreux'],
              ['Bout en bout', 'L’application complète via son API', 'Lents, réservés aux parcours critiques'],
            ],
          ),
          keypoints([
            'Un test vérifie un comportement, pas une implémentation : le refactoring ne doit pas le casser.',
            'Son nom doit décrire la règle, pas la méthode appelée.',
            'Il doit être reproductible : ni date du jour, ni ordre d’exécution, ni valeur aléatoire non maîtrisée.',
            'Teste d’abord les cas limites — zéro, null, valeur négative, liste vide — c’est là que se trouvent les bugs.',
          ]),
          warn(
            "Ne simule pas ce que tu ne possèdes pas. Créer une doublure d’une bibliothèque tierce fige ton hypothèse sur son comportement ; le jour où elle change, ton test reste vert alors que la production échoue. Enveloppe-la dans ta propre interface, et simule celle-ci.",
          ),
          question(
            'Faut-il viser 100 % de couverture de code ?',
            "Non. La couverture mesure les lignes exécutées, pas les comportements vérifiés : un test sans assertion couvre parfaitement du code sans rien garantir. Mieux vaut couvrir sérieusement les règles métier et les cas limites que d’atteindre un chiffre en testant des accesseurs.",
          ),
          quiz('java-q-tests-1'),
        ],
      },
    ],
  },

  /* ---------------------- 40. Bonnes pratiques ----------------------- */
  {
    id: 'java-ch40-bonnes-pratiques',
    title: '40. Bonnes pratiques',
    description: 'Code lisible, patrons utiles, et outillage du projet.',
    lessons: [
      {
        id: 'java-l-bonnes-pratiques',
        title: 'Écrire du code qu’on relira sans souffrir',
        summary: 'Nommage, taille des méthodes, patrons de conception et gestion des dépendances.',
        minutes: 9,
        difficulty: 'moyen',
        requires: ['java-l-tests'],
        concepts: ['clean code'],
        blocks: [
          text(
            "Un programme est lu bien plus souvent qu’il n’est écrit — y compris par toi, dans six mois. Ces règles ne sont pas esthétiques : elles réduisent le temps qu’il faudra pour le comprendre.",
          ),
          keypoints([
            'Nomme d’après l’intention : calculerTvaApplicable plutôt que process ou doIt.',
            'Une méthode fait une seule chose. Si son nom contient « et », elle en fait deux.',
            'Préfère sortir tôt plutôt que d’imbriquer des if.',
            'Un commentaire explique pourquoi, jamais quoi : le code dit déjà ce qu’il fait.',
            'Supprime le code mort au lieu de le commenter. Git garde l’historique.',
          ]),
          badGood({
            language: 'java',
            title: 'Nommer et découper',
            bad: `public void process(List<Object> l) {
    for (Object o : l) {
        if (o != null) {
            // calcul de la tva puis envoi du mail
            ...
        }
    }
}`,
            good: `public void facturerCommandes(List<Commande> commandes) {
    commandes.stream()
        .filter(Objects::nonNull)
        .forEach(this::facturer);
}

private void facturer(Commande commande) {
    Montant tva = calculerTva(commande);
    notifierClient(commande, tva);
}`,
            why: "À droite, chaque nom dit ce qui se passe et chaque méthode fait une seule chose. Le commentaire de gauche devient inutile : les noms le remplacent, et eux ne se désynchronisent pas du code.",
          }),
          text("Quelques patrons de conception reviennent constamment dans une application Java, sans qu’on ait besoin d’en connaître des dizaines."),
          compare(
            ['Patron', 'Ce qu’il résout'],
            [
              ['Strategy', 'Choisir un comportement à l’exécution', 'Plusieurs modes de calcul de remise'],
              ['Factory', 'Centraliser une création complexe', 'Construire l’objet adapté au type reçu'],
              ['Builder', 'Construire un objet à nombreux paramètres', 'Éviter un constructeur à dix arguments'],
              ['Repository', 'Isoler l’accès aux données', 'Le service ignore d’où viennent les données'],
            ],
          ),
          warn(
            "N’applique pas un patron parce qu’il est connu. Un patron résout un problème précis ; sans ce problème, il n’ajoute que de l’indirection. Trois implémentations d’une interface qui n’en aura jamais qu’une compliquent la lecture sans rien apporter.",
          ),
          text("Côté outillage, un projet Java repose sur un gestionnaire de dépendances qui centralise bibliothèques, compilation et tests."),
          compare(
            ['Maven', 'Gradle'],
            [
              ['Format', 'XML, pom.xml', 'Kotlin ou Groovy, build.gradle'],
              ['Philosophie', 'Convention, structure imposée', 'Souplesse, scripts personnalisables'],
              ['Lisibilité', 'Verbeux mais très prévisible', 'Concis, parfois trop libre'],
              ['Vitesse', 'Correcte', 'Meilleure grâce au cache incrémental'],
            ],
          ),
          tip("Les deux font le travail. Maven reste le plus répandu dans l’entreprise et le plus simple à reprendre ; Gradle est fréquent sur Android et sur les projets à build complexe."),
          question(
            'Pourquoi supprimer du code mort plutôt que de le commenter ?',
            "Parce qu’un bloc commenté reste dans les recherches, brouille la lecture, et personne n’ose plus jamais le supprimer faute de savoir s’il servira. L’historique Git conserve tout : le code supprimé n’est jamais perdu.",
          ),
          quiz('java-q-pratiques-1'),
        ],
      },
    ],
  },
];

export const performanceChapters = chapters;

export const performanceCourse: CourseSpec = {
  id: 'java-c5-performance',
  pathId: 'java-path-performance',
  title: 'Performance et qualité',
  description: 'Mesurer, optimiser, cacher, paginer, journaliser, sécuriser, tester.',
  icon: '⚡',
  level: 'avance',
  tags: ['performance', 'sql', 'qualité'],
  chapters,
};
