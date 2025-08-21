import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

function cleanTeamName(teamName: string): string {
  return decodeURIComponent(teamName)
    .normalize("NFC")
    .replace(/﻿/g, "")
    .replace(/-/g, " ")
    .trim();
}

export async function GET(req: Request, context: any) {
  try {
    const { teamName } = context.params;

    if (!teamName) {
      return NextResponse.json({ error: "Bad Request: Missing teamName" }, { status: 400 });
    }

    const cleanedTeamName = cleanTeamName(teamName);
    console.log("Received teamName:", cleanedTeamName);

    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.id as number;

    const team = await prisma.team.findFirst({
      where: { name: cleanedTeamName },
      select: {
        name: true,
        type: true,
        members: {
          where: { status: "APPROVED" },
          select: {
            user: {
              select: {
                id: true, // ✅ เพิ่ม user.id
                username: true,
                profile_picture: true,
              },
            },
            role: true,
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // ✅ ใช้ user.id และส่ง userId ของ current user ไปด้วย
    const members = team.members.map((member) => ({
      id: member.user.id, // ✅ ใช้ user.id แทน
      username: member.user.username,
      profile_picture: member.user.profile_picture,
      role: member.role,
    }));

    return NextResponse.json({
      team: { name: team.name, type: team.type, members },
      currentUserId: userId, // ✅ เพิ่ม userId เพื่อให้ client ใช้ตรวจสอบ role
    });
  } catch (error) {
    console.error("Error in GET /api/team_management/[teamName]/member:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
