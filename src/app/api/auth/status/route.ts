import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value; 

    if (!token) {
      console.error("❌ No token found in cookies");
      return NextResponse.json({ isLoggedIn: false, userId: null, userRole: null }, { status: 401 });
    }

    // ✅ ตรวจสอบและถอดรหัส JWT
    const { payload } = await jwtVerify(token, SECRET);
    console.log("✅ Decoded Payload:", payload); // ✅ Debug
    
    if (!payload || !payload.id) { 
      console.error("❌ Invalid JWT Token:", payload);
      return NextResponse.json({ isLoggedIn: false, userId: null, userRole: null }, { status: 403 });
    }
    
    console.log("✅ User Authenticated:", payload.id);
    return NextResponse.json({ isLoggedIn: true, userId: payload.id, userRole: payload.role });
    

  } catch (error) {
    console.error("❌ Error verifying JWT:", error);
    return NextResponse.json({ isLoggedIn: false, userId: null }, { status: 500 });
  }
}
