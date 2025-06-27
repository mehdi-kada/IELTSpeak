import { SubscriptionCard } from "@/components/subscription/SubscriptionCard";

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

// Dashboard types that match the actual Supabase database structure
export interface DashboardSession {
  id: string; // UUID from database
  user_id: string;
  created_at: string;
  level: string; // proficiency_level enum
  ielts_rating: {
    fluency: number;
    grammar: number;
    overall: number;
    vocabulary: number;
    pronunciation: number;
  } | null;
  toefl_rating: {
    overall: number;
    delivery: number;
    language_use: number;
    topic_development: number;
  } | null;
  feedback: {
    negatives: string[];
    positives: string[];
  } | null;
}

// Transformed session for dashboard display
export interface TransformedDashboardSession {
  id: string;
  date: string;
  level: string;
  ieltsScore: number;
  toeflScore: number;
  scores: {
    // IELTS scores
    fluency: number;
    grammar: number;
    vocabulary: number;
    pronunciation: number;
    // TOEFL scores
    delivery: number;
    language_use: number;
    topic_development: number;
  };
  feedback: {
    positivePoints: string[];
    negativePoints: string[];
  };
}

export interface DashboardData {
  success: boolean;
  sessions: TransformedDashboardSession[];
  totalSessions: number;
  averageIeltsScore: number;
  averageToeflScore: number;
}

export interface SubscriptionData {
  user_id: string;
  lemonsqueezy_subscription_id: string;
  lemonsqueezy_customer_id: string;
  status: "active" | "cancelled" | "expired" | "on_trial" | "paused" | "unpaid";
  plan_name: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  renews_at: string;
}

export interface SubscriptionCardProps {
  title: string;
  description: string;
  price: string;
  features: string[];
  variantId: string;
  isPopular: boolean;
}
