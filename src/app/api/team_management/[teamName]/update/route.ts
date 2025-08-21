import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export async function POST(req: Request, { params }: any) {
  try {
    const teamName = params.teamName;
    
    if (!teamName) {
      return NextResponse.json({ error: "Bad Request: Missing teamName" }, { status: 400 });
    }

    const decodedTeamName = decodeURIComponent(teamName).replace(/-/g, " ");
    console.log("Updating team:", decodedTeamName);

    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload?.id as number;

    console.log("✅ Verified User ID:", userId);

    const team = await prisma.team.findFirst({
      where: { name: decodedTeamName },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const teamMember = await prisma.teamMember.findFirst({
      where: {
        teamId: team.id,
        userId: userId,
        role: "CAPTAIN",
      },
    });

    if (!teamMember) {
      return NextResponse.json({ error: "Forbidden: Only the CAPTAIN can edit this team" }, { status: 403 });
    }

    const data = await req.json();
    console.log("🔄 Updating Team with Data:", data);

    const { name, team_logo, court, type, district, privacy, description } = data;

    if (!name || !district || !privacy) {
      return NextResponse.json({ error: "Bad Request: Missing required fields" }, { status: 400 });
    }

    const updatedTeam = await prisma.team.update({
      where: { id: team.id },
      data: {
        name,
        team_logo: team_logo || null,
        court: court || "",
        type,
        district,
        privacy,
        description: description || "",
      },
    });

    console.log("✅ Team Updated Successfully:", updatedTeam);
    return NextResponse.json({ team: updatedTeam });

  } catch (error) {
    console.error("🚨 Error updating team:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
