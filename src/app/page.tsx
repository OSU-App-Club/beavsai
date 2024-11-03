import { AuthPage } from "@/components/auth";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();
  return <AuthPage session={session ?? null} />;
}
