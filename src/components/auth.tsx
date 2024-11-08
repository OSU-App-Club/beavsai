import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signIn, signOut } from "@/lib/auth";
import { type Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";

export function AuthPage({ session }: { session: Session | null }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">
            Welcome to <span className="text-osu">Beavs AI</span>
          </CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          {!session?.user ? (
            <form
              action={async () => {
                "use server";
                await signIn("google", {
                  redirect: true,
                  redirectTo: "/files",
                });
              }}
            >
              <Button type="submit" className="w-full" variant="outline">
                <FcGoogle className="scale-125 -translate-x-1" />
                Sign in with Google
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                {session.user.image && (
                  <Image
                    src={session.user.image}
                    width={40}
                    height={40}
                    alt="Profile"
                    className="h-10 w-10 rounded-full"
                  />
                )}
                <div className="text-center">
                  <p className="text-sm font-medium">Signed in as</p>
                  <p className="text-sm text-muted-foreground">
                    {session.user.email}
                  </p>
                </div>
              </div>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirect: true, redirectTo: "/" });
                }}
              >
                <Button type="submit" variant="outline" className="w-full">
                  Sign out
                </Button>
              </form>
              <Link
                href={"/files?upload=true"}
                className={buttonVariants({ variant: "link" })}
              >
                Upload a file
              </Link>
              <Link
                href={"/files"}
                className={buttonVariants({ variant: "link" })}
              >
                View all files
              </Link>
              <Link
                href={"/chat"}
                className={buttonVariants({ variant: "link" })}
              >
                Chat with a file
              </Link>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            By proceeding, you confirm that you are a student at Oregon State
            University.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
