import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getModule } from "@/lib/modules";
import { workbookFromRows } from "@/lib/excel";
import { requireUser } from "@/lib/auth";
import { serializeRecord } from "@/lib/utils";

export async function GET(request: NextRequest, context: { params: Promise<{ module: string }> }) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json({ message: "未登录" }, { status: 401 });
  const params = await context.params;
  const config = getModule(params.module);
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword") ?? "";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const current = searchParams.get("current") === "1";
  const where: Record<string, unknown> = {};
  if (keyword && config.searchFields.length) where.OR = config.searchFields.map((field) => ({ [field]: { contains: keyword, mode: "insensitive" } }));
  if (config.dateField && (startDate || endDate)) where[config.dateField] = { ...(startDate ? { gte: new Date(`${startDate}T00:00:00`) } : {}), ...(endDate ? { lte: new Date(`${endDate}T00:00:00`) } : {}) };
  const rows = await (prisma as any)[config.model].findMany({
    where: current ? where : {},
    orderBy: { [config.dateField ?? "id"]: "desc" }
  });
  const buffer = await workbookFromRows(config, serializeRecord(rows));
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${params.module}.xlsx"`
    }
  });
}
