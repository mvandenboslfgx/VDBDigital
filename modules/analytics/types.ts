export type AnalyticsEventType = "visit" | "audit" | "copy" | "builder" | "contact";

export type AnalyticsSummary = {
  totalVisitors: number;
  totalLeads: number;
  conversionRate: number;
  revenue: number;
};
