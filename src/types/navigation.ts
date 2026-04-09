// Navigation type definitions
export type RootStackParamList = {
  Main: undefined;
  Settings: undefined;
  TemplateSelection: undefined;
  CreatePlan: { templateId?: string } | undefined;
  PostMoment: undefined;
};

export type MainTabParamList = {
  Plan: undefined;
  Calendar: undefined;
  Circles: undefined;
  Profile: undefined;
};
