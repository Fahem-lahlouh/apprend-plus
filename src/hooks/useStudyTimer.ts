import { useEffect, useRef } from 'react';
import { recordSession } from '@/services/learningService';
import type { ActivityKind, Id } from '@/models';

/**
 * Measures how long a screen is actually visible and stores it as a learning
 * session on unmount. Time spent with the tab hidden is not counted, so the
 * daily total reflects real study time.
 */
export function useStudyTimer(input: {
  activity: ActivityKind;
  domainId?: Id;
  courseId?: Id;
  lessonId?: Id;
  enabled?: boolean;
}) {
  const { activity, domainId, courseId, lessonId, enabled = true } = input;
  const accumulated = useRef(0);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return undefined;
    startedAt.current = Date.now();

    const pause = () => {
      if (startedAt.current === null) return;
      accumulated.current += (Date.now() - startedAt.current) / 1000;
      startedAt.current = null;
    };
    const resume = () => {
      if (startedAt.current === null) startedAt.current = Date.now();
    };
    const onVisibility = () => (document.hidden ? pause() : resume());

    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      pause();
      const seconds = accumulated.current;
      accumulated.current = 0;
      if (seconds >= 5) {
        void recordSession({ durationSec: seconds, activity, domainId, courseId, lessonId });
      }
    };
  }, [activity, domainId, courseId, lessonId, enabled]);
}
