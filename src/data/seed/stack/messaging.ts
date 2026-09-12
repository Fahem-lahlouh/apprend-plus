import {
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
 * Synchrone, asynchrone et messaging.
 *
 * L'ordre importe particulièrement ici : on ne comprend l'intérêt d'un broker
 * qu'après avoir vu ce que coûte un appel synchrone en chaîne. Et on ne
 * distingue JMS, TIBCO EMS et Kafka qu'après avoir posé queue et topic.
 *
 * Le point de vigilance de tout le cours : ces trois noms circulent comme s'ils
 * désignaient la même chose. JMS est une spécification, EMS un produit, Kafka
 * une plateforme au modèle différent. Chaque leçon y revient.
 */
export const messagingCourse: CourseSpec = {
  id: 'stack-c-messaging',
  title: 'Synchrone, asynchrone et messaging',
  description: 'Queue et topic, JMS, TIBCO EMS, Kafka : le modèle de chacun et quand le choisir.',
  icon: 'bolt',
  level: 'avance',
  tags: ['messaging', 'kafka', 'jms', 'architecture'],
  pathId: 'stack-path-messaging',
  chapters: [
    {
      id: 'stack-ch-sync-async',
      title: 'Synchrone ou asynchrone',
      description: 'Le choix qui précède tout le reste.',
      lessons: [
        {
          id: 'stack-l-sync-async',
          title: 'Attendre ou ne pas attendre',
          summary: 'Ce que le couplage temporel coûte réellement.',
          minutes: 11,
          difficulty: 'moyen',
          requires: ['java-l-api-rest'],
          concepts: ['architecture', 'messaging'],
          blocks: [
            def(
              'Appel synchrone',
              'Un appel est synchrone quand l’appelant attend la réponse avant de continuer. Son sort est lié à celui de l’appelé : si celui-ci est lent ou indisponible, l’appelant l’est aussi.',
            ),
            def(
              'Traitement asynchrone',
              'Un traitement est asynchrone quand l’émetteur dépose une demande et poursuit sans attendre le résultat. Le travail est réalisé plus tard par un autre composant, ce qui découple la disponibilité des deux parties.',
            ),
            flow(
              [
                step(
                  'Option synchrone — Client → API',
                  'Le client attend',
                  'L’API reçoit la commande et garde la connexion ouverte le temps du traitement complet.',
                  'C’est le cas de référence : simple, et la réponse contient le résultat réel.',
                ),
                step(
                  'API → traitement → base',
                  'Tout se fait maintenant',
                  'Validation, écriture, appel au service de paiement, envoi du courriel : tout dans la même requête.',
                  'Si l’une de ces étapes est lente, le client attend tout. Si l’une échoue, la commande échoue.',
                ),
                step(
                  'Réponse au client',
                  'Le résultat est certain',
                  'Le client sait que la commande est enregistrée et payée : l’information est complète.',
                  'C’est l’avantage à ne pas brader — l’asynchrone le perd.',
                ),
              ],
              'Le trajet synchrone',
            ),
            flow(
              [
                step(
                  'Client → API',
                  'Le client attend peu',
                  'L’API valide la demande, l’enregistre, publie un message et répond immédiatement un 202 avec un identifiant de suivi.',
                  'Sans réponse rapide, on perd tout le bénéfice de l’asynchrone.',
                ),
                step(
                  'Broker',
                  'Le tampon',
                  'Conserve le message de façon durable jusqu’à ce qu’un consommateur l’ait traité. Absorbe les pics et survit au redémarrage des consommateurs.',
                  'Sans broker, un consommateur arrêté fait perdre les demandes : c’est lui qui rend le découplage fiable.',
                  'Une table en base peut jouer ce rôle à petite échelle, au prix d’un travail de reprise à écrire soi-même.',
                ),
                step(
                  'Consumer',
                  'Le travail réel',
                  'Récupère le message, effectue le paiement et l’envoi du courriel, à son rythme et avec ses propres réessais.',
                  'Sans consommateur, les messages s’accumulent — visible immédiatement dans la profondeur de la file.',
                ),
                step(
                  'Notification du résultat',
                  'Le client apprend plus tard',
                  'Par interrogation de l’identifiant de suivi, par notification poussée ou par courriel.',
                  'C’est le coût de l’asynchrone : il faut construire ce retour, qui était gratuit en synchrone.',
                ),
              ],
              'Le même besoin, en asynchrone',
            ),
            compare(
              ['Synchrone', 'Asynchrone'],
              [
                ['Le client sait', 'Immédiatement, et avec certitude', 'Plus tard, il faut prévoir comment'],
                ['Si l’aval tombe', 'La requête échoue', 'Le message attend, le traitement reprend après'],
                ['Pic de charge', 'Subi en direct, jusqu’à saturation', 'Absorbé par la file, traité au rythme possible'],
                ['Complexité', 'Faible', 'Réelle : suivi, réessais, ordre, doublons'],
                ['Cohérence', 'Immédiate', 'À terme'],
                ['Bon pour', 'Lire, valider, tout ce dont la réponse est nécessaire', 'Notifier, exporter, calculer, propager'],
              ],
            ),
            warn(
              'L’asynchrone n’est pas « la version évoluée » du synchrone. Il échange un problème contre d’autres : messages en double, ordre non garanti, cohérence à terme, et un suivi à construire. Si le client a besoin de la réponse pour continuer, le synchrone reste le bon choix.',
            ),
            question(
              'Une API reçoit une commande. Quelles parties passer en asynchrone ?',
              'Ce dont le client n’a pas besoin pour continuer. La validation et l’enregistrement restent synchrones : le client doit savoir si sa commande est acceptée, et on veut pouvoir la refuser tout de suite. En revanche l’envoi du courriel de confirmation, la mise à jour du stock chez un partenaire, l’indexation pour la recherche et l’alimentation de l’entrepôt de données n’ont aucune raison de retarder la réponse. La règle : reste synchrone ce qui conditionne la réponse, passe en asynchrone ce qui en découle.',
            ),
            memorize('stack-d-asynchrone'),
            quiz('stack-q-async-1'),
            interview({
              question: 'Quand choisis-tu un traitement asynchrone plutôt qu’un appel synchrone ?',
              short:
                'Quand le client n’a pas besoin du résultat pour continuer. Le synchrone reste le bon choix si la réponse conditionne la suite. Je passe en asynchrone ce qui en découle — notifications, exports, propagation vers d’autres systèmes — pour ne pas faire dépendre ma disponibilité de la leur.',
              detailed:
                'Le critère est le couplage temporel. En synchrone, la disponibilité de l’appelant est le produit de celle de toute la chaîne : trois dépendances à 99 % donnent 97 %, et surtout la lenteur de n’importe laquelle immobilise les threads de l’appelant jusqu’à saturation. En asynchrone, l’émetteur dépose un message durable et répond aussitôt ; le consommateur travaille à son rythme et peut être arrêté sans rien perdre. Les bénéfices sont l’absorption des pics, la résilience aux pannes en aval et la possibilité d’ajouter des consommateurs sans toucher au producteur. Le coût est réel et il faut le dire : le client n’a plus la réponse, il faut donc construire un suivi — identifiant d’exécution, interrogation ou notification. On hérite de la livraison au moins une fois, donc des doublons, donc du besoin de rendre le traitement idempotent. L’ordre n’est garanti que sous conditions. Et le diagnostic devient plus difficile, ce qui rend le traçage indispensable. En pratique, le découpage se fait dans la requête elle-même : ce qui conditionne la réponse reste synchrone — valider et enregistrer la commande —, ce qui en découle part en message — courriel, indexation, facturation, alimentation analytique.',
              followUps: [
                [
                  'Quel code HTTP renvoies-tu pour une opération asynchrone ?',
                  '202 Accepted : la demande est reçue et validée, le traitement n’est pas terminé. On accompagne d’un identifiant de suivi et, idéalement, d’une URL où consulter l’avancement.',
                ],
                [
                  'Que se passe-t-il si le consommateur échoue en plein traitement ?',
                  'Le message n’est pas acquitté et revient : il sera retraité. C’est précisément pourquoi le traitement doit être idempotent. Après un certain nombre d’échecs, on l’écarte vers une file de rebut pour ne pas bloquer les suivants.',
                ],
              ],
            }),
          ],
          definitions: [
            {
              id: 'stack-d-asynchrone',
              title: 'Traitement asynchrone',
              text: 'Un traitement est asynchrone lorsque l’émetteur dépose une demande et poursuit sans attendre le résultat, le travail étant réalisé plus tard par un autre composant. Cela découple la disponibilité des deux parties, au prix d’un suivi à construire et de doublons possibles à absorber.',
              tags: ['messaging', 'architecture'],
            },
          ],
        },
      ],
    },
    {
      id: 'stack-ch-queue-topic',
      title: 'Queue et topic',
      description: 'Les deux modèles de distribution, avant les produits.',
      lessons: [
        {
          id: 'stack-l-queue-topic',
          title: 'File ou publication',
          summary: 'Un seul consommateur, ou tous les abonnés.',
          minutes: 10,
          difficulty: 'moyen',
          requires: ['stack-l-sync-async'],
          concepts: ['messaging'],
          blocks: [
            def(
              'Broker de messages',
              'Un broker est le serveur intermédiaire qui reçoit les messages des producteurs, les conserve de façon durable et les remet aux consommateurs. Il absorbe les écarts de rythme entre les deux et survit à l’arrêt de l’un comme de l’autre.',
            ),
            def(
              'File (queue)',
              'Une file distribue chaque message à un seul consommateur. Plusieurs consommateurs peuvent y être attachés, mais ils se répartissent alors le travail au lieu de le dupliquer.',
            ),
            def(
              'Sujet (topic)',
              'Un sujet remet chaque message à tous les abonnés. Ajouter un abonné ne retire rien aux autres, ce qui permet de brancher un nouveau destinataire sans modifier le producteur.',
            ),
            compare(
              ['File', 'Sujet'],
              [
                ['Modèle', 'Point à point', 'Publication et abonnement'],
                ['Chaque message va', 'À un consommateur', 'À tous les abonnés'],
                ['Ajouter un consommateur', 'Répartit la charge', 'Ajoute un destinataire de plus'],
                ['Question posée', '« Qui s’en occupe ? »', '« Qui veut le savoir ? »'],
                ['Exemple', 'Traiter une commande une fois', 'Annoncer qu’une commande a été passée'],
              ],
              'Deux modèles, deux intentions',
            ),
            why(
              'Pourquoi ce choix structure toute l’architecture ?',
              'Une file exprime un ordre à exécuter : il y a un responsable, une seule fois. Un sujet exprime un fait survenu : chacun en tire ce qu’il veut. Le second se prête aux architectures événementielles parce qu’ajouter un consommateur — l’analytique, la recherche, un nouveau service — ne demande aucune modification du producteur. Le premier convient quand le travail doit être fait exactement une fois par quelqu’un.',
            ),
            tip(
              'Un bon indice pour trancher : nomme ton message. Si c’est un impératif — « envoyer la facture » — c’est une commande, donc une file. Si c’est un passé — « commande validée » — c’est un événement, donc un sujet.',
            ),
            memorize('stack-d-broker'),
            memorize('stack-d-queue'),
            memorize('stack-d-topic'),
            quiz('stack-q-queue-1'),
          ],
          definitions: [
            {
              id: 'stack-d-broker',
              title: 'Broker de messages',
              text: 'Un broker est le serveur qui reçoit les messages des producteurs, les conserve de façon durable et les remet aux consommateurs. Il absorbe les différences de rythme entre les deux et permet à chacun de s’arrêter sans que les messages soient perdus.',
              tags: ['messaging'],
            },
            {
              id: 'stack-d-queue',
              title: 'File de messages',
              text: 'Une file remet chaque message à un seul consommateur, même lorsque plusieurs sont attachés. Ajouter des consommateurs répartit alors la charge entre eux au lieu de dupliquer le travail.',
              tags: ['messaging'],
            },
            {
              id: 'stack-d-topic',
              title: 'Sujet de publication',
              text: 'Un sujet remet chaque message à tous les abonnés plutôt qu’à un seul. Cela permet de brancher un nouveau destinataire sans modifier ni le producteur ni les abonnés existants.',
              tags: ['messaging'],
            },
          ],
        },
      ],
    },
    {
      id: 'stack-ch-jms-ems-kafka',
      title: 'JMS, TIBCO EMS et Kafka',
      description: 'Trois noms, trois natures différentes.',
      lessons: [
        {
          id: 'stack-l-jms',
          title: 'JMS : une spécification',
          summary: 'Une API Java, pas un serveur.',
          minutes: 9,
          difficulty: 'moyen',
          requires: ['stack-l-queue-topic', 'java-l-interfaces'],
          concepts: ['messaging', 'jms'],
          blocks: [
            warn(
              'C’est le point où l’on se trompe le plus souvent. JMS, TIBCO EMS et Kafka sont régulièrement cités comme trois produits équivalents. Ils ne sont pas de même nature : JMS est une spécification, EMS un broker qui l’implémente, Kafka une plateforme dont le modèle est différent.',
            ),
            def(
              'JMS',
              'JMS est la spécification Java qui définit une interface commune pour envoyer et recevoir des messages. Ce n’est pas un serveur : c’est le contrat que les brokers implémentent pour qu’un même code Java fonctionne avec plusieurs d’entre eux.',
            ),
            techDef(
              'Ce que JMS normalise',
              'JMS définit les interfaces ConnectionFactory, Destination, Producer et Consumer, les types de messages, les deux modèles point-à-point et publication-abonnement, et les modes d’acquittement. Il ne dit rien de la manière dont le broker stocke, réplique ou distribue les messages.',
            ),
            compare(
              ['Ce que c’est', 'Analogue connu'],
              [
                ['JMS', 'Une spécification : des interfaces Java, aucun serveur', 'JPA — un contrat, sans implémentation'],
                [
                  'TIBCO EMS, ActiveMQ, IBM MQ',
                  'Des brokers : les serveurs réellement installés et exploités',
                  'Hibernate — des produits qui mettent le contrat en œuvre',
                ],
                [
                  'Kafka',
                  'Une plateforme de flux : le modèle est un journal, pas une file',
                  'Sans équivalent direct — ce n’est pas un broker JMS',
                ],
              ],
              'Situer chaque nom',
            ),
            why(
              'Pourquoi une spécification plutôt que d’utiliser directement le broker ?',
              'Pour la même raison que JPA existe à côté d’Hibernate : ne pas souder le code applicatif à un produit. Une application écrite contre JMS peut passer d’ActiveMQ à EMS en changeant la configuration. En pratique on utilise souvent des fonctions propres au broker et la portabilité n’est jamais totale, mais le gros du code reste indépendant.',
            ),
            memorize('stack-d-jms'),
            quiz('stack-q-jms-1'),
          ],
          definitions: [
            {
              id: 'stack-d-jms',
              title: 'JMS',
              text: 'JMS est la spécification Java qui définit une interface commune pour produire et consommer des messages. Elle ne fournit aucun serveur : ce sont les brokers qui l’implémentent, ce qui permet au même code applicatif de fonctionner avec plusieurs produits.',
              tags: ['messaging', 'jms'],
            },
          ],
        },
        {
          id: 'stack-l-ems',
          title: 'TIBCO EMS : un broker',
          summary: 'Le produit qui met JMS en œuvre.',
          minutes: 8,
          difficulty: 'moyen',
          requires: ['stack-l-jms'],
          concepts: ['messaging', 'jms'],
          blocks: [
            def(
              'TIBCO EMS',
              'TIBCO EMS est un serveur de messagerie commercial qui implémente la spécification JMS. Il fournit les files et les sujets, la persistance des messages, les acquittements et la reprise, avec ses propres outils d’exploitation et de supervision.',
            ),
            text(
              'Dire « on utilise EMS » répond à la question du produit installé. Dire « on utilise JMS » répond à la question de l’API utilisée dans le code. Les deux phrases sont compatibles et décrivent des choses différentes : c’est très exactement le rapport entre Hibernate et JPA.',
            ),
            keypoints(
              [
                'EMS est un broker : un serveur qu’on installe, exploite et supervise.',
                'Il implémente JMS, donc le code applicatif reste du JMS standard.',
                'Il ajoute ses propres fonctions — routage, passerelles, administration — non couvertes par la spécification.',
                'On le rencontre surtout dans les grands systèmes d’information, souvent au centre d’un bus d’intégration.',
              ],
              'Ce qu’il faut en dire',
            ),
            tip(
              'Si on te demande en entretien « tu as fait du JMS ou du EMS ? », la bonne réponse explicite les deux niveaux : « le code était du JMS standard, le broker était EMS ». Cela montre que tu sais où passe la frontière.',
            ),
            memorize('stack-d-ems'),
            quiz('stack-q-ems-1'),
          ],
          definitions: [
            {
              id: 'stack-d-ems',
              title: 'TIBCO EMS',
              text: 'TIBCO EMS est un serveur de messagerie commercial qui met en œuvre la spécification JMS. Il fournit les files, les sujets, la persistance et la reprise, tout en ajoutant ses propres outils d’administration que la spécification ne couvre pas.',
              tags: ['messaging', 'jms'],
            },
          ],
        },
        {
          id: 'stack-l-kafka',
          title: 'Kafka : un journal distribué',
          summary: 'Pourquoi ce n’est pas une file de messages classique.',
          minutes: 14,
          difficulty: 'difficile',
          requires: ['stack-l-ems'],
          concepts: ['messaging', 'kafka'],
          blocks: [
            def(
              'Kafka',
              'Kafka est une plateforme distribuée de flux d’événements qui enregistre les messages dans un journal ordonné et conservé sur disque. Les consommateurs y avancent à leur propre rythme en mémorisant leur position, au lieu que le serveur retire le message une fois remis.',
            ),
            why(
              'En quoi c’est différent d’une file ?',
              'Dans une file classique, un message consommé et acquitté disparaît : le broker suit qui a reçu quoi. Kafka inverse la responsabilité. Le message reste dans le journal pendant toute la durée de rétention configurée, et c’est le consommateur qui mémorise jusqu’où il a lu. Deux conséquences immédiates : plusieurs groupes indépendants peuvent lire le même flux sans se gêner, et on peut rejouer l’historique en reculant simplement sa position.',
            ),
            flow(
              [
                step(
                  'Producer',
                  'Celui qui publie',
                  'Envoie un message dans un topic. S’il fournit une clé, celle-ci détermine la partition de destination.',
                  'Sans producteur, pas de flux — mais Kafka conserve ce qui a déjà été écrit.',
                ),
                step(
                  'Topic',
                  'Le flux nommé',
                  'Un nom logique regroupant les messages d’un même type. Ce n’est pas une file : c’est un journal en ajout seul.',
                  'Sans topic, pas d’organisation du flux.',
                ),
                step(
                  'Partition',
                  'L’unité de parallélisme et d’ordre',
                  'Le topic est découpé en partitions, chacune étant une séquence strictement ordonnée. L’ordre n’est garanti qu’à l’intérieur d’une partition, jamais entre elles.',
                  'Sans partitions, pas de mise à l’échelle : un topic entier serait limité à un seul consommateur par groupe.',
                ),
                step(
                  'Offset',
                  'La position de lecture',
                  'Le numéro de séquence d’un message dans sa partition. Chaque groupe de consommateurs mémorise le sien, ce qui permet de reprendre où l’on s’était arrêté, ou de revenir en arrière.',
                  'Sans offset conservé, un redémarrage relirait tout, ou perdrait tout.',
                ),
                step(
                  'Consumer group',
                  'L’unité d’abonnement',
                  'Kafka attribue chaque partition à un seul consommateur du groupe. Deux groupes différents lisent le même flux indépendamment, chacun avec sa propre position.',
                  'Sans groupes, on ne pourrait pas à la fois répartir la charge et permettre plusieurs abonnés — c’est ce qui réconcilie file et sujet dans un seul modèle.',
                ),
                step(
                  'Consumer',
                  'Celui qui traite',
                  'Lit les messages des partitions qui lui sont attribuées et fait avancer sa position une fois le traitement effectué.',
                  'Sans consommateur, les messages restent — ce qui est précisément la différence avec une file.',
                ),
              ],
              'Le modèle Kafka',
            ),
            compare(
              ['File JMS', 'Kafka'],
              [
                ['Après consommation', 'Le message est retiré', 'Il reste jusqu’à la fin de la rétention'],
                ['Qui suit la progression', 'Le broker', 'Le consommateur, via son offset'],
                ['Plusieurs abonnés', 'Topic distinct du modèle file', 'Plusieurs groupes lisent le même topic'],
                ['Rejouer l’historique', 'Non prévu', 'Oui, en reculant l’offset'],
                ['Ordre', 'Global sur la file, sous conditions', 'Garanti uniquement par partition'],
                ['Parallélisme', 'Par nombre de consommateurs', 'Borné par le nombre de partitions'],
                ['Conçu pour', 'Intégration, commandes à exécuter', 'Flux d’événements à fort débit, plusieurs consommateurs'],
              ],
              'La vraie différence de modèle',
            ),
            warn(
              'Le nombre de consommateurs utiles d’un groupe est plafonné par le nombre de partitions : avec trois partitions, un quatrième consommateur ne recevra rien. Le partitionnement se décide donc à la création du topic, en fonction du parallélisme visé — et l’augmenter plus tard redistribue les clés, ce qui casse l’ordre pour les clés déjà en place.',
            ),
            text(
              'Les garanties de livraison sont le second sujet où les raccourcis abondent. Elles se présentent en trois niveaux, et « exactement une fois » mérite d’être nuancé.',
            ),
            compare(
              ['Garantie', 'Ce que ça signifie vraiment'],
              [
                ['Au plus une fois', 'Risque de perte', 'La position avance avant le traitement : si le consommateur tombe, le message est sauté.'],
                ['Au moins une fois', 'Risque de doublon', 'La position avance après le traitement : un échec après traitement provoque un retraitement. C’est le réglage par défaut, et le plus courant.'],
                ['Exactement une fois', 'Sous conditions', 'Kafka le permet à l’intérieur de son périmètre, par production transactionnelle et offsets validés dans la même transaction. Dès qu’un effet de bord sort de Kafka — écrire en base, appeler une API — la garantie ne s’étend pas : il faut rendre le traitement idempotent.'],
              ],
            ),
            tip(
              'La réponse qui fait la différence en entretien : « en pratique on conçoit pour du au moins une fois et on rend le traitement idempotent ». Promettre « exactement une fois » sans nuance est le signe qu’on n’a pas traité le cas où le consommateur écrit ailleurs que dans Kafka.',
            ),
            def(
              'File de rebut',
              'Une file de rebut recueille les messages qu’un consommateur n’a pas réussi à traiter après plusieurs tentatives. Elle empêche un message défectueux de bloquer indéfiniment le traitement des suivants tout en le conservant pour analyse.',
            ),
            warn(
              'Attention à ne pas présenter la file de rebut comme un mécanisme universel. C’est une fonction native des brokers de type JMS. Dans Kafka, elle n’existe pas au niveau du courtier : on l’implémente en publiant soi-même le message en échec vers un topic dédié, ou via l’outillage qui l’ajoute par-dessus.',
            ),
            memorize('stack-d-kafka'),
            memorize('stack-d-offset'),
            memorize('stack-d-partition'),
            quiz('stack-q-kafka-1'),
            quiz('stack-q-kafka-2'),
            interview({
              question: 'Quelle différence entre Kafka et une file JMS ?',
              short:
                'Une file JMS retire le message une fois consommé et acquitté, et c’est le broker qui suit la progression. Kafka écrit dans un journal conservé sur disque pendant une durée de rétention, et c’est le consommateur qui mémorise sa position. Plusieurs groupes peuvent donc lire le même flux indépendamment, et on peut rejouer l’historique.',
              detailed:
                'Il faut d’abord poser que les trois noms qu’on cite ensemble ne sont pas de même nature. JMS est une spécification Java, une API. TIBCO EMS, ActiveMQ ou IBM MQ sont des brokers qui l’implémentent. Kafka n’est pas un broker JMS : c’est une plateforme de flux d’événements dont le modèle est celui d’un journal en ajout seul. Concrètement, un topic Kafka est découpé en partitions, chacune étant une séquence strictement ordonnée ; l’ordre est garanti dans une partition, jamais entre partitions, et la clé du message détermine sa partition — c’est ainsi qu’on garantit l’ordre par client ou par compte. Chaque consommateur mémorise un offset par partition, ce qui permet de reprendre après un arrêt, mais aussi de reculer pour rejouer. Le groupe de consommateurs est l’unité d’abonnement : Kafka attribue chaque partition à un seul membre du groupe, ce qui répartit la charge, tandis que deux groupes distincts lisent le même flux sans interférer — c’est ce qui réunit le modèle file et le modèle sujet dans une seule structure. Les conséquences pratiques sont le débit, la possibilité de brancher un nouveau consommateur sur l’historique sans toucher au producteur, et la rétention comme source de vérité rejouable. En contrepartie, le parallélisme est plafonné par le nombre de partitions, l’ordre global n’existe pas, et il n’y a pas de file de rebut native : on la construit avec un topic dédié.',
              followUps: [
                [
                  'Comment garantis-tu l’ordre de traitement pour un client donné ?',
                  'En utilisant l’identifiant du client comme clé du message. Tous ses messages tombent alors dans la même partition, et l’ordre y est garanti. Il ne faut pas chercher un ordre global sur le topic : il n’existe pas, et le réclamer reviendrait à n’avoir qu’une partition, donc aucun parallélisme.',
                ],
                [
                  'Que se passe-t-il si un consommateur du groupe tombe ?',
                  'Kafka déclenche un rééquilibrage : les partitions du membre disparu sont réattribuées aux autres, qui reprennent au dernier offset validé. Comme la validation peut précéder de peu la panne, certains messages sont retraités — d’où la nécessité d’un traitement idempotent.',
                ],
                [
                  'Exactement une fois, c’est possible ?',
                  'À l’intérieur de Kafka oui, avec la production transactionnelle et les offsets validés dans la même transaction. Dès que le consommateur produit un effet hors de Kafka — écriture en base, appel d’API — la garantie ne couvre plus cet effet : on retombe sur du au moins une fois et on rend l’opération idempotente.',
                ],
              ],
            }),
          ],
          definitions: [
            {
              id: 'stack-d-kafka',
              title: 'Kafka',
              text: 'Kafka est une plateforme distribuée de flux d’événements qui conserve les messages dans un journal ordonné écrit sur disque. Le message n’est pas retiré après lecture : chaque consommateur mémorise sa propre position, ce qui permet à plusieurs groupes de lire le même flux et de rejouer l’historique.',
              tags: ['messaging', 'kafka'],
            },
            {
              id: 'stack-d-offset',
              title: 'Offset',
              text: 'Un offset est le numéro de séquence d’un message dans sa partition, et la position de lecture qu’un groupe de consommateurs mémorise. C’est lui qui permet de reprendre là où l’on s’était arrêté après un redémarrage, ou de revenir en arrière pour rejouer des messages.',
              tags: ['messaging', 'kafka'],
            },
            {
              id: 'stack-d-partition',
              title: 'Partition',
              text: 'Une partition est une des séquences ordonnées qui composent un topic Kafka. L’ordre des messages n’est garanti qu’à l’intérieur d’une partition, et le nombre de partitions plafonne le nombre de consommateurs actifs dans un même groupe.',
              tags: ['messaging', 'kafka'],
            },
          ],
        },
      ],
    },
  ],
};
