import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSession, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ message: "邮箱或密码错误" }, { status: 401 });
  }
  await setSession({ id: user.id, name: user.name, email: user.email, role: user.role });
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
