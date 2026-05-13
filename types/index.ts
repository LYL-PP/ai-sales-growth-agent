// ============================================================
// AI Sales Growth Agent - Global Type Definitions
// ============================================================

// --- User Related ---
export interface User {
  id: string;
  name: string;
  avatar: string;
  company: string;
  title: string;
  industry: string;
  tags: UserTag[];
  stage: UserStage;
  intent: UserIntent;
  probability: number; // 0-100
  riskLevel: RiskLevel;
  lastActive: string;
  source: string;
}

export interface UserTag {
  id: string;
  label: string;
  type: "intent" | "behavior" | "demographic" | "risk" | "value";
}

export type UserStage =
  | "initial_inquiry"
  | "comparison"
  | "closing"
  | "at_risk";

export type UserIntent =
  | "price_objection"
  | "hesitant"
  | "high_intent"
  | "watching"
  | "unclear_need";

export type RiskLevel = "low" | "medium" | "high" | "critical";

// --- Conversation ---
export interface Message {
  id: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface Conversation {
  userId: string;
  messages: Message[];
}

// --- AI Analysis ---
export interface AIAnalysis {
  intent: {
    primary: UserIntent;
    confidence: number;
    reasoning: string;
  };
  stage: {
    current: UserStage;
    indicators: string[];
  };
  risk: {
    level: RiskLevel;
    factors: string[];
  };
  strategy: {
    recommendation: string;
    shouldEscalate: boolean;
    escalateReason?: string;
    nextActions: string[];
  };
  suggestedReply: string;
}

// --- Dashboard ---
export interface DashboardMetrics {
  newUsersToday: number;
  newUsersTrend: number;
  highIntentCount: number;
  highIntentTrend: number;
  aiProcessingRate: number;
  aiProcessingTrend: number;
  humanTakeoverRate: number;
  humanTakeoverTrend: number;
  predictedConversions: number;
  predictedConversionsTrend: number;
}

export interface ConversionFunnel {
  leads: number;
  inquiries: number;
  intentConfirmed: number;
  signed: number;
}

export interface AIInsight {
  id: string;
  type: "warning" | "opportunity" | "suggestion" | "alert";
  title: string;
  description: string;
  relatedUserId?: string;
  priority: "high" | "medium" | "low";
}

// --- Profile ---
export interface UserProfile extends User {
  email: string;
  phone: string;
  createdAt: string;
  totalInteractions: number;
  avgResponseTime: string;
  behaviorTimeline: BehaviorEvent[];
  aiSummary: string;
  followStrategy: FollowStrategy;
}

export interface BehaviorEvent {
  id: string;
  type: "chat" | "visit" | "click" | "form" | "call";
  description: string;
  timestamp: string;
}

export interface FollowStrategy {
  priority: "urgent" | "high" | "normal" | "low";
  actions: FollowAction[];
}

export interface FollowAction {
  action: string;
  channel: "phone" | "wechat" | "email" | "sms";
  timing: string;
}
