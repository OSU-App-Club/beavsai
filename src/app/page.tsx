import { SignIn, SignOut } from "@/components/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <SignIn />
      <SignOut />
      <ThemeToggle />
      {session?.user ? (
        <div>
          <p>Currently signed in as {session.user.email}</p>
        </div>
      ) : (
        <p>Not signed in</p>
      )}
    </div>
  );
}
