"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface Contact {
  id: number;  // ✅ เพิ่ม id สำหรับใช้เป็น key
  userId: number;
  username: string;
  profile_picture: string | null;
}


interface Team {
  name: string;
  type: string;
  contacts: Contact[];
}

export default function TeamContactPage() {
  const router = useRouter();
  const { teamName } = useParams();
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        if (!teamName) return;
        const decodedTeamName = decodeURIComponent(teamName as string);
        
        console.log("📌 Fetching contact info from:", `/api/team_management/${encodeURIComponent(decodedTeamName)}/contact`);
  
        const res = await fetch(`/api/team_management/${encodeURIComponent(decodedTeamName)}/contact`, {
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
        setTeam(data.team);
      } catch (error) {
        console.error("❌ Error fetching contact info:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchContactData();
  }, [teamName]);

  if (isLoading) {
    return <p className="text-center text-gray-500">กำลังโหลด...</p>;
  }

  if (!team) {
    return <p className="text-center text-red-500">ไม่พบข้อมูลทีม</p>;
  }

  // ✅ กำหนดจำนวนช่องให้สอดคล้องกับประเภททีม
  const maxPlayers = team.type === "THREE_X_THREE" ? 3 : 5;
  const emptySlots = maxPlayers - team.contacts.length;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6 relative">

      <h1 className="text-2xl font-bold mb-6 mt-10">ช่องทางติดต่อ</h1>

      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-6">
      {team.contacts.map((contact) => (
       <div key={contact.userId} className="flex items-center bg-gray-100 p-4 rounded-lg mb-3 border border-gray-300">
            <img
              src={contact.profile_picture || "/default-avatar.png"}
              alt={contact.username}
              className="w-12 h-12 rounded-full mr-4"
            />
            <div className="flex flex-col">
              <p className="font-bold text-lg">{contact.username}</p>
              
              
              <button
              onClick={() => {
                if (contact?.userId) { 
                  router.push(`/user/${contact.userId}/contact`); // ✅ ใช้ userId ที่ถูกต้อง
                } else {
                  alert("ไม่พบข้อมูลการติดต่อของผู้เล่นนี้");
                }
              }}
              className="bg-orange-500 text-white px-3 py-1 rounded mt-2 text-sm hover:bg-orange-600 transition"
            >
              ติดต่อ
            </button>





              

            </div>
          </div>
        ))}

        {/* ✅ สร้างช่อง "ว่างเปล่า" ตามจำนวนที่เหลือ */}
        {Array.from({ length: emptySlots }).map((_, index) => (
          <div key={`empty-${index}`} className="w-full bg-gray-200 p-6 rounded-lg text-center font-bold text-gray-500 mb-3 border border-gray-300">
            ว่างเปล่า
          </div>
        ))}
      </div>
    </div>
  );
}
