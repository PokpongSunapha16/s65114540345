import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export async function GET(req: Request, context: any) {
  try {
    // ✅ ใช้ await กับ context.params ให้ถูกต้อง
    const { teamName } = context.params;

    if (!teamName) {
      return NextResponse.json({ error: "Bad Request: Missing teamName" }, { status: 400 });
    }

    const decodedTeamName = decodeURIComponent(teamName).replace(/-/g, " "); // ✅ แปลง "-" เป็น " "
    console.log("Received teamName:", decodedTeamName);

    // ✅ ใช้ await กับ cookies() ให้ถูกต้อง
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.id as number;

    // ✅ ใช้ Prisma ค้นหาข้อมูลทีม
    const team = await prisma.team.findFirst({
      where: { name: decodedTeamName },
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
        description: true,
        created_by: true,
        map: true,
        members: {
          select: {
            userId: true,
            role: true,
            status: true,
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json({ team, currentUser: userId });
  } catch (error) {
    console.error("Error in GET /api/team_management/[teamName]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
