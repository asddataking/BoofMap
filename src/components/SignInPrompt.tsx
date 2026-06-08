"use client";

import { SignInButton } from "@clerk/nextjs";

export function SignInPrompt({ message }: { message?: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-elevated)] p-6 text-center">
      <p className="text-sm text-[var(--text-muted)]">
        {message ?? "Sign in to submit reports and vote on community posts."}
      </p>
      <SignInButton mode="modal">
        <button type="button" className="btn-primary mt-4">
          Sign in
        </button>
      </SignInButton>
    </div>
  );
}
