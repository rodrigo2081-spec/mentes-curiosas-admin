import { signOut } from "@/auth";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <button
        type="submit"
        className="rounded-md px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100"
      >
        Cerrar sesión
      </button>
    </form>
  );
}
