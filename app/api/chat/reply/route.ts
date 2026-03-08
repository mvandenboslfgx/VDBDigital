import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { addAdminReply } from "@/modules/chat";
import { prisma } from "@/lib/prisma";
import { safeJsonError, handleApiError } from "@/lib/apiSafeResponse";
import { z } from "zod";

const replySchema = z.object({
  conversationId: z.string().uuid(),
  body: z.string().min(1).max(10000),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return safeJsonError("Niet ingelogd.", 401);

    const isAdmin = user.role === "admin" || user.role === "owner";
    if (!isAdmin) return safeJsonError("Geen toegang.", 403);

    const body = await request.json();
    const parsed = replySchema.safeParse(body);
    if (!parsed.success) return safeJsonError("Ongeldige gegevens.", 400);

    const conv = await prisma.chatConversation.findUnique({
      where: { id: parsed.data.conversationId },
    });
    if (!conv) return safeJsonError("Gesprek niet gevonden.", 404);

    const msg = await addAdminReply(
      parsed.data.conversationId,
      user.id,
      parsed.data.body
    );

    return NextResponse.json(
      { success: true, messageId: msg.id },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, "Chat/Reply");
  }
}
