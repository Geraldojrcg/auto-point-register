const { default: axios } = require("axios");

module.exports = {
  getHolidays: async (year) => {
    const { data } = await axios.get(`${process.env.HOLIDAY_API}/${year}`);
    return (data || []).map((d) => d.date + " 00:00:00");
  },
};
