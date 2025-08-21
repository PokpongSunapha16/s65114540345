"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ContactDetail {
  facebook: string;
  instagram: string;
  line: string;
}

export default function ContactDetailPage() {
  const router = useRouter();
  const [contact, setContact] = useState<ContactDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchContactDetail = async () => {
      try {
        const res = await fetch("/api/profile/contact", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(`Failed to fetch: ${errorData.error}`);
        }

        const data = await res.json();
        setContact(data.contact ?? null);
      } catch (error) {
        setErrorMessage((error as Error).message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContactDetail();
  }, []);

  if (isLoading) return <p className="text-center text-gray-500">กำลังโหลด...</p>;
  if (errorMessage) return <p className="text-center text-red-500">{errorMessage}</p>;
  if (!contact) return <p className="text-center text-red-500">ไม่พบข้อมูลการติดต่อ</p>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6 relative">

      {/* ปุ่มแก้ไขข้อมูล */}
      <button
        onClick={() => router.push("/profile/contact/edit")}
        className="absolute top-4 right-4 bg-blue-500 hover:bg-orange-500 text-white font-bold py-2 px-3 rounded-full flex items-center shadow-md transition cursor-pointer"
      >
        ✏ แก้ไขข้อมูล
      </button>

      <h1 className="text-2xl font-bold mb-6">ข้อมูลการติดต่อ</h1>

      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-6">
        <div className="space-y-4">
          <div className="bg-gray-100 p-3 rounded">
            📘 Facebook: <span className="text-blue-600">{contact?.facebook || "ไม่มี"}</span>
          </div>
          <div className="bg-gray-100 p-3 rounded">
            📷 Instagram: {contact?.instagram ? (
              <a href={`https://instagram.com/${contact.instagram}`} 
                 className="text-purple-600" 
                 target="_blank" 
                 rel="noopener noreferrer">
                @{contact.instagram}
              </a>
            ) : "ไม่มี"}
          </div>
          <div className="bg-gray-100 p-3 rounded">
            💬 Line: <span className="text-green-600">{contact?.line || "ไม่มี"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
