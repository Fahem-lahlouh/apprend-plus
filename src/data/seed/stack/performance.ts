import {
  compare,
  def,
  incident,
  interview,
  keypoints,
  memorize,
  question,
  quiz,
  steps,
  text,
  tip,
  warn,
  why,
  type CourseSpec,
} from '../builders';

/**
 * Performance et diagnostic.
 *
 * C'est le cours dont la forme compte autant que le contenu : il enseigne une
 * démarche, pas une liste de remèdes. D'où l'ordre imposé — mesurer avant de
 * corriger — et les blocs `incident`, qui présentent toujours le symptôme et les
 * hypothèses avant la correction, pour qu'on n'apprenne jamais à sauter
 * directement au remède.
 */
export const performanceCourse: CourseSpec = {
  id: 'stack-c-performance',
  title: 'Diagnostiquer une application lente',
  description: 'Une méthode pour trouver où passent les secondes, et des incidents réels à démonter.',
  icon: 'target',
  level: 'avance',
  tags: ['performance', 'diagnostic', 'incident'],
  pathId: 'stack-path-performance',
  chapters: [
    {
      id: 'stack-ch-methode',
      title: 'La méthode',
      description: 'Huit étapes, et aucune ne commence par modifier le code.',
      lessons: [
        {
          id: 'stack-l-methode-perf',
          title: 'Mesurer avant de corriger',
          summary: 'Pourquoi l’intuition se trompe presque toujours.',
          minutes: 13,
          difficulty: 'difficile',
          requires: ['stack-l-grafana', 'java-l-api-lente'],
          concepts: ['performance', 'diagnostic'],
          blocks: [
            warn(
              'La faute la plus coûteuse en performance n’est pas de mal optimiser, c’est d’optimiser au mauvais endroit. On passe deux jours à réécrire une boucle qui représente 20 millisecondes sur 10 secondes, pendant que la vraie cause reste en place. Rien ne commence avant la mesure.',
            ),
            steps(
              [
                'Reproduire : un problème qu’on ne sait pas déclencher ne se vérifie pas corrigé.',
                'Mesurer : obtenir la répartition du temps, couche par couche.',
                'Identifier la couche lente : celle qui concentre le temps, pas celle qu’on soupçonne.',
                'Analyser cette couche seule : ne pas élargir avant d’avoir compris.',
                'Trouver la cause racine : la lenteur visible est souvent un symptôme.',
                'Corriger, une chose à la fois.',
                'Re-mesurer dans les mêmes conditions.',
                'Vérifier l’absence de régression ailleurs.',
              ],
              'La démarche, dans l’ordre',
            ),
            def(
              'Cause racine',
              'La cause racine est le fait dont la correction fait disparaître le problème durablement. Elle se distingue du symptôme, qui est ce qu’on observe, et de la cause immédiate, qui n’est souvent qu’un maillon intermédiaire.',
            ),
            text(
              'Prenons une requête qui répond en 10 secondes. Sans mesure, chacun propose une cause selon sa spécialité. Avec la répartition, la discussion s’arrête.',
            ),
            compare(
              ['Étape', 'Temps mesuré'],
              [
                ['Front', '100 ms', 'Rendu et préparation côté client : négligeable ici.'],
                ['Réseau', '50 ms', 'Aller-retour : rien à en tirer.'],
                ['Controller', '20 ms', 'Désérialisation et validation : sain.'],
                ['Service', '50 ms', 'La logique métier elle-même ne coûte rien.'],
                ['Base de données', '8 500 ms', 'Voilà 85 % du temps. C’est là, et nulle part ailleurs, qu’il faut chercher.'],
                ['API externe', '1 000 ms', 'Second poste, à traiter ensuite — pas en même temps.'],
              ],
              'La même requête, décomposée',
            ),
            why(
              'Pourquoi ne corriger qu’une chose à la fois ?',
              'Parce que si tu changes trois choses et que le temps descend à 2 secondes, tu ne sais pas laquelle a agi. Tu garderas peut-être deux modifications inutiles, dont l’une dégradera autre chose plus tard. Une modification, une mesure : c’est plus lent sur le moment et beaucoup plus rapide au total.',
            ),
            compare(
              ['Où chercher', 'Ce qu’on regarde'],
              [
                ['Base de données', 'Le premier suspect', 'Requêtes lentes, plan d’exécution, index manquants, N+1, verrous, volumétrie réelle.'],
                ['Appels externes', 'Le second', 'Latence par appel, nombre d’appels en série, délais d’attente absents.'],
                ['Threads et pools', 'Le goulot invisible', 'Pool de connexions saturé, threads en attente : tout devient lent d’un coup, sans qu’aucun composant ne le soit.'],
                ['JVM', 'Rarement en cause seul', 'Pauses du ramasse-miettes, tas saturé. Souvent conséquence d’un problème en amont.'],
                ['Processeur et mémoire', 'À vérifier, pas à accuser', 'Saturation du pod, limites atteintes, étranglement.'],
                ['Cache', 'À mesurer', 'Taux de succès réel. Un cache à 5 % de succès ne sert à rien.'],
                ['Code', 'En dernier', 'Boucles imbriquées, complexité, sérialisation de gros volumes.'],
              ],
              'La liste de contrôle, par ordre de probabilité',
            ),
            warn(
              'N’enseigne jamais à toi-même le raccourci « c’est lent, ajoute du cache ». Un cache posé sur une requête non corrigée masque le problème et le fait réapparaître au pire moment : au redémarrage, après un déploiement, ou quand la charge est maximale. Mesure, identifie, corrige, re-mesure.',
            ),
            question(
              'Les métriques montrent que la base prend 8,5 secondes. Quelle est ta première action ?',
              'Pas d’ajouter un index — on ne sait pas encore lequel, ni si c’est le problème. La première action est de savoir **quelles** requêtes sont lentes et combien il y en a. Activer la journalisation du SQL ou consulter les requêtes lentes de la base répond à la seule question qui compte à ce stade : est-ce une requête lente, ou mille requêtes rapides ? Les deux donnent 8,5 secondes et n’ont rien à voir. Une requête lente oriente vers le plan d’exécution et les index ; mille requêtes rapides, c’est un N+1, et aucun index ne le corrigera.',
            ),
            memorize('stack-d-cause-racine'),
            quiz('stack-q-perf-1'),
            quiz('stack-q-perf-2'),
            interview({
              question: 'Comment analyses-tu une application lente ?',
              short:
                'Je commence par reproduire, puis par mesurer la répartition du temps entre les couches : front, réseau, contrôleur, service, base, appels externes. Je ne touche à rien avant de savoir où sont les secondes. Ensuite j’analyse la couche qui concentre le temps, je corrige une chose, et je re-mesure dans les mêmes conditions.',
              detailed:
                'Le principe est de refuser d’agir sur une hypothèse. Je reproduis d’abord, sinon je ne pourrai pas vérifier la correction. Je mesure ensuite, et la mesure qui compte est la répartition : si une requête prend dix secondes, je veux savoir combien passent dans la base, combien dans les appels externes, combien dans le code. Les traces donnent ce découpage directement ; à défaut on l’obtient par journalisation minutée aux frontières. Dans mon expérience et de façon assez constante, le temps est dans la base ou dans un appel externe, presque jamais dans le code Java — ce qui est l’inverse de ce que l’intuition suggère. Une fois la couche identifiée, je l’analyse seule. Sur la base, la première question est le nombre de requêtes, pas leur durée : une requête à huit secondes et mille requêtes à huit millisecondes donnent le même total et appellent des corrections opposées — plan d’exécution et index dans un cas, suppression d’un N+1 dans l’autre. Sur les appels externes, je regarde s’ils sont en série alors qu’ils pourraient être parallèles, et surtout s’ils ont un délai d’attente : sans délai, la lenteur d’une dépendance immobilise les threads et devient une panne chez moi. Je corrige ensuite une seule chose à la fois, sinon je ne saurai pas ce qui a agi, et je re-mesure dans les mêmes conditions. Enfin je vérifie l’absence de régression ailleurs : un index accélère les lectures et ralentit les écritures, une requête réécrite peut changer un comportement. Le cache, s’il a un sens, vient à la fin — jamais à la place d’une correction.',
              followUps: [
                [
                  'Et si tu ne peux pas reproduire ?',
                  'Alors la production est mon environnement d’observation : je m’appuie sur les traces et les métriques pour isoler les cas lents et chercher ce qu’ils ont en commun — un client, un volume, un endpoint, une plage horaire. Souvent le facteur commun est une donnée particulière, un compte avec dix mille lignes là où les autres en ont dix.',
                ],
                [
                  'Pourquoi regarder les centiles plutôt que la moyenne ?',
                  'Parce que la moyenne dilue les cas extrêmes, et ce sont eux dont les utilisateurs se plaignent. Une moyenne à 200 ms est compatible avec 5 % des requêtes à 8 secondes. Le 95e et le 99e centile montrent ce que vivent réellement les plus mal servis.',
                ],
                [
                  'Quand l’optimisation est-elle terminée ?',
                  'Quand l’objectif chiffré fixé au départ est atteint et vérifié par une nouvelle mesure. Sans objectif, on optimise indéfiniment, et chaque optimisation supplémentaire coûte plus cher en complexité qu’elle ne rapporte.',
                ],
              ],
            }),
          ],
          definitions: [
            {
              id: 'stack-d-cause-racine',
              title: 'Cause racine',
              text: 'La cause racine est le fait dont la correction fait disparaître durablement le problème, par opposition au symptôme qui n’en est que la manifestation visible. La chercher évite de corriger un maillon intermédiaire et de voir le problème réapparaître ailleurs.',
              tags: ['performance', 'diagnostic'],
            },
          ],
        },
      ],
    },
    {
      id: 'stack-ch-incidents',
      title: 'Diagnostic d’incidents',
      description: 'Des cas réels, du symptôme à la validation.',
      lessons: [
        {
          id: 'stack-l-incidents-app',
          title: 'Incidents applicatifs',
          summary: 'NullPointerException, 500 en production seulement, lenteur soudaine.',
          minutes: 14,
          difficulty: 'difficile',
          requires: ['stack-l-methode-perf', 'stack-l-elk'],
          concepts: ['diagnostic'],
          blocks: [
            text(
              'Chaque incident se lit dans le même ordre : le symptôme observé, où regarder, ce qu’il faut récupérer, les hypothèses et comment trancher chacune. La correction n’arrive qu’après — et se valide.',
            ),
            incident({
              symptom: 'Une NullPointerException remonte en production sur un endpoint qui fonctionnait hier.',
              where: [
                'Les journaux centralisés, filtrés sur l’identifiant de corrélation de la requête en échec.',
                'La pile d’appels complète : classe, méthode, ligne.',
                'L’historique des déploiements : qu’est-ce qui a changé depuis hier ?',
              ],
              collect: [
                'L’horodatage exact et l’identifiant de trace d’une occurrence.',
                'Les paramètres de la requête qui échoue, et une requête équivalente qui passe.',
                'Le nombre d’occurrences et leur début — toutes les requêtes, ou certaines seulement ?',
                'La version déployée au moment de la première occurrence.',
              ],
              hypotheses: [
                [
                  'Une donnée devenue nulle en base alors que le code la suppose présente.',
                  'Comparer les enregistrements en échec et ceux qui passent sur le champ cité par la pile. Si le champ est nul pour les premiers, c’est trouvé.',
                ],
                [
                  'Un appel externe qui renvoie désormais un corps vide ou partiel.',
                  'Chercher dans les journaux la réponse reçue du service en amont, ou regarder si son taux d’erreur a changé sur la même période.',
                ],
                [
                  'Une régression introduite par le dernier déploiement.',
                  'Vérifier si la première occurrence coïncide avec l’horodatage du déploiement, puis relire le diff du chemin concerné.',
                ],
                [
                  'Une configuration absente dans cet environnement seulement.',
                  'Comparer la ConfigMap de production avec celle de recette sur les clés utilisées par ce code.',
                ],
              ],
              fix: 'Corriger à la source plutôt qu’au point de crash : si la donnée peut légitimement être absente, le modèle doit l’exprimer — Optional, valeur par défaut, validation au moment de l’entrée. Si elle ne devrait jamais l’être, la rejeter tôt avec un message explicite plutôt que de la laisser traverser trois couches. Ajouter un test reproduisant le cas exact.',
              validate: 'Rejouer la requête qui échouait avec les mêmes paramètres, vérifier que le taux d’erreur de l’endpoint revient à son niveau d’avant, et confirmer sur 24 heures qu’aucune nouvelle occurrence n’apparaît.',
            }),
            incident({
              symptom: 'Une API renvoie HTTP 500 uniquement en production ; en recette tout fonctionne.',
              where: [
                'Ce qui diffère entre les deux environnements — c’est là que se trouve la réponse par définition.',
                'Les variables d’environnement, ConfigMap et Secret effectivement montés dans le pod.',
                'Les journaux au démarrage : une configuration automatique absente s’y voit.',
                'Les droits réseau : la production est souvent plus cloisonnée.',
              ],
              collect: [
                'La pile d’appels complète de l’erreur 500, pas seulement le message renvoyé au client.',
                'La différence de configuration entre les deux environnements, clé par clé.',
                'Le volume de données réel en production comparé à celui de recette.',
                'La version de l’image déployée dans chaque environnement — sont-elles identiques ?',
              ],
              hypotheses: [
                [
                  'Une configuration ou un secret manquant ou différent.',
                  'Comparer les valeurs effectivement injectées dans le pod, pas les fichiers du dépôt : c’est souvent là que l’écart se cache.',
                ],
                [
                  'Un volume de données qui fait dépasser un délai d’attente ou saturer la mémoire.',
                  'Comparer le nombre de lignes traitées, et vérifier si l’erreur ne touche que les comptes volumineux.',
                ],
                [
                  'Un droit réseau ou une règle de pare-feu absente vers une dépendance.',
                  'Tester la connexion depuis le pod lui-même vers l’hôte et le port visés.',
                ],
                [
                  'Une image différente de celle testée, parce qu’elle a été reconstruite pour la production.',
                  'Comparer les empreintes des images déployées. Si elles diffèrent, la cause est là et le processus de livraison est à corriger aussi.',
                ],
              ],
              fix: 'Aligner ce qui doit l’être : compléter la configuration manquante, ouvrir le flux réseau, ou corriger le code si c’est le volume qui révèle un défaut — pagination, traitement par lots, délai d’attente adapté. Si l’image diffère, rétablir la promotion d’une image unique à travers les environnements.',
              validate: 'Reproduire en recette la condition qui manquait — même volume, même configuration — pour que l’écart ne puisse plus se cacher, puis vérifier l’endpoint en production et surveiller le taux d’erreur.',
            }),
            incident({
              symptom: 'Une API qui répondait en 200 ms met désormais 12 secondes.',
              where: [
                'Les traces : la répartition du temps par étape répond en une minute à la question « où ? ».',
                'Les requêtes lentes de la base de données.',
                'La latence des dépendances externes sur la même période.',
                'Les métriques de saturation : pool de connexions, threads, mémoire.',
              ],
              collect: [
                'La date exacte de la bascule, et ce qui s’est produit à ce moment — déploiement, montée de charge, changement chez une dépendance.',
                'La répartition du temps sur une requête lente représentative.',
                'Le nombre de requêtes SQL émises pour un seul appel.',
                'Le taux de succès du cache, si un cache existe.',
              ],
              hypotheses: [
                [
                  'Un N+1 introduit ou révélé par la croissance des données.',
                  'Compter les requêtes SQL pour un appel : une requête suivie de N requêtes identiques à un identifiant près est le signe caractéristique.',
                ],
                [
                  'Un index devenu insuffisant à mesure que la table grandit.',
                  'Lire le plan d’exécution de la requête lente et chercher un parcours complet de table.',
                ],
                [
                  'Une dépendance externe devenue lente, sans délai d’attente côté appelant.',
                  'Comparer la latence de cet appel avant et après. Si elle a monté, le problème est chez elle — mais l’absence de délai est un problème chez nous.',
                ],
                [
                  'Un pool de connexions saturé.',
                  'Regarder le temps d’attente d’obtention d’une connexion : s’il est élevé alors que les requêtes sont rapides, le goulot est le pool, pas la base.',
                ],
                [
                  'Des pauses du ramasse-miettes qui s’allongent.',
                  'Corréler les pics de latence avec les pauses. Si elles coïncident, remonter à la cause d’allocation ou de rétention plutôt que de régler le ramasse-miettes.',
                ],
              ],
              fix: 'Corriger la cause identifiée, une seule à la fois : jointure explicite pour le N+1, index adapté au filtre réel, délai d’attente et disjoncteur sur l’appel externe, dimensionnement du pool ou raccourcissement des transactions qui le retiennent.',
              validate: 'Re-mesurer la même requête dans les mêmes conditions, vérifier que le 95e centile redescend et non seulement la moyenne, et contrôler qu’aucune autre route ne s’est dégradée — un index accélère les lectures et ralentit les écritures.',
            }),
            tip(
              'Dans les trois cas, la première question n’est jamais « qu’est-ce que je change ? » mais « qu’est-ce qui a changé ? ». Un système qui fonctionnait et ne fonctionne plus a subi une modification : un déploiement, un volume, une dépendance, une configuration. Trouver quoi est presque toujours plus rapide que raisonner à partir du code.',
            ),
            quiz('stack-q-incident-1'),
          ],
        },
        {
          id: 'stack-l-incidents-infra',
          title: 'Incidents d’infrastructure',
          summary: 'Pod qui redémarre, mémoire qui monte, processeur à 100 %.',
          minutes: 13,
          difficulty: 'difficile',
          requires: ['stack-l-incidents-app', 'stack-l-gc'],
          concepts: ['diagnostic', 'kubernetes'],
          blocks: [
            incident({
              symptom: 'Un pod redémarre toutes les cinq minutes.',
              where: [
                'Le motif du dernier arrêt : OOMKilled, échec de sonde, ou code de sortie applicatif — les trois mènent ailleurs.',
                'Les journaux du conteneur **précédent**, pas seulement du courant.',
                'La configuration des sondes de liveness et readiness.',
                'Les limites de mémoire et de processeur du conteneur.',
              ],
              collect: [
                'Le nombre de redémarrages et le motif exact de l’arrêt.',
                'La consommation mémoire juste avant l’arrêt, comparée à la limite.',
                'Le point d’accès interrogé par la sonde de liveness et ce qu’il teste réellement.',
                'Le temps de démarrage de l’application comparé au délai initial de la sonde.',
              ],
              hypotheses: [
                [
                  'Le conteneur dépasse sa limite mémoire et est tué par le système.',
                  'Le motif d’arrêt indique OOMKilled. Comparer la limite du conteneur et le tas maximal de la JVM : si la JVM peut allouer autant que la limite du conteneur, elle sera tuée avant de déclencher un ramassage complet.',
                ],
                [
                  'La sonde de liveness échoue alors que l’application est saine.',
                  'Interroger le point d’accès manuellement depuis le pod. Si la sonde teste la base et que celle-ci est lente, elle échoue sans que l’application soit en cause — et le redémarrage aggrave tout.',
                ],
                [
                  'L’application démarre plus lentement que le délai accordé.',
                  'Comparer le temps de démarrage réel au délai initial de la sonde. Le symptôme typique est un redémarrage à intervalle très régulier, avant même que l’application ne serve du trafic.',
                ],
                [
                  'Une fuite mémoire qui remplit le tas en quelques minutes.',
                  'Regarder la courbe du tas après chaque ramassage complet : si le plancher monte à chaque cycle, c’est une rétention, pas une charge.',
                ],
              ],
              fix: 'Selon la cause : ajuster la limite mémoire du conteneur **et** le tas maximal de la JVM pour qu’il reste en dessous ; faire tester à la liveness le processus et non ses dépendances, en déplaçant la vérification des dépendances vers la readiness ; ajouter une sonde de startup si le démarrage est long ; corriger la rétention si c’est une fuite.',
              validate: 'Vérifier que le compteur de redémarrages n’augmente plus sur plusieurs heures, que la mémoire se stabilise après chaque ramassage, et que le pod reste prêt sous charge normale.',
            }),
            incident({
              symptom: 'La mémoire du pod augmente continuellement jusqu’à l’OutOfMemoryError.',
              where: [
                'La courbe du tas **après** ramassage complet, pas la mémoire instantanée.',
                'Un cliché du tas pris avant la saturation.',
                'Le code des caches, collections statiques et écouteurs enregistrés.',
              ],
              collect: [
                'La forme de la courbe : le plancher après collecte monte-t-il, ou redescend-il toujours au même niveau ?',
                'Le délai entre le démarrage et la saturation, et s’il varie avec la charge.',
                'Les dix classes retenant le plus de mémoire dans le cliché, et par quelle chaîne de références.',
              ],
              hypotheses: [
                [
                  'Un cache maison sans taille maximale ni expiration.',
                  'Dans le cliché du tas, chercher une Map dont le nombre d’entrées croît avec le temps de fonctionnement. C’est la cause la plus fréquente de loin.',
                ],
                [
                  'Des écouteurs ou abonnements enregistrés et jamais retirés.',
                  'Compter les instances de la classe d’écouteur : si elle croît alors qu’on en attend un nombre fixe, c’est trouvé.',
                ],
                [
                  'Une ThreadLocal non nettoyée sur un pool qui recycle ses threads.',
                  'Chercher les valeurs retenues par les threads du pool dans le cliché : elles survivent à la requête puisque le thread, lui, est réutilisé.',
                ],
                [
                  'Une charge simplement supérieure à la mémoire allouée, sans fuite.',
                  'Si le plancher après collecte est stable et que seul le pic monte, il n’y a pas de fuite : c’est un dimensionnement.',
                ],
              ],
              fix: 'Supprimer la rétention à sa source : borner le cache en taille et en durée, désinscrire les écouteurs, nettoyer les ThreadLocal en fin de traitement. Augmenter la mémoire ne corrige rien s’il y a fuite — cela ne fait que reculer l’échéance.',
              validate: 'Laisser tourner sous charge représentative et vérifier que le tas après ramassage complet revient au même plancher pendant plusieurs heures. C’est la seule preuve qu’il n’y a plus de rétention.',
            }),
            incident({
              symptom: 'Le processeur du pod monte à 100 % et la latence explose.',
              where: [
                'Un échantillonnage des piles d’appels pendant l’épisode : c’est ce qui nomme la méthode responsable.',
                'Les métriques de ramassage de miettes : un tas saturé consomme du processeur en collectes répétées.',
                'Le trafic entrant : est-ce une charge réelle ou un comportement anormal ?',
                'Les limites de processeur du conteneur et l’étranglement éventuel.',
              ],
              collect: [
                'Quel thread consomme : applicatif, ramasse-miettes, ou un pool particulier.',
                'La corrélation avec le trafic : la montée suit-elle les requêtes, ou est-elle indépendante ?',
                'La date de début et le déploiement le plus proche.',
                'La limite de processeur configurée et le temps passé en étranglement.',
              ],
              hypotheses: [
                [
                  'Une boucle coûteuse ou un algorithme dont le coût croît avec le volume.',
                  'L’échantillonnage des piles montre la méthode dominante. Une complexité quadratique se trahit par une montée bien plus rapide que le volume.',
                ],
                [
                  'Le ramasse-miettes tourne en permanence faute de mémoire libre.',
                  'Si le temps passé en collecte dépasse quelques pour cent, le processeur est consommé par la mémoire : le vrai problème est la rétention, pas le calcul.',
                ],
                [
                  'La limite de processeur du conteneur est trop basse et provoque un étranglement.',
                  'Regarder le temps d’étranglement : s’il est élevé alors que l’usage plafonne pile à la limite, c’est un dimensionnement, pas un emballement.',
                ],
                [
                  'Une sérialisation ou une compression sur des réponses devenues énormes.',
                  'Corréler avec la taille des réponses. Une liste non paginée qui a grandi produit exactement ce profil.',
                ],
              ],
              fix: 'Corriger ce que l’échantillonnage désigne : algorithme, sérialisation, taille des réponses. Si c’est le ramasse-miettes, remonter à la cause mémoire. Si c’est l’étranglement, ajuster la limite — mais seulement après avoir vérifié qu’il n’y a pas d’emballement en amont.',
              validate: 'Re-mesurer l’usage processeur et la latence sous le même trafic, vérifier que le temps d’étranglement revient à zéro et que le 99e centile redescend.',
            }),
            warn(
              'Augmenter les ressources est parfois la bonne réponse, mais c’est toujours la mauvaise **première** réponse. Ajouter de la mémoire à une fuite, du processeur à un algorithme quadratique ou des pods à une base saturée ne fait que déplacer l’échéance — en la rendant plus coûteuse.',
            ),
            keypoints(
              [
                'Toujours commencer par « qu’est-ce qui a changé ? ».',
                'Lire le motif de l’arrêt avant les journaux : il oriente immédiatement.',
                'Le tas après collecte distingue une fuite d’une simple charge.',
                'Une liveness qui teste les dépendances transforme une lenteur en boucle de redémarrages.',
                'Une correction sans nouvelle mesure n’est pas une correction, c’est une supposition.',
              ],
              'Les réflexes',
            ),
            quiz('stack-q-incident-2'),
            interview({
              question: 'Un pod redémarre en boucle. Comment procèdes-tu ?',
              short:
                'Je regarde d’abord le motif du dernier arrêt : OOMKilled, échec de sonde ou sortie applicative mènent à trois enquêtes différentes. Puis je lis les journaux du conteneur précédent, pas du courant. Ensuite je compare la mémoire avant l’arrêt à la limite, et je vérifie ce que teste réellement la sonde de liveness.',
              detailed:
                'Le motif d’arrêt est l’information qui fait gagner le plus de temps, et on l’oublie souvent pour aller lire les journaux. S’il indique OOMKilled, le conteneur a dépassé sa limite mémoire : la cause classique est une JVM autorisée à allouer autant que la limite du conteneur, si bien que le système la tue avant qu’un ramassage complet n’ait pu libérer — le tas maximal doit rester nettement sous la limite. S’il s’agit d’un échec de liveness, la question devient ce que cette sonde teste : si elle interroge un point d’accès qui vérifie la base, une base lente fait échouer la sonde, Kubernetes tue le pod, le pod redémarre et rouvre ses connexions, ce qui aggrave la charge sur la base — la boucle s’auto-entretient. La liveness doit tester que le processus répond, la readiness que les dépendances sont disponibles : la première tue, la seconde retire simplement du trafic. Un troisième cas très courant est le démarrage plus lent que le délai accordé, reconnaissable à des redémarrages parfaitement réguliers avant tout trafic servi ; la sonde de startup est faite pour ça. Il faut par ailleurs toujours lire les journaux du conteneur précédent, puisque le courant vient de démarrer et ne contient rien d’utile. Enfin, si c’est bien la mémoire, je distingue fuite et dimensionnement en regardant le tas après ramassage complet : un plancher qui monte à chaque cycle est une rétention, et augmenter la limite ne ferait que repousser l’échéance.',
              followUps: [
                [
                  'Pourquoi le tas maximal doit-il être inférieur à la limite du conteneur ?',
                  'Parce que la JVM consomme de la mémoire hors du tas : métaespace, piles de threads, tampons hors tas, code compilé par le JIT. Si le tas maximal égale la limite, ce hors-tas fait dépasser et le conteneur est tué sans qu’aucune erreur Java n’apparaisse — ce qui rend le diagnostic très déroutant.',
                ],
                [
                  'Comment évites-tu qu’une dépendance lente provoque ces redémarrages ?',
                  'En séparant strictement les sondes, en mettant des délais d’attente sur tous les appels sortants, et en ajoutant un disjoncteur pour cesser d’appeler une dépendance en échec plutôt que d’accumuler des threads en attente.',
                ],
              ],
            }),
          ],
        },
      ],
    },
  ],
};
