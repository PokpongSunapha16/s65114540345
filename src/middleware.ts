import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    console.log("🔴 No token found, redirecting to /signin");
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  try {
    // ✅ Verify Token และอ่านค่า `id`
    const { payload } = await jwtVerify(token, SECRET);
    console.log("✅ Decoded Payload:", payload);

    // 🔹 ตรวจสอบว่ามี `id` และเป็น `number` หรือไม่
    if (!payload || typeof payload.id !== "number") {
      console.error("❌ Invalid Token: Missing `id`");
      return NextResponse.redirect(new URL("/signin", req.url));
    }

    // ✅ แปลง `id` เป็น `string` อย่างปลอดภัย
    const userId: string = String(payload.id);
    const userRole: string = typeof payload.role === "string" ? payload.role : "USER"; // 🔥 ถ้าไม่มี role ให้เป็น USER

    // ✅ ป้องกันไม่ให้ `USER` เข้า `/admin/*`
    const isAdminPage = req.nextUrl.pathname.startsWith("/admin");
    if (isAdminPage && userRole !== "ADMIN") {
      console.error("❌ Unauthorized access to admin page");
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // ✅ เพิ่ม Header ให้ใช้ใน Frontend
    const response = NextResponse.next();
    response.headers.set("x-user-id", userId);
    response.headers.set("x-user-role", userRole);
    response.headers.set("x-user-logged-in", "true");

    return response;
  } catch (err) {
    console.error("❌ Invalid Token:", err);
    return NextResponse.redirect(new URL("/signin", req.url));
  }
}

// ✅ เพิ่ม `/admin/:path*` ใน matcher เพื่อให้ Middleware ตรวจสอบ Admin
export const config = {
  matcher: [
    "/home",
    "/findplayer",
    "/findteam",
    "/team_management",
    "/gethoop",
    "/profile",
    "/upload_gallery",
    "/blog/create",
    "/blog/:slug/report",
    "/blog/:slug/edit",
    "/admin/:path*" // 🔥 จำกัดให้เฉพาะ ADMIN เท่านั้น
  ],
};
