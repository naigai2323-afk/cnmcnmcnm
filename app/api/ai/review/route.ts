import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { serializeRecord } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json({ message: "未登录" }, { status: 401 });
  const rows = await prisma.feishuMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json(serializeRecord(rows));
}
