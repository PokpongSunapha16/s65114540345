import { PrismaClient, District } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query")?.trim() || "";
  const districtParam = searchParams.get("district")?.trim(); 

  const district = districtParam && Object.values(District).includes(districtParam as District)
    ? (districtParam as District)
    : undefined;

  try {
    console.log("🔍 Query:", query, "🏙️ District:", district);

    const teams = await prisma.team.findMany({
      where: {
        name: query ? { contains: query } : undefined,
        district: district,
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

    console.log("✅ Fetched Teams:", teams.length);
    return NextResponse.json({ teams });

  } catch (error) {
    console.error("❌ Error fetching teams:", error);
    return NextResponse.json({ error: "Failed to fetch teams", details: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
