"use client";

import { useEffect, useState } from "react";

interface Announcement {
  id: number;
  content: string;
}

interface FeaturedAnnouncement {
  id?: number;
  title: string;
  image: string;
  linkUrl: string;
  details: string;
  createdAt?: string;
}

export default function AdminAnnouncements() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [featuredAnnouncements, setFeaturedAnnouncements] = useState<FeaturedAnnouncement[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newContent, setNewContent] = useState("");
  const [newFeatured, setNewFeatured] = useState<FeaturedAnnouncement>({
    title: "",
    image: "",
    linkUrl: "",
    details: "",
  });

  // ✅ โหลดประกาศทั่วไป
  useEffect(() => {
    async function fetchAnnouncement() {
      try {
        const res = await fetch("/api/admin/announcements");
        if (!res.ok) throw new Error("Failed to fetch announcement");
        const data = await res.json();
        setAnnouncement(data);
      } catch (err) {
        setError("Error loading announcement");
        console.error(err);
      }
    }
    fetchAnnouncement();
  }, []);

  // ✅ โหลด Featured Announcements (3 รายการ)
  useEffect(() => {
    async function fetchFeaturedAnnouncements() {
      try {
        const res = await fetch("/api/admin/featured-announcements");
        if (!res.ok) throw new Error("Failed to fetch featured announcements");
        const data = await res.json();
        setFeaturedAnnouncements(data);
      } catch (err) {
        setError("Error loading featured announcements");
        console.error(err);
      }
    }
    fetchFeaturedAnnouncements();
  }, []);

  // ✅ ฟังก์ชันเพิ่มประกาศทั่วไป
  const handleCreateAnnouncement = async () => {
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent }),
      });
      if (!res.ok) throw new Error("Failed to create announcement");
      window.location.reload();
    } catch (error) {
      console.error("Error creating announcement:", error);
    }
  };

  // ✅ ฟังก์ชันเพิ่ม Featured Announcement
  const handleCreateFeatured = async () => {
    try {
      const res = await fetch("/api/admin/featured-announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFeatured),
      });
      if (!res.ok) throw new Error("Failed to create featured announcement");
      window.location.reload();
    } catch (error) {
      console.error("Error creating featured announcement:", error);
    }
  };

  // ✅ ฟังก์ชันลบ Featured Announcement
  const handleDeleteFeatured = async (id: number) => {
    try {
      const res = await fetch("/api/admin/featured-announcements", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete featured announcement");
      setFeaturedAnnouncements(featuredAnnouncements.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Error deleting featured announcement:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">📢 ประกาศจากทางเว็บไซต์</h1>

      {error && <p className="text-red-500">{error}</p>}

      {/* ✅ ฟอร์มเพิ่มประกาศทั่วไป */}
      <div className="mt-4 p-4 border rounded bg-gray-50">
        <h2 className="text-lg font-semibold">📢 เพิ่มประกาศใหม่</h2>
        <textarea
          className="w-full p-2 border rounded mt-2"
          placeholder="Enter new announcement..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
        ></textarea>
        <button onClick={handleCreateAnnouncement} className="bg-green-500 text-white px-4 py-2 rounded mt-2">
          ➕ เพิ่มประกาศ
        </button>
      </div>

      {/* ✅ แสดงประกาศล่าสุด */}
      {announcement && (
        <div className="mt-4 p-4 border rounded bg-gray-100">
          <h2 className="text-lg font-semibold">📢 ประกาศล่าสุด</h2>
          <p>{announcement.content}</p>
        </div>
      )}

      <hr className="my-6" />

      {/* ✅ ฟอร์มเพิ่ม Featured Announcement */}
      <h2 className="text-2xl font-semibold">📌 ประกาศที่น่าสนใจ</h2>
      <div className="mt-4 p-4 border rounded bg-gray-50">
        <input
          className="w-full p-2 border rounded mt-2"
          placeholder="Title"
          value={newFeatured.title}
          onChange={(e) => setNewFeatured({ ...newFeatured, title: e.target.value })}
        />
        <input
          className="w-full p-2 border rounded mt-2"
          placeholder="Image (Base64 or URL)"
          value={newFeatured.image}
          onChange={(e) => setNewFeatured({ ...newFeatured, image: e.target.value })}
        />
        <textarea
          className="w-full p-2 border rounded mt-2"
          placeholder="Details"
          value={newFeatured.details}
          onChange={(e) => setNewFeatured({ ...newFeatured, details: e.target.value })}
        ></textarea>
        <input
          className="w-full p-2 border rounded mt-2"
          placeholder="Link URL"
          value={newFeatured.linkUrl}
          onChange={(e) => setNewFeatured({ ...newFeatured, linkUrl: e.target.value })}
        />
        <button onClick={handleCreateFeatured} className="bg-green-500 text-white px-4 py-2 rounded mt-2">
          ➕ เพิ่มประกาศที่น่าสนใจ
        </button>
      </div>

      {/* ✅ แสดง Featured Announcements */}
      <div className="mt-6">
        {featuredAnnouncements.map((announcement) => (
          <div key={announcement.id} className="p-4 border rounded bg-gray-100 mt-2">
            <h2 className="text-lg font-semibold">📢 {announcement.title}</h2>
            <img src={announcement.image} alt={announcement.title} className="w-full h-40 object-cover rounded mt-2" />
            <p className="mt-2">{announcement.details}</p>
            <a href={announcement.linkUrl} target="_blank" className="text-blue-500 hover:underline">
              🔗 ดูเพิ่มเติม
            </a>
            <p className="text-sm text-gray-500 mt-1">อัพเดทล่าสุด: {new Date(announcement.createdAt || "").toLocaleString()}</p>
            <button
              onClick={() => handleDeleteFeatured(announcement.id!)}
              className="bg-red-500 text-white px-4 py-2 rounded mt-2"
            >
              🗑️ ลบประกาศ
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
