import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Carl</CardTitle>
          <CardDescription>You do the creative work. Carl does the admin.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm linkError={Boolean(error)} />
        </CardContent>
      </Card>
    </main>
  );
}
