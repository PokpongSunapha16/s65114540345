import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export async function POST(req: Request, context: any) {
  try {
    const teamName = context.params?.teamName;

    if (!teamName) {
      return NextResponse.json({ error: "❌ ไม่พบชื่อทีม" }, { status: 400 });
    }

    const decodedTeamName = decodeURIComponent(teamName).replace(/-/g, " "); // ✅ รองรับชื่อทีมที่มี `-`

    // ✅ ตรวจสอบ JWT Token
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "❌ คุณต้องเข้าสู่ระบบก่อนเข้าร่วมทีม" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    const currentUserId = Number(payload.id);

    // ✅ ค้นหาทีม และตรวจสอบสถานะ `PUBLIC`
    const team = await prisma.team.findFirst({
      where: { name: decodedTeamName },
      select: { id: true, type: true, privacy: true, member_count: true },
    });

    if (!team) {
      return NextResponse.json({ error: "❌ ไม่พบทีมนี้ในระบบ" }, { status: 404 });
    }

    if (team.privacy !== "PUBLIC") {
      return NextResponse.json({ error: "❌ ทีมนี้เป็นส่วนตัว ต้องได้รับคำเชิญ" }, { status: 403 });
    }

    // ✅ ตรวจสอบว่าทีมยังไม่เต็ม
    const maxPlayers = team.type === "THREE_X_THREE" ? 3 : 5;
    if (team.member_count >= maxPlayers) {
      return NextResponse.json({ error: "❌ ทีมนี้มีสมาชิกครบแล้ว" }, { status: 400 });
    }

    // ✅ ตรวจสอบว่าผู้ใช้ยังไม่ได้อยู่ในทีม
    const existingMember = await prisma.teamMember.findFirst({
      where: { teamId: team.id, userId: currentUserId },
    });

    if (existingMember) {
      return NextResponse.json({ error: "❌ คุณเป็นสมาชิกของทีมนี้อยู่แล้ว" }, { status: 400 });
    }

    // ✅ เพิ่มสมาชิกใหม่ในทีม (role เริ่มต้นเป็น PLAYER)
    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId: currentUserId,
        role: "PLAYER",
        status: "APPROVED",
      },
    });

    // ✅ อัปเดต `member_count`
    await prisma.team.update({
      where: { id: team.id },
      data: { member_count: team.member_count + 1 },
    });

    return NextResponse.json({ message: "✅ เข้าร่วมทีมสำเร็จ!" });
  } catch (error) {
    console.error("❌ Error in POST /api/team_management/[teamName]/join:", error);
    return NextResponse.json({ error: "❌ เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" }, { status: 500 });
  }
}
