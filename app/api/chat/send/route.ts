import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  createConversation,
  findOpenConversationByEmail,
  addVisitorMessage,
  getConversationById,
} from "@/modules/chat";
import { safeJsonError, handleApiError } from "@/lib/apiSafeResponse";
import { rateLimitSensitive, getRateLimitKey } from "@/lib/rateLimit";
import { z } from "zod";

const sendSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(200).optional(),
  message: z.string().min(1).max(10000),
  conversationId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  try {
    const key = getRateLimitKey(request);
    const { ok } = rateLimitSensitive(key);
    if (!ok) return safeJsonError("Te veel verzoeken.", 429);

    const user = await getCurrentUser();
    const body = await request.json();
    const parsed = sendSchema.safeParse(body);
    if (!parsed.success) {
      return safeJsonError("Ongeldige gegevens.", 400);
    }

    const { email, name, message, conversationId } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    if (conversationId) {
      const conv = await getConversationById(conversationId);
      if (!conv) return safeJsonError("Gesprek niet gevonden.", 404);
      if (conv.visitorEmail.toLowerCase() !== normalizedEmail) {
        return safeJsonError("Geen toegang tot dit gesprek.", 403);
      }
      const appended = await addVisitorMessage(conversationId, message);
      return NextResponse.json(
        { success: true, messageId: appended.id, conversationId },
        { status: 200 }
      );
    }

    const existing = await findOpenConversationByEmail(normalizedEmail);
    if (existing) {
      const appended = await addVisitorMessage(existing.id, message);
      return NextResponse.json(
        { success: true, messageId: appended.id, conversationId: existing.id },
        { status: 200 }
      );
    }

    const conv = await createConversation({
      visitorEmail: normalizedEmail,
      visitorName: name ?? undefined,
      visitorId: user?.id,
      initialMessage: message,
    });

    return NextResponse.json(
      { success: true, conversationId: conv.id, messageId: conv.messages[0]?.id },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, "Chat/Send");
  }
}
