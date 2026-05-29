import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getModule } from "@/lib/modules";
import { enrichAttendance, normalizeInput } from "@/lib/calculations";
import { requireUser } from "@/lib/auth";
import { serializeRecord } from "@/lib/utils";

export async function GET(request: NextRequest, context: { params: Promise<{ module: string }> }) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json({ message: "未登录" }, { status: 401 });
  const params = await context.params;
  const config = getModule(params.module);
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 10);
  const keyword = searchParams.get("keyword") ?? "";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const sortBy = searchParams.get("sortBy") ?? config.dateField ?? "id";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
  const where: Record<string, unknown> = {};
  if (keyword && config.searchFields.length) {
    where.OR = config.searchFields.map((field) => ({ [field]: { contains: keyword, mode: "insensitive" } }));
  }
  if (config.dateField && (startDate || endDate)) {
    where[config.dateField] = {
      ...(startDate ? { gte: new Date(`${startDate}T00:00:00`) } : {}),
      ...(endDate ? { lte: new Date(`${endDate}T00:00:00`) } : {})
    };
  }
  const model = (prisma as any)[config.model];
  const [rows, total] = await Promise.all([
    model.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { [sortBy]: sortOrder } }),
    model.count({ where })
  ]);
  return NextResponse.json(serializeRecord({ rows, total, page, pageSize }));
}

export async function POST(request: NextRequest, context: { params: Promise<{ module: string }> }) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json({ message: "未登录" }, { status: 401 });
  const params = await context.params;
  const config = getModule(params.module);
  let data = normalizeInput(params.module, await request.json());
  if (params.module === "attendance") data = await enrichAttendance(data);
  const row = await (prisma as any)[config.model].create({ data });
  return NextResponse.json(serializeRecord(row));
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ module: string }> }) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json({ message: "未登录" }, { status: 401 });
  const params = await context.params;
  const config = getModule(params.module);
  const { ids } = await request.json();
  await (prisma as any)[config.model].deleteMany({ where: { id: { in: ids.map(Number) } } });
  return NextResponse.json({ ok: true });
}
