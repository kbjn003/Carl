"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendMagicLink, type LoginState } from "./actions";

const initial: LoginState = { status: "idle" };

export function LoginForm({ linkError }: { linkError?: boolean }) {
  const [state, action, pending] = useActionState(sendMagicLink, initial);
  // Controlled so React's post-action form reset doesn't wipe a typo'd address.
  const [email, setEmail] = useState("");

  if (state.status === "sent") {
    return (
      <div className="space-y-2 text-sm">
        <p>
          Link sent to <span className="font-medium">{state.email}</span>.
        </p>
        <p className="text-muted-foreground">Open it on this device to sign in.</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@studio.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
      </div>
      {state.status === "error" && (
        <p className="text-sm text-destructive" role="alert">
          {state.message}
        </p>
      )}
      {state.status === "idle" && linkError && (
        <p className="text-sm text-destructive" role="alert">
          That link expired or was already used. Request a new one.
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Email me a sign-in link"}
      </Button>
    </form>
  );
}
