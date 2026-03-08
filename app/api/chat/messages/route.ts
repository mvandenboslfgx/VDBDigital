import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getConversationById, markConversationMessagesRead } from "@/modules/chat";
import { safeJsonError, handleApiError } from "@/lib/apiSafeResponse";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");
    if (!conversationId) {
      return safeJsonError("conversationId ontbreekt.", 400);
    }

    const conv = await getConversationById(conversationId);
    if (!conv) {
      return safeJsonError("Gesprek niet gevonden.", 404);
    }

    const markRead = searchParams.get("markRead") === "true";
    if (markRead) {
      const user = await getCurrentUser();
      const isAdminOrOwner = user && (user.role === "admin" || user.role === "owner");
      if (isAdminOrOwner) {
        await markConversationMessagesRead(conversationId);
      }
      // If not admin/owner, do not mark as read (e.g. visitor with markRead=true is ignored)
    }

    return NextResponse.json(
      {
        success: true,
        conversation: {
          id: conv.id,
          visitorEmail: conv.visitorEmail,
          visitorName: conv.visitorName,
          status: conv.status,
          createdAt: conv.createdAt,
        },
        messages: conv.messages.map((m) => ({
          id: m.id,
          body: m.body,
          fromAdmin: m.fromAdmin,
          createdAt: m.createdAt,
          readAt: m.readAt,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "Chat/Messages");
  }
}
