import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export async function PUT(req: Request, context: any) {
  try {
    const teamName = context.params?.teamName;

    if (!teamName) {
      return NextResponse.json({ error: "Missing teamName" }, { status: 400 });
    }

    const decodedTeamName = decodeURIComponent(teamName).replace(/-/g, " "); // ✅ รองรับชื่อทีมที่มี `-`
    console.log("Received teamName:", decodedTeamName); // Debugging

    // ✅ ตรวจสอบ JWT Token
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    const currentUserId = payload.id as number;

    // ✅ ค้นหาข้อมูลทีม
    const team = await prisma.team.findFirst({
      where: { name: decodedTeamName },
      select: { id: true, created_by: true }, // ดึง id และ created_by
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // ✅ ตรวจสอบว่าสมาชิกเป็น CAPTAIN หรือ OWNER
    const teamMember = await prisma.teamMember.findFirst({
      where: { teamId: team.id, userId: currentUserId },
      select: { role: true },
    });

    if (!teamMember || (teamMember.role !== "CAPTAIN" && team.created_by !== currentUserId)) {
      return NextResponse.json({ error: "Forbidden: Only CAPTAIN or TEAM OWNER can update the map" }, { status: 403 });
    }

    // ✅ รับค่าใหม่จาก request body
    const { map } = await req.json();

    if (!map || typeof map !== "string") {
      return NextResponse.json({ error: "Invalid map URL" }, { status: 400 });
    }

    // ✅ อัปเดตค่า `map` ในฐานข้อมูล
    await prisma.team.update({
      where: { id: team.id },
      data: { map },
    });

    return NextResponse.json({ message: "Map updated successfully", map });
  } catch (error) {
    console.error("Error in PUT /api/team_management/[teamName]/map:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
