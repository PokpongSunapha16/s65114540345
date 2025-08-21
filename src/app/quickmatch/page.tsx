"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const districtMap: Record<string, string> = {
  MUEANG: "เมืองอุบลราชธานี",
  SI_MUEANG_MAI: "ศรีเมืองใหม่",
  KHONG_CHIAM: "โขงเจียม",
  KHUEANG_NAI: "เขื่องใน",
  KHEMMARAT: "เขมราฐ",
  DET: "เดชอุดม",
  NA_CHALUAI: "นาจะหลวย",
  NAM_YUEN: "น้ำยืน",
  BUNTHARIK: "บุณฑริก",
  TRAKAN: "ตระการพืชผล",
  KUT_KHAOPUN: "กุดข้าวปุ้น",
  MUANG_SAM_SIP: "ม่วงสามสิบ",
  WARIN: "วารินชำราบ",
  PHIBUN: "พิบูลมังสาหาร",
  TAN_SUM: "ตาลสุม",
  PHO_SAI: "โพธิ์ไทร",
  SAMRONG: "สำโรง",
  DON_MOT_DAENG: "ดอนมดแดง",
  SIRINDHORN: "สิรินธร",
  THUNG_SI_UDOM: "ทุ่งศรีอุดม",
  SI_LAK_CHAI: "ศรีหลักชัย",
  NAM_KHUN: "น้ำขุ่น",
  LAO_SUEA_KOK: "เหล่าเสือโก้ก",
  SAWANG_WIRAWONG: "สว่างวีระวงศ์",
};

const QuickmatchPage = () => {
  const router = useRouter();
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedTeamType, setSelectedTeamType] = useState<string>("");
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // ฟังก์ชั่นกรองทีม
  const fetchTeams = async () => {
    if (!selectedDistrict || !selectedTeamType) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/quickmatch?district=${selectedDistrict}&type=${selectedTeamType}`);
      const data = await res.json();
      
      if (data.teams && data.teams.length === 0) {
        alert("ไม่พบทีมที่ตรงกับการค้นหา");
      }

      
      setTeams(data.teams || []);
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setIsLoading(false);
    }
  };

// ฟังก์ชั่นเข้าร่วมทีมและเพิ่มผู้เล่นลงในทีม
const handleJoinTeam = async (teamName: string) => {
  try {
    const response = await fetch(`/api/team_management/${encodeURIComponent(teamName)}/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (response.ok) {
      alert(`เข้าร่วมทีม ${teamName} สำเร็จ!`);
      router.push(`/team_management/`);
    } else {
      alert(`เกิดข้อผิดพลาด: ${result.error}`);
    }
  } catch (error) {
    alert("เกิดข้อผิดพลาดในการเข้าร่วมทีม");
  }
};


  // ฟังก์ชั่นแปลงวันที่และเวลาให้เป็นรูปแบบที่เข้าใจง่าย
  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString("th-TH", {
      weekday: "short", 
      day: "2-digit", 
      month: "2-digit", 
      year: "numeric",
      hour: "2-digit", 
      minute: "2-digit",
    });
  };


  return (
    <div className="p-6 bg-white shadow-md rounded-lg w-full max-w-lg mx-auto mt-10">
      <h1 className="text-3xl font-semibold text-center mb-6 text-gray-800">⚡ QUICKMATCH ⚡</h1>

      <div className="mb-4">
        <label className="block text-gray-700 mb-2">เลือกประเภททีม</label>
        <select
          value={selectedTeamType}
          onChange={(e) => setSelectedTeamType(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">เลือกประเภททีม</option>
          <option value="THREE_X_THREE">3X3</option>
          <option value="FIVE_X_FIVE">5X5</option>
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 mb-2">เลือกอำเภอ</label>
        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">เลือกอำเภอ</option>
          {Object.entries(districtMap).map(([key, value]) => (
            <option key={key} value={key}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-between">
        <button
          onClick={fetchTeams}
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
        >
          ยืนยัน
        </button>

        <button
          onClick={() => router.push("/home")}
          className="px-6 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 focus:outline-none"
        >
          ยกเลิก
        </button>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <p className="text-center text-gray-500">กำลังโหลดข้อมูล...</p>
        ) : (
          <div>
            {teams.length > 0 ? (
              teams.map((team: any) => (
                <div key={team.id} className="border p-4 rounded-md mb-4 shadow-md flex items-center">
                  <img
                    src={team.team_logo || "/default-team.png"}
                    alt={team.name}
                    className="w-16 h-16 rounded-full mr-4"
                  />
                  <div className="flex-1">
                    <h2 className="font-bold text-xl text-gray-700">{team.name}</h2>
                    <p className="text-gray-600">สนาม: {team.court}</p>
                    <p className="text-gray-600">วันที่: {formatDateTime(team.start_at)} - {formatDateTime(team.end_at)}</p>
                    <button
                      onClick={() => handleJoinTeam(team.name)}
                      className="mt-4 px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none"
                    >
                      เข้าร่วมทีม
                    </button>
                    <span className="text-sm font-bold text-gray-600 ml-24 mt-4">
                        จำนวนสมาชิก {team.member_count} คน
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">ไม่พบทีมที่ตรงกับการค้นหา</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickmatchPage;
