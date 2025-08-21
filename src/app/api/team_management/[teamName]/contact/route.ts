import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

function cleanTeamName(teamName: string): string {
  return decodeURIComponent(teamName)
    .normalize("NFC") // ✅ Normalize ตัวอักษร
    .replace(/﻿/g, "") // ✅ ลบอักขระแปลก (Zero Width No-Break Space)
    .replace(/-/g, " ") // ✅ แปลง "-" เป็น " "
    .trim(); // ✅ ลบ space หน้า-หลัง
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

    // ✅ ค้นหาทีม และสมาชิกที่ได้รับการอนุมัติ (APPROVED) พร้อม Contact Info
    const team = await prisma.team.findFirst({
      where: { name: cleanedTeamName },
      select: {
        name: true,
        type: true,
        members: {
          where: { status: "APPROVED" },
          select: {
            userId: true, // ✅ ใช้ userId ที่ถูกต้อง
            user: {
              select: {
                username: true,
                profile_picture: true,
                contactInfo: { 
                  select: {
                    facebook: true,
                    instagram: true,
                    line: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // ✅ จัดรูปแบบข้อมูล Contact โดยใช้ userId ที่ถูกต้อง
    const contacts = team.members.map((member) => ({
      userId: member.userId, // ✅ ใช้ userId สำหรับลิงก์ที่ถูกต้อง
      username: member.user.username,
      profile_picture: member.user.profile_picture,
      facebook: member.user.contactInfo?.facebook || null,
      instagram: member.user.contactInfo?.instagram || null,
      line: member.user.contactInfo?.line || null,
    }));

    return NextResponse.json({ team: { name: team.name, type: team.type, contacts } });
  } catch (error) {
    console.error("❌ Error in GET /api/team_management/[teamName]/contact:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
