import { z } from "zod";

function requiredText(label: string, min: number, max: number) {
  return z
    .string()
    .trim()
    .min(min, `${label} must be at least ${min} characters.`)
    .max(max, `${label} must be ${max} characters or fewer.`);
}

function optionalUrl(label: string) {
  return z.preprocess((value) => {
    if (value === undefined || value === null) return undefined;
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  }, z.string().url(`${label} must be a valid URL.`).max(240).optional());
}

export const RevenueRangeSchema = z.enum([
  "Under $1M",
  "$1M-$5M",
  "$5M-$25M",
  "$25M-$100M",
  "$100M+",
]);

export const AccessRequestPrioritySchema = z.enum([
  "critical",
  "high",
  "medium",
  "watch",
]);

export const AccessRequestStatusSchema = z.enum([
  "submitted",
  "processing",
  "executive_review",
  "executive_call",
  "approved",
  "waitlisted",
  "declined",
]);

export const RequestAccessInputSchema = z.object({
  fullName: requiredText("Full name", 2, 120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(240),
  company: requiredText("Company / Portfolio", 2, 160),
  industry: requiredText("Industry", 2, 120),
  website: optionalUrl("Website"),
  linkedin: optionalUrl("LinkedIn"),
  revenueRange: RevenueRangeSchema,
  marketFocus: requiredText("Market focus", 4, 220),
  strategicObjective: requiredText("Strategic objective", 12, 320),
  whyApex: requiredText("Why APEX", 20, 1200),
});

export const AccessRequestAnalysisSchema = z.object({
  prestigeScore: z.number().int().min(0).max(100),
  authorityScore: z.number().int().min(0).max(100),
  marketPotentialScore: z.number().int().min(0).max(100),
  luxuryFitScore: z.number().int().min(0).max(100),
  priorityLevel: AccessRequestPrioritySchema,
  executiveSummary: requiredText("Executive summary", 24, 600),
  strategicRecommendation: requiredText("Strategic recommendation", 24, 600),
});

export const AccessRequestUpdateSchema = z.object({
  id: z.string().uuid("Invalid request identifier."),
  status: AccessRequestStatusSchema.optional(),
  executiveNotes: z
    .string()
    .trim()
    .max(2000, "Executive notes must be 2000 characters or fewer.")
    .optional(),
});

export type RequestAccessFormInput = z.input<typeof RequestAccessInputSchema>;
export type RequestAccessInput = z.output<typeof RequestAccessInputSchema>;
export type AccessRequestAnalysis = z.infer<typeof AccessRequestAnalysisSchema>;
export type AccessRequestPriority = z.infer<typeof AccessRequestPrioritySchema>;
export type AccessRequestStatus = z.infer<typeof AccessRequestStatusSchema>;
export type AccessRequestUpdate = z.infer<typeof AccessRequestUpdateSchema>;