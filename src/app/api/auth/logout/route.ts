import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers"; // ✅ ใช้ next/headers แทน req.cookies.get()
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies(); // ✅ ใช้ next/headers แทน
    const token = (await cookieStore).get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 });
    }

    // ✅ ตรวจสอบและดึง userId จาก Token
    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.id as number;

    // ✅ อัปเดตสถานะผู้ใช้เป็น OFFLINE
    await prisma.user.update({
      where: { id: userId },
      data: { status: "OFFLINE" },
    });

    // ✅ ลบ Token จาก Cookies
    (await
      // ✅ ลบ Token จาก Cookies
      cookieStore).set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0), // ✅ ตั้งให้หมดอายุทันที
      path: "/",
    });

    console.log("✅ Successfully logged out");
    return NextResponse.json({ message: "Logout successful" });
  } catch (error) {
    console.error("❌ Error during logout:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { message: "Logout failed", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
