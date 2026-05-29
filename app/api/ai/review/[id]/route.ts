import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json({ message: "未登录" }, { status: 401 });
  const params = await context.params;
  const { status } = await request.json();
  const row = await prisma.feishuMessage.update({ where: { id: Number(params.id) }, data: { status } });
  return NextResponse.json(row);
}
