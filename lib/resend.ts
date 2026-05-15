const RESEND_API_URL = "https://api.resend.com/emails";

type SupportedLanguage = "ja" | "ko";

type PaymentConfirmationEmailInput = {
  email: string;
  name?: string | null;
  language?: string | null;
  plan?: string | null;
  amountTotal?: number | null;
  currency?: string | null;
  subscriptionId?: string | null;
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
    ? "🌿 瞑想life에 오신 것을 환영합니다 — 새로운 리듬의 시작"
    : "🌿 瞑想lifeへようこそ — 新しいリズムの始まり";
}

function getPlanHighlights(plan?: string | null, language: SupportedLanguage = "ja") {
  const normalizedPlan = String(plan || "").toLowerCase();

  if (normalizedPlan === "growth") {
    return language === "ko"
      ? [
          "・7일 리듬과 1분 호흡",
          "・실천 커뮤니티 참여",
          "・AI 코치와 함께 이어가는 리듬"
        ]
      : [
          "・7日リズムと1分瞑想",
          "・実践コミュニティへの参加",
          "・AIコーチと共に続けるリズム"
        ];
  }

  if (normalizedPlan === "inner_circle" || normalizedPlan === "inner-circle") {
    return language === "ko"
      ? [
          "・7일 리듬과 1분 호흡",
          "・실천 커뮤니티 참여",
          "・プレミアム 세션 안내 우선 수신"
        ]
      : [
          "・7日リズムと1分瞑想",
          "・実践コミュニティへの参加",
          "・プレミアムセッション案内の優先受信"
        ];
  }

  return language === "ko"
    ? [
        "・7일 리듬과 1분 호흡",
        "・무리 없이 이어가는 기본 리듬"
      ]
    : [
        "・7日リズムと1分瞑想",
        "・無理なく続ける基本リズム"
      ];
}

function buildTextBody(input: PaymentConfirmationEmailInput) {
  const language = normalizeLanguage(input.language);
  const recipient = getRecipientName(input.name, language);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.meisoulife.com";
  const lineUrl = process.env.NEXT_PUBLIC_LINE_URL || "(LINEリンク placeholder)";
  const planHighlights = getPlanHighlights(input.plan, language).join("\n");

  if (language === "ko") {
    return `${recipient}

안녕하세요.

瞑想life에 함께해주셔서 감사합니다.

이것은 단순한 콘텐츠 구매가 아니라,
"나에게 돌아오는 조용한 리듬"에 참여하는 시작입니다.

먼저 7일 동안,
무리하지 않고 부드럽게 시작해보세요.

【가장 먼저 해볼 것】

1. 오늘의 1분 명상
${siteUrl}/meditation

2. AI 습관 코치
${siteUrl}/coach

3. 커뮤니티 참여
${lineUrl}

4. 당신의 성장 페이지
${siteUrl}/member

【이번 플랜으로 함께할 리듬】
${planHighlights}

혼자 애쓰지 않아도 괜찮습니다.

"혼자 버티는 삶에서,
함께 깨어나는 삶으로."

瞑想life 팀`;
  }

  return `${recipient}

こんにちは。

瞑想lifeへご参加ありがとうございます。

これはコンテンツ購入ではなく、
「自分に戻る静かなリズム」を育てる参加です。

まず最初の7日間、
無理なく、やさしく始めましょう。

【最初のステップ】

1. 今日の1分瞑想
${siteUrl}/meditation

2. AI習慣コーチ
${siteUrl}/coach

3. コミュニティ参加
${lineUrl}

4. あなたの成長ページ
${siteUrl}/member

【このプランで始まるリズム】
${planHighlights}

一人で頑張らなくて大丈夫です。

「ひとりで耐える人生から、
共に目覚める人生へ。」

瞑想lifeチーム`;
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
  const lineUrl = escapeHtml(process.env.NEXT_PUBLIC_LINE_URL || "(LINEリンク placeholder)");
  const intro =
    language === "ko"
      ? "이것은 단순한 콘텐츠 구매가 아니라, ‘나에게 돌아오는 조용한 리듬’에 참여하는 시작입니다."
      : "これはコンテンツ購入ではなく、「自分に戻る静かなリズム」を育てる参加です。";
  const bodyA =
    language === "ko"
      ? "먼저 7일 동안, 무리하지 않고 부드럽게 시작해보세요."
      : "まず最初の7日間、無理なく、やさしく始めましょう。";
  const closing =
    language === "ko"
      ? "혼자 애쓰지 않아도 괜찮습니다。"
      : "一人で頑張らなくて大丈夫です。";
  const quote =
    language === "ko"
      ? "“혼자 버티는 삶에서, 함께 깨어나는 삶으로.”"
      : "「ひとりで耐える人生から、共に目覚める人生へ。」";
  const step1 = language === "ko" ? "오늘의 1분 명상" : "今日の1分瞑想";
  const step2 = language === "ko" ? "AI 습관 코치" : "AI習慣コーチ";
  const step3 = language === "ko" ? "커뮤니티 참여" : "コミュニティ参加";
  const step4 = language === "ko" ? "당신의 성장 페이지" : "あなたの成長ページ";
  const planTitle = language === "ko" ? "이번 플랜으로 함께할 리듬" : "このプランで始まるリズム";
  const highlights = getPlanHighlights(input.plan, language)
    .map((item) => `<li style="margin:0 0 8px;">${escapeHtml(item.replace(/^・/, ""))}</li>`)
    .join("");

  return `
    <div style="margin:0;background:#0b0f0d;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#f4efe5;">
      <div style="max-width:560px;margin:0 auto;border-radius:24px;overflow:hidden;background:linear-gradient(180deg,#122018 0%,#0d1411 100%);border:1px solid rgba(244,239,229,0.08);box-shadow:0 20px 60px rgba(0,0,0,0.35);">
        <div style="padding:40px 32px;">
          <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#b0c2a1;margin-bottom:20px;">Meisoulife</div>
          <p style="margin:0 0 20px;font-size:18px;line-height:1.8;color:#f7f2e9;">${recipient}</p>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.9;color:#efe8dc;">${intro}</p>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.9;color:#efe8dc;">${bodyA}</p>
          <div style="border-radius:20px;border:1px solid rgba(244,239,229,0.08);background:rgba(255,255,255,0.03);padding:20px 20px 16px;margin-bottom:24px;">
            <p style="margin:0 0 14px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#b0c2a1;">First Steps</p>
            <p style="margin:0 0 10px;"><a href="${siteUrl}/meditation" style="color:#f4efe5;text-decoration:none;">1. ${step1}</a></p>
            <p style="margin:0 0 10px;"><a href="${siteUrl}/coach" style="color:#f4efe5;text-decoration:none;">2. ${step2}</a></p>
            <p style="margin:0 0 10px;"><a href="${lineUrl}" style="color:#f4efe5;text-decoration:none;">3. ${step3}</a></p>
            <p style="margin:0;"><a href="${siteUrl}/member" style="color:#f4efe5;text-decoration:none;">4. ${step4}</a></p>
          </div>
          <div style="border-radius:20px;border:1px solid rgba(212,186,117,0.16);background:rgba(212,186,117,0.06);padding:20px 20px 12px;margin-bottom:24px;">
            <p style="margin:0 0 12px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#d4ba75;">${planTitle}</p>
            <ul style="margin:0;padding-left:18px;line-height:1.8;color:#efe8dc;">${highlights}</ul>
          </div>
          <p style="margin:0 0 12px;font-size:15px;line-height:1.9;color:#d9d1c2;">${closing}</p>
          <p style="margin:0 0 22px;font-size:16px;line-height:1.9;color:#f7f2e9;">${quote}</p>
          <a href="${siteUrl}/member" style="display:inline-block;border-radius:999px;background:#e7d7a8;padding:12px 20px;color:#182117;text-decoration:none;font-size:14px;font-weight:600;">${language === "ko" ? "성장 페이지 열기" : "成長ページを開く"}</a>
          <p style="margin:22px 0 0;font-size:15px;line-height:1.8;color:#f7f2e9;">瞑想lifeチーム</p>
        </div>
      </div>
    </div>
  `;
}

async function sendEmail(params: {
  to: string[];
  subject: string;
  text: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("[resend] skipped email", { reason: "missing_api_key", to: params.to });
    return { sent: false as const, skipped: true as const };
  }

  const from =
    process.env.EMAIL_FROM ||
    process.env.RESEND_FROM_EMAIL ||
    process.env.FROM_EMAIL ||
    "Meisoulife <onboarding@resend.dev>";

  // If hello@meisoulife.com is not verified in Resend yet, use a verified onboarding/testing sender here.
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend API failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return { sent: true as const, id: data?.id ?? null };
}

export async function sendPaymentConfirmationEmail(input: PaymentConfirmationEmailInput) {
  const language = normalizeLanguage(input.language);

  console.log("[resend] payment confirmation email sending started", {
    email: input.email,
    language,
    plan: input.plan ?? null
  });

  try {
    const result = await sendEmail({
      to: [input.email],
      subject: buildSubject(language),
      text: buildTextBody(input),
      html: buildHtmlBody(input)
    });

    if (!result.sent) {
      return result;
    }

    console.log("[resend] payment confirmation email sent successfully", {
      email: input.email,
      id: result.id ?? null,
      plan: input.plan ?? null,
      amountTotal: input.amountTotal ?? null,
      currency: input.currency ?? null
    });

    return result;
  } catch (error) {
    console.error("[resend] payment confirmation email failed", {
      email: input.email,
      error: error instanceof Error ? error.message : error
    });
    throw error;
  }
}

export async function sendAdminPaymentNotification(input: {
  customerEmail: string;
  customerName?: string | null;
  plan?: string | null;
  amountTotal?: number | null;
  currency?: string | null;
}) {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    return { sent: false as const, skipped: true as const };
  }

  const subject = "New Meisoulife payment received";
  const amount =
    typeof input.amountTotal === "number"
      ? `${(input.amountTotal / 100).toLocaleString("ja-JP")} ${String(input.currency || "JPY").toUpperCase()}`
      : "Unknown amount";
  const text = `A new Meisoulife payment was completed.

Customer: ${input.customerName || "Unknown"}
Email: ${input.customerEmail}
Plan: ${input.plan || "Unknown"}
Amount: ${amount}`;
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:24px;background:#0b0f0d;color:#f4efe5;">
      <div style="max-width:560px;margin:0 auto;border-radius:20px;padding:24px;background:#101816;border:1px solid rgba(244,239,229,0.08);">
        <h1 style="margin:0 0 16px;font-size:20px;">New Meisoulife payment received</h1>
        <p style="margin:0 0 10px;">Customer: ${escapeHtml(input.customerName || "Unknown")}</p>
        <p style="margin:0 0 10px;">Email: ${escapeHtml(input.customerEmail)}</p>
        <p style="margin:0 0 10px;">Plan: ${escapeHtml(input.plan || "Unknown")}</p>
        <p style="margin:0;">Amount: ${escapeHtml(amount)}</p>
      </div>
    </div>
  `;

  console.log("[resend] admin payment notification sending started", {
    adminEmail,
    customerEmail: input.customerEmail
  });

  try {
    const result = await sendEmail({
      to: [adminEmail],
      subject,
      text,
      html
    });

    if (result.sent) {
      console.log("[resend] admin payment notification sent successfully", {
        adminEmail,
        customerEmail: input.customerEmail
      });
    }

    return result;
  } catch (error) {
    console.error("[resend] admin payment notification failed", {
      adminEmail,
      customerEmail: input.customerEmail,
      error: error instanceof Error ? error.message : error
    });
    throw error;
  }
}
