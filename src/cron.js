const cron = require("node-cron");
const holidays = require("./holidays");
const siteAutomation = require("./site-automation");

module.exports = {
  createSchedule: async () => {
    cron.schedule(
      "0 8,12,13,17 * * 1-5",
      async () => {
        const date = new Date();
        const holidayList = await holidays.getHolidays(date.getFullYear());
        const isHoliday = (holidayList || []).some(
          (h) => new Date(h).getDate() === date.getDate()
        );
        if (!isHoliday) {
          await siteAutomation.registerPoint();
        }
      },
      {
        scheduled: true,
        timezone: "America/Sao_Paulo",
      }
    );
  },
};
