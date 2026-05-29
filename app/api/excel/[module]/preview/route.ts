import { NextRequest, NextResponse } from "next/server";
import { getModule } from "@/lib/modules";
import { parseWorkbook, validateRows } from "@/lib/excel";
import { requireUser } from "@/lib/auth";

export async function POST(request: NextRequest, context: { params: Promise<{ module: string }> }) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json({ message: "未登录" }, { status: 401 });
  const params = await context.params;
  const config = getModule(params.module);
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ message: "请上传Excel文件" }, { status: 400 });
  const rows = await parseWorkbook(await file.arrayBuffer(), config);
  return NextResponse.json({ rows: validateRows(config, rows) });
}
