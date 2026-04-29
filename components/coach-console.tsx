"use client";

import { useMemo, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const presetChips = ["疲れた", "不安", "眠れない", "イライラする", "孤独"];

export function CoachConsole() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "今日はどんな気分ですか。短い言葉でも大丈夫です。"
    }
  ]);
  const [loading, setLoading] = useState(false);

  const dailyUsage = useMemo(() => {
    return messages.filter((message) => message.role === "user").length;
  }, [messages]);

  async function sendMessage(nextMessage?: string) {
    const content = (nextMessage || input).trim();

    if (!content || loading) {
      return;
    }

    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: content,
          history: nextMessages
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "coach response failed");
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.reply
        }
      ]);
    } catch (_error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "まず、ゆっくり息を吐きましょう。今のあなたは大丈夫です。"
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="premium-card rounded-lg p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-gold">AI Meditation Coach</p>
        <h1 className="mt-4 font-serif text-3xl text-white sm:text-4xl">今日の気分を入力してください</h1>
        <p className="mt-3 text-base leading-8 text-white/72">
          無料会員は1日3回まで、有料会員は無制限で使えます。今は安全に試せるプレースホルダー応答も用意しています。
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {presetChips.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => {
              setInput(chip);
              void sendMessage(chip);
            }}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/88 transition hover:border-gold/50 hover:bg-white/10"
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="premium-card rounded-lg p-4 sm:p-6">
        <div className="grid gap-4">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={message.role === "assistant" ? "rounded-lg bg-white/5 p-4" : "rounded-lg bg-moss/20 p-4"}
            >
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-gold/80">
                {message.role === "assistant" ? "Coach" : "You"}
              </p>
              <p className="whitespace-pre-wrap text-sm leading-7 text-white/88">{message.content}</p>
            </div>
          ))}
        </div>
        <form
          className="mt-6 grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void sendMessage();
          }}
        >
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={4}
            className="rounded-md border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-gold/60"
            placeholder="たとえば『仕事でずっと気が張っている』など"
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-white/60">本日の送信回数: {dailyUsage}</p>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#e7cd92] disabled:opacity-60"
            >
              {loading ? "AIに相談中..." : "AIに相談する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
