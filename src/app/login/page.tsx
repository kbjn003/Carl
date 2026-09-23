import { LoginForm } from "./login-form";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Carl</h1>
          <p className="text-sm text-muted">
            Admin, handled. Sign in with a magic link.
          </p>
        </div>
        {error === "link" && (
          <p role="alert" className="text-sm text-danger">
            That link expired or was already used. Request a new one.
          </p>
        )}
        <LoginForm />
      </div>
    </main>
  );
}
