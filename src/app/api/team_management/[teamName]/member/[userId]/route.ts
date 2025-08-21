import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export async function DELETE(req: Request, context: any) {
  try {
    const { teamName, userId } = context.params; // ✅ ไม่ต้อง await ที่นี่

    if (!teamName || !userId) {
      return NextResponse.json({ error: "Bad Request: Missing parameters" }, { status: 400 });
    }

    // ✅ Decode และทำให้รองรับชื่อทีมที่มี "-" หรือเว้นวรรค
    const cleanedTeamName = decodeURIComponent(teamName).replace(/-/g, " ").trim();
    console.log("Processing removal for:", cleanedTeamName, "UserID:", userId);

    // ✅ ตรวจสอบ JWT Token
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    const currentUserId = payload.id as number;

    // ✅ ค้นหาทีม
    const team = await prisma.team.findFirst({
      where: { name: cleanedTeamName },
      select: { id: true, member_count: true },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // ✅ ตรวจสอบว่าสมาชิกที่ต้องการเตะมีอยู่จริง
    const targetMember = await prisma.teamMember.findFirst({
      where: { teamId: team.id, userId: Number(userId) },
      select: { role: true },
    });

    if (!targetMember) {
      return NextResponse.json({ error: "Member not found in team" }, { status: 404 });
    }

    if (targetMember.role !== "PLAYER") {
      return NextResponse.json({ error: "Only PLAYERs can be removed" }, { status: 403 });
    }

    // ✅ ตรวจสอบว่า currentUser เป็น CAPTAIN
    const teamMember = await prisma.teamMember.findFirst({
      where: { teamId: team.id, userId: currentUserId },
      select: { role: true },
    });

    if (!teamMember || teamMember.role !== "CAPTAIN") {
      return NextResponse.json({ error: "Forbidden: Only CAPTAIN can remove members" }, { status: 403 });
    }

    // ✅ ลบสมาชิกออกจากทีม
    await prisma.teamMember.deleteMany({
      where: { teamId: team.id, userId: Number(userId) },
    });

    // ✅ ลบความคิดเห็นทั้งหมดของสมาชิกที่ถูกเตะออกจากทีม
    await prisma.commentBoard.deleteMany({
      where: { userId: Number(userId), teamId: team.id },
    });

    // ✅ อัปเดตจำนวนสมาชิกของทีม
    const updatedMemberCount = await prisma.teamMember.count({
      where: { teamId: team.id },
    });

    await prisma.team.update({
      where: { id: team.id },
      data: { member_count: updatedMemberCount },
    });

    return NextResponse.json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/team_management/[teamName]/member/[userId]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
