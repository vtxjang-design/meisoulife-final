import { NextResponse } from "next/server";
import { z } from "zod";
import { buildCoachPrompt, getOpenAiClient } from "@/lib/openai";
import { hasSupabaseEnv } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const coachSchema = z.object({
  message: z.string().min(1),
  history: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string()
    })
  )
});

const fallbackReply = "まず、ゆっくり息を吐きましょう。今のあなたは大丈夫です。";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = coachSchema.parse(json);
    const client = getOpenAiClient();

    let reply = fallbackReply;

    if (client) {
      const response = await client.responses.create({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: buildCoachPrompt(payload.message)
      });

      reply = response.output_text || fallbackReply;
    }

    if (hasSupabaseEnv()) {
      const supabase = await getSupabaseServerClient();

      if (supabase) {
        await supabase.from("coach_messages").insert({
          user_message: payload.message,
          assistant_message: reply
        });
      }
    }

    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Coach failed",
        reply: fallbackReply
      },
      {
        status: 200
      }
    );
  }
}
