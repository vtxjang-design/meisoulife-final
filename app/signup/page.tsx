import { AuthCard } from "@/components/auth-card";
import { SectionHeading } from "@/components/section-heading";

export default function SignupPage() {
  return (
    <div className="section-shell py-16 sm:py-24">
      <div className="mx-auto grid max-w-2xl gap-8">
        <SectionHeading
          eyebrow="Signup"
          title="会員登録"
          description="メールとパスワードで登録し、無料チャレンジから有料会員、リーダー候補まで一つのアカウントで管理します。"
          align="center"
        />
        <AuthCard mode="signup" />
      </div>
    </div>
  );
}
