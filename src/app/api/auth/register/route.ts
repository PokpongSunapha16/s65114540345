import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const { username, mail, password, profile_picture, role } = await req.json();

    // ตรวจสอบฟิลด์ที่จำเป็น
    if (!username || !mail || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // ตรวจสอบรูปแบบของ profile_picture
    if (
      profile_picture &&
      !profile_picture.startsWith("data:image")
    ) {
      return NextResponse.json(
        { message: "Invalid profile picture format" },
        { status: 400 }
      );
    }

    // กำหนดค่า default สำหรับรูปภาพ
    const finalProfilePicture =
      profile_picture && typeof profile_picture === "string"
        ? profile_picture
        : "/default-profile.png";

    // Hash รหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);

    // สร้างผู้ใช้ในฐานข้อมูล โดยใช้ role ที่รับมาจาก frontend
    const user = await prisma.user.create({
      data: {
        username,
        mail,
        password: hashedPassword,
        profile_picture: finalProfilePicture,
        role: role || "USER", // ค่า default เป็น USER
      },
    });

    return NextResponse.json(
      { message: "User registered successfully", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering user:", error);

    // จัดการ JSON Parsing Error
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { message: "Invalid JSON format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
