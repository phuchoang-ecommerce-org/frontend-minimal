"use client";
import { Button, Input } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Account, MergeRejection } from "@/lib/types";
export function LoginForm() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const params = useSearchParams();
  const cache = useQueryClient();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
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
            : "Could not log in.",
        );
      cache.clear();
      if (result.account.role === "MEMBER") {
        const rejected = result.cartMerge?.rejectedLines ?? [];
        if (rejected.length)
          sessionStorage.setItem("cartMergeRejected", JSON.stringify(rejected));
        const returnTo = params.get("returnTo");
        router.push(returnTo === "/cart" ? returnTo : "/cart");
      } else router.push("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not log in.");
    } finally {
      setBusy(false);
    }
  }
  return (
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
  );
}
