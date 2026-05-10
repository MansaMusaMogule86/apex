// src/lib/openrouter.ts
// OpenRouter client — drop-in OpenAI replacement with 200+ models.
// Docs: https://openrouter.ai/docs

import OpenAI from "openai";

let openrouterInstance: OpenAI | null = null;

if (process.env.OPENROUTER_API_KEY) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  openrouterInstance = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": siteUrl,
      "X-Title": "APEX",
    },
  });
} else {
  console.warn("[openrouter] OPENROUTER_API_KEY is not set — AI routes will fail");
}

export { openrouterInstance as openrouter };

// ─── Models ──────────────────────────────────────────────────────
export const MODELS = {
  fast:     "mistralai/mistral-7b-instruct",
  balanced: "mistralai/mistral-small",
  smart:    "mistralai/mistral-medium",
  best:     "anthropic/claude-sonnet-4.5",
} as const;

export type ModelKey = keyof typeof MODELS;

export const DEFAULT_MODEL = MODELS.best;

// ─── Helper: simple text completion ──────────────────────────────
export async function complete({
  prompt,
  system,
  model = "balanced",
  maxTokens = 1000,
}: {
  prompt: string;
  system?: string;
  model?: ModelKey;
  maxTokens?: number;
}): Promise<string> {
  if (!openrouterInstance) {
    throw new Error("OpenRouter is not configured");
  }
  const messages: OpenAI.ChatCompletionMessageParam[] = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: prompt });

  const response = await openrouterInstance.chat.completions.create({
    model: MODELS[model],
    messages,
    max_tokens: maxTokens,
  });

  return response.choices[0]?.message?.content ?? "";
}

// ─── Helper: JSON response ───────────────────────────────────────
export async function completeJSON<T>({
  prompt,
  system,
  model = "balanced",
  maxTokens = 1000,
}: {
  prompt: string;
  system?: string;
  model?: ModelKey;
  maxTokens?: number;
}): Promise<T> {
  const jsonSystem = [
    system,
    "Respond ONLY with valid JSON. No markdown, no backticks, no explanation.",
  ]
    .filter(Boolean)
    .join("\n\n");

  const raw = await complete({ prompt, system: jsonSystem, model, maxTokens });
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean) as T;
}

// ─── Helper: streaming completion ────────────────────────────────
export async function streamCompletion({
  prompt,
  system,
  model = "balanced",
}: {
  prompt: string;
  system?: string;
  model?: ModelKey;
}): Promise<ReadableStream<string>> {
  if (!openrouterInstance) {
    throw new Error("OpenRouter is not configured");
  }
  const messages: OpenAI.ChatCompletionMessageParam[] = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: prompt });

  const stream = await openrouterInstance.chat.completions.create({
    model: MODELS[model],
    messages,
    stream: true,
  });

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? "";
        if (text) controller.enqueue(text);
      }
      controller.close();
    },
  });
}
