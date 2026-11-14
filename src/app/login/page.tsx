import { LoginForm } from "@/components/login-form";
import { Suspense } from "react";
export default function LoginPage() {
  return (
    <main className="container">
      <h1>Log in</h1>
      <Suspense fallback={<p>Loading login…</p>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
