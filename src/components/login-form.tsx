"use client";
import { Button, Input } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Account, MergeRejection } from "@/lib/types";
type DevRole = "MEMBER" | "SELLER" | "ADMIN";
export function LoginForm({ devRoles = [] }: { devRoles?: readonly DevRole[] }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const params = useSearchParams();
  const cache = useQueryClient();
  function finishLogin(result: { account?: Account; cartMerge?: { rejectedLines: MergeRejection[] } }) {
    if (!result.account) return;
    cache.clear();
    if (result.account.role === "MEMBER") {
      const rejected = result.cartMerge?.rejectedLines ?? [];
      if (rejected.length) sessionStorage.setItem("cartMergeRejected", JSON.stringify(rejected));
      const returnTo = params.get("returnTo");
      router.push(returnTo === "/cart" ? returnTo : "/cart");
    } else router.push(result.account.role === "SELLER" ? "/seller/orders" : "/");
    router.refresh();
  }
  async function authenticate(url: string, body: object) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = (await response.json()) as {
        account?: Account;
        cartMerge?: { rejectedLines: MergeRejection[] };
        code?: string;
      };
      if (!response.ok || !result.account)
        throw new Error(
          result.code === "INVALID_CREDENTIALS"
            ? "Login or password is incorrect."
            : result.code === "DEV_ACCOUNT_NOT_CONFIGURED"
              ? "Set the development account login and password in the frontend environment."
            : "Could not log in.",
        );
      finishLogin(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not log in.");
    } finally {
      setBusy(false);
    }
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await authenticate("/api/login", { login, password });
  }
  return (
    <div className="grid gap-5">
    {devRoles.length > 0 && <section className="rounded-2xl border border-clay bg-[#fff4e9] p-5 sm:p-6" aria-labelledby="dev-accounts-heading">
      <h2 id="dev-accounts-heading" className="text-xl font-semibold text-forest">Development accounts</h2>
      <p className="mt-1 text-sm text-sage">Choose a seeded account to sign in locally.</p>
      <div className="mt-4 flex flex-wrap gap-2">{devRoles.map((role) => <Button key={role} className="min-h-11" disabled={busy} onClick={() => authenticate("/api/dev-login", { role })}>Log in as {role.charAt(0) + role.slice(1).toLowerCase()}</Button>)}</div>
    </section>}
    <form className="grid gap-5 rounded-2xl border border-line bg-paper p-6 shadow-sm sm:p-8" onSubmit={submit}>
      <label className="grid gap-2 text-sm font-semibold">
        Login{" "}
        <Input
          autoComplete="username"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Password{" "}
        <Input.Password
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      <Button className="min-h-11" type="primary" htmlType="submit" loading={busy}>
        Log in
      </Button>
      {error && (
        <p className="rounded-lg bg-[#fff0e9] p-3 text-[#9f3327]" role="alert">
          {error}
        </p>
      )}
    </form>
    </div>
  );
}
