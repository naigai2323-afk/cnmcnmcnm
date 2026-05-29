import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      app: "factory-dashboard",
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        app: "factory-dashboard",
        status: "degraded",
        database: "disconnected",
        message: error instanceof Error ? error.message : "Unknown database error",
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}
