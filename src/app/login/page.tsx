import { LoginForm } from "./login-form";

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const callbackUrlRaw = searchParams?.callbackUrl;
  const callbackUrl =
    (Array.isArray(callbackUrlRaw) ? callbackUrlRaw[0] : callbackUrlRaw) || "/admin";

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-neutral-900">Mentes Curiosas</h1>
        <p className="mb-6 text-sm text-neutral-500">Panel de administración</p>
        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
