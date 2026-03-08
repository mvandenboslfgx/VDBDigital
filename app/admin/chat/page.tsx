import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { setAdminPresence } from "@/lib/chat-presence";
import { AdminChatClient } from "@/components/admin/AdminChatClient";

export default async function AdminChatPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin" && user.role !== "owner") redirect("/dashboard");

  setAdminPresence();

  const conversations = await prisma.chatConversation.findMany({
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: { select: { messages: true } },
    },
  });

  const unreadCount = await prisma.chatMessage.count({
    where: { fromAdmin: false, readAt: null },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Chat</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Gesprekken met bezoekers. Reageer op berichten.
          </p>
        </div>
        {unreadCount > 0 && (
          <span className="rounded-full bg-amber-500/20 px-3 py-1 text-sm font-medium text-amber-400">
            {unreadCount} ongelezen
          </span>
        )}
      </div>

      <AdminChatClient
        initialConversations={conversations.map((c) => ({
          id: c.id,
          visitorEmail: c.visitorEmail,
          visitorName: c.visitorName,
          status: c.status,
          updatedAt: c.updatedAt.toISOString(),
          messageCount: c._count.messages,
          lastMessage: c.messages[0]
            ? {
                body: c.messages[0].body,
                fromAdmin: c.messages[0].fromAdmin,
                createdAt: c.messages[0].createdAt.toISOString(),
              }
            : null,
        }))}
        currentUserId={user.id}
      />
    </div>
  );
}
