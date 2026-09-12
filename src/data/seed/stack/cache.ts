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
  steps,
  techDef,
  text,
  warn,
  type CourseSpec,
} from '../builders';

/**
 * Redis et les stratégies de cache.
 *
 * Le piège de ce sujet est d'en faire une recette : « c'est lent, mets du
 * cache ». Le cours insiste donc autant sur les problèmes créés par un cache
 * que sur le gain qu'il apporte, et rappelle qu'il vient après les corrections,
 * jamais à leur place.
 */
export const cacheCourse: CourseSpec = {
  id: 'stack-c-cache',
  title: 'Redis et stratégies de cache',
  description: 'Stockage en mémoire, durée de vie, cache-aside, invalidation et les pièges classiques.',
  icon: 'database',
  level: 'avance',
  tags: ['redis', 'cache', 'performance'],
  pathId: 'stack-path-donnees',
  chapters: [
    {
      id: 'stack-ch-redis',
      title: 'Redis',
      description: 'Ce que c’est réellement, au-delà du mot « cache ».',
      lessons: [
        {
          id: 'stack-l-redis',
          title: 'Redis n’est pas qu’un cache',
          summary: 'Un stockage en mémoire, souvent utilisé comme cache.',
          minutes: 10,
          difficulty: 'moyen',
          requires: ['java-l-cache'],
          concepts: ['cache', 'redis'],
          blocks: [
            def(
              'Redis',
              'Redis est un système de stockage de données en mémoire, organisé par clés associées à des valeurs. Sa rapidité vient du fait que les données vivent en mémoire vive plutôt que sur disque, ce qui en fait un bon cache — mais il sert aussi à d’autres usages.',
            ),
            warn(
              'Réduire Redis à « un cache » est la réponse qui plafonne un entretien. Redis est un stockage clé-valeur en mémoire ; le cache est son usage le plus répandu, pas sa définition. Il sert aussi de compteur atomique, de file légère, de verrou distribué, de stockage de sessions, de classement trié, et il sait publier des messages.',
            ),
            techDef(
              'Structures de données',
              'Redis ne stocke pas que des chaînes : il connaît les listes, les ensembles, les ensembles triés, les tables de hachage et les flux. Les opérations sur ces structures sont atomiques, ce qui permet de construire compteurs, verrous et classements sans transaction applicative.',
            ),
            compare(
              ['Base relationnelle', 'Redis'],
              [
                ['Données', 'Sur disque, en tables', 'En mémoire, par clés'],
                ['Interrogation', 'SQL, jointures, filtres', 'Accès par clé, pas de jointure'],
                ['Vitesse', 'Millisecondes', 'Fraction de milliseconde'],
                ['Volume', 'Limité par le disque', 'Limité par la mémoire, donc plus coûteux'],
                ['Rôle', 'Source de vérité', 'Copie accélérée, ou données volatiles'],
              ],
            ),
            def(
              'Durée de vie',
              'La durée de vie est le délai au bout duquel une clé disparaît automatiquement. C’est le mécanisme d’expiration le plus simple : plutôt que de décider quand supprimer une donnée périmée, on accepte qu’elle le soit pendant un temps borné.',
            ),
            memorize('stack-d-redis'),
            memorize('stack-d-ttl'),
            quiz('stack-q-redis-1'),
          ],
          definitions: [
            {
              id: 'stack-d-redis',
              title: 'Redis',
              text: 'Redis est un système de stockage de données en mémoire organisé par clés et valeurs, ce qui rend ses lectures extrêmement rapides. Il sert souvent de cache, mais aussi de compteur, de verrou distribué, de stockage de sessions ou de file légère.',
              tags: ['redis', 'cache'],
            },
            {
              id: 'stack-d-ttl',
              title: 'Durée de vie',
              text: 'La durée de vie est le délai au terme duquel une entrée du cache est automatiquement supprimée. Elle borne le temps pendant lequel une donnée peut être périmée, ce qui évite d’avoir à décider explicitement du moment de son retrait.',
              tags: ['cache'],
            },
          ],
        },
        {
          id: 'stack-l-cache-aside',
          title: 'Le motif cache-aside',
          summary: 'Le trajet d’une lecture, avec et sans cache.',
          minutes: 11,
          difficulty: 'moyen',
          requires: ['stack-l-redis'],
          concepts: ['cache'],
          blocks: [
            def(
              'Succès de cache',
              'Il y a succès de cache quand la donnée demandée se trouve déjà dans le cache. La réponse est alors servie sans solliciter la base, ce qui économise à la fois du temps et de la charge.',
            ),
            def(
              'Défaut de cache',
              'Il y a défaut de cache quand la donnée demandée n’est pas présente. Il faut alors la chercher à la source, la renvoyer, et généralement la déposer dans le cache pour les demandes suivantes.',
            ),
            flow(
              [
                step(
                  'Client → API',
                  'La demande arrive',
                  'Le service a besoin d’une donnée identifiée par une clé.',
                  'Point de départ de la lecture.',
                ),
                step(
                  'Le service interroge Redis',
                  'La première question',
                  'Il demande la clé au cache. C’est une opération très rapide, mais pas gratuite : c’est un aller-retour réseau.',
                  'Sans cache, on irait directement en base à chaque fois.',
                ),
                step(
                  'Succès : la valeur est là',
                  'Chemin court',
                  'La valeur est renvoyée immédiatement. La base n’est pas sollicitée du tout.',
                  'C’est le gain recherché — il n’existe que si le taux de succès est élevé.',
                ),
                step(
                  'Défaut : la valeur est absente',
                  'Chemin long',
                  'Le service interroge la base, obtient la donnée, l’écrit dans Redis avec une durée de vie, puis la renvoie.',
                  'Si ce chemin est lent, le cache ne le corrige pas : il ne fait que le rendre plus rare.',
                ),
                step(
                  'Écriture des données',
                  'Le moment délicat',
                  'Quand la donnée change en base, l’entrée du cache devient fausse. Il faut la supprimer ou la mettre à jour.',
                  'Sans invalidation, on sert des données périmées — le défaut le plus courant et le plus sournois.',
                ),
              ],
              'Cache-aside : le service gère le cache',
            ),
            badGood({
              language: 'java',
              title: 'Invalider au bon endroit',
              bad: `public Produit modifier(Long id, MajRequest maj) {
    Produit p = repository.save(appliquer(id, maj));
    return p;   // le cache garde l'ancienne version
}`,
              good: `@CacheEvict(value = "produits", key = "#id")
public Produit modifier(Long id, MajRequest maj) {
    return repository.save(appliquer(id, maj));
}`,
              why: 'Sans invalidation, la modification est bien écrite en base mais les lectures continuent de servir l’ancienne valeur jusqu’à l’expiration. Le symptôme est déroutant : « j’ai modifié, ça ne change pas, et une heure après si ». Toute écriture doit dire ce qu’elle rend périmé dans le cache.',
            }),
            steps(
              [
                'Chercher la clé dans le cache.',
                'Si elle y est, renvoyer la valeur : c’est fini.',
                'Sinon, lire à la source.',
                'Écrire le résultat dans le cache avec une durée de vie explicite.',
                'Renvoyer la valeur.',
                'À chaque écriture de la donnée, supprimer ou remplacer l’entrée correspondante.',
              ],
              'Le motif cache-aside, en six temps',
            ),
            memorize('stack-d-cache-aside'),
            quiz('stack-q-cache-1'),
          ],
          definitions: [
            {
              id: 'stack-d-cache-aside',
              title: 'Cache-aside',
              text: 'Le motif cache-aside laisse l’application interroger le cache d’abord, puis la source seulement en cas d’absence, et y déposer le résultat pour les demandes suivantes. C’est elle qui reste responsable d’invalider l’entrée dès que la donnée change à la source.',
              tags: ['cache'],
            },
          ],
        },
        {
          id: 'stack-l-pieges-cache',
          title: 'Les problèmes qu’un cache crée',
          summary: 'Données périmées, invalidation, ruée, et cache inutile.',
          minutes: 12,
          difficulty: 'difficile',
          requires: ['stack-l-cache-aside'],
          concepts: ['cache', 'performance'],
          blocks: [
            text(
              'Un cache ajoute une copie de la vérité. Toute copie peut diverger, expirer au mauvais moment, ou être reconstruite par tout le monde en même temps. Ces problèmes ne sont pas des accidents : ils sont la contrepartie du gain.',
            ),
            def(
              'Donnée périmée',
              'Une donnée est périmée lorsqu’elle a changé à la source mais que le cache sert encore l’ancienne version. C’est la conséquence directe de toute mise en cache, et la seule question est de savoir combien de temps on l’accepte.',
            ),
            def(
              'Ruée sur le cache',
              'Une ruée se produit quand une entrée très demandée expire et que toutes les requêtes simultanées partent reconstruire la même valeur à la source. La base reçoit alors d’un coup la charge que le cache absorbait.',
            ),
            compare(
              ['Problème', 'Ce qui le déclenche'],
              [
                ['Données périmées', 'Écriture sans invalidation', 'La donnée change en base, l’entrée reste. Symptôme : « ça se met à jour une heure après ».'],
                ['Ruée sur le cache', 'Expiration simultanée d’une clé très lue', 'Mille requêtes reconstruisent la même valeur en même temps ; la base sature d’un coup.'],
                ['Vidage à froid', 'Redémarrage ou vidage du cache', 'Tout repart en défaut au même instant : la charge réelle apparaît brutalement, souvent en pleine journée.'],
                ['Cache inutile', 'Mise en cache de ce qui change tout le temps', 'Le taux de succès reste bas : on paie l’aller-retour Redis sans jamais économiser la base.'],
                ['Cache incohérent', 'Plusieurs instances avec un cache local', 'Chacune a sa version ; l’utilisateur voit des réponses différentes selon le pod qui répond.'],
              ],
              'Les cinq pièges classiques',
            ),
            steps(
              [
                'Ajouter un écart aléatoire aux durées de vie, pour que les clés n’expirent pas toutes en même temps.',
                'Reconstruire sous verrou : une seule requête recalcule, les autres attendent ou servent l’ancienne valeur.',
                'Rafraîchir en arrière-plan avant l’expiration, pour les clés chaudes connues.',
                'Préchauffer les clés critiques après un déploiement, plutôt que de subir le vidage à froid.',
              ],
              'Comment limiter la ruée',
            ),
            warn(
              'Ne mets jamais en cache pour compenser une requête lente que tu n’as pas corrigée. Le défaut de cache restera aussi lent, et il surviendra précisément au pire moment : au redémarrage, après un déploiement, ou quand la charge est la plus forte. Corrige d’abord, mets en cache ensuite.',
            ),
            question(
              'Quelles données sont de bons candidats au cache ?',
              'Celles qui réunissent trois critères : coûteuses à produire, lues souvent, et modifiées rarement. Un catalogue de produits, un référentiel de taux, le résultat d’un calcul lourd. À l’inverse, mettre en cache le solde d’un compte est douteux — il change souvent et une valeur périmée y est visible immédiatement. Et mettre en cache ce qui est lu une seule fois ne fait qu’ajouter un aller-retour réseau.',
            ),
            keypoints(
              [
                'Un cache utile suppose un taux de succès élevé : mesure-le, ne le suppose pas.',
                'Toute écriture doit dire ce qu’elle invalide.',
                'Une durée de vie explicite vaut mieux qu’une invalidation parfaite mais oubliée quelque part.',
                'Un cache local par instance devient incohérent dès qu’il y a plusieurs pods.',
                'Le cache ne répare rien : il rend plus rare ce qui est lent.',
              ],
              'À retenir',
            ),
            memorize('stack-d-stampede'),
            quiz('stack-q-cache-2'),
            interview({
              question: 'Quels problèmes un cache introduit-il ?',
              short:
                'Il ajoute une copie de la vérité, donc la possibilité qu’elle diverge. Les trois problèmes principaux sont les données périmées quand l’invalidation est oubliée, la ruée quand une clé très lue expire et que tout le monde reconstruit en même temps, et le cache inutile quand la donnée change trop souvent pour que le taux de succès soit intéressant.',
              detailed:
                'Le premier est l’obsolescence. Dès qu’une donnée est copiée, elle peut diverger de la source ; la vraie question n’est pas de l’éviter mais de décider combien de temps on l’accepte, et de s’y tenir. En pratique on combine une durée de vie explicite, qui borne le pire cas, et une invalidation à l’écriture, qui raccourcit le délai courant. Se reposer uniquement sur l’invalidation est fragile : il suffit d’un chemin d’écriture oublié — un batch, une correction manuelle, un autre service — pour servir une valeur fausse indéfiniment. Le deuxième est la ruée : une clé très demandée expire, et toutes les requêtes en cours partent reconstruire la même valeur simultanément ; la base encaisse d’un coup la charge que le cache absorbait. On l’atténue en ajoutant un écart aléatoire aux durées de vie, en reconstruisant sous verrou pour qu’une seule requête recalcule, ou en rafraîchissant en arrière-plan les clés chaudes. Le même effet, en plus brutal, survient au vidage à froid après un redémarrage. Le troisième est le cache qui ne sert à rien : si la donnée change à chaque écriture ou n’est lue qu’une fois, on paie un aller-retour réseau sans jamais économiser la base — d’où l’importance de mesurer le taux de succès plutôt que de le supposer. Enfin, un cache local par instance devient incohérent dès qu’il y a plusieurs pods : l’utilisateur voit des réponses différentes selon celui qui répond, ce qui est précisément l’argument pour un cache partagé comme Redis.',
              followUps: [
                [
                  'Comment choisis-tu la durée de vie ?',
                  'À partir de la tolérance métier : combien de temps une valeur fausse est-elle acceptable ici ? Un catalogue supporte une heure, un solde de compte quelques secondes au mieux. C’est une décision métier, pas technique.',
                ],
                [
                  'Cache local ou cache distribué ?',
                  'Le local est le plus rapide, sans réseau, mais il est propre à chaque instance : incohérent en cluster et perdu à chaque redémarrage. Le distribué ajoute un aller-retour mais donne une vue commune et survit aux redéploiements. On combine parfois les deux, avec un local très court devant le distribué.',
                ],
              ],
            }),
          ],
          definitions: [
            {
              id: 'stack-d-stampede',
              title: 'Ruée sur le cache',
              text: 'Une ruée survient lorsqu’une entrée très demandée expire et que toutes les requêtes simultanées partent reconstruire la même valeur à la source. La base reçoit alors d’un seul coup la charge que le cache absorbait jusque-là.',
              tags: ['cache', 'performance'],
            },
          ],
        },
      ],
    },
  ],
};
