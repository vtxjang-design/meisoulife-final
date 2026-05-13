const RESEND_API_URL = "https://api.resend.com/emails";

type SupportedLanguage = "ja" | "ko";

type PaymentConfirmationEmailInput = {
  email: string;
  name?: string | null;
  language?: string | null;
  plan?: string | null;
  amountTotal?: number | null;
  currency?: string | null;
};

function normalizeLanguage(language?: string | null): SupportedLanguage {
  return language === "ko" ? "ko" : "ja";
}

function getRecipientName(name?: string | null, language: SupportedLanguage = "ja") {
  const trimmed = name?.trim();

  if (trimmed) {
    return language === "ko" ? `${trimmed}님` : `${trimmed} 様`;
  }

  return language === "ko" ? "회원님" : "会員様";
}

function buildSubject(language: SupportedLanguage) {
  return language === "ko"
    ? "瞑想life 참여가 완료되었습니다"
    : "瞑想lifeへのご参加ありがとうございます";
}

function buildTextBody(input: PaymentConfirmationEmailInput) {
  const language = normalizeLanguage(input.language);
  const recipient = getRecipientName(input.name, language);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.meisoulife.com";

  if (language === "ko") {
    return `${recipient}

瞑想life에 함께해주셔서 감사합니다.

오늘부터 무리하지 않고, 나에게 돌아오는 작은 리듬을 함께 시작해봅니다.

먼저 1분 호흡만으로도 충분합니다.

▼ 瞑想life 열기
${siteUrl}

당신의 하루가 조금씩 고요하게 정돈되기를 바랍니다.

瞑想life`;
  }

  return `${recipient}

瞑想lifeにご参加いただき、ありがとうございます。

今日から、無理なく自分に戻る小さなリズムを一緒に始めていきましょう。

まずは、1分の呼吸からで十分です。

▼ 瞑想lifeを開く
${siteUrl}

あなたの毎日が、少しずつ静かに整っていきますように。

瞑想life`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildHtmlBody(input: PaymentConfirmationEmailInput) {
  const language = normalizeLanguage(input.language);
  const recipient = escapeHtml(getRecipientName(input.name, language));
  const siteUrl = escapeHtml(process.env.NEXT_PUBLIC_SITE_URL || "https://www.meisoulife.com");
  const intro =
    language === "ko"
      ? "瞑想life에 함께해주셔서 감사합니다。"
      : "瞑想lifeにご参加いただき、ありがとうございます。";
  const bodyA =
    language === "ko"
      ? "오늘부터 무리하지 않고, 나에게 돌아오는 작은 리듬을 함께 시작해봅니다。"
      : "今日から、無理なく自分に戻る小さなリズムを一緒に始めていきましょう。";
  const bodyB =
    language === "ko"
      ? "먼저 1분 호흡만으로도 충분합니다。"
      : "まずは、1分の呼吸からで十分です。";
  const cta = language === "ko" ? "瞑想life 열기" : "瞑想lifeを開く";
  const closing =
    language === "ko"
      ? "당신의 하루가 조금씩 고요하게 정돈되기를 바랍니다。"
      : "あなたの毎日が、少しずつ静かに整っていきますように。";

  return `
    <div style="margin:0;background:#0b0f0d;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#f4efe5;">
      <div style="max-width:560px;margin:0 auto;border-radius:24px;overflow:hidden;background:linear-gradient(180deg,#122018 0%,#0d1411 100%);border:1px solid rgba(244,239,229,0.08);box-shadow:0 20px 60px rgba(0,0,0,0.35);">
        <div style="padding:40px 32px;">
          <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#b0c2a1;margin-bottom:20px;">Meisoulife</div>
          <p style="margin:0 0 20px;font-size:18px;line-height:1.8;color:#f7f2e9;">${recipient}</p>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.9;color:#efe8dc;">${intro}</p>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.9;color:#efe8dc;">${bodyA}</p>
          <p style="margin:0 0 28px;font-size:16px;line-height:1.9;color:#efe8dc;">${bodyB}</p>
          <a href="${siteUrl}" style="display:inline-block;border-radius:999px;background:#e7d7a8;padding:12px 20px;color:#182117;text-decoration:none;font-size:14px;font-weight:600;">${cta}</a>
          <p style="margin:28px 0 0;font-size:15px;line-height:1.9;color:#d9d1c2;">${closing}</p>
          <p style="margin:20px 0 0;font-size:15px;line-height:1.8;color:#f7f2e9;">瞑想life</p>
        </div>
      </div>
    </div>
  `;
}

export async function sendPaymentConfirmationEmail(input: PaymentConfirmationEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("[resend] skipped payment confirmation email", {
      reason: "missing_api_key",
      email: input.email
    });
    return { sent: false as const, skipped: true as const };
  }

  const language = normalizeLanguage(input.language);
  const from = process.env.RESEND_FROM_EMAIL || "Meisoulife <onboarding@resend.dev>";

  console.log("[resend] payment confirmation email sending started", {
    email: input.email,
    language,
    from,
    plan: input.plan ?? null
  });

  // If hello@meisoulife.com is not verified in Resend yet, use a verified onboarding/testing sender here.
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [input.email],
      subject: buildSubject(language),
      text: buildTextBody(input),
      html: buildHtmlBody(input)
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[resend] payment confirmation email failed", {
      email: input.email,
      status: response.status,
      errorText
    });
    throw new Error(`Resend API failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  console.log("[resend] payment confirmation email sent successfully", {
    email: input.email,
    id: data?.id ?? null,
    plan: input.plan ?? null,
    amountTotal: input.amountTotal ?? null,
    currency: input.currency ?? null
  });

  return { sent: true as const, id: data?.id ?? null };
}
