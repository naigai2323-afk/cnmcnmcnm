import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseFactoryText } from "@/lib/ai/deepseek";
import { serializeRecord } from "@/lib/utils";

export async function POST(request: Request) {
  const body = await request.json();
  const rawText = body.raw_text ?? body.rawText ?? body.event?.message?.content ?? "";
  const created = await prisma.feishuMessage.create({
    data: {
      messageId: body.message_id ?? body.event?.message?.message_id,
      senderName: body.sender_name ?? body.event?.sender?.sender_name,
      senderId: body.sender_id ?? body.event?.sender?.sender_id?.user_id,
      groupId: body.group_id ?? body.event?.message?.chat_id,
      rawText: String(rawText),
      status: "pending"
    }
  });
  const parsed = await parseFactoryText(String(rawText));
  const updated = await prisma.feishuMessage.update({
    where: { id: created.id },
    data: { parsedJson: JSON.parse(JSON.stringify(parsed)), moduleType: parsed.module_type, status: "parsed" }
  });
  return NextResponse.json(serializeRecord(updated));
}
