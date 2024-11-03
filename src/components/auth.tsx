import { Button } from "@/components/ui/button";
import { signIn, signOut } from "@/lib/auth";

export function SignIn() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirect: true, redirectTo: "/upload" });
      }}
    >
      <Button type="submit">Sign in with Google</Button>
    </form>
  );
}

export function SignOut() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirect: true, redirectTo: "/" });
      }}
    >
      <Button type="submit">Sign out</Button>
    </form>
  );
}
