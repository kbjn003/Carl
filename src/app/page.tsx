import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");
  const email = data.claims.email;

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="font-semibold">Carl</span>
        <div className="flex items-center gap-3 text-sm text-muted">
          <span data-testid="signed-in-as">{email}</span>
          <form action="/auth/signout" method="post">
            <button type="submit" className="hover:text-foreground">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 text-sm text-muted">
        Signed in. Chat and Workboard arrive in M2.
      </main>
    </div>
  );
}
