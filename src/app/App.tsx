import { lazy, Suspense, useEffect, useState } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ConfirmProvider, ToastProvider } from '@/design-system';
import { PreferencesProvider } from '@/hooks/usePreferences';
import { ensureSeeded } from '@/data/seed';
import { BottomNav } from './BottomNav';
import { HomeScreen } from '@/features/home/HomeScreen';
import { CoursesScreen } from '@/features/courses/CoursesScreen';
import { DomainScreen } from '@/features/courses/DomainScreen';
import { CourseScreen } from '@/features/courses/CourseScreen';
import { LessonScreen } from '@/features/courses/LessonScreen';
import { ContentEditorScreen } from '@/features/courses/ContentEditorScreen';
import { PracticeScreen } from '@/features/practice/PracticeScreen';

// The code editor pulls in CodeMirror and its language modes; loading it on
// demand keeps the first paint of the app light on a phone connection.
const CodePlaygroundScreen = lazy(() =>
  import('@/features/practice/CodePlaygroundScreen').then((m) => ({ default: m.CodePlaygroundScreen })),
);
import { ResourcesScreen } from '@/features/practice/ResourcesScreen';
import { GamesScreen } from '@/features/games/GamesScreen';
import { QuizGameScreen } from '@/features/games/QuizGameScreen';
import { MemoryGameScreen } from '@/features/games/MemoryGameScreen';
import { SpeedChallengeScreen } from '@/features/games/SpeedChallengeScreen';
import { FlashcardsScreen } from '@/features/flashcards/FlashcardsScreen';
import { RemindersScreen } from '@/features/reminders/RemindersScreen';
import { ProgressScreen } from '@/features/progress/ProgressScreen';
import { ReviewScreen } from '@/features/progress/ReviewScreen';
import { CalendarScreen } from '@/features/progress/CalendarScreen';
import { ProfileScreen } from '@/features/profile/ProfileScreen';
import { FavoritesScreen } from '@/features/profile/FavoritesScreen';
import { DataScreen } from '@/features/profile/DataScreen';
import { SearchScreen } from '@/features/search/SearchScreen';
import { DefinitionsScreen } from '@/features/memorize/DefinitionsScreen';
import { DefinitionScreen } from '@/features/memorize/DefinitionScreen';
import { DefinitionEditorScreen } from '@/features/memorize/DefinitionEditorScreen';
import { MemorizeSessionScreen } from '@/features/memorize/MemorizeSessionScreen';
import { TimedMissingWordScreen } from '@/features/games/TimedMissingWordScreen';

function Boot({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureSeeded()
      .catch((error) => console.error('Seed failed', error))
      .finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="ap-shell">
        <div className="ap-page" style={{ display: 'grid', placeItems: 'center' }}>
          <p className="ap-caption">Chargement d’Apprend+…</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

export function App() {
  return (
    <PreferencesProvider>
      <ToastProvider>
        <ConfirmProvider>
          <Boot>
            {/* HashRouter keeps deep links working on GitHub Pages without any
                server-side rewrite rule. */}
            <HashRouter>
              <div className="ap-shell">
                <Routes>
                  <Route path="/" element={<HomeScreen />} />
                  <Route path="/search" element={<SearchScreen />} />

                  <Route path="/courses" element={<CoursesScreen />} />
                  <Route path="/courses/domain/:domainId" element={<DomainScreen />} />
                  <Route path="/courses/course/:courseId" element={<CourseScreen />} />
                  <Route path="/courses/lesson/:lessonId" element={<LessonScreen />} />
                  <Route path="/courses/new" element={<ContentEditorScreen />} />

                  <Route path="/practice" element={<PracticeScreen />} />
                  <Route
                    path="/practice/editor"
                    element={
                      <Suspense fallback={<main className="ap-page"><p className="ap-caption">Chargement de l’éditeur…</p></main>}>
                        <CodePlaygroundScreen />
                      </Suspense>
                    }
                  />
                  <Route path="/practice/resources" element={<ResourcesScreen />} />

                  <Route path="/games" element={<GamesScreen />} />
                  <Route path="/games/quiz" element={<QuizGameScreen />} />
                  <Route path="/games/memory" element={<MemoryGameScreen />} />
                  <Route path="/games/defi" element={<SpeedChallengeScreen />} />
                  <Route path="/games/timed" element={<TimedMissingWordScreen />} />

                  <Route path="/memorize" element={<DefinitionsScreen />} />
                  <Route path="/memorize/new" element={<DefinitionEditorScreen />} />
                  <Route path="/memorize/:definitionId" element={<DefinitionScreen />} />
                  <Route path="/memorize/:definitionId/edit" element={<DefinitionEditorScreen />} />
                  <Route path="/memorize/:definitionId/play" element={<MemorizeSessionScreen />} />

                  <Route path="/flashcards" element={<FlashcardsScreen />} />

                  <Route path="/reminders" element={<RemindersScreen />} />

                  <Route path="/progress" element={<ProgressScreen />} />
                  <Route path="/progress/review" element={<ReviewScreen />} />
                  <Route path="/progress/calendar" element={<CalendarScreen />} />

                  <Route path="/profile" element={<ProfileScreen />} />
                  <Route path="/profile/favorites" element={<FavoritesScreen />} />
                  <Route path="/profile/data" element={<DataScreen />} />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <BottomNav />
              </div>
            </HashRouter>
          </Boot>
        </ConfirmProvider>
      </ToastProvider>
    </PreferencesProvider>
  );
}
