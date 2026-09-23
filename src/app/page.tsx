import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

// Step 1 placeholder: proves the session round-trips. The chat + Workboard
// shell replaces this in step 3.
export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims?.email as string | undefined;
  if (!data?.claims) redirect("/login");

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex h-12 shrink-0 items-center justify-between border-b px-4">
        <span className="font-semibold tracking-tight">Carl</span>
        <form action="/auth/signout" method="post" className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">{email}</span>
          <Button variant="ghost" size="sm" type="submit">
            Sign out
          </Button>
        </form>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 text-center">
        <div className="space-y-2">
          <p className="text-lg">Signed in. Nothing staged yet.</p>
          <p className="text-sm text-muted-foreground">Chat and Workboard arrive in step 3.</p>
        </div>
      </main>
    </div>
  );
}
