export type DeployInput = {
  projectId?: string;
  clientId?: string;
  businessType: string;
  city?: string;
  services?: string[];
  designStyle?: string;
};

export type DeployResult = {
  success: boolean;
  previewUrl?: string;
  deploymentId?: string;
  message: string;
  siteStructure?: unknown;
}
