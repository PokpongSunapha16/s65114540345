import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.id as number;

    const requestBody = await req.json();
    const {
      name,
      privacy,
      type,
      start_at,
      end_at,
      district,
      court,
      team_logo,
      description,
    } = requestBody;

    // บันทึกข้อมูลทีมใหม่
    const team = await prisma.team.create({
      data: {
        name,
        privacy,
        type,
        start_at: new Date(start_at),
        end_at: new Date(end_at),
        district,
        court,
        team_logo,
        description,
        created_by: userId,
        member_count: 1, // ตั้งค่า member_count เป็น 1 ตั้งแต่แรก
      },
    });

    // เพิ่มผู้สร้างเข้าเป็นสมาชิกทีมทันที
    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId: userId,
        status: "APPROVED",
        role: "CAPTAIN",
      },
    });

    return NextResponse.json({ success: true, team });
  } catch (error) {
    console.error("Error in POST /api/team_management/create:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
