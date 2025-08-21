import { NextResponse } from "next/server";
import { jwtVerify } from "jose"; // ต้องติดตั้ง jose: npm install jose

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie");
  const token = cookie?.split("token=")[1]?.split(";")[0];

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // ตรวจสอบ token และดึง payload ออกมา
    const { payload } = await jwtVerify(token, SECRET);

    // ส่งข้อมูลผู้ใช้กลับไป
    return NextResponse.json({ user: payload });
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
