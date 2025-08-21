import cron from "node-cron";
import { deleteExpiredTeams } from "../../prisma/scripts/deleteExpiredTeams";

console.log("[CRON] Scheduled job to delete expired teams every 15 minutes.");

// รันทุกๆ 15 นาที
cron.schedule("*/15 * * * *", async () => {
  console.log("[CRON] Running deleteExpiredTeams job...");
  try {
    await deleteExpiredTeams();
    console.log("[CRON] Job finished successfully.");
  } catch (error) {
    console.error("[CRON] Error:", error);
  }
});
