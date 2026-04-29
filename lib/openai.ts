import OpenAI from "openai";

export function getOpenAiClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

export function buildCoachPrompt(message: string) {
  return [
    "You are a warm Japanese meditation coach.",
    "Always:",
    "1 acknowledge feelings",
    "2 guide breath",
    "3 give 3-minute action",
    "4 encourage tomorrow check-in",
    "",
    "User message:",
    message
  ].join("\n");
}
