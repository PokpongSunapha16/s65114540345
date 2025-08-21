"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardData {
  totalUsers: number;
  totalBlogs: number;
  totalReports: number;
  totalImages: number;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        const dashboardData = await res.json();
        setData(dashboardData);
      } catch (err) {
        setError("Error loading dashboard data");
        console.error(err);
      }
    }
    fetchDashboardData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">ADMIN DASHBOARD</h1>

      {error && <p className="text-red-500">{error}</p>}

      {data ? (
        <div className="mt-4">
          <p>👥 ผู้ใช้งานทั้งหมด: {data.totalUsers} คน</p>
          <p>📝 บล็อกทั้งหมด: {data.totalBlogs} บล็อก</p>
          <p>🚨 รายงานบล็อกทั้งหมด: {data.totalReports} รายงาน</p>
          <p>📸 รูปภาพในแกลลอรี่ทั้งหมด: {data.totalImages} รูป</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}

      <div className="mt-4 space-y-2">
        <Link href="/admin/announcements" className="block bg-gray-200 p-4 rounded">📢 จัดการประกาศ</Link>
        <Link href="/admin/reports" className="block bg-gray-200 p-4 rounded">🚨 จัดการรายงานบล็อก</Link>
        <Link href="/admin/blogs" className="block bg-gray-200 p-4 rounded">📝 จัดการบล็อก</Link>
        <Link href="/admin/users" className="block bg-gray-200 p-4 rounded">👥 จัดการสมาชิก</Link>
      </div>
    </div>
  );
}
