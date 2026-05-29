import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

const COOKIE_NAME = "factory_session";

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "manager" | "staff";
};

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

function encodeSession(user: SessionUser) {
  return Buffer.from(JSON.stringify(user), "utf8").toString("base64url");
}

function decodeSession(value?: string): SessionUser | null {
  if (!value) return null;
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as SessionUser;
  } catch {
    return null;
  }
}

export async function setSession(user: SessionUser) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, encodeSession(user), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
    secure: env.NODE_ENV === "production"
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionFromRequest(request?: NextRequest) {
  if (request) return decodeSession(request.cookies.get(COOKIE_NAME)?.value);
  const cookieStore = await cookies();
  return decodeSession(cookieStore.get(COOKIE_NAME)?.value);
}

export async function requireUser(request?: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role } as SessionUser;
}

export function canDelete(role?: string) {
  return role === "admin" || role === "manager";
}

export function canManageSettings(role?: string) {
  return role === "admin";
}
