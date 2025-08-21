import { PrismaClient, TeamType, District, Privacy } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const districtParam = searchParams.get("district")?.trim();
  const typeParam = searchParams.get("type")?.trim();

  // ตรวจสอบค่า district และ type ให้ตรงกับ enum ที่กำหนดใน schema
  const district = districtParam && Object.values(District).includes(districtParam as District)
    ? (districtParam as District)
    : undefined;

  const type = typeParam && Object.values(TeamType).includes(typeParam as TeamType)
    ? (typeParam as TeamType)
    : undefined;

  try {
    const teams = await prisma.team.findMany({
      where: {
        privacy: Privacy.PUBLIC,  // เฉพาะทีมที่เป็นสาธารณะ
        district: district,
        type: type,
      },
      select: {
        id: true,
        name: true,
        description: true,
        team_logo: true,
        court: true,
        start_at: true,
        end_at: true,
        privacy: true,
        type: true,
        district: true,
        member_count: true,
      },
      orderBy: {
        member_count: "desc",
      },
    });

    if (teams.length === 0) {
        return NextResponse.json({ message: "ไม่พบทีมที่ตรงกับการค้นหา" });
      }

    return NextResponse.json({ teams });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
