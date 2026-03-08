/**
 * Chat module: conversations and messages for live chat and offline form.
 */

import { prisma } from "@/lib/prisma";

export interface CreateConversationInput {
  visitorEmail: string;
  visitorName?: string;
  visitorId?: string;
  subject?: string;
  initialMessage?: string;
}

export async function createConversation(input: CreateConversationInput) {
  const { visitorEmail, visitorName, visitorId, subject = "Chat", initialMessage } = input;
  const conv = await prisma.chatConversation.create({
    data: {
      visitorEmail: visitorEmail.trim().toLowerCase(),
      visitorName: visitorName?.trim() || null,
      visitorId: visitorId || null,
      subject,
      status: "open",
      ...(initialMessage && {
        messages: {
          create: {
            body: initialMessage.trim(),
            fromAdmin: false,
          },
        },
      }),
    },
    include: { messages: true },
  });
  return conv;
}

export async function getConversationById(id: string) {
  return prisma.chatConversation.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
}

export async function getConversationsForAdmin(options?: { status?: string; limit?: number }) {
  const { status, limit = 100 } = options ?? {};
  return prisma.chatConversation.findMany({
    where: status ? { status } : undefined,
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: { select: { messages: true } },
    },
  });
}

export async function getUnreadCountForAdmin() {
  const unread = await prisma.chatMessage.count({
    where: {
      fromAdmin: false,
      readAt: null,
    },
  });
  return unread;
}

export async function addVisitorMessage(conversationId: string, body: string) {
  const msg = await prisma.chatMessage.create({
    data: { conversationId, body: body.trim(), fromAdmin: false },
  });
  await prisma.chatConversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });
  return msg;
}

export async function addAdminReply(conversationId: string, authorId: string, body: string) {
  const msg = await prisma.chatMessage.create({
    data: { conversationId, body: body.trim(), fromAdmin: true, authorId },
  });
  await prisma.chatConversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });
  return msg;
}

export async function markConversationMessagesRead(conversationId: string) {
  await prisma.chatMessage.updateMany({
    where: { conversationId, fromAdmin: false, readAt: null },
    data: { readAt: new Date() },
  });
}

export async function findOpenConversationByEmail(visitorEmail: string) {
  const normalized = visitorEmail.trim().toLowerCase();
  return prisma.chatConversation.findFirst({
    where: {
      visitorEmail: normalized,
      status: "open",
    },
    orderBy: { updatedAt: "desc" },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
}
