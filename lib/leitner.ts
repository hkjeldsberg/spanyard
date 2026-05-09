export const LEITNER_INTERVALS = [0, 1, 3, 7, 14, 30] as const; // index = box
export const LEITNER_PROGRESS  = [0, 20, 40, 60, 80, 100] as const;
export const NEW_WORDS_PER_SESSION = 10;
export const MAX_REVIEW_PER_SESSION = 20;

export function nextBox(current: number, correct: boolean): number {
  if (correct) return Math.min(current + 1, 5);
  return 1;
}

export function nextReviewDate(box: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + LEITNER_INTERVALS[box]);
  return d;
}

export function progressPercent(box: number): number {
  return LEITNER_PROGRESS[box] ?? 0;
}

export function fluencyScore(boxCounts: number[]): number {
  // boxCounts[i] = number of words in box i (1-indexed, 0 = unseen)
  const total = 1000;
  const weighted = boxCounts.reduce((sum, count, box) => {
    return sum + count * LEITNER_PROGRESS[box];
  }, 0);
  return Math.round(weighted / total);
}
