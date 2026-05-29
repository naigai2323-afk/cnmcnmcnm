import { NextRequest, NextResponse } from "next/server";
import { getModule } from "@/lib/modules";
import { templateWorkbook } from "@/lib/excel";
import { requireUser } from "@/lib/auth";

export async function GET(request: NextRequest, context: { params: Promise<{ module: string }> }) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json({ message: "未登录" }, { status: 401 });
  const params = await context.params;
  const config = getModule(params.module);
  const buffer = await templateWorkbook(config);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${params.module}-template.xlsx"`
    }
  });
}
