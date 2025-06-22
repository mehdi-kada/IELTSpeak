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

// types for polar
// polar product
export interface PolarProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: "one_time" | "recurring";
  recurring_interval?: "month" | "year";
}

// polar user
export interface PolarCustomer {
  id: string;
  email: string;
  name?: string;
  metadata: Record<string, any>;
}

//checkout session for payment
export interface CheckoutSession {
  id: string;
  url: string; // for redirecting FOR payment
  customer_id?: string; // associated customer id
  product_id: string; // product being purchased
  success_url: string; //for redirecting after successful purchase
  error_url: string;
}

// subscription information
export interface Subscription {
  id: string; // Subscription ID
  customer_id: string; // Who owns this subscription
  product_id: string; // What product they're subscribed to
  status: "active" | "canceled" | "past_due" | "trialing"; // Current status
  current_period_start: string; // When current billing period started
  current_period_end: string; // When current billing period ends
  created_at: string; // When subscription was created
}

// Payment/Order information
export interface Order {
  id: string; // Order ID from Polar
  customer_id: string; // Who made the purchase
  product_id: string; // What was purchased
  amount: number; // Amount paid (in cents)
  currency: string; // Currency used
  status: "pending" | "succeeded" | "failed"; // Payment status
  created_at: string; // When order was created
}

export interface UserSubscription {
  id: string; // Primary key
  user_id: string; // Your app's user ID (links to auth.users)
  polar_customer_id: string; // Polar's customer ID
  polar_subscription_id?: string; // Polar's subscription ID (if applicable)
  product_type: string; // What they purchased ("premium", "basic", etc.)
  status: string; // Current subscription status
  expires_at?: string; // When subscription expires
  created_at: string; // When record was created
  updated_at: string; // When record was last updated
}