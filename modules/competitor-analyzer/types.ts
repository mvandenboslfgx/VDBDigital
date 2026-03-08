export type CompetitorAnalyzerInput = {
  industry: string;
  city: string;
};

export type CompetitorResult = {
  name: string;
  url?: string;
  seoScore: number;
  designQuality: string;
  strengths: string[];
  gaps: string[];
};

export type CompetitorAnalysisResult = {
  topCompetitors: CompetitorResult[];
  seoComparison: string[];
  designQualitySummary: string;
  marketingGaps: string[];
  recommendations: string[];
}
