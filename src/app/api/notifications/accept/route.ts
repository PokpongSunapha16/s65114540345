import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { notificationId, teamId } = await req.json();

    console.log("📥 API Request Data:", { notificationId, teamId });

    // ✅ ตรวจสอบว่า notificationId และ teamId มีค่าหรือไม่
    if (!notificationId || !teamId) {
      console.error("❌ Missing required fields:", { notificationId, teamId });
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ✅ ดึงข้อมูล Notification และรวมข้อมูลทีม
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      include: { team: true }, // ✅ เพิ่ม include เพื่อให้ดึงข้อมูลทีมมาด้วย
    });

    if (!notification) {
      console.error("❌ Notification not found for ID:", notificationId);
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    // ✅ ตรวจสอบว่า notification มี teamId จริงๆ หรือไม่
    if (!notification.teamId) {
      console.error("❌ Notification does not have a valid teamId:", notification);
      return NextResponse.json({ error: "Invalid teamId in notification" }, { status: 400 });
    }

    // ✅ ตรวจสอบประเภทของการแจ้งเตือน
    if (notification.type !== "TEAM_INVITE" && notification.type !== "TEAM_REQUEST") {
      console.error("❌ Invalid notification type:", notification.type);
      return NextResponse.json({ error: "Invalid notification type" }, { status: 400 });
    }

    // ✅ ตรวจสอบว่า User เป็นสมาชิกอยู่แล้วหรือไม่
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        teamId: teamId,
        userId: notification.type === "TEAM_INVITE" ? notification.receiverId : notification.senderId,
      },
    });

    if (existingMember) {
      console.warn("⚠️ User is already a member of this team:", { teamId, userId: notification.receiverId });
      return NextResponse.json({ error: "User is already a member of this team" }, { status: 400 });
    }

    // ✅ เพิ่มผู้เล่นเข้า Team
    await prisma.teamMember.create({
      data: {
        teamId: teamId,
        userId: notification.type === "TEAM_INVITE" ? notification.receiverId : notification.senderId,
        status: "APPROVED",
        role: "PLAYER",
      },
    });

    console.log("✅ User added to team:", { teamId, userId: notification.receiverId });

    // ✅ อัปเดตจำนวนสมาชิกในทีม
    await prisma.team.update({
      where: { id: teamId },
      data: { member_count: { increment: 1 } },
    });

    console.log("✅ Updated member count for team:", teamId);

    // ✅ ลบคำเชิญออกจาก Notification หลังจากรับคำเชิญ
    await prisma.notification.delete({ where: { id: notificationId } });

    console.log("✅ Notification deleted:", notificationId);

    return NextResponse.json({ message: "✅ Team invitation/request accepted successfully!" });
  } catch (error) {
    console.error("❌ Error accepting invite:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
