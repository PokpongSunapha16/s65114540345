import { NextResponse } from "next/server";
import { PrismaClient, District, Position } from "@prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

// GET handler: Fetch user profile
export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = await cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: No token provided", status: "OFFLINE" },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.id as number;

    // Update status to ACTIVE
    await prisma.user.update({
      where: { id: userId },
      data: { status: "ACTIVE" },
    });


    // ดึงข้อมูล User
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        profile_picture: true,
        note: true,
        district: true,
        position: true,
        status: true, // Ensure this covers all 4 statuses
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ ดึงข้อมูลรีวิวที่ได้รับ
    const reviews = await prisma.review.findMany({
      where: { reviewed_user_id: userId },
      select: {
        score: true,
        comment: true,
        reviewer_user: {
          select: {
            username: true,
            profile_picture: true,
          },
        },
      },
    });

    // ✅ คำนวณค่าเฉลี่ยคะแนนรีวิว
    const totalReviews = reviews.length;
    const averageScore =
      totalReviews > 0
        ? reviews.reduce((acc, curr) => acc + curr.score, 0) / totalReviews
        : 0;

    // ✅ ปัดคะแนนให้แสดงผลแบบ 1-5 ดาว
    const roundedAverageScore = Math.round(averageScore);

    return NextResponse.json({
      ...user,
      reviewStats: {
        averageScore: roundedAverageScore,
        totalReviews,
      },
      reviews, // ✅ ส่งข้อมูลรีวิวที่ได้รับกลับไป
    });
  } catch (error) {
    console.error("Error in GET /api/profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


// PUT handler: Update profile
export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = await cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });
    }

    let payload;
    try {
      ({ payload } = await jwtVerify(token, SECRET));
    } catch (error) {
      console.error("Token verification failed:", error);
      return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
    }

    const userId = payload.id as number;

    const { profile_picture, note, district, position } = await req.json();

    // Validate district value
    if (district && !Object.values(District).includes(district as District)) {
      return NextResponse.json({ error: "Invalid district value" }, { status: 400 });
    }

    // Validate position value
    if (position && !Object.values(Position).includes(position as Position)) {
      return NextResponse.json({ error: "Invalid position value" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(profile_picture && { profile_picture }),
        ...(note && { note }),
        ...(district && { district: district as District }),
        ...(position && { position: position as Position }),
      },
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in PUT /api/profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
