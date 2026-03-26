import type OpenAI from "openai";

export type OfferChatProvider = "groq" | "openai";

export type OfferChatClient = {
  client: OpenAI;
  model: string;
  provider: OfferChatProvider;
};

const GROQ_DEFAULT_BASE = "https://api.groq.com/openai/v1";
const GROQ_DEFAULT_MODEL = "llama-3.3-70b-versatile";
const OPENAI_DEFAULT_MODEL = "gpt-4o";

/**
 * Weekly offers use Groq when `GROQ_API_KEY` is set; otherwise the existing
 * OpenAI integration env vars (see @workspace/integrations-openai-ai-server).
 */
export async function getOfferChatClient(): Promise<OfferChatClient> {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (groqKey) {
    const { default: OpenAIConstructor } = await import("openai");
    const baseURL = process.env.GROQ_BASE_URL?.trim() || GROQ_DEFAULT_BASE;
    const model = process.env.GROQ_CHAT_MODEL?.trim() || GROQ_DEFAULT_MODEL;
    return {
      client: new OpenAIConstructor({ apiKey: groqKey, baseURL }),
      model,
      provider: "groq",
    };
  }

  const { openai } = await import("@workspace/integrations-openai-ai-server");
  const model = process.env.OPENAI_CHAT_MODEL?.trim() || OPENAI_DEFAULT_MODEL;
  return {
    client: openai,
    model,
    provider: "openai",
  };
}

export function offerChatCompletionParams(provider: OfferChatProvider) {
  if (provider === "groq") {
    return { max_tokens: 2048 } as const;
  }
  return { max_completion_tokens: 2048 } as const;
}
