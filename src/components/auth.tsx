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

export function AuthPage({ session }: { session: Session | null }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">
            Welcome to <span className="text-orange-600">Beavs AI</span>
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
                  redirectTo: "/upload",
                });
              }}
            >
              <Button type="submit" className="w-full" variant="outline">
                <svg
                  className="mr-1 h-4 w-4"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fab"
                  data-icon="google"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 488 512"
                >
                  <path
                    fill="currentColor"
                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                  ></path>
                </svg>
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
                href={"/upload"}
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
