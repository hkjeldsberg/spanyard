export interface Word {
  id: number;
  rank: number;
  spanish: string;
  english: string;
  pos: string | null;
}

export interface UserWord {
  id: number;
  word_id: number;
  box: number;
  next_review_at: string;
  last_reviewed_at: string | null;
}

export interface Sentence {
  id: number;
  word_id: number;
  spanish: string;
  english: string;
  cloze: string;
  created_at: string;
}

export type ExerciseMode = "cloze" | "scrambler";

export interface Exercise {
  word: Word;
  sentence: Sentence;
  mode: ExerciseMode;
  box: number;
  isNew: boolean;
}

export interface SessionResult {
  word_id: number;
  correct: boolean;
}
