export interface sessionComponentProps {
  mode: "exam" | "practice";
  level: string;
}

export interface EvaluationData {
  sessionId: string;
  level: string;
  evaluation: {
    ielts_ratings: {
      fluency: number;
      grammar: number;
      vocabulary: number;
      pronunciation: number;
      overall: number;
    };
    toefl_ratings: {
      delivery: number;
      language_use: number;
      topic_development: number;
      overall: number;
    };
    feedback: {
      positives: string[];
      negatives: string[];
    };
  };
}
