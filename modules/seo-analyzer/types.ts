export type SeoAnalysisInput = {
  url: string;
  html?: string;
};

export type SeoAnalysisResult = {
  score: number;
  metaTitle: string | null;
  metaDescription: string | null;
  h1Count: number;
  h2Count: number;
  issues: string[];
  recommendations: string[];
};
