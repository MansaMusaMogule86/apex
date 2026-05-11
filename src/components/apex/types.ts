export type IntentType =
  | "intelligence_os"
  | "deal_flow"
  | "influence"
  | "advisory";

export interface ApplicationDraft {
  full_name: string;
  title: string;
  company: string;
  market: string;
  aum_range: string;
  email: string;
  intent_type: IntentType | "";
  problem_statement: string;
  linkedin_url: string;
  website_url: string;
  referral_source: string;
  referral_code: string;
  phantom_scan_authorized: boolean;
  osint_score: number | null;
}

export const EMPTY_DRAFT: ApplicationDraft = {
  full_name: "",
  title: "",
  company: "",
  market: "",
  aum_range: "",
  email: "",
  intent_type: "",
  problem_statement: "",
  linkedin_url: "",
  website_url: "",
  referral_source: "",
  referral_code: "",
  phantom_scan_authorized: false,
  osint_score: null,
};

export type Updater = <K extends keyof ApplicationDraft>(
  key: K,
  value: ApplicationDraft[K],
) => void;
