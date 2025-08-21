"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";

interface Team {
  id: number;
  name: string;
  team_logo: string | null;
  court: string;
  start_at: string;
  end_at: string;
  type: string;
  district: string;
  privacy: string;
  member_count: number;
}

const fetcher = (url: string) => fetch(url, { credentials: "include" }).then((res) => res.json());

export default function TeamManagementPage() {
  const router = useRouter();
  const { data, mutate, error } = useSWR("/api/team_management", fetcher);
  const teams = data?.teams || [];
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSearch = () => {
    if (!data) return;
    return teams.filter((team: Team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; 
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatTeamType = (type: string) => {
    return type === "THREE_X_THREE" ? "3X3" : "5X5";
  };

  if (error) return <p className="text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>;

  return (
    <div className="relative p-6 min-h-screen bg-gray-50">

      <h1 className="text-2xl font-bold text-center mb-6">ทีมของคุณ</h1>

      <div className="flex justify-between items-center bg-black py-2 px-4 rounded-lg shadow-md mb-6 w-2/3 mx-auto">
        <button
          onClick={() => router.push("/team_management/create")}
          className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
        >
          สร้างทีม
        </button>

        <div className="relative w-3/4">
          <input
            type="text"
            placeholder="ค้นหาชื่อทีม ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-2 py-1 w-full border border-gray-300 rounded-md focus:ring focus:ring-orange-300"
          />
        </div>
      </div>

      <div className="flex justify-center items-center">
        {!data ? (
          <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
        ) : teams.length === 0 ? (
          <p className="text-gray-500 text-lg font-bold">คุณไม่มีทีม</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 w-2/3">
            {handleSearch()?.map((team: Team) => (
              <div
                key={team.id}
                className="flex items-center p-4 border rounded-lg shadow-md bg-white cursor-pointer hover:bg-gray-100 transition"
                onClick={() => router.push(`/team_management/${encodeURIComponent(team.name.replace(/ /g, "-"))}`)}
              >
                <img
                  src={team.team_logo || "/default-team.png"}
                  alt={team.name}
                  className="w-16 h-16 rounded-full mr-4"
                />
                <div className="flex-1">
                  <h2 className="font-bold text-lg">{team.name}</h2>
                  <p className="text-sm text-gray-500">สนาม: {team.court}</p>
                  <p className="text-sm text-gray-500">
                    วันที่: {formatDate(team.start_at)} - {formatDate(team.end_at)}
                  </p>
                  <p className="text-sm text-gray-500">
                    เวลา: {formatTime(team.start_at)} - {formatTime(team.end_at)}
                  </p>
                  <p className="text-sm font-bold mt-1 flex items-center">
                    {team.privacy === "PUBLIC" ? "🌍 สาธารณะ" : "🔒 ส่วนตัว"} 
                    <span className="ml-2 bg-gray-200 text-black px-2 py-1 rounded-md text-l font-bold">
                      {formatTeamType(team.type)}
                    </span>
                  </p>
                </div>
                <span className="text-sm font-bold text-gray-600">
                  {team.member_count} สมาชิก
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
