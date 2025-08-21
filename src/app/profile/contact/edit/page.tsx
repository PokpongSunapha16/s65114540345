"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ContactDetail {
  facebook: string;
  instagram: string;
  line: string;
}

export default function EditContactPage() {
  const router = useRouter();
  const [contact, setContact] = useState<ContactDetail>({ facebook: "", instagram: "", line: "" });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
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
          throw new Error(`โหลดข้อมูลล้มเหลว: ${errorData.error}`);
        }

        const data = await res.json();
        setContact({
          facebook: data.contact?.facebook || "",
          instagram: data.contact?.instagram || "",
          line: data.contact?.line || "",
        });
      } catch (error) {
        setErrorMessage((error as Error).message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContactDetail();
  }, []);

  const handleSave = async () => {
    try {
      if (!contact.facebook.trim() && !contact.instagram.trim() && !contact.line.trim()) {
        alert("กรุณากรอกข้อมูลอย่างน้อย 1 ช่อง");
        return;
      }

      setIsSaving(true);
      const res = await fetch("/api/profile/contact/edit", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`บันทึกข้อมูลล้มเหลว: ${errorData.error}`);
      }

      router.push("/profile/contact");
    } catch (error) {
      console.error("❌ Error saving contact:", error);
      setErrorMessage("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <p className="text-center text-gray-500">🔄 กำลังโหลด...</p>;
  if (errorMessage) return <p className="text-center text-red-500">{errorMessage}</p>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6 relative">

      <h1 className="text-2xl font-bold mb-6">แก้ไขข้อมูลการติดต่อ</h1>

      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <label className="block mb-2">📘 Facebook</label>
        <input
          type="text"
          value={contact.facebook}
          onChange={(e) => setContact({ ...contact, facebook: e.target.value })}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="block mt-4 mb-2">📷 Instagram</label>
        <input
          type="text"
          value={contact.instagram}
          onChange={(e) => setContact({ ...contact, instagram: e.target.value })}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <label className="block mt-4 mb-2">💬 Line</label>
        <input
          type="text"
          value={contact.line}
          onChange={(e) => setContact({ ...contact, line: e.target.value })}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <div className="flex justify-between mt-6">
          <button
            onClick={() => router.back()}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
          >
            ❌ ยกเลิก
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-4 py-2 rounded text-white transition ${
              isSaving ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isSaving ? "💾 กำลังบันทึก..." : "💾 บันทึก"}
          </button>
        </div>
      </div>
    </div>
  );
}
