import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.id as number;

    // 🏀 ✅ ดึงเฉพาะทีมที่ windy123 ยังเป็นสมาชิกอยู่
    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: {
            userId: userId,
            status: "APPROVED",
          },
        },
      },
      select: {
        id: true,
        name: true,
        team_logo: true,
        court: true,
        start_at: true,
        end_at: true,
        type: true,
        district: true,
        privacy: true,
        members: {
          select: { id: true },
        },
      },
    });

    const teamsWithMemberCount = teams.map((team) => ({
      ...team,
      member_count: team.members.length,
    }));

    await prisma.$disconnect(); // ✅ ปิดการเชื่อมต่อ Prisma

    return NextResponse.json({ teams: teamsWithMemberCount });
  } catch (error) {
    console.error("Error in GET /api/team_management:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
