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
    // ✅ สร้าง response แล้วสั่งลบ cookie ออก
    const response = NextResponse.json({ message: "Logout successful" });
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: false,
      expires: new Date(0), // หมดอายุทันที
      path: "/",
    });
    return response;

    
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
