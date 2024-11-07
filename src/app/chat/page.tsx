import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ChatList } from "./(render)/chat-list";
import { WelcomeMessage } from "./(render)/welcome-message";

async function fetchChats() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  const chats = await prisma.chat.findMany({
    where: {
      userId: session?.user?.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return chats;
}

async function fetchFiles() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  const files = await prisma.courseMaterial.findMany({
    where: {
      userId: session?.user?.id,
    },
  });
  return files;
}

export default async function ChatPage() {
  const session = await auth();
  if (!session) redirect("/");

  const [chatPromise, filePromise] = await Promise.allSettled([
    fetchChats(),
    fetchFiles(),
  ]);

  if (chatPromise.status === "rejected" || filePromise.status === "rejected") {
    redirect("/");
  }

  const chats = chatPromise.value;
  const files = filePromise.value;

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <ChatList
        initialChats={chats}
        files={files}
        onCreateChat={async (fileId?: string) => {
          "use server";
          if (!session?.user?.id) throw new Error("Unauthorized");

          const chat = await prisma.chat.create({
            data: {
              userId: session.user.id,
              fileId: fileId || null,
            },
          });

          return chat;
        }}
      />
      <WelcomeMessage session={session} />
    </div>
  );
}
