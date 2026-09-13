import {
  badGood,
  compare,
  def,
  interview,
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
  type CourseSpec,
} from '../builders';

/**
 * API en profondeur.
 *
 * Le domaine `java` présente déjà REST et les codes HTTP. Ce cours part de là
 * pour traiter ce qui se joue en entretien et en production : l'idempotence, le
 * choix du bon code, la performance d'une API, et SOAP — qu'on croise encore
 * partout et qu'il faut savoir situer sans le caricaturer.
 */
export const apiCourse: CourseSpec = {
  id: 'stack-c-api',
  title: 'API : REST en profondeur et SOAP',
  description: 'Idempotence, codes de statut, performance, contrat, et le choix entre REST et SOAP.',
  icon: 'globe',
  level: 'intermediaire',
  tags: ['api', 'rest', 'soap', 'http'],
  pathId: 'stack-path-api',
  chapters: [
    {
      id: 'stack-ch-rest-profond',
      title: 'REST au-delà des verbes',
      description: 'Idempotence, codes, et ce qui distingue une bonne API.',
      lessons: [
        {
          id: 'stack-l-idempotence',
          title: 'Idempotence',
          summary: 'La propriété qui rend un réessai sans danger.',
          minutes: 10,
          difficulty: 'moyen',
          requires: ['java-l-api-rest', 'java-l-codes-http'],
          concepts: ['api', 'rest'],
          blocks: [
            def(
              'Idempotence',
              'Une opération est idempotente si l’exécuter plusieurs fois produit le même état final qu’une seule fois. Elle peut donc être réessayée sans risque quand on ne sait pas si la première tentative a abouti.',
            ),
            why(
              'Pourquoi c’est une question de production, pas de théorie ?',
              'Le réseau perd des réponses. Un client envoie une requête, la traite le serveur correctement, mais la réponse se perd : le client ne sait pas si l’opération a eu lieu. S’il réessaie et que l’opération est idempotente, il n’y a aucun risque. Sinon, il vient de créer une deuxième commande, ou de débiter deux fois. Toute la fiabilité d’une intégration repose là-dessus.',
            ),
            compare(
              ['Méthode', 'Idempotente ?'],
              [
                ['GET', 'Oui', 'Lire cent fois ne change rien. Doit rester sans effet de bord.'],
                ['PUT', 'Oui', 'Remplace la ressource par l’état fourni : le répéter aboutit au même état.'],
                ['DELETE', 'Oui', 'La ressource est absente après un appel comme après trois. Le code de retour peut différer.'],
                ['POST', 'Non', 'Crée une nouvelle ressource à chaque appel : deux appels, deux créations.'],
                ['PATCH', 'Pas nécessairement', 'Dépend du contenu. « Remplace le statut » l’est ; « ajoute 10 au solde » ne l’est pas.'],
              ],
              'Les méthodes HTTP',
            ),
            badGood({
              language: 'java',
              title: 'Rendre une création réessayable',
              bad: `@PostMapping("/paiements")
public Paiement payer(@RequestBody PaiementRequest requete) {
    return service.debiter(requete);
}`,
              good: `@PostMapping("/paiements")
public Paiement payer(
        @RequestHeader("Idempotency-Key") String cle,
        @RequestBody PaiementRequest requete) {
    return service.debiterUneSeuleFois(cle, requete);
}`,
              why: 'Un POST n’est pas idempotent par nature, mais on peut le rendre sûr au réessai avec une clé d’idempotence fournie par le client. Le serveur mémorise la clé et son résultat : si la même clé revient, il renvoie la réponse d’origine au lieu de rejouer le débit. C’est exactement ce que font les prestataires de paiement, et c’est une réponse qui se remarque en entretien.',
            }),
            memorize('stack-d-idempotence'),
            quiz('stack-q-idempotence-1'),
            interview({
              question: 'Qu’est-ce que l’idempotence et pourquoi est-ce important dans une API ?',
              short:
                'Une opération est idempotente si la répéter donne le même état final qu’une seule exécution. C’est ce qui rend un réessai sûr : quand une réponse se perd sur le réseau, le client peut relancer sans risquer de créer un doublon ou de débiter deux fois.',
              detailed:
                'En HTTP, GET, PUT et DELETE sont idempotentes par définition du protocole, POST ne l’est pas, et PATCH dépend de ce qu’il transporte : remplacer une valeur l’est, incrémenter ne l’est pas. L’enjeu n’est pas terminologique. Dans toute intégration distribuée, un client finit par ne pas recevoir de réponse : délai dépassé, connexion coupée, redémarrage du pod côté serveur. Il ignore alors si l’opération a été exécutée. Sur une opération idempotente il réessaie sans réfléchir ; sinon il doit choisir entre risquer un doublon et risquer de ne rien faire. Pour les créations, qui sont le cas gênant, la pratique courante est la clé d’idempotence : le client génère un identifiant unique pour sa tentative et le place en en-tête ; le serveur mémorise la clé avec le résultat produit et, si la même clé revient, renvoie la réponse d’origine sans rejouer l’opération. Il faut alors décider de la durée de rétention et du comportement si la même clé arrive avec un corps différent — en général un conflit. Sans ce mécanisme, le seul filet restant est une contrainte d’unicité en base, qui protège les données mais renvoie une erreur au client plutôt qu’une réponse utile.',
              followUps: [
                [
                  'Idempotent et « sûr », est-ce la même chose ?',
                  'Non. Une méthode sûre ne modifie rien : seul GET l’est vraiment. DELETE est idempotente mais absolument pas sûre. Toute méthode sûre est idempotente, l’inverse est faux.',
                ],
                [
                  'Quel code renvoyer sur un second DELETE ?',
                  'Les deux positions se défendent : 204 à chaque fois, ce qui rend le client trivial, ou 404 au second appel pour signaler que la ressource n’existe plus. L’essentiel est de trancher et de le documenter — l’idempotence porte sur l’état final, pas sur le code renvoyé.',
                ],
              ],
            }),
          ],
          definitions: [
            {
              id: 'stack-d-idempotence',
              title: 'Idempotence',
              text: 'Une opération est idempotente lorsque l’exécuter plusieurs fois laisse le système dans le même état qu’une seule exécution. Cette propriété permet à un client de réessayer sans danger quand il ignore si sa première tentative a abouti.',
              tags: ['api', 'rest'],
            },
          ],
        },
        {
          id: 'stack-l-codes-choix',
          title: 'Choisir le bon code de statut',
          summary: '400 ou 409, 401 ou 403 : les confusions qui coûtent cher.',
          minutes: 10,
          difficulty: 'moyen',
          requires: ['java-l-codes-http'],
          concepts: ['api', 'http'],
          blocks: [
            text(
              'Le code de statut est la seule information que tout client sait interpréter sans lire ta documentation. Le choisir au hasard revient à écrire un message d’erreur dans une langue que personne ne parle.',
            ),
            compare(
              ['Code', 'Quand exactement'],
              [
                ['200 OK', 'Succès avec contenu', 'Lecture réussie, ou modification dont on renvoie le résultat.'],
                ['201 Created', 'Création réussie', 'Accompagné d’un en-tête Location vers la ressource créée.'],
                ['204 No Content', 'Succès sans contenu', 'Suppression, ou modification dont on ne renvoie rien.'],
                ['400 Bad Request', 'Requête malformée', 'Champ manquant, type invalide, JSON illisible. Le client doit corriger sa requête.'],
                ['401 Unauthorized', 'Non authentifié', 'Pas de jeton, jeton expiré ou invalide. On ne sait pas qui tu es.'],
                ['403 Forbidden', 'Authentifié mais non autorisé', 'On sait qui tu es, tu n’as pas le droit. Réessayer ne servira à rien.'],
                ['404 Not Found', 'Ressource absente', 'Aussi utilisé pour masquer une ressource existante à qui n’a pas le droit de savoir.'],
                ['409 Conflict', 'Conflit avec l’état actuel', 'Doublon sur une contrainte d’unicité, modification concurrente, transition d’état interdite.'],
                ['422', 'Sémantiquement invalide', 'Bien formé mais métier invalide. Utile si tu distingues forme et règle ; sinon 400 suffit.'],
                ['500', 'Défaut du serveur', 'Un bug chez toi. Jamais pour une erreur du client.'],
              ],
              'Les codes qu’on confond',
            ),
            warn(
              'La confusion 401 / 403 est la plus fréquente et la plus visible : renvoyer 401 à un utilisateur authentifié fait boucler les clients qui tentent de renouveler leur jeton indéfiniment. 401 veut dire « je ne sais pas qui tu es » ; 403 veut dire « je sais, et c’est non ».',
            ),
            warn(
              'Ne renvoie jamais 200 avec un corps contenant `{"erreur": ...}`. Les clients, les proxys, les tableaux de bord et les alertes se basent sur le code : une erreur déguisée en succès ne sera comptée nulle part, et l’incident restera invisible.',
            ),
            question(
              'Un utilisateur tente de créer un compte avec une adresse déjà utilisée. Quel code ?',
              '409 Conflict. La requête est bien formée — donc pas un 400 — et l’utilisateur a le droit de créer un compte — donc pas un 403. Ce qui bloque est l’état actuel du système : cette adresse est déjà prise. C’est exactement ce que 409 exprime. Le corps doit préciser quel champ pose problème, sans révéler d’information sensible sur le compte existant.',
            ),
            memorize('stack-d-codes-http'),
            quiz('stack-q-codes-1'),
            quiz('stack-q-codes-2'),
          ],
          definitions: [
            {
              id: 'stack-d-codes-http',
              title: 'Code de statut HTTP',
              text: 'Le code de statut est le nombre par lequel le serveur indique l’issue d’une requête, indépendamment du contenu de la réponse. Il est la seule information que tout client sait interpréter sans documentation, ce qui rend son choix aussi important que celui du corps.',
              tags: ['api', 'http'],
            },
          ],
        },
        {
          id: 'stack-l-api-performante',
          title: 'Ce qui rend une API rapide',
          summary: 'Pagination, sélection, N+1, cache : dans le bon ordre.',
          minutes: 12,
          difficulty: 'difficile',
          requires: ['stack-l-codes-choix', 'java-l-api-performante'],
          concepts: ['api', 'performance'],
          blocks: [
            warn(
              'L’ordre de cette leçon n’est pas décoratif. Ajouter un cache devant une requête mal écrite masque le problème et le rend plus difficile à trouver plus tard. On corrige d’abord ce qui est lent, on met en cache ensuite si c’est encore utile.',
            ),
            steps(
              [
                'Ne renvoie que ce qui est demandé : pagination obligatoire sur toute liste, et champs limités au besoin réel.',
                'Supprime les requêtes inutiles : le N+1 est de loin la première cause de lenteur en Spring Data.',
                'Vérifie les index : une requête qui filtre sur une colonne non indexée parcourt toute la table.',
                'Supprime les allers-retours : un appel qui en déclenche cinq en série additionne cinq latences réseau.',
                'Mets des délais d’attente partout : sans eux, une dépendance lente immobilise tes threads jusqu’à saturation.',
                'Passe en asynchrone ce qui n’a pas besoin d’être répondu tout de suite.',
                'Mets en cache, seulement maintenant, ce qui est coûteux, souvent lu et rarement modifié.',
                'Mesure de nouveau : sans mesure après, tu ne sais pas si tu as amélioré ou déplacé le problème.',
              ],
              'Dans cet ordre',
            ),
            def(
              'Pagination',
              'La pagination consiste à ne renvoyer qu’une tranche de résultats à la fois plutôt que l’ensemble. Elle borne le travail du serveur, la taille de la réponse et la mémoire consommée, quelle que soit la croissance des données.',
            ),
            badGood({
              language: 'java',
              title: 'La liste qui grandit',
              bad: `@GetMapping("/commandes")
public List<CommandeDto> lister() {
    return service.toutes().stream().map(CommandeDto::de).toList();
}`,
              good: `@GetMapping("/commandes")
public Page<CommandeDto> lister(@PageableDefault(size = 50) Pageable pageable) {
    return service.rechercher(pageable).map(CommandeDto::de);
}`,
              why: 'La première version fonctionne parfaitement en recette avec deux cents commandes, puis rend l’API inutilisable le jour où il y en a deux millions : tout est chargé en mémoire, sérialisé, et transmis. Le point important est qu’aucune alerte ne préviendra — la dégradation est progressive. Une liste sans pagination est une panne programmée.',
            }),
            tip(
              'La pagination par numéro de page est simple mais dérive quand les données changent pendant le parcours : un élément inséré décale tout et fait apparaître un doublon. Sur un flux qui bouge ou un volume important, la pagination par curseur — « ce qui suit cet identifiant » — est plus juste et évite le coût du saut de lignes.',
            ),
            keypoints(
              [
                'Mesurer d’abord : sans répartition du temps, toute optimisation est un pari.',
                'Le N+1 coûte en nombre de requêtes, pas en durée unitaire : chaque requête semble rapide.',
                'Un délai d’attente absent transforme la lenteur d’un voisin en panne chez toi.',
                'Le cache est la dernière étape, jamais la première.',
              ],
              'À retenir',
            ),
            memorize('stack-d-pagination'),
            quiz('stack-q-perf-api-1'),
            interview({
              question: 'Comment rends-tu une API performante ?',
              short:
                'Je commence par mesurer pour savoir où passe le temps, car l’intuition se trompe. Ensuite je réduis le travail : pagination sur les listes, suppression des N+1, index sur les colonnes filtrées, délais d’attente sur les appels externes. Le cache vient en dernier, sur ce qui est coûteux, souvent lu et rarement modifié — et seulement une fois le reste corrigé.',
              detailed:
                'La première chose est de refuser d’optimiser à l’aveugle. Une API lente a une répartition : temps réseau, temps contrôleur, temps service, temps base, temps des appels externes. Tant qu’on ne l’a pas, on ne sait pas quoi corriger, et la statistique est constante — c’est presque toujours la base ou un appel externe, rarement le code Java. Ensuite on réduit le travail dans l’ordre de rentabilité. La pagination d’abord, parce qu’une liste non bornée est une panne qui attend son volume. Le N+1 ensuite, parce que c’est le défaut le plus fréquent avec un ORM et qu’il est invisible en recette : cent requêtes de deux millisecondes font deux cents millisecondes que personne ne voit sur un jeu de test. Les index, parce qu’une requête sans index parcourt toute la table et se dégrade linéairement. Puis les appels externes : les mettre en parallèle quand ils sont indépendants, et surtout leur donner un délai d’attente, car sans cela une dépendance lente immobilise les threads jusqu’à saturation du serveur — la lenteur d’un voisin devient une panne chez soi. Ce qui n’a pas besoin d’être répondu immédiatement passe en asynchrone via un message. Et seulement alors on met en cache, en ayant décidé de la durée de vie et de l’invalidation. Enfin on remesure : sans cela on ignore si le problème a été corrigé ou simplement déplacé.',
              followUps: [
                [
                  'Pourquoi ne pas commencer par le cache ?',
                  'Parce qu’un cache devant une requête mal écrite la masque : elle reste lente sur les défauts de cache, et le problème réapparaît au premier vidage ou redémarrage, souvent en pleine charge. On met en cache ce qui est déjà correct et reste coûteux.',
                ],
                [
                  'Comment repères-tu un N+1 ?',
                  'En journalisant le SQL et en comptant les requêtes d’un appel : une requête suivie de N requêtes identiques à un identifiant près. On corrige avec une jointure explicite pour ce cas précis, pas en basculant toutes les associations en chargement immédiat, ce qui déplacerait le problème.',
                ],
              ],
            }),
          ],
          definitions: [
            {
              id: 'stack-d-pagination',
              title: 'Pagination',
              text: 'La pagination consiste à renvoyer les résultats par tranches au lieu de les renvoyer tous d’un coup. Elle borne la mémoire, la taille de la réponse et le travail du serveur, ce qui empêche une liste de devenir inutilisable à mesure que les données grandissent.',
              tags: ['api', 'performance'],
            },
          ],
        },
      ],
    },
    {
      id: 'stack-ch-soap',
      title: 'SOAP et le choix du style',
      description: 'Situer SOAP sans le caricaturer.',
      lessons: [
        {
          id: 'stack-l-soap',
          title: 'SOAP, XML et WSDL',
          summary: 'Un protocole à contrat, encore très présent.',
          minutes: 11,
          difficulty: 'moyen',
          requires: ['stack-l-idempotence'],
          concepts: ['api', 'soap'],
          blocks: [
            def(
              'SOAP',
              'SOAP est un protocole d’échange de messages structurés en XML, indépendant du transport. Chaque message est enveloppé dans une structure normalisée comprenant un en-tête facultatif et un corps contenant l’appel ou la réponse.',
            ),
            techDef(
              'WSDL',
              'Un document WSDL décrit en XML le contrat d’un service : les opérations exposées, les types de leurs paramètres et de leurs retours, et le point d’accès. Il permet de générer automatiquement clients et serveurs, et sert de référence opposable entre les deux parties.',
            ),
            why(
              'Pourquoi ça existe encore ?',
              'Parce que le contrat explicite est une vraie qualité dans certains contextes. Dans la banque, l’assurance ou les télécoms, où deux entreprises s’engagent contractuellement sur un échange, un WSDL versionné qui définit précisément chaque type et permet de générer les deux extrémités a plus de valeur qu’une documentation informelle. S’y ajoutent les normes de sécurité et de transaction construites autour, qui n’ont pas d’équivalent direct côté REST.',
            ),
            compare(
              ['REST', 'SOAP'],
              [
                ['Nature', 'Un style d’architecture', 'Un protocole normalisé'],
                ['Format', 'Généralement JSON, libre', 'XML imposé'],
                ['Contrat', 'Documenté, souvent par OpenAPI', 'Formel et exécutable : le WSDL'],
                ['Transport', 'HTTP', 'Indépendant : HTTP, mais aussi file de messages'],
                ['Verbes', 'Ceux d’HTTP, porteurs de sens', 'Des opérations nommées, généralement en POST'],
                ['Poids', 'Léger', 'Verbeux : enveloppe et espaces de noms'],
                ['Sécurité', 'TLS, jetons OAuth2 ou JWT', 'TLS, plus WS-Security au niveau du message'],
                ['Va bien avec', 'Web, mobile, microservices', 'Intégration inter-entreprises, existant, contrat fort'],
              ],
              'Le choix se fait sur le contexte',
            ),
            tip(
              'En entretien, évite « REST est moderne, SOAP est dépassé ». La réponse qui se remarque est : REST par défaut pour les API web et mobiles, où la légèreté et l’évolutivité priment ; SOAP quand le contexte impose un contrat formel, des normes de sécurité au niveau du message, ou l’intégration avec un existant qui le parle déjà.',
            ),
            memorize('stack-d-soap'),
            quiz('stack-q-soap-1'),
            interview({
              question: 'REST ou SOAP : comment choisis-tu ?',
              short:
                'REST par défaut pour une API web ou mobile : léger, JSON, verbes HTTP, facile à faire évoluer. SOAP quand le contexte l’exige — contrat formel opposable via un WSDL, normes de sécurité au niveau du message, ou intégration avec un système existant qui ne parle que ça.',
              detailed:
                'Ce ne sont pas deux choses de même nature. REST est un style d’architecture qui s’appuie sur HTTP : des ressources identifiées par des URI, les verbes du protocole porteurs de sens, des codes de statut standard, généralement du JSON. SOAP est un protocole : une enveloppe XML normalisée, indépendante du transport, avec un contrat décrit par un WSDL à partir duquel on génère clients et serveurs. Les avantages de REST sont la légèreté, la lisibilité, l’outillage universel et la souplesse d’évolution : ajouter un champ optionnel ne casse personne. Ses limites sont l’absence de contrat exécutable — OpenAPI en tient lieu mais reste déclaratif — et une sécurité qui s’arrête au transport. SOAP apporte exactement l’inverse : le WSDL est vérifiable et opposable, WS-Security signe ou chiffre au niveau du message et non de la connexion, ce qui compte quand le message traverse plusieurs intermédiaires, et le transport peut être une file de messages plutôt qu’HTTP. Le prix est la verbosité et la rigidité. En pratique, on trouve encore beaucoup de SOAP dans la banque, l’assurance et les télécoms, et le sujet est rarement de choisir : c’est d’exposer du REST vers les nouveaux clients tout en consommant du SOAP existant, avec une couche de traduction au milieu.',
              followUps: [
                [
                  'Peut-on faire du REST sans JSON ?',
                  'Oui. REST n’impose aucun format : la négociation de contenu permet de servir du XML, du CSV ou du binaire. JSON est un usage dominant, pas une règle du style.',
                ],
                [
                  'Qu’apporte WS-Security que TLS n’apporte pas ?',
                  'TLS protège la connexion entre deux points ; le message est en clair à chaque extrémité. WS-Security signe et chiffre le message lui-même, qui reste donc protégé en traversant des intermédiaires — un besoin réel dans les chaînes d’intégration inter-entreprises.',
                ],
              ],
            }),
          ],
          definitions: [
            {
              id: 'stack-d-soap',
              title: 'SOAP',
              text: 'SOAP est un protocole d’échange de messages en XML dans lequel chaque appel est enveloppé dans une structure normalisée. Son contrat est décrit par un document WSDL qui définit précisément les opérations et les types, ce qui permet de générer les deux extrémités et d’opposer ce contrat entre partenaires.',
              tags: ['api', 'soap'],
            },
          ],
        },
      ],
    },
  ],
};
