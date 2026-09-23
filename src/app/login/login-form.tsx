"use client";

import { useActionState } from "react";
import { sendMagicLink, type LoginState } from "./actions";

const initialState: LoginState = { status: "idle" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    sendMagicLink,
    initialState,
  );

  if (state.status === "sent") {
    return (
      <p className="text-sm text-muted">
        Link sent to <span className="text-foreground">{state.email}</span>.
        Check your inbox.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label htmlFor="email" className="text-sm text-muted">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        autoFocus
        placeholder="you@studio.com"
        className="rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-background disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send magic link"}
      </button>
      {state.status === "error" && (
        <p role="alert" className="text-sm text-danger">
          {state.message}
        </p>
      )}
    </form>
  );
}
