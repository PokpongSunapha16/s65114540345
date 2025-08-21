import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export async function POST(req: Request) {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      console.error("❌ No Token Found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ ตรวจสอบ JWT และดึง userId
    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.id;

    if (!userId) {
      console.error("❌ Invalid Payload:", payload);
      return NextResponse.json({ error: "Invalid user" }, { status: 403 });
    }

    // ✅ อัปเดตสถานะแจ้งเตือนเป็น `READ`
    await prisma.notification.updateMany({
      where: { receiverId: userId, status: "UNREAD" },
      data: { status: "READ" },
    });

    console.log("✅ Notifications marked as read for user:", userId);
    return NextResponse.json({ message: "Notifications marked as read" });

  } catch (error) {
    console.error("❌ Error marking notifications as read:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
