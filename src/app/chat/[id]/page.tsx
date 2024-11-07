import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ChatArea } from "../(render)/chat-area";
import { ChatList } from "../(render)/chat-list";

async function fetchChat(chatId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const chat = await prisma.chat.findUnique({
    where: {
      id: chatId,
      userId: session.user.id,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
      CourseMaterial: true,
    },
  });

  return chat;
}

async function fetchChats() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const chats = await prisma.chat.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return chats;
}

async function fetchFiles() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const files = await prisma.courseMaterial.findMany({
    where: {
      userId: session.user.id,
    },
  });

  return files;
}

export default async function ChatPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const session = await auth();
  if (!session) redirect("/login");
  const { id } = params;

  const [chat, chats, files] = await Promise.all([
    fetchChat(id),
    fetchChats(),
    fetchFiles(),
  ]);

  if (!chat) redirect("/chat");

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
            include: {
              messages: true,
            },
          });

          revalidatePath("/chat");
          return chat;
        }}
      />
      <ChatArea
        chatId={chat.id}
        initialMessage={chat.messages[0]?.content}
        initialMessages={chat.messages}
        fileContext={chat.CourseMaterial?.fileUrl}
        session={session}
      />
    </div>
  );
}
