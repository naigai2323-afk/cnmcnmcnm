import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getModule } from "@/lib/modules";
import { enrichAttendance, normalizeInput } from "@/lib/calculations";
import { requireUser } from "@/lib/auth";
import { serializeRecord } from "@/lib/utils";

export async function PATCH(request: NextRequest, context: { params: Promise<{ module: string; id: string }> }) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json({ message: "未登录" }, { status: 401 });
  const params = await context.params;
  const config = getModule(params.module);
  let data = normalizeInput(params.module, await request.json());
  if (params.module === "attendance") data = await enrichAttendance(data);
  const row = await (prisma as any)[config.model].update({ where: { id: Number(params.id) }, data });
  return NextResponse.json(serializeRecord(row));
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ module: string; id: string }> }) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json({ message: "未登录" }, { status: 401 });
  const params = await context.params;
  const config = getModule(params.module);
  await (prisma as any)[config.model].delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ ok: true });
}
