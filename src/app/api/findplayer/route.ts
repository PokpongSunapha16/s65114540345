import { PrismaClient, District } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const district = searchParams.get("district") || ""; // รับ district
  const query = searchParams.get("query") || ""; // รับ query (username)

  try {
    const conditions: any = {};

    // เพิ่มเงื่อนไขสำหรับ query
    if (query.trim()) {
      conditions.username = {
        contains: query,
      };
    }

    // เพิ่มเงื่อนไขสำหรับ district
    if (district.trim()) {
      if (Object.values(District).includes(district as District)) {
        conditions.district = district as District;
      } else {
        return NextResponse.json(
          { error: "Invalid district" },
          { status: 400 }
        );
      }
    }

    console.log("Generated conditions:", JSON.stringify(conditions)); // Log เงื่อนไข

    // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
    const players = await prisma.user.findMany({
      where: conditions,
      select: {
        id: true,
        username: true,
        profile_picture: true,
        district: true,
        position: true,
        status: true,
      },
    });

    console.log("Fetched players:", players); // Log ผลลัพธ์

    // ตรวจสอบผลลัพธ์ก่อนส่งกลับ
    if (!players || players.length === 0) {
      return NextResponse.json(
        { players: [], message: "No players found" },
        { status: 200 }
      );
    }

    return NextResponse.json({ players });
  } catch (error) {
    console.error("Error fetching players:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch players",
        details: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
