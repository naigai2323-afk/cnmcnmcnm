import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getModule } from "@/lib/modules";
import { enrichAttendance, normalizeInput } from "@/lib/calculations";
import { requireUser } from "@/lib/auth";

export async function POST(request: NextRequest, context: { params: Promise<{ module: string }> }) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json({ message: "未登录" }, { status: 401 });
  const params = await context.params;
  const config = getModule(params.module);
  const body = await request.json();
  const rows = Array.isArray(body.rows) ? body.rows : [];
  let count = 0;
  for (const row of rows) {
    let data = normalizeInput(params.module, row);
    if (params.module === "attendance") data = await enrichAttendance(data);
    await (prisma as any)[config.model].create({ data });
    count += 1;
  }
  return NextResponse.json({ count });
}
