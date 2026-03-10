import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getConversationById, markConversationMessagesRead } from "@/modules/chat";
import { safeJsonError, handleApiError } from "@/lib/apiSafeResponse";
import { rateLimitSensitive, getRateLimitKey } from "@/lib/rateLimit";

export async function GET(request: Request) {
  try {
    const key = getRateLimitKey(request);
    const { ok } = rateLimitSensitive(key);
    if (!ok) return safeJsonError("Te veel verzoeken.", 429);

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");
    const visitorEmail = searchParams.get("visitorEmail")?.trim().toLowerCase();

    if (!conversationId) {
      return safeJsonError("conversationId ontbreekt.", 400);
    }

    const conv = await getConversationById(conversationId);
    if (!conv) {
      return safeJsonError("Gesprek niet gevonden.", 404);
    }

    const user = await getCurrentUser();
    const isAdminOrOwner = user && (user.role === "admin" || user.role === "owner");

    if (!isAdminOrOwner) {
      if (!visitorEmail || visitorEmail !== conv.visitorEmail.toLowerCase()) {
        return safeJsonError("Geen toegang tot dit gesprek.", 403);
      }
    }

    const markRead = searchParams.get("markRead") === "true";
    if (markRead && isAdminOrOwner) {
      await markConversationMessagesRead(conversationId);
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
