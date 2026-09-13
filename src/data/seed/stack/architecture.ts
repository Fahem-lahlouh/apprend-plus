import {
  compare,
  flow,
  interview,
  keypoints,
  memorize,
  question,
  quiz,
  step,
  text,
  tip,
  warn,
  why,
  def,
  type CourseSpec,
} from '../builders';

/**
 * Le scénario complet.
 *
 * Ce cours ne présente aucune technologie nouvelle : il relie celles des cours
 * précédents. C'est volontaire — savoir ce qu'est Kafka et savoir où il se place
 * dans une architecture sont deux acquis distincts, et c'est le second qu'un
 * entretien vérifie réellement.
 *
 * Les blocs `flow` en sont la matière : chaque maillon se déplie sur « ce qu'il
 * fait », « sans lui », « à la place ».
 */
export const architectureCourse: CourseSpec = {
  id: 'stack-c-architecture',
  title: 'Anatomie d’une application complète',
  description: 'De l’utilisateur au pod : chaque composant, son rôle, et ce qui casse sans lui.',
  icon: 'globe',
  level: 'avance',
  tags: ['architecture', 'systeme'],
  pathId: 'stack-path-architecture',
  chapters: [
    {
      id: 'stack-ch-chaine-requete',
      title: 'La chaîne d’exécution',
      description: 'Ce que traverse une requête, de bout en bout.',
      lessons: [
        {
          id: 'stack-l-chaine-complete',
          title: 'De l’utilisateur à la base',
          summary: 'Sept maillons, chacun justifié.',
          minutes: 14,
          difficulty: 'difficile',
          requires: ['stack-l-couches-spring', 'stack-l-cache-aside', 'stack-l-pod'],
          concepts: ['architecture'],
          blocks: [
            text(
              'Chaque composant d’une architecture existe parce qu’il résout un problème précis. Savoir lequel — et ce qui se passerait sans lui — est ce qui distingue une réponse apprise d’une réponse comprise.',
            ),
            flow(
              [
                step(
                  'Utilisateur',
                  'L’origine de la demande',
                  'Un humain ou un système déclenche une action : consulter, créer, valider.',
                  'Sans demande, le système ne fait rien — tout le reste existe pour elle.',
                ),
                step(
                  'Frontend',
                  'L’interface',
                  'Recueille la saisie, effectue une première validation de forme, appelle l’API et affiche le résultat.',
                  'Sans lui, il faudrait appeler l’API à la main. Il ne porte aucune règle de sécurité : tout ce qu’il valide doit être revalidé côté serveur.',
                ),
                step(
                  'Ingress / Route',
                  'La porte d’entrée du cluster',
                  'Expose un nom de domaine vers l’intérieur, termine le TLS et oriente vers le bon service.',
                  'Sans elle, l’application n’est joignable que depuis l’intérieur du cluster.',
                ),
                step(
                  'Service Kubernetes',
                  'L’adresse stable et la répartition',
                  'Présente une IP fixe devant un ensemble de pods dont les adresses changent, et répartit le trafic entre eux.',
                  'Sans lui, impossible d’appeler l’application de façon fiable : l’adresse d’un pod disparaît à chaque recréation.',
                ),
                step(
                  'Controller',
                  'La traduction HTTP',
                  'Désérialise, valide la forme, appelle le service, choisit le code de statut et sérialise la réponse.',
                  'Sans lui, la logique métier devrait comprendre HTTP et ne serait plus appelable par un batch ou un consommateur de messages.',
                ),
                step(
                  'Service métier',
                  'La décision',
                  'Applique les règles, orchestre les dépendances, délimite la transaction.',
                  'Sans lui, la règle se duplique dans chaque point d’entrée et devient intestable sans serveur web.',
                ),
                step(
                  'Cache Redis',
                  'Le raccourci',
                  'Interrogé avant la base pour les données coûteuses, souvent lues et rarement modifiées. En cas d’absence, on lit la source et on dépose le résultat.',
                  'Sans lui, chaque lecture frappe la base. Il n’est utile que si le taux de succès est réellement élevé — et il crée en retour un problème d’invalidation.',
                  'Un cache local suffit parfois, mais il devient incohérent dès qu’il y a plusieurs pods.',
                ),
                step(
                  'Repository et JPA',
                  'L’accès aux données',
                  'Traduit les intentions métier en SQL, gère le suivi des modifications et l’écriture différée en fin de transaction.',
                  'Sans lui, le SQL se répand dans le service. C’est aussi la couche où naissent la plupart des N+1.',
                  'JdbcTemplate ou jOOQ quand on veut garder la maîtrise du SQL.',
                ),
                step(
                  'Base de données',
                  'La source de vérité',
                  'Applique index et contraintes, garantit la cohérence transactionnelle, conserve durablement.',
                  'C’est le bout de la chaîne — et statistiquement l’endroit où se trouve le temps perdu d’une application lente.',
                ),
              ],
              'Le chemin synchrone',
            ),
            flow(
              [
                step(
                  'Service métier',
                  'Le point de bascule',
                  'Après avoir validé et enregistré, il publie un événement décrivant ce qui vient de se produire, puis rend la main.',
                  'Sans bascule, tout le travail annexe alourdit la réponse de l’utilisateur.',
                ),
                step(
                  'Kafka ou broker',
                  'Le tampon durable',
                  'Conserve l’événement jusqu’à son traitement, absorbe les pics et permet à plusieurs consommateurs indépendants de le lire.',
                  'Sans lui, l’arrêt d’un consommateur fait perdre les demandes, et le producteur redevient dépendant de sa disponibilité.',
                ),
                step(
                  'Consumer',
                  'Le travail différé',
                  'Envoie le courriel, met à jour l’index de recherche, alimente l’entrepôt de données, notifie un partenaire.',
                  'Sans consommateur, les messages s’accumulent — ce qui se voit immédiatement dans la profondeur de la file.',
                ),
                step(
                  'Retour vers l’utilisateur',
                  'La boucle à refermer',
                  'Par interrogation d’un identifiant de suivi, par notification poussée ou par courriel.',
                  'Sans ce retour, l’utilisateur ne sait jamais si son action a abouti : c’est le coût de l’asynchrone, à construire explicitement.',
                ),
              ],
              'La branche asynchrone',
            ),
            why(
              'Pourquoi séparer les deux branches ?',
              'Parce qu’elles répondent à des exigences opposées. Le chemin synchrone doit être court : l’utilisateur attend, et chaque maillon ajoute sa latence et son risque de panne. La branche asynchrone peut être longue, peut réessayer, peut tomber et reprendre. Mettre l’envoi d’un courriel dans le chemin synchrone, c’est faire dépendre la validation d’une commande de la disponibilité d’un serveur de messagerie.',
            ),
            question(
              'On te dit « enlevons Redis, ça fait un composant de moins ». Que réponds-tu ?',
              'Que ça dépend de ce qu’il absorbe, et que c’est mesurable. Je regarde le taux de succès du cache et la charge qu’il évite à la base : s’il sert 90 % des lectures d’un catalogue, le retirer multiplie par dix les requêtes sur la base et la question devient sa capacité. S’il est à 5 % de succès, il ne fait qu’ajouter un aller-retour réseau et un risque d’incohérence, et le retirer simplifie réellement. La bonne réponse n’est jamais « il en faut » ni « il n’en faut pas » mais « voici ce qu’il absorbe, voici ce qui se passe sans lui ».',
            ),
            memorize('stack-d-architecture'),
            quiz('stack-q-archi-1'),
            interview({
              question: 'Décris l’architecture d’une application sur laquelle tu as travaillé.',
              short:
                'Une API REST Spring Boot en trois couches, déployée en plusieurs pods sur OpenShift derrière une Route et un Service. Le chemin synchrone va du contrôleur au service, puis au cache Redis et à la base via JPA. Le travail annexe part en événement sur Kafka vers des consommateurs dédiés. Logs, métriques et traces centralisés pour le diagnostic.',
              detailed:
                'Je la décris en suivant une requête. Elle entre par une Route qui termine le TLS et vise un Service Kubernetes, lequel répartit vers l’un des pods — plusieurs exemplaires pour la disponibilité, la charge et le déploiement progressif. Dans le pod, le contrôleur ne fait que traduire HTTP en appel métier : désérialisation, validation de forme, choix du code de statut. Le service porte les règles et délimite la transaction. Pour les lectures coûteuses et stables, il interroge Redis avant la base ; sinon il passe par le dépôt et JPA, qui produit le SQL. La base reste la source de vérité. Ce qui n’est pas nécessaire à la réponse — courriel de confirmation, indexation pour la recherche, alimentation analytique, notification d’un partenaire — est publié comme événement sur Kafka et traité par des consommateurs séparés, ce qui évite de faire dépendre la validation d’une commande de la disponibilité d’un serveur de messagerie. Côté livraison, un push déclenche la chaîne d’intégration : compilation, tests, analyse, construction d’une image étiquetée par l’empreinte du commit, publication au registre, puis mise à jour du Deployment qui remplace les pods progressivement. La configuration reste hors de l’image, dans des ConfigMap et des Secrets, pour que la même image traverse tous les environnements. Côté exploitation, les journaux structurés sont centralisés, les métriques alimentent des tableaux de bord et des alertes sur latence et taux d’erreur, et les traces donnent la répartition du temps par service — c’est ce qui permet, quand une requête est lente, de dire en une minute où sont passées les secondes.',
              followUps: [
                [
                  'Pourquoi plusieurs pods plutôt qu’un plus gros ?',
                  'Parce qu’un exemplaire unique est un point de panne unique et empêche tout déploiement sans coupure. Plusieurs exemplaires permettent d’en perdre un sans interruption, de répartir la charge, et de remplacer progressivement lors d’une mise à jour. Cela suppose en revanche une application sans état local.',
                ],
                [
                  'Comment gères-tu la cohérence entre la base et les événements publiés ?',
                  'C’est le point difficile : écrire en base puis publier n’est pas atomique, et une panne entre les deux perd l’événement. La réponse courante est le motif de la boîte d’envoi — écrire l’événement dans une table dans la même transaction, puis le publier depuis cette table par un processus séparé. On accepte alors le doublon possible et on rend les consommateurs idempotents.',
                ],
                [
                  'Qu’est-ce que tu changerais dans cette architecture ?',
                  'C’est la vraie question : il faut savoir nommer une limite. Par exemple que le cache n’avait pas d’invalidation explicite et reposait uniquement sur des durées de vie, ce qui donnait des fenêtres d’incohérence gênantes sur certaines données — et expliquer ce qu’on aurait mis à la place.',
                ],
              ],
            }),
          ],
          definitions: [
            {
              id: 'stack-d-architecture',
              title: 'Architecture applicative',
              text: 'L’architecture d’une application est l’ensemble des composants qu’une requête traverse et des raisons pour lesquelles chacun est là. La décrire consiste moins à énumérer des technologies qu’à expliquer quel problème chaque maillon résout et ce qui se passerait sans lui.',
              tags: ['architecture'],
            },
          ],
        },
        {
          id: 'stack-l-remplacer-composants',
          title: 'Remplacer un composant',
          summary: 'Ce qui est interchangeable, et ce qui ne l’est pas.',
          minutes: 10,
          difficulty: 'difficile',
          requires: ['stack-l-chaine-complete'],
          concepts: ['architecture'],
          blocks: [
            def(
              'Couplage',
              'Le couplage mesure à quel point un composant dépend des détails d’un autre. Un couplage faible permet de remplacer une pièce sans toucher au reste ; un couplage fort fait de chaque remplacement un chantier.',
            ),
            compare(
              ['Composant', 'Remplaçable par'],
              [
                ['Base relationnelle', 'Coûteux à remplacer', 'Une autre base relationnelle si on est resté sur du SQL standard. Vers du non relationnel, c’est une réécriture du modèle.'],
                ['Redis', 'Facile', 'Un cache local pour un seul pod, Memcached, ou rien du tout si le taux de succès est faible.'],
                ['Kafka', 'Selon l’usage', 'Un broker JMS si on n’exploite ni la rétention ni la relecture. Sinon la migration change le modèle.'],
                ['Jenkins', 'Facile', 'GitLab CI, GitHub Actions, Azure DevOps : le pipeline se réécrit, les étapes restent.'],
                ['Kubernetes', 'Coûteux', 'OpenShift est la même base. Sortir de l’orchestration entière est une décision structurante.'],
                ['Hibernate', 'Moyen', 'EclipseLink si on est resté sur JPA standard. Vers jOOQ ou JdbcTemplate, il faut réécrire les accès.'],
                ['Elasticsearch', 'Selon l’usage', 'Loki pour les journaux si on n’a pas besoin de recherche plein texte sur le contenu.'],
              ],
              'Le coût réel du remplacement',
            ),
            tip(
              'La règle qui prédit le coût : ce qui a été utilisé à travers une abstraction standard se remplace ; ce qui a été utilisé par ses fonctions propres ne se remplace pas. Du JPA standard change d’implémentation ; du code truffé d’annotations Hibernate spécifiques ne bouge plus. C’est exactement la raison d’être de JMS face aux brokers, et de JPA face à Hibernate.',
            ),
            warn(
              'Se méfier aussi de l’excès inverse : construire une abstraction maison au-dessus de chaque outil « au cas où on en changerait » coûte immédiatement et se révèle presque toujours inadaptée le jour où le changement arrive. On s’appuie sur les abstractions standard qui existent déjà, on n’en invente pas de nouvelles par précaution.',
            ),
            keypoints(
              [
                'La base de données est presque toujours le composant le plus coûteux à changer.',
                'Un cache se retire facilement — sauf si du code s’est mis à en dépendre pour être correct.',
                'Le remplacement d’un broker dépend de ce qu’on a utilisé de son modèle, pas de son nom.',
                'Ce qui se remplace facilement est ce qui a été consommé via une interface standard.',
              ],
              'À retenir',
            ),
            quiz('stack-q-archi-2'),
          ],
        },
      ],
    },
  ],
};
