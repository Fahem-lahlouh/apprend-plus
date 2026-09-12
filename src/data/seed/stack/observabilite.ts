import {
  badGood,
  compare,
  def,
  flow,
  interview,
  keypoints,
  memorize,
  quiz,
  step,
  steps,
  techDef,
  tip,
  warn,
  why,
  type CourseSpec,
} from '../builders';

/**
 * Observabilité.
 *
 * Le cours sépare d'abord trois mots qu'on emploie l'un pour l'autre — journaux,
 * supervision, observabilité — parce que confondre les trois est ce qui fait
 * qu'on cherche une cause dans l'outil qui ne peut pas la donner.
 *
 * Point de vigilance factuel : la collecte des journaux ne passe pas forcément
 * par Logstash, et Grafana ne dépend pas de Prometheus. Les leçons le disent.
 */
export const observabiliteCourse: CourseSpec = {
  id: 'stack-c-observabilite',
  title: 'Logs, métriques et traces',
  description: 'Savoir ce que fait l’application en production, et retrouver une erreur dans le bruit.',
  icon: 'chart',
  level: 'avance',
  tags: ['observabilite', 'elk', 'grafana', 'monitoring'],
  pathId: 'stack-path-observabilite',
  chapters: [
    {
      id: 'stack-ch-trois-piliers',
      title: 'Trois choses différentes',
      description: 'Journaux, métriques, traces : chacune répond à une question distincte.',
      lessons: [
        {
          id: 'stack-l-piliers',
          title: 'Logging, monitoring, observabilité',
          summary: 'Trois mots employés l’un pour l’autre, trois usages distincts.',
          minutes: 10,
          difficulty: 'moyen',
          requires: ['java-l-logs-monitoring'],
          concepts: ['observabilite'],
          blocks: [
            compare(
              ['Répond à', 'Ce que ça ne dit pas'],
              [
                [
                  'Journaux (logs)',
                  '« Que s’est-il passé précisément pour cette requête ? » Des événements datés, avec leur contexte.',
                  'Ils ne donnent aucune vue d’ensemble : impossible de savoir si le problème touche 1 % ou 40 % du trafic.',
                ],
                [
                  'Métriques',
                  '« Comment se comporte le système dans son ensemble ? » Des valeurs chiffrées agrégées dans le temps.',
                  'Elles ne disent jamais pourquoi : une courbe de latence qui monte ne nomme aucune cause.',
                ],
                [
                  'Traces',
                  '« Où sont passées les secondes de cette requête ? » Le trajet complet à travers les services, découpé par étape.',
                  'Elles ne remplacent pas le détail applicatif : on sait quel appel a duré, pas ce qui s’y est joué.',
                ],
              ],
              'Les trois signaux',
            ),
            def(
              'Supervision',
              'La supervision consiste à surveiller des indicateurs connus à l’avance et à alerter quand ils sortent de leurs bornes. Elle répond bien aux problèmes qu’on a anticipés, et mal à ceux auxquels personne n’avait pensé.',
            ),
            def(
              'Observabilité',
              'L’observabilité est la capacité à comprendre ce qui se passe dans un système à partir de ce qu’il émet, y compris pour des problèmes non anticipés. Elle suppose de pouvoir poser des questions nouvelles sans avoir à redéployer.',
            ),
            why(
              'Pourquoi la distinction n’est pas cosmétique ?',
              'La supervision prépare une liste de questions et y répond bien : le processeur dépasse-t-il 80 % ? Le taux d’erreur dépasse-t-il 1 % ? L’observabilité vise les questions qu’on n’avait pas prévues : pourquoi ce client précis a-t-il eu des réponses lentes entre 14 h 02 et 14 h 07 ? Un tableau de bord ne répondra jamais à celle-là. Il faut pouvoir recouper des traces et des journaux sur des critères décidés au moment de chercher.',
            ),
            keypoints(
              [
                'Les métriques repèrent qu’il y a un problème et mesurent son ampleur.',
                'Les traces localisent où le temps passe ou où l’erreur naît.',
                'Les journaux expliquent ce qui s’est passé à cet endroit précis.',
                'On les utilise dans cet ordre : constater, localiser, comprendre.',
              ],
              'Comment s’en servir ensemble',
            ),
            memorize('stack-d-observabilite'),
            quiz('stack-q-obs-1'),
            interview({
              question: 'Quelle différence entre logging, monitoring et observabilité ?',
              short:
                'Les journaux racontent ce qui s’est passé pour une exécution précise. La supervision surveille des indicateurs connus et alerte quand ils sortent de leurs bornes. L’observabilité est la capacité à répondre à des questions qu’on n’avait pas prévues, en recoupant journaux, métriques et traces.',
              detailed:
                'Ce sont trois niveaux qui se complètent. Les journaux sont des événements datés et contextualisés : ils donnent le détail d’une exécution, mais aucune vue d’ensemble — on ne sait pas, en les lisant, si l’erreur touche un utilisateur ou la moitié du trafic. Les métriques sont des valeurs agrégées dans le temps : taux d’erreur, latence par centile, débit, saturation. Elles montrent l’ampleur et la tendance, mais ne nomment jamais une cause. Les traces suivent une requête à travers tous les services traversés en découpant sa durée par étape : c’est ce qui permet de dire que sur dix secondes, huit et demie sont passées dans la base. La supervision est l’usage de ces signaux pour surveiller des seuils décidés d’avance, ce qui marche pour les problèmes anticipés. L’observabilité est la propriété qui permet d’enquêter sur un problème imprévu sans redéployer : elle suppose des journaux structurés, des identifiants de corrélation qui relient les trois signaux, et une cardinalité suffisante pour filtrer sur un client ou une version. En pratique, on constate avec les métriques, on localise avec les traces, on comprend avec les journaux — et c’est l’identifiant de trace commun qui permet de passer de l’un à l’autre.',
              followUps: [
                [
                  'Pourquoi des journaux structurés ?',
                  'Parce qu’une ligne de texte libre ne se cherche que par mot-clé. En JSON avec des champs nommés — niveau, service, identifiant de trace, durée — on filtre, on agrège et on compte. C’est ce qui permet de passer de « je cherche une erreur » à « combien de fois cette erreur, sur quel client, depuis quelle version ».',
                ],
                [
                  'Qu’est-ce qu’un identifiant de corrélation ?',
                  'Un identifiant unique attribué à une requête à son entrée et propagé à tous les services qu’elle traverse. C’est lui qui permet de rassembler les journaux dispersés sur dix pods en une seule histoire, et de relier une trace à ses journaux.',
                ],
              ],
            }),
          ],
          definitions: [
            {
              id: 'stack-d-observabilite',
              title: 'Observabilité',
              text: 'L’observabilité est la capacité à comprendre ce qui se passe dans un système à partir des signaux qu’il émet, y compris pour des problèmes que personne n’avait anticipés. Elle se distingue de la supervision, qui ne surveille que des indicateurs décidés à l’avance.',
              tags: ['observabilite'],
            },
          ],
        },
      ],
    },
    {
      id: 'stack-ch-logs',
      title: 'Journaux et recherche',
      description: 'Écrire des journaux utiles, puis y retrouver une erreur.',
      lessons: [
        {
          id: 'stack-l-niveaux-logs',
          title: 'Les niveaux de journalisation',
          summary: 'TRACE, DEBUG, INFO, WARN, ERROR : à quoi sert chacun.',
          minutes: 9,
          difficulty: 'facile',
          requires: ['stack-l-piliers'],
          concepts: ['observabilite'],
          blocks: [
            compare(
              ['Niveau', 'Quand l’utiliser'],
              [
                ['TRACE', 'Le plus fin', 'Chaque étape interne. Réservé à une investigation ponctuelle, jamais actif durablement en production.'],
                ['DEBUG', 'Diagnostic', 'Valeurs intermédiaires utiles pour comprendre un comportement. Activable temporairement.'],
                ['INFO', 'Le fil normal', 'Les événements métier marquants : démarrage, commande validée, traitement terminé. Actif en production.'],
                ['WARN', 'Anormal mais géré', 'Une situation inattendue que le code a su traiter : réessai, repli, configuration par défaut.'],
                ['ERROR', 'Échec', 'Le traitement n’a pas abouti. Doit exiger une action : si personne ne regarde jamais, ce n’est pas une erreur.'],
              ],
              'Les cinq niveaux',
            ),
            badGood({
              language: 'java',
              title: 'Un journal exploitable',
              bad: `try {
    paiementClient.debiter(commande);
} catch (Exception e) {
    log.error("erreur");
}`,
              good: `try {
    paiementClient.debiter(commande);
} catch (PaiementException e) {
    log.error("Débit refusé commandeId={} montant={} code={}",
            commande.id(), commande.montant(), e.getCode(), e);
    throw e;
}`,
              why: 'La première ligne est inutilisable : aucun contexte pour savoir quelle commande, aucune trace d’exception, et l’exception est avalée. La seconde nomme les champs qui permettront de filtrer, passe l’exception en dernier argument pour conserver la pile d’appels, et relance — journaliser n’est pas traiter.',
            }),
            warn(
              'Ne journalise jamais de données personnelles, de mot de passe, de jeton ni de numéro de carte. Les journaux sont copiés, indexés, conservés des mois et lisibles par plus de gens que la base. C’est un des chemins de fuite les plus fréquents, et le plus facile à éviter.',
            ),
            tip(
              'Écris un message par événement métier, pas par ligne de code. Un journal utile se relit comme le récit de ce qu’a fait la requête ; un journal qui commente chaque instruction noie l’information et coûte cher à stocker.',
            ),
            memorize('stack-d-log'),
            quiz('stack-q-logs-1'),
          ],
          definitions: [
            {
              id: 'stack-d-log',
              title: 'Journal applicatif',
              text: 'Un journal est la trace écrite et datée des événements d’une application, classée par niveau de gravité. Il sert à reconstituer ce qui s’est passé pour une exécution précise, ce qu’aucune métrique agrégée ne permet de faire.',
              tags: ['observabilite'],
            },
          ],
        },
        {
          id: 'stack-l-elk',
          title: 'Elasticsearch, Kibana et la collecte',
          summary: 'Centraliser les journaux de dizaines de pods.',
          minutes: 11,
          difficulty: 'moyen',
          requires: ['stack-l-niveaux-logs', 'stack-l-pod'],
          concepts: ['observabilite', 'elk'],
          blocks: [
            why(
              'Pourquoi centraliser ?',
              'Parce qu’avec des pods jetables, les journaux locaux disparaissent avec le pod — et c’est précisément le pod qui a planté dont on voudrait lire les journaux. S’y ajoute le fait qu’une requête traverse plusieurs services : reconstituer son histoire suppose de rassembler des lignes émises à dix endroits.',
            ),
            def(
              'Elasticsearch',
              'Elasticsearch est un moteur de recherche et d’analyse qui indexe des documents pour permettre des recherches plein texte et des agrégations rapides sur de grands volumes. Dans une chaîne de journaux, c’est lui qui stocke et rend interrogeable.',
            ),
            def(
              'Kibana',
              'Kibana est l’interface de visualisation posée devant Elasticsearch. Elle permet de rechercher dans les données indexées, de les filtrer et d’en construire des tableaux de bord, sans écrire de requête à la main.',
            ),
            techDef(
              'Logstash',
              'Logstash est un outil de collecte et de transformation qui reçoit des flux, les analyse, les enrichit et les envoie vers une destination. C’est l’un des collecteurs possibles, pas le seul ni nécessairement celui utilisé.',
            ),
            warn(
              'L’acronyme ELK fige une architecture qui n’est plus la seule. Dans un cluster Kubernetes, la collecte se fait souvent par un agent léger déployé sur chaque nœud — Filebeat, Fluent Bit, Fluentd, Vector ou l’OpenTelemetry Collector — qui envoie directement à Elasticsearch, ou vers une autre destination comme Loki. Logstash n’intervient que s’il faut vraiment transformer. Présenter Logstash comme le passage obligé est une erreur fréquente en entretien.',
            ),
            flow(
              [
                step(
                  'Application',
                  'La source',
                  'Écrit ses journaux sur la sortie standard, au format JSON structuré, avec l’identifiant de trace.',
                  'Écrire dans un fichier du conteneur revient à perdre les journaux avec le pod.',
                ),
                step(
                  'Agent de collecte',
                  'Le ramassage',
                  'Un agent présent sur chaque nœud lit la sortie des conteneurs, ajoute le contexte Kubernetes — pod, espace de noms, étiquettes — et transmet.',
                  'Sans agent, chaque application devrait envoyer ses journaux elle-même, et les perdrait en cas de panne réseau.',
                  'Filebeat, Fluent Bit, Fluentd, Vector ou l’OpenTelemetry Collector jouent ce rôle.',
                ),
                step(
                  'Traitement, si nécessaire',
                  'L’enrichissement facultatif',
                  'Analyse des formats hétérogènes, filtrage, masquage de données sensibles. C’est ici qu’intervient Logstash — quand il intervient.',
                  'Sans cette étape, on indexe brut : souvent suffisant si les applications journalisent déjà en JSON.',
                ),
                step(
                  'Elasticsearch',
                  'Le stockage interrogeable',
                  'Indexe les documents et permet recherche plein texte et agrégations sur de gros volumes.',
                  'Sans index, il faudrait parcourir des fichiers : impossible à l’échelle de plusieurs jours de trafic.',
                  'Loki adopte une approche différente : il n’indexe que les étiquettes et non le contenu, ce qui coûte moins cher.',
                ),
                step(
                  'Kibana',
                  'La lecture',
                  'Recherche, filtres, tableaux de bord. C’est l’endroit où l’on mène l’enquête.',
                  'Sans interface, les données existent mais restent inexploitables en situation d’incident.',
                ),
              ],
              'De la ligne de journal à la recherche',
            ),
            steps(
              [
                'Partir du symptôme daté : une réponse 500 à telle heure, ou une alerte.',
                'Retrouver l’identifiant de corrélation de la requête — en-tête de réponse, message d’erreur côté client, ou recherche par horodatage et chemin.',
                'Filtrer sur cet identifiant : toutes les lignes de tous les services pour cette requête apparaissent.',
                'Lire dans l’ordre chronologique jusqu’à la première erreur — pas la dernière, qui n’est souvent qu’une conséquence.',
                'Ouvrir la pile d’appels : classe, méthode, ligne.',
                'Remonter à la cause : la ligne qui échoue n’est pas toujours celle qui a le problème.',
                'Vérifier l’ampleur : combien d’autres requêtes ont la même erreur sur la même période ?',
              ],
              'Retrouver une erreur : la méthode',
            ),
            memorize('stack-d-elasticsearch'),
            quiz('stack-q-elk-1'),
            interview({
              question: 'Comment retrouves-tu la cause d’une erreur 500 en production ?',
              short:
                'Je pars de l’heure et du chemin appelé, je récupère l’identifiant de corrélation de la requête, et je filtre les journaux centralisés dessus. Cela rassemble les lignes de tous les services traversés. Je remonte à la première erreur de la chaîne, j’ouvre sa pile d’appels, puis je vérifie combien d’autres requêtes sont touchées.',
              detailed:
                'Le point de départ est toujours un fait daté : une alerte, un ticket, une réponse 500 observée. La première chose à récupérer est l’identifiant de corrélation, attribué à la requête à son entrée et propagé à tous les services ; sans lui on cherche par horodatage et chemin, ce qui est nettement plus laborieux dès qu’il y a du trafic. En filtrant dessus dans Kibana, on obtient l’histoire complète de la requête, tous services confondus, ce qui est impossible avec des journaux locaux à des pods jetables. On lit ensuite dans l’ordre chronologique en cherchant la **première** erreur, pas la dernière : celle qui remonte à l’utilisateur est souvent une conséquence — une NullPointerException lors de la sérialisation alors que la vraie cause est un délai dépassé trois appels plus tôt. La pile d’appels donne classe, méthode et ligne, mais il faut se méfier de confondre le lieu du symptôme et celui de la cause. Vient enfin la question de l’ampleur : une seule occurrence, ou toutes les requêtes d’un client, ou tout le trafic depuis un déploiement ? C’est cette dernière question qui oriente vers un bug fonctionnel, une donnée particulière, ou une régression — et c’est là que les métriques complètent les journaux. Si l’erreur est une lenteur plutôt qu’une exception, les traces prennent le relais pour dire quelle étape a consommé le temps.',
              followUps: [
                [
                  'Et si les journaux ne suffisent pas ?',
                  'On passe aux traces pour la répartition du temps entre services, et aux métriques pour l’ampleur et la corrélation temporelle avec un déploiement ou un pic. Si rien ne ressort, c’est généralement qu’il manque de l’instrumentation — et c’est une conclusion d’incident légitime.',
                ],
                [
                  'Faut-il tout envoyer dans Elasticsearch ?',
                  'Non : le stockage et l’indexation coûtent, et un volume de DEBUG permanent noie l’information utile. On garde INFO et au-dessus en production, on échantillonne les traces, et on active DEBUG temporairement et ciblé quand on enquête.',
                ],
              ],
            }),
          ],
          definitions: [
            {
              id: 'stack-d-elasticsearch',
              title: 'Elasticsearch',
              text: 'Elasticsearch est un moteur de recherche et d’analyse qui indexe des documents pour permettre des recherches et des agrégations rapides sur de grands volumes. Dans une chaîne de journaux centralisés, c’est lui qui stocke les lignes collectées et les rend interrogeables.',
              tags: ['observabilite', 'elk'],
            },
          ],
        },
      ],
    },
    {
      id: 'stack-ch-metriques',
      title: 'Métriques et tableaux de bord',
      description: 'Grafana, Prometheus, et ce qu’il faut réellement surveiller.',
      lessons: [
        {
          id: 'stack-l-grafana',
          title: 'Grafana, Prometheus et les métriques utiles',
          summary: 'Quatre indicateurs qui suffisent à voir venir un incident.',
          minutes: 11,
          difficulty: 'moyen',
          requires: ['stack-l-piliers'],
          concepts: ['observabilite', 'monitoring'],
          blocks: [
            def(
              'Métrique',
              'Une métrique est une valeur numérique mesurée régulièrement et conservée dans le temps. Contrairement à un journal qui décrit un événement isolé, elle décrit un comportement d’ensemble et permet de comparer une période à une autre.',
            ),
            def(
              'Grafana',
              'Grafana est un outil de visualisation qui construit des tableaux de bord et déclenche des alertes à partir de sources de données variées. Il ne stocke rien lui-même : il interroge les systèmes qui détiennent les données.',
            ),
            techDef(
              'Prometheus',
              'Prometheus est une base de données temporelle qui collecte les métriques en interrogeant périodiquement les applications sur un point d’accès dédié, et les interroge via son propre langage de requête. C’est la source la plus courante derrière Grafana, sans en être la seule.',
            ),
            warn(
              'Grafana et Prometheus sont souvent cités ensemble, mais Grafana ne dépend pas de Prometheus : il sait interroger Elasticsearch, Loki, InfluxDB, une base SQL ou un service infonuagique. À l’inverse, Prometheus a sa propre interface et peut alerter sans Grafana. Ce sont deux outils qui se complètent bien, pas un couple indissociable.',
            ),
            compare(
              ['Indicateur', 'Ce qu’il révèle'],
              [
                ['Latence', 'La lenteur ressentie', 'À lire en centiles, jamais en moyenne : une moyenne à 200 ms peut cacher 5 % d’utilisateurs à 8 secondes.'],
                ['Trafic', 'La charge reçue', 'Requêtes par seconde. Donne le contexte : une latence qui monte avec le trafic ne se lit pas comme une qui monte sans.'],
                ['Erreurs', 'La proportion d’échecs', 'Taux de 5xx. C’est l’indicateur le plus direct de la santé perçue.'],
                ['Saturation', 'La marge restante', 'Processeur, mémoire, pool de connexions, profondeur des files. C’est lui qui permet de voir venir plutôt que de constater.'],
              ],
              'Les quatre signaux dorés',
            ),
            tip(
              'Surveille toujours la latence en centiles — le 95e et le 99e — plutôt qu’en moyenne. La moyenne est insensible aux cas extrêmes, qui sont précisément ceux dont les utilisateurs se plaignent. Le 99e centile dit ce que vit le client le plus mal servi sur cent.',
            ),
            keypoints(
              [
                'Une alerte doit correspondre à une action : sinon elle sera ignorée, puis tout le monde ignorera les autres.',
                'Alerte sur les symptômes perçus — latence, erreurs — plus que sur les causes possibles.',
                'Un tableau de bord sans référence de normalité ne sert à rien : il faut savoir à quoi ressemble un jour ordinaire.',
                'Les métriques disent qu’il y a un problème et son ampleur, jamais pourquoi.',
              ],
              'Ce qui fait une supervision utile',
            ),
            memorize('stack-d-metrique'),
            quiz('stack-q-grafana-1'),
          ],
          definitions: [
            {
              id: 'stack-d-metrique',
              title: 'Métrique',
              text: 'Une métrique est une valeur numérique mesurée à intervalles réguliers et conservée dans le temps, comme une latence ou un taux d’erreur. Elle décrit le comportement d’ensemble du système et permet de comparer une période à une autre, là où un journal ne décrit qu’un événement isolé.',
              tags: ['observabilite', 'monitoring'],
            },
          ],
        },
      ],
    },
  ],
};
