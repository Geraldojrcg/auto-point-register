const { default: axios } = require("axios");

module.exports = {
  getHolidays: async (year) => {
    try {
      const { data } = await axios.get(`${process.env.HOLIDAY_API}/${year}`);
      return (data || []).map((d) => d.date + " 00:00:00");
    } catch (error) {
      return [];
    }
  },
};
