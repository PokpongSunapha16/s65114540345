import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { notificationId } = await req.json();

    if (!notificationId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ✅ ตรวจสอบว่ามีการแจ้งเตือนอยู่จริงหรือไม่
    const notification = await prisma.notification.findUnique({ where: { id: notificationId } });

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    // ✅ ลบคำเชิญหรือคำขอเข้าร่วมทีมออกจาก Notification
    await prisma.notification.delete({ where: { id: notificationId } });

    console.log("✅ Notification declined:", notificationId);
    return NextResponse.json({ message: "Team invitation/request declined" });
  } catch (error) {
    console.error("❌ Error declining invite/request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
