import { NextResponse } from "next/server";
import { z } from "zod";
import { challengeDays } from "@/lib/content";
import { hasSupabaseEnv } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const challengeSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  lineId: z.string().optional().default(""),
  stressLevel: z.number().min(1).max(10)
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = challengeSchema.parse(json);

    if (hasSupabaseEnv()) {
      const supabase = await getSupabaseServerClient();

      if (supabase) {
        await supabase.from("users").upsert(
          {
            email: payload.email,
            full_name: payload.name,
            line_id: payload.lineId || null,
            stress_level: payload.stressLevel,
            current_plan: "free",
            challenge_day: 1,
            role: "free"
          },
          {
            onConflict: "email"
          }
        );

        const progressRows = challengeDays.map((day) => ({
          email: payload.email,
          day_number: day.day,
          title: day.title,
          completed: day.day === 1 ? false : false
        }));

        await supabase.from("challenge_progress").upsert(progressRows, {
          onConflict: "email,day_number"
        });
      }
    }

    return NextResponse.json({
      ok: true,
      challengeDay: 1
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Challenge signup failed"
      },
      {
        status: 400
      }
    );
  }
}
