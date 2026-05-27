export type {
  Profile,
  UsersConsent,
  UserActiveConsent,
  UserRole,
  ConsentAction,
  UserHealthProfile,
  Meal,
  MealInterval,
  WeightLog,
  ComplianceSnapshot,
  Violation,
  BlogPost,
  BlogContent,
  ChatMessage,
  FeatureFlag,
} from "./database";

export interface AuthFormState {
  error?: string;
  success?: string;
}

export interface ConsentFormState {
  error?: string;
  success?: boolean;
}
