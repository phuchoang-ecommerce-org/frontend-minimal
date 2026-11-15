import { LoginForm } from "@/components/login-form";
import { Suspense } from "react";
export default function LoginPage() {
  const devAccounts = process.env.APP_PROFILE === "dev"
    ? ([
        { role: "MEMBER", login: process.env.DEV_MEMBER_LOGIN ?? "", password: process.env.DEV_MEMBER_PASSWORD ?? "" },
        { role: "SELLER", login: process.env.DEV_SELLER_LOGIN ?? "", password: process.env.DEV_SELLER_PASSWORD ?? "" },
        { role: "ADMIN", login: process.env.DEV_ADMIN_LOGIN ?? "", password: process.env.DEV_ADMIN_PASSWORD ?? "" },
      ] as const)
    : [];
  return (
    <main className="page-shell py-12 sm:py-14"><div className="max-w-xl">
      <p className="eyebrow mb-2">Your account</p>
      <h1 className="page-heading mb-10">Log in</h1>
      <Suspense fallback={<p>Loading login…</p>}>
        <LoginForm devAccounts={devAccounts} />
      </Suspense>
    </div></main>
  );
}
