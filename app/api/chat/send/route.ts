import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  createConversation,
  findOpenConversationByEmail,
  addVisitorMessage,
} from "@/modules/chat";
import { safeJsonError, handleApiError } from "@/lib/apiSafeResponse";
import { z } from "zod";

const sendSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(200).optional(),
  message: z.string().min(1).max(10000),
  conversationId: z.string().uuid().optional(),
});

const CHAT_ERROR_MESSAGE =
  "We kunnen je bericht nu niet ontvangen. Gebruik het contactformulier op de contactpagina of mail naar algemeen@vdbdigital.nl.";

export async function POST(request: Request) {
  try {
    let user = null;
    try {
      user = await getCurrentUser();
    } catch {
      // Ongelogde bezoeker mag ook bericht achterlaten
    }
    const body = await request.json();
    const parsed = sendSchema.safeParse(body);
    if (!parsed.success) {
      return safeJsonError("Ongeldige gegevens.", 400);
    }

    const { email, name, message, conversationId } = parsed.data;

    if (conversationId) {
      const appended = await addVisitorMessage(conversationId, message);
      return NextResponse.json(
        { success: true, messageId: appended.id, conversationId },
        { status: 200 }
      );
    }

    const existing = await findOpenConversationByEmail(email);
    if (existing) {
      const appended = await addVisitorMessage(existing.id, message);
      return NextResponse.json(
        { success: true, messageId: appended.id, conversationId: existing.id },
        { status: 200 }
      );
    }

    const conv = await createConversation({
      visitorEmail: email,
      visitorName: name ?? undefined,
      visitorId: user?.id,
      initialMessage: message,
    });

    return NextResponse.json(
      { success: true, conversationId: conv.id, messageId: conv.messages[0]?.id },
      { status: 201 }
    );
  } catch (error) {
    const res = handleApiError(error, "Chat/Send");
    // Stuur een begrijpelijke boodschap voor de chat-widget (blijft 500)
    try {
      const body = await res.clone().json();
      if (body?.message && body.message === "Er is iets misgegaan. Probeer het later opnieuw.") {
        return NextResponse.json(
          { success: false, message: CHAT_ERROR_MESSAGE },
          { status: 503 }
        );
      }
    } catch {
      // fallback: originele response
    }
    return res;
  }
}
