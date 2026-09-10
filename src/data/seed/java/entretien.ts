import type { QuizQuestion } from '@/models';
import { openQuestion } from '../builders';
import { D } from './shared';

/**
 * Questions d'entretien. Ce sont des questions ouvertes : on formule sa réponse,
 * puis on la compare au modèle et on s'auto-évalue.
 *
 * Elles portent toutes le tag `entretien`, et c'est ce seul tag que l'écran du
 * mode entretien interroge — n'importe quel domaine peut donc en fournir.
 */
export const entretienQuestions: QuizQuestion[] = [
  openQuestion({
    id: 'java-e-java',
    domainId: D, courseId: 'java-c1-debutant', lessonId: 'java-l-introduction',
    topic: 'Java',
    prompt: 'Qu’est-ce que Java ?',
    answer:
      'Un langage de programmation orienté objet et fortement typé. Son code source est compilé en bytecode par javac, puis ce bytecode est exécuté par la JVM. C’est ce passage par un format intermédiaire qui rend le même programme exécutable sur Windows, Linux ou macOS.',
  }),
  openQuestion({
    id: 'java-e-jvm-jre-jdk',
    domainId: D, courseId: 'java-c1-debutant', lessonId: 'java-l-jdk-jre',
    topic: 'JDK',
    prompt: 'Quelle différence entre JVM, JRE et JDK ?',
    answer:
      'La JVM exécute le bytecode. Le JRE, c’est la JVM plus les bibliothèques standard : de quoi exécuter, pas de quoi compiler. Le JDK, c’est le JRE plus les outils de développement, dont javac. À noter : depuis Java 11, le JRE n’est plus distribué séparément — on installe un JDK, y compris en production.',
  }),
  openQuestion({
    id: 'java-e-classe',
    domainId: D, courseId: 'java-c2-objet', lessonId: 'java-l-classes',
    topic: 'classe',
    prompt: 'Qu’est-ce qu’une classe, et qu’est-ce qu’un objet ?',
    answer:
      'La classe est un modèle : elle décrit les attributs et les méthodes que possédera un objet, sans contenir aucune valeur. L’objet est une instance créée avec new : il occupe sa propre mémoire et détient ses propres valeurs. Une classe, autant d’objets qu’on veut, chacun indépendant.',
  }),
  openQuestion({
    id: 'java-e-encapsulation',
    domainId: D, courseId: 'java-c2-objet', lessonId: 'java-l-encapsulation',
    topic: 'encapsulation',
    prompt: 'Qu’est-ce que l’encapsulation, et à quoi sert-elle concrètement ?',
    answer:
      'Elle consiste à rendre les attributs private et à n’exposer que des méthodes qui contrôlent les modifications. Concrètement, elle rend la classe seule responsable de son état : personne ne peut mettre un solde à une valeur absurde, parce que le seul chemin passe par une méthode qui vérifie. Attention : un setter sans règle n’est pas de l’encapsulation, c’est un champ public déguisé.',
  }),
  openQuestion({
    id: 'java-e-heritage',
    domainId: D, courseId: 'java-c2-objet', lessonId: 'java-l-heritage',
    topic: 'héritage',
    prompt: 'Qu’est-ce que l’héritage ?',
    answer:
      'Le mécanisme par lequel une classe enfant récupère les attributs et méthodes d’une classe parent, via extends. Il sert à réutiliser du code, mais surtout à rendre les classes interchangeables : partout où un Animal est attendu, un Chien convient. Il ne se justifie que si « l’enfant est un parent » est vrai.',
  }),
  openQuestion({
    id: 'java-e-polymorphisme',
    domainId: D, courseId: 'java-c2-objet', lessonId: 'java-l-polymorphisme',
    topic: 'polymorphisme',
    prompt: 'Explique le polymorphisme, et pourquoi Animal a = new Chien(); a.parler(); affiche « Wouf ».',
    answer:
      'Le polymorphisme permet de manipuler des objets enfants à travers une référence du type parent. Le compilateur vérifie seulement que le type déclaré — Animal — possède parler(). Le choix de la méthode réellement exécutée se fait à l’exécution, d’après le type réel de l’objet : c’est le dispatch dynamique. L’objet étant un Chien, c’est sa version qui s’exécute. L’intérêt : une boucle sur des Animal fonctionne avec une nouvelle sous-classe sans être modifiée.',
  }),
  openQuestion({
    id: 'java-e-interface-abstraite',
    domainId: D, courseId: 'java-c2-objet', lessonId: 'java-l-interfaces',
    topic: 'interface',
    prompt: 'Interface ou classe abstraite : comment choisis-tu ?',
    answer:
      'La classe abstraite convient quand les classes partagent une vraie nature commune et du code d’implémentation ; elle peut porter des attributs. L’interface convient quand des classes sans lien doivent être interchangeables : elle décrit une capacité, pas une nature. La contrainte décisive est qu’on n’hérite que d’une classe alors qu’on implémente autant d’interfaces qu’on veut. Dans le doute, l’interface, car elle n’épuise pas le droit d’héritage.',
  }),
  openQuestion({
    id: 'java-e-arraylist-linkedlist',
    domainId: D, courseId: 'java-c3-moderne', lessonId: 'java-l-implementations',
    topic: 'collections',
    prompt: 'ArrayList ou LinkedList ?',
    answer:
      'ArrayList s’appuie sur un tableau : accès par indice immédiat, mémoire compacte, mais une insertion au milieu décale tout ce qui suit. LinkedList est une chaîne de maillons : insertion et suppression rapides une fois la position atteinte, mais l’accès par indice oblige à parcourir. En pratique, ArrayList par défaut : le surcoût mémoire de LinkedList annule souvent son avantage théorique.',
  }),
  openQuestion({
    id: 'java-e-hashmap',
    domainId: D, courseId: 'java-c3-moderne', lessonId: 'java-l-implementations',
    topic: 'collections',
    prompt: 'Comment fonctionne une HashMap ?',
    answer:
      'Elle appelle hashCode() sur la clé, transforme le résultat en indice de casier, et range la paire dans ce casier. En cas de collision, equals départage les clés à l’intérieur du casier ; un casier trop chargé est réorganisé en arbre. Quand la map se remplit, elle double sa capacité et redistribue tout. C’est pourquoi une clé doit être immuable : modifier un champ entrant dans le hashCode rend l’entrée introuvable.',
  }),
  openQuestion({
    id: 'java-e-equals-hashcode',
    domainId: D, courseId: 'java-c2-objet', lessonId: 'java-l-super-object',
    topic: 'equals',
    prompt: 'Pourquoi faut-il redéfinir hashCode dès qu’on redéfinit equals ?',
    answer:
      'Parce que les structures de hachage cherchent en deux temps : le casier par hashCode, puis la comparaison par equals à l’intérieur. Si deux objets égaux ont des hashCode différents, ils atterrissent dans des casiers différents et ne se rencontrent jamais. On range une clé dans une HashMap, on la recherche avec une clé égale, et on obtient null — sans aucune exception pour prévenir.',
  }),
  openQuestion({
    id: 'java-e-checked',
    domainId: D, courseId: 'java-c3-moderne', lessonId: 'java-l-checked-unchecked',
    topic: 'exceptions',
    prompt: 'Checked ou unchecked : quelle différence, et laquelle utiliser ?',
    answer:
      'Une checked hérite d’Exception hors RuntimeException et oblige l’appelant à l’attraper ou à la déclarer. Une unchecked hérite de RuntimeException et n’impose rien. Les checked représentent un événement externe prévisible — IOException, SQLException — les unchecked une erreur de programmation ou une règle métier violée. Dans une application moderne, on privilégie les unchecked pour le métier : les checked polluent toutes les signatures intermédiaires sans rien apporter.',
  }),
  openQuestion({
    id: 'java-e-stream-boucle',
    domainId: D, courseId: 'java-c3-moderne', lessonId: 'java-l-streams',
    topic: 'streams',
    prompt: 'Stream ou boucle classique ?',
    answer:
      'Un stream décrit ce qu’on veut obtenir, une boucle décrit comment le faire. Le stream gagne en lisibilité dès qu’on enchaîne filtre, transformation et tri, ne modifie jamais la source, et son évaluation paresseuse permet à un limit(10) d’arrêter le traitement tôt. Il n’est pas systématiquement plus rapide : sur de petites collections, il est même légèrement plus lent. On le choisit pour la clarté.',
  }),
  openQuestion({
    id: 'java-e-optional',
    domainId: D, courseId: 'java-c3-moderne', lessonId: 'java-l-optional',
    topic: 'Optional',
    prompt: 'Pourquoi Optional ?',
    answer:
      'Parce que null ne se voit pas dans un type : rien, dans « cette méthode renvoie un Utilisateur », n’avertit qu’elle peut ne rien renvoyer. Optional déplace l’information dans la signature, là où on la lit forcément, et empêche d’appeler une méthode sans avoir traité l’absence. Il est fait pour un type de retour : en paramètre ou en attribut, il alourdit sans garantir quoi que ce soit.',
  }),
  openQuestion({
    id: 'java-e-api-rest',
    domainId: D, courseId: 'java-c4-api', lessonId: 'java-l-api-rest',
    topic: 'REST',
    prompt: 'Qu’est-ce qu’une API REST ?',
    answer:
      'Une API qui s’appuie sur HTTP et organise les échanges autour de ressources identifiées par des URLs. La méthode HTTP porte l’action — GET lit, POST crée, PUT remplace, PATCH modifie, DELETE supprime — et l’URL désigne la ressource. Les URLs contiennent des noms, pas des verbes, puisque le verbe est déjà dans la méthode.',
  }),
  openQuestion({
    id: 'java-e-get-post',
    domainId: D, courseId: 'java-c4-api', lessonId: 'java-l-api-rest',
    topic: 'REST',
    prompt: 'GET ou POST, PUT ou PATCH ?',
    answer:
      'GET lit et ne modifie rien : il est sûr et peut être mis en cache ou rejoué. POST crée, et n’est pas idempotent — deux envois créent deux ressources. PUT remplace la ressource entière : les champs absents sont effacés. PATCH n’applique que les champs fournis. PUT et DELETE sont idempotents : les rejouer laisse le même état final.',
  }),
  openQuestion({
    id: 'java-e-dto',
    domainId: D, courseId: 'java-c4-api', lessonId: 'java-l-dto',
    topic: 'DTO',
    prompt: 'Qu’est-ce qu’un DTO, et pourquoi ne pas exposer ses entités ?',
    answer:
      'Un Data Transfer Object transporte uniquement les données nécessaires entre deux couches ou deux systèmes. Exposer une entité fait fuiter des champs internes — un champ ajouté demain partirait sans que personne ne le remarque — déclenche des requêtes N+1 quand le sérialiseur parcourt les relations, et lie le contrat public au schéma de la base. Un record est le format naturel d’un DTO.',
  }),
  openQuestion({
    id: 'java-e-api-lente',
    domainId: D, courseId: 'java-c4-api', lessonId: 'java-l-api-lente',
    topic: 'diagnostic',
    prompt: 'Une API met 10 secondes à répondre. Comment procèdes-tu ?',
    answer:
      'Je mesure avant de supposer. Je découpe le temps total par étape : base, appels externes, traitement Java, sérialisation. Je compte le nombre de requêtes SQL émises pour un seul appel, je regarde le volume de données ramené, je vérifie les index sur les colonnes filtrées, puis les ressources de la machine — processeur, mémoire, pauses du ramasse-miettes, pool de connexions. J’identifie le goulot d’étranglement, je corrige celui-là seulement, et je remesure. Corriger deux choses à la fois empêche de savoir laquelle a produit le gain.',
  }),
  openQuestion({
    id: 'java-e-index',
    domainId: D, courseId: 'java-c5-performance', lessonId: 'java-l-index-sql',
    topic: 'index',
    prompt: 'Qu’est-ce qu’un index SQL, et quand en ajouter ?',
    answer:
      'Une structure annexe qui permet de retrouver des lignes sans parcourir toute la table — l’index alphabétique d’un livre. On indexe les colonnes utilisées dans les WHERE, les JOIN et les ORDER BY fréquents. Pas toutes : chaque index occupe de l’espace et doit être mis à jour à chaque écriture. Et une fonction appliquée à la colonne empêche l’index de servir. EXPLAIN montre si la base l’utilise réellement.',
  }),
  openQuestion({
    id: 'java-e-nplus1',
    domainId: D, courseId: 'java-c5-performance', lessonId: 'java-l-n-plus-1',
    topic: 'N+1',
    prompt: 'Qu’est-ce que le problème N+1 ?',
    answer:
      'Une première requête ramène N éléments, puis une requête part pour chacun d’eux : N+1 au total. Le coût ne vient pas de la lenteur des requêtes mais de leur nombre, chacune payant sa latence réseau. Le profil est trompeur : la base signale des requêtes rapides et pourtant l’API rampe. On le détecte en comptant les requêtes d’un seul appel, et on le corrige par JOIN FETCH, EntityGraph ou une projection DTO.',
  }),
  openQuestion({
    id: 'java-e-cache',
    domainId: D, courseId: 'java-c5-performance', lessonId: 'java-l-cache',
    topic: 'cache',
    prompt: 'Pourquoi utiliser un cache, et quels sont ses pièges ?',
    answer:
      'Pour éviter de refaire un traitement coûteux sur des données qui changent rarement : un accès mémoire au lieu d’un accès base, soit un rapport de mille à un. Les pièges : ne pas invalider à l’écriture, et servir des données périmées ; un cache sans taille maximale, qui devient une fuite mémoire ; et surtout une clé qui n’inclut pas l’identité de l’utilisateur, ce qui fait fuiter les données d’une personne vers une autre.',
  }),
  openQuestion({
    id: 'java-e-thread-safety',
    domainId: D, courseId: 'java-c3-moderne', lessonId: 'java-l-threads',
    topic: 'threads',
    prompt: 'Pourquoi un simple compteur devient-il faux avec plusieurs threads ?',
    answer:
      'Parce que valeur++ cache trois étapes : lire, ajouter, réécrire. Si deux threads lisent 5 en même temps, tous deux écrivent 6 : un incrément est perdu. C’est une condition de course, redoutable parce qu’elle dépend du timing — elle ne se reproduit pas en local et disparaît quand on ajoute des logs. Les réponses, dans l’ordre : ne rien partager, rendre l’objet immuable, ou synchroniser avec un AtomicInteger.',
  }),
];
