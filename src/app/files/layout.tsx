import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function FileViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return children;
}
