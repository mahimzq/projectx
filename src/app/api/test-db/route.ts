import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Check Prisma connection
    await prisma.$connect();

    // Count users
    const userCount = await prisma.user.count();

    // List user emails and password lengths (safe diagnostic)
    const users = await prisma.user.findMany({
      select: {
        email: true,
        role: true,
        password: true,
      }
    });

    // Show password first 3 chars for debug (safe enough for temporary use)
    const safeUsers = users.map(u => ({
      email: u.email,
      role: u.role,
      passwordPreview: u.password ? u.password.substring(0, 3) + "***" : "NULL",
      passwordLength: u.password?.length || 0,
    }));

    return NextResponse.json({
      status: "success",
      database: "connected",
      databaseUrl: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":***@"),
      userCount,
      users: safeUsers
    });
  } catch (error: any) {
    console.error("Database connection error:", error);
    return NextResponse.json({
      status: "error",
      message: error.message,
      databaseUrl: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":***@"),
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
