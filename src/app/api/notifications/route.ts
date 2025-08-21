import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export async function GET() {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      console.error("❌ No Token Found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ ตรวจสอบ JWT และใช้ `id` แทน `userId`
    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.id; // ✅ ใช้ `id` ตามที่ตรวจสอบจาก JWT

    if (!userId) {
      console.error("❌ Invalid Payload:", payload);
      return NextResponse.json({ error: "Invalid user" }, { status: 403 });
    }

    // ✅ ดึงรายการแจ้งเตือนของผู้ใช้ รวมถึงคำขอเข้าร่วมทีม (TEAM_REQUEST)
    const notifications = await prisma.notification.findMany({
      where: { 
        receiverId: userId,
        type: { in: ["TEAM_INVITE", "TEAM_REQUEST"] } // ✅ เพิ่มประเภท TEAM_REQUEST
      },
      include: { sender: { select: { username: true } }, team: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    console.log("✅ Notifications for user:", userId, notifications);
    return NextResponse.json({ notifications });

  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
