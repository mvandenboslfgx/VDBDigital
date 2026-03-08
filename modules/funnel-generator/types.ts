export type FunnelGeneratorInput = {
  businessType: string;
  offer?: string;
  targetAudience?: string;
};

export type FunnelGeneratorResult = {
  landingPageStructure: {
    headline: string;
    subheadline: string;
    sections: Array<{ title: string; description: string }>;
    cta: string;
  };
  offerIdea: {
    title: string;
    description: string;
    leadMagnet?: string;
  };
  emailFunnel: {
    subjectLines: string[];
    sequenceSteps: string[];
  };
  adIdeas: string[];
}
