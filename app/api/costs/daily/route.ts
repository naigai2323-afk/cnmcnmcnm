import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateDailyCost } from "@/lib/calculations";
import { requireUser } from "@/lib/auth";
import { serializeRecord } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json({ message: "未登录" }, { status: 401 });
  const date = request.nextUrl.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  return NextResponse.json(serializeRecord(await calculateDailyCost(date)));
}

export async function POST(request: NextRequest) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json({ message: "未登录" }, { status: 401 });
  const body = await request.json();
  const result = await calculateDailyCost(body.date, body);
  const row = await prisma.dailyCost.upsert({
    where: { date: result.date },
    update: result,
    create: result
  });
  return NextResponse.json(serializeRecord(row));
}
