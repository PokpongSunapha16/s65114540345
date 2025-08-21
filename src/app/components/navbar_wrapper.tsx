"use client";

import { useAuth } from "@/app/components/authContext";
import GeneralNavbar from "@/app/components/general_navbar";
import UserNavbar from "@/app/components/user_navbar";

export default function NavbarWrapper() {
  const { isLoggedIn } = useAuth(); // ใช้ Context ตรวจสอบสถานะล็อกอิน

  return isLoggedIn ? <UserNavbar /> : <GeneralNavbar />;
}
