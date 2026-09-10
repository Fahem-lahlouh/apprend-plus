import type { DomainSpec } from './builders';
import { def, example, fillBlank, keypoints, mcq, quiz, text, tip, trueFalse, warn } from './builders';

const D = 'grammaire';

export const grammaireDomain: DomainSpec = {
  id: D,
  name: 'Grammaire',
  description: 'Maîtrise les bases du français',
  icon: 'book',
  accent: 'amber',
  paths: [
    { id: 'fr-path-essentiel', title: 'Français essentiel', description: 'Accords, conjugaison et orthographe du quotidien professionnel.' },
  ],
  courses: [
    {
      id: 'fr-essentiel',
      pathId: 'fr-path-essentiel',
      title: 'Grammaire francaise essentielle',
      description: 'Les règles qui evitent les fautes visibles dans un mail ou un rapport.',
      icon: '✍️',
      level: 'debutant',
      tags: ['français', 'grammaire', 'orthographe'],
      chapters: [
        {
          id: 'fr-ch-accords',
          title: 'Les accords',
          lessons: [
            {
              id: 'fr-l-sujet-verbe',
              title: 'Accord sujet-verbe',
              summary: 'Trouver le vrai sujet, même quand il est loin du verbe.',
              minutes: 5,
              blocks: [
                text("Le verbe s’accorde avec son sujet, pas avec le mot le plus proche. Pose la question « qui est-ce qui ? » devant le verbe."),
                example("La liste des participants **est** longue. (c’est la liste qui est longue, pas les participants)"),
                quiz('fr-q-sujet-1'),
              ],
            },
            {
              id: 'fr-l-participe-avoir',
              title: 'Participe passé avec avoir',
              summary: 'La règle du COD place avant le verbe.',
              minutes: 7,
              blocks: [
                def('Règle', "Avec l’auxiliaire avoir, le participe passé s’accorde avec le complément d’objet direct seulement si celui-ci est place avant le verbe."),
                example("J'ai envoye les rapports. (COD après : pas d’accord)\nLes rapports que j’ai envoyés. (COD avant : accord)"),
                quiz('fr-q-participe-1'),
              ],
            },
            {
              id: 'fr-l-participe-être',
              title: 'Participe passé avec être',
              summary: 'Accord systématique avec le sujet.',
              minutes: 5,
              blocks: [
                text("Avec l’auxiliaire être, le participe passé s’accorde toujours en genre et en nombre avec le sujet."),
                example('Elles sont arrivees en avance. · La réunion est terminée.'),
                quiz('fr-q-participe-2'),
              ],
            },
            {
              id: 'fr-l-adjectifs',
              title: 'Accord des adjectifs',
              summary: 'Le cas des adjectifs de couleur et des noms coordonnés.',
              minutes: 6,
              blocks: [
                keypoints([
                  "L'adjectif s’accorde avec le nom qu’il qualifie.",
                  'Deux noms coordonnés au singulier entraînent le pluriel : « une lettre et un rapport clairs ».',
                  "Les adjectifs de couleur dérivés d’un nom restent invariables : « des chemises orange »."
                ]),
                quiz('fr-q-adjectif-1'),
              ],
            },
          ],
        },
        {
          id: 'fr-ch-conjugaison',
          title: 'Conjugaison',
          lessons: [
            {
              id: 'fr-l-présent',
              title: 'Le présent de l’indicatif',
              summary: 'Les terminaisons des trois groupes.',
              minutes: 6,
              blocks: [
                keypoints([
                  '1er groupe (-er) : e, es, e, ons, ez, ent.',
                  '2e groupe (-ir, -issons) : is, is, it, issons, issez, issent.',
                  '3e groupe : irrégulier, à mémoriser verbe par verbe.',
                ]),
                warn("« je conclus » et non « je conclue » ; « il inclut » et non « il inclue »."),
                quiz('fr-q-présent-1'),
              ],
            },
            {
              id: 'fr-l-passé-composé',
              title: 'Passé composé',
              summary: 'Choisir entre être et avoir.',
              minutes: 6,
              blocks: [
                text("La plupart des verbes se conjuguent avec avoir. Être s’emploie pour les verbes pronominaux et une liste de verbes de mouvement ou d’état (aller, venir, arriver, partir, rester, devenir...)."),
                example("J'ai termine le dossier. · Je suis alle à la réunion. · Elle s’est levée tot."),
                quiz('fr-q-passé-1'),
              ],
            },
            {
              id: 'fr-l-imparfait',
              title: 'Imparfait et passé composé',
              summary: 'Decor contre action ponctuelle.',
              minutes: 6,
              blocks: [
                text("L'imparfait pose le décor, l’habitude, la durée. Le passé composé rapporte l’action ponctuelle qui survient."),
                example('Je travaillais quand le client a appelé.'),
                quiz('fr-q-imparfait-1'),
              ],
            },
            {
              id: 'fr-l-futur-conditionnel',
              title: 'Futur ou conditionnel',
              summary: 'Le piege du « je serai » / « je serais ».',
              minutes: 5,
              blocks: [
                tip("Remplace par la première personne du pluriel : si « nous serons » fonctionne, c’est le futur (-ai) ; si c’est « nous serions », c’est le conditionnel (-ais)."),
                example("Demain je serai présent. · Si j’avais le temps, je serais venu."),
                quiz('fr-q-futur-1'),
              ],
            },
          ],
        },
        {
          id: 'fr-ch-orthographe',
          title: 'Orthographe et style',
          lessons: [
            {
              id: 'fr-l-homophones',
              title: 'Les homophones fréquents',
              summary: 'a/à, ou/où, ce/se, ces/ses, leur/leurs.',
              minutes: 7,
              blocks: [
                keypoints([
                  "a / à : « a » se remplace par « avait ».",
                  "ou / où : « ou » se remplace par « ou bien ».",
                  "ce / se : « se » accompagne un verbe pronominal.",
                  "ces / ses : « ses » marqué la possession.",
                  "leur / leurs : « leur » devant un verbe est invariable.",
                ]),
                quiz('fr-q-homophone-1'),
                quiz('fr-q-homophone-2'),
              ],
            },
            {
              id: 'fr-l-ponctuation',
              title: 'La ponctuation',
              summary: 'Les espaces avant les signes doubles, et la virgule.',
              minutes: 5,
              blocks: [
                keypoints([
                  'Espace insécable avant : ; ? ! et a l’interieur des guillemets français.',
                  'Pas d’espace avant la virgule et le point.',
                  'La virgule ne séparé jamais le sujet de son verbe.',
                ]),
                quiz('fr-q-ponctuation-1'),
              ],
            },
            {
              id: 'fr-l-mail-pro',
              title: 'Écrire un mail professionnel',
              summary: 'Structure et formules qui passent partout.',
              minutes: 6,
              blocks: [
                keypoints([
                  'Un objet explicite, six mots maximum.',
                  'Une demande claire des la première phrase.',
                  'Un paragraphe par idée.',
                  "Formule de fin sobre : « Cordialement » suffit dans presque tous les cas.",
                ]),
                warn("« Je vous serais gré » : c’est bien le conditionnel, avec un s."),
                quiz('fr-q-mail-1'),
              ],
            },
          ],
        },
      ],
    },
  ],
  questions: [
    mcq({ id: 'fr-q-sujet-1', domainId: D, courseId: 'fr-essentiel', lessonId: 'fr-l-sujet-verbe', topic: 'Français Accords', prompt: 'Quelle phrase est correcte ?', options: ['La liste des participants sont longue.', 'La liste des participants est longue.', 'La liste des participants etaient longue.'], answerIndex: 1, explanation: 'Le sujet est « la liste », au singulier. « des participants » est un complément du nom.' }),
    mcq({ id: 'fr-q-participe-1', domainId: D, courseId: 'fr-essentiel', lessonId: 'fr-l-participe-avoir', topic: 'Français Accords', prompt: 'Quelle phrase est correcte ?', options: ["Les rapports que j’ai envoye.", "Les rapports que j’ai envoyés.", "Les rapports que j’ai envoyees."], answerIndex: 1, explanation: 'Le COD « les rapports » (masculin pluriel) est place avant le verbe : accord en -es.' }),
    trueFalse({ id: 'fr-q-participe-2', domainId: D, courseId: 'fr-essentiel', lessonId: 'fr-l-participe-être', topic: 'Français Accords', prompt: "Avec l’auxiliaire être, le participe passé s’accorde avec le sujet.", answer: true, explanation: 'Accord systématique en genre et en nombre avec le sujet.' }),
    mcq({ id: 'fr-q-adjectif-1', domainId: D, courseId: 'fr-essentiel', lessonId: 'fr-l-adjectifs', topic: 'Français Accords', prompt: 'Quelle forme est correcte ?', options: ['des chemises oranges', 'des chemises orange', 'des chemises orangées'], answerIndex: 1, explanation: 'Les adjectifs de couleur dérivés d’un nom (orange, marron) restent invariables.' }),
    fillBlank({ id: 'fr-q-présent-1', domainId: D, courseId: 'fr-essentiel', lessonId: 'fr-l-présent', topic: 'Français Conjugaison', prompt: 'Conjugue « conclure » à la première personne du présent : je ___', answer: 'conclus', explanation: '« je conclus », sans e final.' }),
    mcq({ id: 'fr-q-passé-1', domainId: D, courseId: 'fr-essentiel', lessonId: 'fr-l-passé-composé', topic: 'Français Conjugaison', prompt: 'Quel auxiliaire pour « aller » au passé composé ?', options: ['avoir', 'être', 'les deux'], answerIndex: 1, explanation: '« aller » fait partie des verbes de mouvement qui se conjuguent avec être : « je suis alle ».' }),
    mcq({ id: 'fr-q-imparfait-1', domainId: D, courseId: 'fr-essentiel', lessonId: 'fr-l-imparfait', topic: 'Français Conjugaison', prompt: 'Quelle phrase respecte la logique imparfait / passé composé ?', options: ['Je travaillais quand le client a appelé.', "J'ai travaille quand le client appelait.", 'Je travaillais quand le client appelait.'], answerIndex: 0, explanation: "L'imparfait pose le décor, le passé composé rapporte l’action ponctuelle." }),
    mcq({ id: 'fr-q-futur-1', domainId: D, courseId: 'fr-essentiel', lessonId: 'fr-l-futur-conditionnel', topic: 'Français Conjugaison', prompt: 'Quelle phrase est correcte ?', options: ['Demain je serais présent.', 'Demain je serai présent.', 'Demain je serais présent si.'], answerIndex: 1, explanation: 'Le futur simple prend -ai : « je serai ». Le test : « nous serons demain » fonctionne.' }),
    mcq({ id: 'fr-q-homophone-1', domainId: D, courseId: 'fr-essentiel', lessonId: 'fr-l-homophones', topic: 'Français Orthographe', prompt: 'Complete : « Il ___ termine son rapport. »', options: ['a', 'à', 'as'], answerIndex: 0, explanation: 'On peut remplacer par « avait » : c’est le verbe avoir, donc « a » sans accent.' }),
    fillBlank({ id: 'fr-q-homophone-2', domainId: D, courseId: 'fr-essentiel', lessonId: 'fr-l-homophones', topic: 'Français Orthographe', prompt: 'Complete : « Le dossier ___ trouve sur le bureau. » (ce / se)', answer: 'se', explanation: '« se trouve » est un verbe pronominal : on emploie « se ».' }),
    trueFalse({ id: 'fr-q-ponctuation-1', domainId: D, courseId: 'fr-essentiel', lessonId: 'fr-l-ponctuation', topic: 'Français Orthographe', prompt: 'En français, on met une espace avant le point-virgule.', answer: true, explanation: 'Les signes doubles ( ; : ? ! ) prennent une espace insécable avant, contrairement à l’anglais.' }),
    mcq({ id: 'fr-q-mail-1', domainId: D, courseId: 'fr-essentiel', lessonId: 'fr-l-mail-pro', topic: 'Français Orthographe', prompt: 'Quelle formule est correcte ?', options: ['Je vous serai gré', 'Je vous serais gré', 'Je vous serez gré'], answerIndex: 1, explanation: 'La formule de politesse emploie le conditionnel : « je vous serais gré ».' }),
  ],
  flashcards: [
    { id: 'fr-fc-participe', courseId: 'fr-essentiel', front: 'Participe passé avec avoir', back: 'Accord avec le COD seulement s’il est place avant le verbe.', tags: ['accords'] },
    { id: 'fr-fc-futur', courseId: 'fr-essentiel', front: 'je serai ou je serais ?', back: 'Futur : -ai (nous serons). Conditionnel : -ais (nous serions).', tags: ['conjugaison'] },
    { id: 'fr-fc-aou', courseId: 'fr-essentiel', front: 'a ou à ?', back: 'Si « avait » fonctionne à la place, c’est le verbe : « a » sans accent.', tags: ['orthographe'] },
    { id: 'fr-fc-couleur', courseId: 'fr-essentiel', front: 'Accord des couleurs', back: 'Les adjectifs de couleur dérivés d’un nom (orange, marron) sont invariables.', tags: ['accords'] },
    { id: 'fr-fc-ponctuation', courseId: 'fr-essentiel', front: 'Espace avant « ? »', back: 'Oui en français : les signes doubles prennent une espace insécable avant.', tags: ['orthographe'] },
  ],
};
