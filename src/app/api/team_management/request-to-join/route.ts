import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export async function POST(req: NextRequest) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    const userId = Number(payload.id);
    if (!userId) {
      return NextResponse.json({ error: "Invalid user" }, { status: 403 });
    }

    const { teamName } = await req.json();
    const decodedTeamName = decodeURIComponent(teamName).replace(/-/g, " "); // ✅ แปลง "-" เป็น " "
    
    // ✅ ค้นหาข้อมูลทีม พร้อมจำนวนสมาชิก
    const team = await prisma.team.findFirst({
      where: { name: decodedTeamName },
      select: { id: true, name: true, type: true, member_count: true, privacy: true, created_by: true },
    });

    if (!team) {
      return NextResponse.json({ error: "ทีมนี้ไม่มีอยู่ในระบบ" }, { status: 404 });
    }

    if (team.privacy !== "PRIVATE") {
      return NextResponse.json({ error: "ทีมนี้เป็นสาธารณะ ไม่ต้องส่งคำขอ" }, { status: 400 });
    }

    // ✅ ตรวจสอบจำนวนสมาชิกสูงสุด
    const maxMembers = team.type === "THREE_X_THREE" ? 3 : 5;
    if (team.member_count >= maxMembers) {
      return NextResponse.json({ error: "ทีมนี้มีสมาชิกครบแล้ว" }, { status: 400 });
    }

    // ✅ ตรวจสอบว่าผู้ใช้เป็นสมาชิกของทีมนี้แล้วหรือไม่
    const existingMember = await prisma.teamMember.findFirst({
      where: { teamId: team.id, userId },
    });

    if (existingMember) {
      return NextResponse.json({ error: "คุณเป็นสมาชิกของทีมนี้อยู่แล้ว" }, { status: 400 });
    }

    // ✅ ตรวจสอบว่ามีคำขอเข้าร่วมทีมอยู่แล้วหรือไม่
    const existingRequest = await prisma.notification.findFirst({
      where: { teamId: team.id, senderId: userId, type: "TEAM_REQUEST" },
    });

    if (existingRequest) {
      return NextResponse.json({ error: "คุณได้ส่งคำขอเข้าร่วมทีมนี้ไปแล้ว" }, { status: 409 });
    }

    // ✅ สร้างคำขอเข้าร่วมทีมใน `Notification`
    await prisma.notification.create({
      data: {
        senderId: userId,
        receiverId: team.created_by,
        teamId: team.id,
        type: "TEAM_REQUEST",
        status: "UNREAD",
        message: `🔔 ${payload.username} ขอเข้าร่วมทีม ${team.name}`,
      },
    });

    return NextResponse.json({ message: "✅ คำขอเข้าร่วมทีมถูกส่งแล้ว" });
  } catch (error) {
    console.error("❌ Error requesting to join team:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
