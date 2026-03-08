export type BuilderInput = {
  businessType: string;
  city: string;
  style: string;
  services: string[];
};

export type PageSection = {
  id: string;
  title: string;
  description: string;
};

export type PageDefinition = {
  slug: "home" | "services" | "about" | "contact";
  title: string;
  headline: string;
  text?: string;
  sections: PageSection[];
  cta: string;
};

export type SiteStructure = {
  home: PageDefinition;
  services: PageDefinition;
  about: PageDefinition;
  contact: PageDefinition;
};

