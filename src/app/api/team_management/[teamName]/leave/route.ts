import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export async function POST(req: NextRequest, { params }: any) {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.id as number;

    // 🔍 ค้นหา Team ID ตามชื่อทีม
    const decodedTeamName = decodeURIComponent(params.teamName).replace(/-/g, " ");
    const team = await prisma.team.findFirst({
      where: { name: decodedTeamName },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // 🔍 ค้นหาข้อมูลสมาชิกในทีม
    const member = await prisma.teamMember.findFirst({
      where: { teamId: team.id, userId: userId },
    });

    if (!member) {
      return NextResponse.json({ error: "You are not a member of this team" }, { status: 403 });
    }

    // 🏀 ตรวจสอบบทบาทของสมาชิก
    if (member.role === "PLAYER") {
      // ✅ กรณีเป็นผู้เล่นทั่วไป → ออกจากทีมได้เลย
      await prisma.teamMember.deleteMany({
        where: { teamId: team.id, userId: userId },
      });

      // 🔄 อัปเดตจำนวนสมาชิกในทีม
      const newMemberCount = await prisma.teamMember.count({ where: { teamId: team.id } });
      await prisma.team.update({ where: { id: team.id }, data: { member_count: newMemberCount } });

      return NextResponse.json({ message: "Left the team successfully" });
    }

    // 🏆 กรณีเป็นกัปตัน → ตรวจสอบสมาชิกที่เหลืออยู่
    const teamMembers = await prisma.teamMember.findMany({
      where: { teamId: team.id },
      orderBy: { joined_at: "asc" }, // เรียงลำดับสมาชิกที่เข้าร่วมนานที่สุด
    });

    if (teamMembers.length === 1) {
      // 🛑 ถ้าไม่มีสมาชิกคนอื่นเหลือ → ลบทีมออกจากฐานข้อมูล
      await prisma.team.delete({ where: { id: team.id } });
      return NextResponse.json({ message: "Team deleted as no members left" });
    }

    // 🔄 โอนตำแหน่งกัปตันให้กับสมาชิกที่อยู่มานานที่สุด (ที่ไม่ใช่ตัวเอง)
    const newCaptain = teamMembers.find((m) => m.userId !== userId);

    if (newCaptain) {
      await prisma.teamMember.update({
        where: { id: newCaptain.id },
        data: { role: "CAPTAIN" },
      });
    }

    // ✅ ลบกัปตันเดิมออกจากทีม
    await prisma.teamMember.delete({ where: { id: member.id } });

    // 🔄 อัปเดตจำนวนสมาชิกในทีม
    const updatedMemberCount = await prisma.teamMember.count({ where: { teamId: team.id } });
    await prisma.team.update({ where: { id: team.id }, data: { member_count: updatedMemberCount } });

    return NextResponse.json({ message: "Captain role transferred and left the team" });
  } catch (error) {
    console.error("Error leaving team:", error);
    return NextResponse.json({ error: "Failed to leave team" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
