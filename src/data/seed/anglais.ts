import type { DomainSpec } from './builders';
import { code, def, example, fillBlank, keypoints, mcq, pronounce, quiz, text, tip, trueFalse, warn } from './builders';

const D = 'anglais';
const EN = 'en-US';

export const anglaisDomain: DomainSpec = {
  id: D,
  name: 'Anglais',
  description: 'Améliore ton niveau pas à pas',
  icon: 'chat',
  accent: 'pink',
  paths: [
    { id: 'en-path-pro', title: 'Anglais professionnel', description: 'Le vocabulaire et les tournures du quotidien en entreprise.' },
    { id: 'en-path-grammaire', title: 'Grammaire anglaise', description: 'Les temps et structures indispensables.' },
  ],
  courses: [
    {
      id: 'en-vocabulaire',
      pathId: 'en-path-pro',
      title: 'Anglais technique et professionnel',
      description: 'Le vocabulaire du développement, des réunions et des mails.',
      icon: '🗣️',
      level: 'debutant',
      tags: ['anglais', 'vocabulaire', 'pro'],
      chapters: [
        {
          id: 'en-ch-vocab',
          title: 'Vocabulaire',
          lessons: [
            {
              id: 'en-l-vocab-dev',
              title: 'Vocabulaire du développement',
              summary: 'Les mots que tu croiseras dans toute documentation technique.',
              minutes: 7,
              blocks: [
                keypoints([
                  'deployment - déploiement',
                  'release - livraison, mise en production',
                  'issue - anomalie ou demande',
                  'requirement - exigence, besoin',
                  'to fix - corriger',
                  'to review - relire, revoir',
                  'workaround - contournement',
                  'trade-off - compromis',
                ], 'Vocabulaire de base'),
                example('"The application is ready for deployment, but we still have two open issues."'),
                quiz('en-q-vocab-1'),
              ],
            },
            {
              id: 'en-l-vocab-meeting',
              title: 'Réunions et mails',
              summary: 'Les formules qui reviennent dans chaque réunion.',
              minutes: 6,
              blocks: [
                keypoints([
                  "Let's get started - on commence",
                  'Could you elaborate on that? - peux-tu préciser ?',
                  "I'll follow up by email - je fais un suivi par mail",
                  "Let's park this for now - on met ca de côté",
                  'To wrap up - pour conclure',
                ]),
                tip("En anglais professionnel, « Could you... » est plus poli que « Can you... » et bien plus courant à l’écrit."),
                quiz('en-q-vocab-2'),
              ],
            },
          ],
        },
        {
          id: 'en-ch-prononciation',
          title: 'Prononciation',
          lessons: [
            {
              id: 'en-l-pron-it',
              title: 'Mots techniques mal prononces',
              summary: 'Écoute et répète les mots que les francophones écorchent le plus.',
              minutes: 6,
              blocks: [
                text("Écoute chaque mot, puis répète-le à voix haute. La synthese vocale de ton navigateur lit le mot ; il n’y à pas de note automatique, car aucun navigateur mobile ne l’évalue de facon fiable."),
                pronounce({ word: 'credentials', phonetic: '/krɪˈdenʃlz/', sentence: 'Please check your credentials.', translation: 'identifiants', lang: EN }),
                pronounce({ word: 'query', phonetic: '/ˈkwɪəri/', sentence: 'This query is too slow.', translation: 'requête', lang: EN }),
                pronounce({ word: 'cache', phonetic: '/kæʃ/', sentence: 'Clear the cache first.', translation: 'cache (prononce « cash »)', lang: EN }),
                pronounce({ word: 'deploy', phonetic: '/dɪˈplɔɪ/', sentence: 'We deploy every Thursday.', translation: 'déployer', lang: EN }),
                warn("« cache » se prononce comme « cash », pas « ca-che ». C'est l’erreur la plus répandue."),
              ],
            },
            {
              id: 'en-l-pron-th',
              title: 'Le son « th »',
              summary: 'Le son absent du français, et comment le produire.',
              minutes: 5,
              blocks: [
                text("Le « th » a deux sons : sourd (/θ/) dans think, sonore (/ð/) dans this. Dans les deux cas la langue touche légèrement les dents du haut."),
                pronounce({ word: 'think', phonetic: '/θɪŋk/', sentence: 'I think it works.', translation: 'penser', lang: EN }),
                pronounce({ word: 'this', phonetic: '/ðɪs/', sentence: 'This is the last version.', translation: 'ceci', lang: EN }),
                quiz('en-q-pron-1'),
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'en-grammaire',
      pathId: 'en-path-grammaire',
      title: 'Grammaire anglaise',
      description: 'Présent simple, continuous, past simple, présent perfect, futur et conditionnels.',
      icon: '📘',
      level: 'intermediaire',
      tags: ['anglais', 'grammaire', 'temps'],
      chapters: [
        {
          id: 'en-ch-présent',
          title: 'Le présent',
          lessons: [
            {
              id: 'en-l-présent-simple',
              title: 'Présent simple',
              summary: 'Habitudes, vérités générales et le -s de la troisième personne.',
              minutes: 7,
              blocks: [
                def('Présent simple', "Le temps des habitudes, des faits permanents et des vérités générales."),
                code('text', `I work    you work    he/she/it works
Do you work?          He does not work.`, { caption: 'Conjugaison' }),
                example('I work in Paris. · She works every Saturday. · Water boils at 100 degrees.'),
                warn("Le -s de la troisième personne du singulier disparaît à la forme négative et interrogative : « He does not work », pas « He does not works »."),
                quiz('en-q-présent-1'),
              ],
            },
            {
              id: 'en-l-présent-continuous',
              title: 'Présent continuous',
              summary: 'Une action en cours, maintenant ou temporairement.',
              minutes: 6,
              blocks: [
                def('Présent continuous', 'be + verbe-ing : une action en cours au moment ou l’on parle, ou temporaire.'),
                example("I am working on a new feature. (maintenant) · He is living in Lyon this year. (temporaire)"),
                tip("Certains verbes d’état (know, want, believe, need) ne s’emploient normalement pas au continuous."),
                quiz('en-q-présent-2'),
              ],
            },
          ],
        },
        {
          id: 'en-ch-passé',
          title: 'Le passé',
          lessons: [
            {
              id: 'en-l-past-simple',
              title: 'Past simple',
              summary: 'Une action terminée à un moment precis du passé.',
              minutes: 7,
              blocks: [
                def('Past simple', 'Une action achevée, située dans un passé révolu et souvent date.'),
                example('I deployed the app yesterday. · We met in 2019.'),
                warn("Avec un marqueur de temps precis (yesterday, last week, in 2019), c’est toujours le past simple, jamais le présent perfect."),
                quiz('en-q-past-1'),
              ],
            },
            {
              id: 'en-l-présent-perfect',
              title: 'Présent perfect',
              summary: 'Le lien entre un fait passé et le présent.',
              minutes: 8,
              blocks: [
                def('Présent perfect', "have/has + participe passé : un fait passé dont le résultat compte maintenant, ou une période non terminée."),
                example("I have finished the report. (c’est fait, ca compte maintenant) · I have worked here for three years. (et j’y travaille encore)"),
                keypoints([
                  'for + durée : for three years.',
                  'since + point de départ : since 2021.',
                  'already, just, yet, ever, never accompagnent souvent ce temps.',
                  'Jamais avec yesterday, last month, in 2019.',
                ]),
                quiz('en-q-perfect-1'),
                quiz('en-q-perfect-2'),
              ],
            },
          ],
        },
        {
          id: 'en-ch-futur',
          title: 'Futur et conditionnel',
          lessons: [
            {
              id: 'en-l-futur',
              title: 'Will, going to et présent continuous',
              summary: 'Trois façons d’exprimer le futur, trois nuances.',
              minutes: 7,
              blocks: [
                keypoints([
                  'will : decision prise au moment de parler, prediction. « I will help you. »',
                  'going to : intention déjà formee, ou preuve visible. « It is going to rain. »',
                  'présent continuous : rendez-vous déjà fixe. « I am meeting the client at 10. »',
                ]),
                quiz('en-q-futur-1'),
              ],
            },
            {
              id: 'en-l-conditionnels',
              title: 'Les conditionnels',
              summary: 'Zéro, first, second, third : quelle structure pour quelle situation.',
              minutes: 8,
              blocks: [
                code('text', `0 : If you heat water, it boils.            (vérité générale)
1 : If it rains, I will stay home.          (probable)
2 : If I had time, I would learn Java.      (hypothétique)
3 : If I had known, I would have called.    (regret, passé)`, { caption: 'Les quatre conditionnels' }),
                warn("Après « if », on n’emploie pas « will » au first conditional : « If it will rain » est incorrect."),
                quiz('en-q-cond-1'),
              ],
            },
          ],
        },
      ],
    },
  ],
  questions: [
    mcq({ id: 'en-q-vocab-1', domainId: D, courseId: 'en-vocabulaire', lessonId: 'en-l-vocab-dev', topic: 'Anglais Vocabulaire', prompt: 'Que signifie « deployment » ?', options: ['Développement', 'Déploiement', 'Deplacement'], answerIndex: 1, explanation: '« Deployment » désigne la mise en service d’une application. « Développement » se dit « development ».' }),
    mcq({ id: 'en-q-vocab-2', domainId: D, courseId: 'en-vocabulaire', lessonId: 'en-l-vocab-meeting', topic: 'Anglais Vocabulaire', prompt: 'Que veut dire « Could you elaborate on that? »', options: ['Peux-tu préciser ?', 'Peux-tu recommencer ?', 'Peux-tu abreger ?'], answerIndex: 0, explanation: '« To elaborate » signifie developper, donner plus de détails.' }),
    mcq({ id: 'en-q-pron-1', domainId: D, courseId: 'en-vocabulaire', lessonId: 'en-l-pron-th', topic: 'Anglais Prononciation', prompt: 'Comment se prononce « cache » en anglais ?', options: ['« ca-che »', '« cash »', '« ca-shay »'], answerIndex: 1, explanation: '« cache » se prononce /kæʃ/, exactement comme « cash ».' }),
    mcq({ id: 'en-q-présent-1', domainId: D, courseId: 'en-grammaire', lessonId: 'en-l-présent-simple', topic: 'Anglais Présent Simple', prompt: 'Quelle phrase est correcte ?', options: ['He work every day.', 'He works every day.', 'He is work every day.'], answerIndex: 1, explanation: 'A la troisième personne du singulier, le présent simple prend un -s.' }),
    trueFalse({ id: 'en-q-présent-2', domainId: D, courseId: 'en-grammaire', lessonId: 'en-l-présent-continuous', topic: 'Anglais Présent Continuous', prompt: '« I am knowing the answer » est correct.', answer: false, explanation: '« know » est un verbe d’état : il ne se met pas au continuous. On dit « I know the answer ».' }),
    mcq({ id: 'en-q-past-1', domainId: D, courseId: 'en-grammaire', lessonId: 'en-l-past-simple', topic: 'Anglais Past Simple', prompt: 'Quelle phrase est correcte ?', options: ['I have deployed it yesterday.', 'I deployed it yesterday.', 'I deploy it yesterday.'], answerIndex: 1, explanation: 'Avec « yesterday », marqueur de temps precis, on emploie le past simple.' }),
    mcq({ id: 'en-q-perfect-1', domainId: D, courseId: 'en-grammaire', lessonId: 'en-l-présent-perfect', topic: 'Anglais Présent Perfect', prompt: 'Complete : « I have worked here ___ three years. »', options: ['since', 'for', 'during'], answerIndex: 1, explanation: '« for » introduit une durée, « since » un point de départ.' }),
    fillBlank({ id: 'en-q-perfect-2', domainId: D, courseId: 'en-grammaire', lessonId: 'en-l-présent-perfect', topic: 'Anglais Présent Perfect', prompt: 'Complete : « She has ___ (finish) the report. »', answer: 'finished', explanation: 'Le présent perfect se construit avec have/has + participe passé.' }),
    mcq({ id: 'en-q-futur-1', domainId: D, courseId: 'en-grammaire', lessonId: 'en-l-futur', topic: 'Anglais Futur', prompt: 'Quelle forme exprime un rendez-vous déjà fixe ?', options: ['will', 'going to', 'présent continuous'], answerIndex: 2, explanation: 'Un rendez-vous programme s’exprime au présent continuous : « I am meeting the client at 10. »' }),
    mcq({ id: 'en-q-cond-1', domainId: D, courseId: 'en-grammaire', lessonId: 'en-l-conditionnels', topic: 'Anglais Conditionnels', prompt: 'Quelle phrase est correcte ?', options: ['If it will rain, I will stay home.', 'If it rains, I will stay home.', 'If it rains, I stayed home.'], answerIndex: 1, explanation: 'Au first conditional : if + présent simple, puis will + base verbale.' }),
  ],
  flashcards: [
    { id: 'en-fc-deployment', courseId: 'en-vocabulaire', front: 'What does "deployment" mean?', back: 'Déploiement', example: 'The application is ready for deployment.', lang: EN, tags: ['vocabulaire'] },
    { id: 'en-fc-workaround', courseId: 'en-vocabulaire', front: 'workaround', back: 'Contournement, solution temporaire', example: 'We found a workaround until the next release.', lang: EN, tags: ['vocabulaire'] },
    { id: 'en-fc-tradeoff', courseId: 'en-vocabulaire', front: 'trade-off', back: 'Compromis', example: "It's a trade-off between speed and memory.", lang: EN, tags: ['vocabulaire'] },
    { id: 'en-fc-credentials', courseId: 'en-vocabulaire', front: 'credentials', back: 'Identifiants (/krɪˈdenʃlz/)', example: 'Please check your credentials.', lang: EN, tags: ['prononciation'] },
    { id: 'en-fc-forsince', courseId: 'en-grammaire', front: 'for ou since ?', back: 'for + durée (for three years) · since + point de départ (since 2021)', lang: EN, tags: ['grammaire'] },
    { id: 'en-fc-perfect', courseId: 'en-grammaire', front: 'Quand utiliser le présent perfect ?', back: 'Quand un fait passé compte encore maintenant, ou pendant une période non terminée. Jamais avec yesterday.', tags: ['grammaire'] },
    { id: 'en-fc-cond2', courseId: 'en-grammaire', front: 'Second conditional', back: 'If + past simple, would + base verbale. « If I had time, I would learn Java. »', tags: ['grammaire'] },
  ],
};
