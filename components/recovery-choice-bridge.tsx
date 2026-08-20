"use client";

import { useState } from "react";
import type { LandingCopy } from "@/lib/landing-copy";

type RecoveryChoiceBridgeProps = {
  copy: LandingCopy["instant"]["recoveryChoiceBridge"];
  supportChoices: LandingCopy["instant"]["supportChoices"];
};

type BridgeStep = "outcome" | "choice" | "review" | "ended";

const MAX_CUSTOM_CHOICE_LENGTH = 120;

export function RecoveryChoiceBridge({ copy, supportChoices }: RecoveryChoiceBridgeProps) {
  const [step, setStep] = useState<BridgeStep>("outcome");
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [customChoice, setCustomChoice] = useState("");
  const [writingOwnChoice, setWritingOwnChoice] = useState(false);

  function continueToChoice(outcome?: string) {
    setSelectedOutcome(outcome ?? null);
    setStep("choice");
  }

  function selectChoice(choice: string) {
    setSelectedChoice(choice);
    setWritingOwnChoice(false);
    setStep("review");
  }

  function chooseCustomChoice() {
    const trimmedChoice = customChoice.trim();

    if (!trimmedChoice) {
      return;
    }

    selectChoice(trimmedChoice);
  }

  function changeChoice() {
    setStep("choice");
  }

  function deleteChoice() {
    setSelectedChoice(null);
    setCustomChoice("");
    setWritingOwnChoice(false);
    setStep("choice");
  }

  return (
    <div className="mt-5 border-t border-white/10 pt-5" data-recovery-choice-bridge>
      {step === "outcome" ? (
        <div>
          <p className="text-sm font-medium leading-6 text-white/82">{copy.outcomeQuestion}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {copy.outcomes.map((outcome) => {
              const selected = selectedOutcome === outcome;

              return (
                <button
                  key={outcome}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => continueToChoice(outcome)}
                  className={`min-h-[44px] rounded-full border px-4 py-2 text-sm font-medium transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/65 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08111b] ${
                    selected
                      ? "border-gold/35 bg-gold/[0.16] text-white shadow-[0_12px_28px_rgba(212,186,117,0.12)]"
                      : "border-white/10 bg-white/[0.05] text-white/72 hover:border-white/14 hover:bg-white/[0.07] hover:text-white"
                  }`}
                >
                  {outcome}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => continueToChoice()}
            className="mt-3 min-h-[44px] text-sm text-white/60 underline decoration-white/25 underline-offset-4 transition hover:text-white/82 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/65 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08111b]"
          >
            {copy.skipOutcome}
          </button>
        </div>
      ) : null}

      {step === "choice" ? (
        <div>
          <p className="text-sm font-medium leading-6 text-white/82">{copy.choiceQuestion}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {supportChoices.map((choice) => (
              <button
                key={choice.key}
                type="button"
                aria-pressed={selectedChoice === choice.label}
                onClick={() => selectChoice(choice.label)}
                className="min-h-[44px] rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white/72 transition duration-300 hover:border-white/14 hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/65 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08111b]"
              >
                {choice.label}
              </button>
            ))}
            <button
              type="button"
              aria-pressed={writingOwnChoice}
              onClick={() => setWritingOwnChoice((current) => !current)}
              className={`min-h-[44px] rounded-full border px-4 py-2 text-sm font-medium transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/65 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08111b] ${
                writingOwnChoice
                  ? "border-gold/35 bg-gold/[0.16] text-white shadow-[0_12px_28px_rgba(212,186,117,0.12)]"
                  : "border-white/10 bg-white/[0.05] text-white/72 hover:border-white/14 hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              {copy.writeOwn}
            </button>
          </div>
          {writingOwnChoice ? (
            <div className="mt-3 grid gap-3">
              <label className="grid gap-2 text-sm leading-6 text-white/72">
                <span>{copy.customChoiceLabel}</span>
                <textarea
                  value={customChoice}
                  onChange={(event) => setCustomChoice(event.target.value.slice(0, MAX_CUSTOM_CHOICE_LENGTH))}
                  maxLength={MAX_CUSTOM_CHOICE_LENGTH}
                  rows={3}
                  className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white outline-none transition focus:border-gold/45 focus:ring-2 focus:ring-gold/20"
                />
              </label>
              <button
                type="button"
                onClick={chooseCustomChoice}
                disabled={!customChoice.trim()}
                className="min-h-[44px] w-fit rounded-full border border-gold/25 bg-gold/[0.14] px-4 py-2 text-sm font-medium text-white transition hover:bg-gold/[0.2] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/65 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08111b]"
              >
                {copy.chooseCustomChoice}
              </button>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => setStep("ended")}
            className="mt-4 min-h-[44px] text-sm text-white/60 underline decoration-white/25 underline-offset-4 transition hover:text-white/82 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/65 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08111b]"
          >
            {copy.noChoice}
          </button>
        </div>
      ) : null}

      {step === "review" && selectedChoice ? (
        <div>
          <p className="whitespace-pre-line text-sm leading-6 text-white/82">{copy.reviewMessage}</p>
          <p className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white/72">{selectedChoice}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={changeChoice}
              className="min-h-[44px] rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/72 transition hover:border-white/14 hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/65 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08111b]"
            >
              {copy.changeChoice}
            </button>
            <button
              type="button"
              onClick={deleteChoice}
              className="min-h-[44px] rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/72 transition hover:border-white/14 hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/65 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08111b]"
            >
              {copy.deleteChoice}
            </button>
            <button
              type="button"
              onClick={() => setStep("ended")}
              className="min-h-[44px] rounded-full border border-gold/25 bg-gold/[0.14] px-4 py-2 text-sm font-medium text-white transition hover:bg-gold/[0.2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/65 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08111b]"
            >
              {copy.endForToday}
            </button>
          </div>
        </div>
      ) : null}

      {step === "ended" ? <p className="text-sm leading-6 text-white/82">{copy.endingMessage}</p> : null}

      <p className="mt-4 text-xs leading-5 text-white/48">{copy.privacyNote}</p>
    </div>
  );
}
