"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/authContext"; // ✅ Import AuthContext

interface Notification {
  id: number;
  senderId: number;
  receiverId: number;
  teamId?: number;
  type: "TEAM_INVITE" | "GAME_INVITE" | "MESSAGE";
  status: "UNREAD" | "READ" | "ACTIONED";
  message?: string;
  createdAt: string;
  expiresAt?: string;
}

const UserNavbar: React.FC = () => {
  const { isLoggedIn, setIsLoggedIn } = useAuth(); // ✅ ใช้ Context
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null); // ✅ เพิ่ม state เก็บ role
  const router = useRouter();

  // ✅ ดึงข้อมูล Session และตรวจสอบว่า Login หรือไม่
  useEffect(() => {
    async function fetchUserSession() {
      try {
        const res = await fetch("/api/auth/status", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();
        console.log("📌 Session Data:", data);

        if (data.isLoggedIn && data.userId) {
          setUserId(data.userId);
          setUserRole(data.userRole); // ✅ อัปเดต role ของ user
        } else {
          setIsLoggedIn(false);
          setUserId(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error("❌ Error fetching user session:", error);
      }
    }

    if (isLoggedIn) {
      fetchUserSession();
    }
  }, [isLoggedIn]); // ✅ ทำให้ re-fetch เมื่อสถานะเปลี่ยน

  // ✅ ดึงการแจ้งเตือน ถ้าผู้ใช้ล็อกอินอยู่
  useEffect(() => {
    if (!userId) return;

    async function fetchNotifications() {
      try {
        console.log(`📡 Fetching notifications for userId: ${userId}`);
        const response = await fetch(`/api/notifications?userId=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch notifications");

        const data = await response.json();
        console.log("📌 Fetched Notifications:", data.notifications);

        setNotifications(data.notifications);
        setHasUnread(data.notifications.some((notif: Notification) => notif.status === "UNREAD"));
      } catch (error) {
        console.error("❌ Error fetching notifications:", error);
      }
    }

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  // ✅ Mark Notifications as Read
  const handleNotificationClick = async () => {
    if (!hasUnread) return;

    try {
      const response = await fetch("/api/notifications/mark-as-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to mark notifications as read");

      console.log("✅ Notifications marked as read");
      setHasUnread(false);
    } catch (error) {
      console.error("❌ Error marking notifications as read:", error);
    }
  };

  // ✅ Logout & รีเฟรช Navbar
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to logout");

      console.log("✅ Logout successful");

      // ✅ ลบ Token & อัปเดต Context
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      setIsLoggedIn(false);
      setUserId(null);
      setUserRole(null);

      router.refresh(); // ✅ รีเฟรช NavbarWrapper
      router.push("/signin");
    } catch (error) {
      console.error("❌ Error logging out:", error);
    }
  };

  return (
    <nav className="bg-orange-600 p-4">
      <div className="flex justify-between items-center">

        <div className="flex items-center">
          <Image src="/images/logo.png" alt="Logo" width={50} height={50} className="mr-2" />
          <h1 className="text-white text-xl font-semibold hidden sm:block">Ubon Hooper Club</h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">

          {isLoggedIn && (
            <Link href="/notifications" className="relative text-white hover:text-gray-400" onClick={handleNotificationClick}>
              🔔
              {hasUnread && <span className="absolute top-0 right-0 bg-red-500 text-xs w-3 h-3 rounded-full"></span>}
            </Link>
          )}

          {/* ✅ แสดงปุ่ม Dashboard เฉพาะ ADMIN */}
          {isLoggedIn && userRole === "ADMIN" && (
            <Link href="/admin/dashboard" className="bg-white text-orange-600 px-3 py-1 rounded hover:bg-gray-200 text-sm">
              Dashboard
            </Link>
          )}

          <Link href="/home" className="text-white hover:text-gray-400">หน้าแรก</Link>

          {/* ✅ ซ่อน GET HOOP และ BLOG ถ้าไม่ได้ล็อกอิน */}
          {isLoggedIn && (
            <>
              <Link href="/gethoop" className="text-white hover:text-gray-400">GET HOOP</Link>
              <Link href="/blog" className="text-white hover:text-gray-400">บล็อก</Link>
            </>
          )}

          {isLoggedIn ? (
            <>
              <Link href="/profile" className="text-white hover:text-gray-400">โปรไฟล์</Link>
              <button onClick={handleLogout} className="text-white hover:text-red-600">ออกจากระบบ</button>
            </>
          ) : (
            <Link href="/signin" className="text-white hover:text-gray-400">เข้าสู่ระบบ</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;
