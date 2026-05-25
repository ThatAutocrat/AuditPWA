export type User = {
  id: string;
  email: string;
  created_at: string;
};

export type DailyLog = {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  planned: string; // What you said you'd do
  actual: string; // What you actually did
  reflection: string; // Why the gap happened (max ~3 sentences)
  mood: "focused" | "scattered" | "dead" | "on-fire" | "just-existing";
  created_at: string;
  updated_at: string;
};

export type Pattern = {
  label: string;
  count: number;
  percentage: number;
};

export type Portrait = {
  period_start: string;
  period_end: string;
  total_logs: number;
  completion_rate: number; // % of days logged
  mood_breakdown: Record<DailyLog["mood"], number>;
  top_excuses: string[]; // recurring phrases from reflections
  productive_days: string[]; // days where plan ~= actual
  honest_summary: string; // the brutal honest paragraph
};

export type AccountabilityPartner = {
  id: string;
  user_id: string;
  partner_id: string;
  status: "pending" | "active" | "rejected";
  created_at: string;
};
