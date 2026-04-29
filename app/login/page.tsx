import { AuthCard } from "@/components/auth-card";
import { SectionHeading } from "@/components/section-heading";

export default function LoginPage() {
  return (
    <div className="section-shell py-16 sm:py-24">
      <div className="mx-auto grid max-w-2xl gap-8">
        <SectionHeading
          eyebrow="Login"
          title="会員ログイン"
          description="Supabase Authを前提にしたログイン画面です。環境変数設定後、そのまま本番導線として使えます。"
          align="center"
        />
        <AuthCard mode="login" />
      </div>
    </div>
  );
}
