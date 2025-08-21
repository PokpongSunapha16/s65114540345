import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // ✅ ดึง Token จาก Cookies
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ ถอดรหัส JWT Token
    const secretKey = new TextEncoder().encode("your-secret-key"); // ใช้ค่าเดียวกับตอน Login
    const { payload } = await jwtVerify(token, secretKey);

    // ✅ ดึง User ID จาก Token
    const userId = Number(payload.id);
    if (!userId) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    console.log("✅ User ID from Token:", userId); // Debugging

    // ✅ ดึงบล็อกจากฐานข้อมูล
    const userBlogs = await prisma.blog.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true,
        category: true,
        hearts: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(userBlogs);
  } catch (error) {
    console.error("🚨 Error fetching user blogs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
