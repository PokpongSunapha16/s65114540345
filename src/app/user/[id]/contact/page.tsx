"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface ContactDetail {
  facebook: string;
  instagram: string;
  line: string;
}

interface UserProfile {
  username: string;
  profile_picture: string | null;
  contact: ContactDetail;
}

export default function UserContactPage() {
  const router = useRouter();
  const { id } = useParams(); // ✅ ตรวจสอบค่าจาก URL Params
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserContact = async () => {
      try {
        if (!id) {
          console.error("❌ No ID Found in URL Params");
          return;
        }

        console.log("📌 Fetching contact info for user:", id);

        const res = await fetch(`/api/user/${id}/contact`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        console.log("✅ Fetch response status:", res.status);

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(`Failed to fetch: ${errorData.error}`);
        }

        const data = await res.json();
        console.log("✅ Received Data:", data);
        setUser(data.user ?? null);
      } catch (error) {
        setErrorMessage((error as Error).message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserContact();
  }, [id]);

  if (isLoading) return <p className="text-center text-gray-500">กำลังโหลด...</p>;
  if (errorMessage) return <p className="text-center text-red-500">{errorMessage}</p>;
  if (!user) return <p className="text-center text-red-500">ไม่พบข้อมูลการติดต่อ</p>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6 relative">

      <h1 className="text-2xl font-bold mb-6">ข้อมูลการติดต่อของ {user.username}</h1>

      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-6">
        <img
          src={user.profile_picture || "/default-avatar.png"}
          alt="Profile"
          className="w-24 h-24 rounded-full mx-auto mb-4"
        />
        <div className="space-y-4">
          <div className="bg-gray-100 p-3 rounded">
            📘 Facebook: <span className="text-blue-600">{user.contact?.facebook || "ไม่มี"}</span>
          </div>
          <div className="bg-gray-100 p-3 rounded">
            📷 Instagram: {user.contact?.instagram ? (
              <a href={`https://instagram.com/${user.contact.instagram}`} className="text-purple-600" target="_blank" rel="noopener noreferrer">@{user.contact.instagram}</a>
            ) : "ไม่มี"}
          </div>
          <div className="bg-gray-100 p-3 rounded">
            💬 Line: <span className="text-green-600">{user.contact?.line || "ไม่มี"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
