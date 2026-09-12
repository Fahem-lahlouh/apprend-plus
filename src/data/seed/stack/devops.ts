import {
  badGood,
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
 * Docker, Kubernetes, OpenShift et l'intégration continue.
 *
 * L'ordre suit la chaîne réelle de livraison : on ne comprend un pod qu'après
 * l'image, et l'image qu'après le JAR. Chaque leçon reprend donc le maillon
 * précédent plutôt que de repartir de zéro.
 */
export const devopsCourse: CourseSpec = {
  id: 'stack-c-devops',
  title: 'Docker, Kubernetes et CI/CD',
  description: 'De l’archive exécutable au pod qui tourne, et la chaîne qui l’y amène.',
  icon: 'laptop',
  level: 'avance',
  tags: ['docker', 'kubernetes', 'openshift', 'jenkins'],
  pathId: 'stack-path-devops',
  chapters: [
    {
      id: 'stack-ch-docker',
      title: 'Docker',
      description: 'Image et conteneur : la distinction qui fait tout.',
      lessons: [
        {
          id: 'stack-l-docker',
          title: 'Image et conteneur',
          summary: 'Le modèle et l’instance, appliqués au déploiement.',
          minutes: 11,
          difficulty: 'moyen',
          requires: ['stack-l-spring-vs-boot'],
          concepts: ['docker', 'deploiement'],
          blocks: [
            why(
              'Quel problème Docker résout-il ?',
              'Le « ça marche sur ma machine ». Une application dépend d’une version de Java, de variables d’environnement, de bibliothèques du système, de fichiers présents à tel endroit. Reproduire tout cela à l’identique sur un serveur est une source d’erreurs permanente. L’image embarque l’application **et** son environnement, si bien que ce qui a été testé est exactement ce qui tourne.',
            ),
            def(
              'Image',
              'Une image est un modèle en lecture seule contenant l’application et tout ce dont elle a besoin pour s’exécuter. Elle ne tourne pas : elle sert de point de départ figé, identique partout où on la déploie.',
            ),
            def(
              'Conteneur',
              'Un conteneur est une instance en cours d’exécution d’une image. Il ajoute par-dessus une couche modifiable qui disparaît avec lui, ce qui fait que tout ce qu’il écrit est perdu à son arrêt sauf si un volume le conserve.',
            ),
            compare(
              ['Image', 'Conteneur'],
              [
                ['Nature', 'Un modèle figé, en lecture seule', 'Une exécution de ce modèle'],
                ['Analogie Java', 'La classe', 'L’objet'],
                ['Combien', 'Une image', 'Autant de conteneurs qu’on veut, à partir d’elle'],
                ['Persiste', 'Oui, stockée dans un registre', 'Non : sa couche modifiable meurt avec lui'],
                ['Se construit avec', 'Un Dockerfile', 'Une commande de lancement'],
              ],
            ),
            techDef(
              'Dockerfile',
              'Un Dockerfile est le fichier de recette décrivant la construction d’une image, instruction par instruction : image de base, fichiers copiés, variables, port exposé, commande de démarrage. Chaque instruction produit une couche réutilisable, ce qui accélère les reconstructions.',
            ),
            def(
              'Registre',
              'Un registre est le dépôt où les images sont publiées et récupérées. La chaîne d’intégration y pousse l’image construite, et l’orchestrateur l’y récupère au moment de déployer.',
            ),
            flow(
              [
                step(
                  'Code Spring Boot',
                  'Les sources',
                  'Le projet tel qu’il est dans le dépôt Git.',
                  'Point de départ : sans code, rien à construire.',
                ),
                step(
                  'Build Maven ou Gradle',
                  'La compilation et les tests',
                  'Compile, exécute les tests et produit une archive exécutable contenant l’application et ses dépendances.',
                  'Sans cette étape, aucun artefact vérifié à empaqueter.',
                ),
                step(
                  'JAR exécutable',
                  'L’artefact applicatif',
                  'Un fichier unique, lançable par une JVM. Il ne contient ni la JVM ni le système.',
                  'Sans lui, il faudrait déployer des sources et compiler sur le serveur.',
                ),
                step(
                  'Image Docker',
                  'L’artefact déployable',
                  'Ajoute autour du JAR une JVM, un système minimal et la configuration de démarrage. Le résultat est figé et identique partout.',
                  'Sans image, on retombe sur l’installation manuelle d’une JVM sur chaque serveur.',
                ),
                step(
                  'Registre',
                  'La distribution',
                  'Stocke l’image versionnée et la rend récupérable par les environnements.',
                  'Sans registre, il faudrait transférer l’image à la main sur chaque machine.',
                ),
                step(
                  'Conteneur',
                  'L’exécution',
                  'L’image est lancée avec ses variables d’environnement et ses ports ; l’application tourne.',
                  'C’est le but de toute la chaîne.',
                ),
              ],
              'Du code au conteneur',
            ),
            badGood({
              language: 'text',
              title: 'Configurer une image',
              bad: `# Dockerfile
COPY application-prod.yml /app/config/
ENV DB_PASSWORD=motdepasse_prod`,
              good: `# Dockerfile : aucune valeur d'environnement
COPY app.jar /app/app.jar
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

# Les valeurs sont fournies au lancement,
# par variables d'environnement ou par un Secret.`,
              why: 'Une image doit être la même dans tous les environnements : c’est ce qui garantit que ce qui a été testé en recette est ce qui tourne en production. Y figer une configuration oblige à reconstruire une image par environnement, donc à déployer en production une image jamais testée. Et un mot de passe inscrit dans une image reste lisible par quiconque récupère l’image, y compris dans les couches précédentes.',
            }),
            memorize('stack-d-image'),
            memorize('stack-d-conteneur'),
            quiz('stack-q-docker-1'),
            interview({
              question: 'Quelle différence entre une image et un conteneur ?',
              short:
                'L’image est un modèle figé en lecture seule contenant l’application et son environnement ; le conteneur est une instance en cours d’exécution de cette image. La même image donne autant de conteneurs qu’on veut, exactement comme une classe donne plusieurs objets.',
              detailed:
                'L’image est construite à partir d’un Dockerfile et se compose de couches empilées, chacune correspondant à une instruction. Elle est en lecture seule et immuable : la même image, identifiée par son empreinte, donne le même contenu partout. C’est la propriété qui rend le déploiement reproductible — ce qui a été testé en recette est exactement ce qui tourne en production. Le conteneur est une exécution de cette image : le moteur y ajoute une couche modifiable, isole les processus, le réseau et le système de fichiers, et lance la commande de démarrage. Tout ce que le conteneur écrit va dans cette couche, qui disparaît à son arrêt : d’où les volumes pour ce qui doit survivre. Deux conséquences pratiques suivent de l’immuabilité. La configuration ne doit jamais être dans l’image, sinon il faut une image par environnement et on déploie en production quelque chose de jamais testé : elle passe par des variables d’environnement ou des Secrets, injectés au lancement. Et un conteneur doit être considéré comme jetable, ce qui suppose une application sans état local — c’est exactement ce que suppose ensuite Kubernetes pour déplacer ou redémarrer un pod librement.',
              followUps: [
                [
                  'Pourquoi une image multi-étapes ?',
                  'Pour ne pas livrer l’outillage de compilation. Un premier étage compile avec Maven et le JDK complet, un second ne récupère que l’archive produite sur une base contenant seulement un runtime Java. L’image finale est bien plus petite et présente beaucoup moins de surface d’attaque.',
                ],
                [
                  'Quelle différence avec une machine virtuelle ?',
                  'Une machine virtuelle embarque un système d’exploitation complet au-dessus d’un hyperviseur. Un conteneur partage le noyau de l’hôte et n’isole que les processus et les ressources. Il démarre donc en une seconde plutôt qu’en une minute et pèse bien moins, au prix d’une isolation plus faible.',
                ],
              ],
            }),
          ],
          definitions: [
            {
              id: 'stack-d-image',
              title: 'Image',
              text: 'Une image est un modèle figé en lecture seule qui contient l’application et tout l’environnement nécessaire à son exécution. Elle ne s’exécute pas elle-même mais sert de point de départ identique partout où on la déploie, ce qui rend le déploiement reproductible.',
              tags: ['docker'],
            },
            {
              id: 'stack-d-conteneur',
              title: 'Conteneur',
              text: 'Un conteneur est une instance en cours d’exécution d’une image, isolée des autres processus de la machine. Tout ce qu’il écrit va dans une couche modifiable qui disparaît à son arrêt, sauf si un volume est monté pour conserver ces données.',
              tags: ['docker'],
            },
          ],
        },
      ],
    },
    {
      id: 'stack-ch-kubernetes',
      title: 'Kubernetes et OpenShift',
      description: 'Ce qu’est réellement un pod, et pourquoi il y en a plusieurs.',
      lessons: [
        {
          id: 'stack-l-pod',
          title: 'Pod, Deployment, Service',
          summary: 'Les trois objets dont tout le reste découle.',
          minutes: 13,
          difficulty: 'difficile',
          requires: ['stack-l-docker'],
          concepts: ['kubernetes', 'deploiement'],
          blocks: [
            text(
              'Un conteneur seul sur une machine, on sait faire. Le problème commence quand il en faut plusieurs, sur plusieurs machines, qu’ils doivent se trouver entre eux, survivre à une panne et se remplacer sans coupure. C’est ce que Kubernetes automatise, et le pod en est la brique.',
            ),
            def(
              'Pod',
              'Un pod est la plus petite unité déployable de Kubernetes : un ou plusieurs conteneurs qui partagent la même adresse réseau et les mêmes volumes. Kubernetes ne déploie jamais un conteneur seul, toujours un pod, et c’est le pod entier qui est créé, déplacé ou supprimé.',
            ),
            warn(
              'Un pod n’est pas un synonyme de conteneur. Il en contient généralement un seul, mais il peut en contenir plusieurs quand ils doivent absolument vivre ensemble et partager le réseau — par exemple un conteneur applicatif et un agent qui collecte ses journaux. Ce sont ces conteneurs auxiliaires qu’on appelle des side-cars.',
            ),
            flow(
              [
                step(
                  'Conteneur',
                  'Le processus applicatif',
                  'L’application en train de tourner, issue d’une image.',
                  'Sans lui il n’y a rien à exécuter — mais Kubernetes ne le manipule jamais directement.',
                ),
                step(
                  'Pod',
                  'L’unité déployable',
                  'Enveloppe un ou plusieurs conteneurs partageant réseau et volumes. Il reçoit une adresse IP, et il est jetable par conception.',
                  'Sans pod, pas d’unité commune pour planifier, déplacer et surveiller.',
                ),
                step(
                  'Deployment',
                  'L’état souhaité',
                  'Déclare quelle image et combien d’exemplaires doivent tourner. Le contrôleur compare en continu l’état réel à cette déclaration et corrige l’écart.',
                  'Sans lui, un pod mort resterait mort et il faudrait relancer à la main.',
                ),
                step(
                  'Service',
                  'L’adresse stable',
                  'Donne un nom et une IP fixes devant un ensemble de pods, et répartit le trafic entre eux. Les pods changent d’adresse à chaque recréation, pas le service.',
                  'Sans lui, impossible d’appeler l’application : son adresse changerait à chaque redémarrage.',
                ),
                step(
                  'Ingress ou Route',
                  'L’entrée depuis l’extérieur',
                  'Expose un service au monde extérieur sur un nom de domaine, et termine généralement le TLS. « Route » est le nom OpenShift de ce rôle.',
                  'Sans elle, le service n’est joignable que depuis l’intérieur du cluster.',
                ),
              ],
              'De bas en haut',
            ),
            why(
              'Pourquoi plusieurs pods pour la même application ?',
              'Trois raisons, et elles se cumulent. La disponibilité : un pod qui meurt ou dont le nœud tombe laisse les autres répondre. La charge : le service répartit le trafic, donc doubler les pods double approximativement la capacité. Le déploiement sans coupure : le contrôleur remplace les pods un par un, si bien qu’il y a toujours des exemplaires de l’ancienne version qui servent pendant que la nouvelle démarre.',
            ),
            compare(
              ['Sonde', 'Ce qu’elle décide'],
              [
                ['Liveness', 'Le pod est-il vivant ?', 'Si elle échoue, Kubernetes tue et recrée le conteneur. À réserver aux blocages irrécupérables.'],
                ['Readiness', 'Le pod peut-il recevoir du trafic ?', 'Si elle échoue, le pod est retiré du service mais pas tué. C’est elle qui empêche d’envoyer des requêtes à une application qui démarre encore.'],
                ['Startup', 'Le démarrage est-il fini ?', 'Suspend les deux autres pendant l’initialisation, pour les applications lentes à démarrer.'],
              ],
              'Les sondes de santé',
            ),
            warn(
              'Une sonde de liveness mal réglée est pire que pas de sonde du tout. Si elle interroge un point d’entrée qui dépend de la base, une base lente fait échouer la sonde, Kubernetes tue le pod, le pod redémarre, la base reçoit une nouvelle vague de connexions — et la boucle s’auto-entretient. La liveness doit tester le processus, la readiness ses dépendances.',
            ),
            compare(
              ['Docker', 'Kubernetes'],
              [
                ['Rôle', 'Construire et exécuter des conteneurs', 'Orchestrer des conteneurs sur un ensemble de machines'],
                ['Portée', 'Une machine', 'Un cluster'],
                [
                  'Prend en charge',
                  'Images, conteneurs, volumes, réseau local',
                  'Planification, mise à l’échelle, reprise, exposition, configuration',
                ],
                [
                  'Et OpenShift ?',
                  'Sans objet : c’est un autre niveau',
                  'Une distribution de Kubernetes — même socle et mêmes objets, plus l’authentification intégrée, les Routes, la construction d’images et une console',
                ],
              ],
              'Trois niveaux, souvent confondus',
            ),
            def(
              'ConfigMap',
              'Une ConfigMap contient de la configuration non sensible sous forme de clés et de valeurs, injectée dans les pods par variables d’environnement ou par fichier monté. Elle permet de changer un paramètre sans reconstruire l’image.',
            ),
            def(
              'Secret',
              'Un Secret contient les valeurs sensibles — mots de passe, jetons, certificats — et s’injecte comme une ConfigMap. Il est séparé pour que ses accès soient restreints et son contenu jamais affiché dans les listings courants.',
            ),
            question(
              'Ton application Spring Boot tourne en trois pods. Où mets-tu la session utilisateur ?',
              'Surtout pas en mémoire du pod. Le service répartit les requêtes : le deuxième appel d’un utilisateur peut tomber sur un autre pod, qui ne connaîtra pas sa session. Il faut soit un jeton auto-porteur côté client, soit un stockage de sessions partagé comme Redis. C’est la conséquence directe du caractère jetable des pods : toute application destinée à être répliquée doit être sans état local.',
            ),
            memorize('stack-d-pod'),
            memorize('stack-d-deployment'),
            quiz('stack-q-k8s-1'),
            quiz('stack-q-k8s-2'),
            interview({
              question: 'Qu’est-ce qu’un pod, et pourquoi en avoir plusieurs ?',
              short:
                'Un pod est la plus petite unité déployable de Kubernetes : un ou plusieurs conteneurs partageant la même adresse réseau et les mêmes volumes. On en déploie plusieurs pour la disponibilité, pour répartir la charge, et pour pouvoir déployer sans coupure en les remplaçant un par un.',
              detailed:
                'Kubernetes ne manipule jamais un conteneur isolé : l’unité est le pod, qui enveloppe généralement un conteneur mais peut en réunir plusieurs quand ils doivent partager le réseau et les volumes — typiquement un agent de collecte de journaux à côté de l’application. Le pod est jetable par conception : il reçoit une adresse IP à sa création et la perd à sa disparition, ce qui impose deux choses. D’abord un Deployment, qui déclare l’état souhaité — telle image, tel nombre d’exemplaires — et dont le contrôleur corrige en permanence l’écart avec l’état réel : c’est lui qui recrée un pod mort ou replanifie ceux d’un nœud tombé. Ensuite un Service, qui donne une adresse et un nom stables devant l’ensemble des pods et répartit le trafic, puisqu’on ne peut pas appeler une IP qui change. Le nombre d’exemplaires répond à trois besoins simultanés : rester disponible malgré la perte d’un pod ou d’un nœud ; encaisser la charge, puisque le service répartit ; et déployer progressivement, le contrôleur remplaçant les pods un à un de sorte que l’ancienne version continue de servir pendant que la nouvelle démarre. Cette dernière propriété repose entièrement sur la sonde de readiness, qui empêche d’envoyer du trafic à un pod pas encore prêt. Et tout cela suppose une application sans état local : une session en mémoire serait perdue au premier redémarrage et invisible depuis les autres pods.',
              followUps: [
                [
                  'Quelle différence entre liveness et readiness ?',
                  'La liveness répond « ce processus est-il encore sain ? » : en cas d’échec le conteneur est tué et recréé. La readiness répond « peut-il recevoir du trafic ? » : en cas d’échec il est simplement retiré du service. Confondre les deux — une liveness qui teste la base — provoque des redémarrages en boucle dès que la base ralentit.',
                ],
                [
                  'Qu’est-ce qu’une mise à jour progressive ?',
                  'Le remplacement des pods par lots plutôt que d’un coup : quelques nouveaux démarrent, on attend leur readiness, puis on retire autant d’anciens, et ainsi de suite. Il n’y a donc jamais d’interruption, et un échec au démarrage arrête la progression avant que l’ancienne version n’ait disparu.',
                ],
                [
                  'Quelle différence entre Kubernetes et OpenShift ?',
                  'OpenShift est une distribution de Kubernetes : le même socle et les mêmes objets, auxquels Red Hat ajoute l’authentification et les autorisations intégrées, les Routes à la place des Ingress, la construction d’images dans le cluster, une console et des politiques de sécurité plus strictes par défaut.',
                ],
              ],
            }),
          ],
          definitions: [
            {
              id: 'stack-d-pod',
              title: 'Pod',
              text: 'Un pod est la plus petite unité que Kubernetes sait déployer : un ou plusieurs conteneurs partageant la même adresse réseau et les mêmes volumes. Il est jetable par conception, ce qui oblige l’application à ne garder aucun état local si elle doit être répliquée.',
              tags: ['kubernetes'],
            },
            {
              id: 'stack-d-deployment',
              title: 'Deployment',
              text: 'Un Deployment déclare l’état souhaité d’une application : quelle image utiliser et combien d’exemplaires doivent tourner. Son contrôleur compare en permanence cet état à la réalité et corrige l’écart, ce qui recrée automatiquement les pods disparus.',
              tags: ['kubernetes'],
            },
          ],
        },
      ],
    },
    {
      id: 'stack-ch-cicd',
      title: 'Intégration et livraison continues',
      description: 'La chaîne qui mène du commit au pod.',
      lessons: [
        {
          id: 'stack-l-cicd',
          title: 'CI, CD et Jenkins',
          summary: 'Chaque étape, et ce qu’elle empêche.',
          minutes: 11,
          difficulty: 'moyen',
          requires: ['stack-l-pod'],
          concepts: ['cicd', 'deploiement'],
          blocks: [
            def(
              'Intégration continue',
              'L’intégration continue consiste à construire et tester automatiquement chaque modification dès qu’elle est poussée. Le but est de détecter une régression en quelques minutes plutôt qu’au moment de livrer.',
            ),
            def(
              'Livraison continue',
              'La livraison continue consiste à rendre automatiquement déployable toute version ayant passé l’intégration. Le déploiement en production peut rester déclenché par une personne, mais il ne demande alors plus aucune opération manuelle.',
            ),
            techDef(
              'Pipeline',
              'Un pipeline est la suite d’étapes automatisées exécutées à chaque modification, décrite dans un fichier versionné avec le code. Chaque étape conditionne la suivante : un échec arrête la chaîne et la version n’est pas promue.',
            ),
            flow(
              [
                step(
                  'Développeur → Git',
                  'Le déclencheur',
                  'Le code est poussé sur une branche. Un crochet prévient la chaîne d’intégration.',
                  'Sans déclenchement automatique, la chaîne ne sert plus à rien : on revient aux vérifications oubliées.',
                ),
                step(
                  'Jenkins récupère et construit',
                  'La compilation',
                  'Il récupère les sources et lance la construction. Une erreur de compilation est signalée immédiatement.',
                  'Sans construction automatique, on découvre qu’une branche ne compile pas au moment de fusionner.',
                  'GitLab CI, GitHub Actions ou Azure DevOps remplissent le même rôle.',
                ),
                step(
                  'Tests',
                  'Le filet',
                  'Tests unitaires puis d’intégration. C’est la seule étape qui atteste réellement que le code fait ce qu’on croit.',
                  'Sans tests, la chaîne ne fait que produire plus vite une version non vérifiée.',
                ),
                step(
                  'Analyse de qualité',
                  'Le garde-fou',
                  'Couverture, duplication, vulnérabilités connues des dépendances. Un seuil non atteint peut bloquer la chaîne.',
                  'Sans elle, la dette et les failles de dépendances s’accumulent sans que personne ne les voie.',
                ),
                step(
                  'Construction de l’image',
                  'L’empaquetage',
                  'Le JAR validé est enveloppé dans une image étiquetée, généralement par l’empreinte du commit.',
                  'Sans image, rien de déployable dans un cluster.',
                ),
                step(
                  'Publication au registre',
                  'La mise à disposition',
                  'L’image est poussée dans le registre, d’où tous les environnements la tireront.',
                  'Sans registre, chaque environnement reconstruirait — et obtiendrait potentiellement autre chose.',
                ),
                step(
                  'Déploiement sur OpenShift',
                  'La mise à jour',
                  'Le Deployment est mis à jour avec la nouvelle étiquette, ce qui déclenche le remplacement progressif des pods.',
                  'Sans automatisation, le déploiement redevient une opération manuelle, donc irrégulière et risquée.',
                ),
                step(
                  'Pods en cours d’exécution',
                  'Le résultat',
                  'La nouvelle version sert le trafic, l’ancienne a été retirée au fur et à mesure.',
                  'C’est le bout de la chaîne — et le point où l’observabilité prend le relais.',
                ),
              ],
              'Du commit au pod',
            ),
            tip(
              'La même image traverse tous les environnements : on ne reconstruit jamais pour la production. Reconstruire signifie déployer un artefact qui n’a pas été celui testé, ce qui annule le bénéfice de toute la chaîne. On promeut une image, on ne la refabrique pas.',
            ),
            keypoints(
              [
                'Un pipeline est du code versionné, relu et modifié comme le reste.',
                'Un échec doit arrêter la chaîne : un pipeline qu’on ignore ne sert à rien.',
                'L’étiquette de l’image dérive de l’empreinte du commit, pour savoir exactement ce qui tourne.',
                'La configuration reste hors de l’image ; seule elle change d’un environnement à l’autre.',
              ],
              'Ce qui fait une chaîne utile',
            ),
            memorize('stack-d-ci'),
            quiz('stack-q-cicd-1'),
            interview({
              question: 'Décris la chaîne qui mène d’un commit à une application déployée.',
              short:
                'Le push déclenche la chaîne : récupération des sources, compilation, tests, analyse de qualité. Si tout passe, une image est construite, étiquetée avec l’empreinte du commit et poussée au registre. Le Deployment est alors mis à jour, ce qui remplace progressivement les pods par la nouvelle version.',
              detailed:
                'Le déclencheur est le push, via un crochet : c’est ce qui rend la vérification systématique plutôt que dépendante de la discipline de chacun. Suivent la compilation, qui détecte immédiatement ce qui ne construit pas, puis les tests unitaires et d’intégration, seule étape qui atteste vraiment du comportement, puis l’analyse de qualité — couverture, duplication, vulnérabilités connues des dépendances — avec des seuils qui peuvent bloquer. Si tout passe, l’artefact est empaqueté dans une image étiquetée par l’empreinte du commit, ce qui permet de savoir exactement ce qui tourne et de revenir en arrière sans ambiguïté, et poussée au registre. Le déploiement consiste alors simplement à mettre à jour le Deployment avec la nouvelle étiquette ; le contrôleur remplace les pods progressivement, en s’appuyant sur la sonde de readiness pour n’envoyer du trafic qu’aux pods prêts, ce qui évite l’interruption. Le point de méthode le plus important est qu’on ne reconstruit jamais pour la production : la même image traverse les environnements, et seule la configuration change, injectée par ConfigMap et Secret. Reconstruire reviendrait à déployer un artefact différent de celui qui a été testé, ce qui annule tout le bénéfice de la chaîne.',
              followUps: [
                [
                  'Différence entre livraison continue et déploiement continu ?',
                  'La livraison continue rend chaque version validée déployable en un clic, mais une personne décide du moment. Le déploiement continu enchaîne automatiquement jusqu’à la production, sans intervention. Le second suppose une confiance élevée dans les tests et un retour arrière rapide.',
                ],
                [
                  'Comment reviens-tu en arrière après un déploiement raté ?',
                  'En redéployant l’étiquette précédente, qui est toujours dans le registre — c’est immédiat et c’est la raison d’étiqueter par commit. Le point délicat n’est pas l’application mais la base : une migration de schéma ne se défait pas aussi simplement, d’où l’intérêt de migrations compatibles avec les deux versions.',
                ],
              ],
            }),
          ],
          definitions: [
            {
              id: 'stack-d-ci',
              title: 'Intégration continue',
              text: 'L’intégration continue consiste à construire et tester automatiquement chaque modification dès qu’elle est poussée sur le dépôt. Elle fait apparaître une régression en quelques minutes, au lieu de la laisser se découvrir au moment de livrer.',
              tags: ['cicd'],
            },
          ],
        },
      ],
    },
  ],
};
