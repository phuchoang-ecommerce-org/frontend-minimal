import { LoginForm } from "@/components/login-form";
import { Suspense } from "react";
export default function LoginPage() {
  return (
    <main className="mx-auto max-w-xl px-5 py-12 sm:px-8">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-forest">Your account</p>
      <h1 className="mb-8 text-4xl font-semibold tracking-tight">Log in</h1>
      <Suspense fallback={<p>Loading login…</p>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
