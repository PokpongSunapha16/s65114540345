"use client";

import { useRouter } from "next/navigation";

export default function GetHoopPage() {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path); // Navigate to the specified path
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center relative">

      <div className="bg-gray-50 shadow-md rounded-lg w-96 p-8 text-center">
        <h1 className="text-3xl font-bold text-black mb-8">GET HOOP</h1>

        <div className="space-y-4">
        <button
            onClick={() => handleNavigate("/quickmatch")}
            className="w-full py-3 text-red-500 font-semibold border border-red-500 rounded-lg hover:bg-red-500 hover:text-white transition duration-300"
          >
            QUICK MATCH
          </button>

          <button
            onClick={() => handleNavigate("/findteam")}
            className="w-full py-3 text-black font-semibold border border-gray-300 rounded-lg hover:bg-gray-200 transition duration-300"
          >
            ค้นหาทีม
          </button>
          <button
            onClick={() => handleNavigate("/findplayer")}
            className="w-full py-3 text-black font-semibold border border-gray-300 rounded-lg hover:bg-gray-200 transition duration-300"
          >
            ค้นหาผู้เล่น
          </button>
          <button
            onClick={() => handleNavigate("/team_management")}
            className="w-full py-3 text-orange-500 font-semibold border border-orange-500 rounded-lg hover:bg-orange-500 hover:text-white transition duration-300"
          >
            ทีมของคุณ
          </button>
        </div>
      </div>
    </div>
  );
}
