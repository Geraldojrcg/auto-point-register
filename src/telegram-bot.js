const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

async function sendMessage(message) {
  return await bot.telegram.sendMessage(process.env.TELEGRAN_CHAT_ID, message);
}

function getDate() {
  return new Date().toLocaleString("pt-BR", { timeZone: "America/Recife" });
}

module.exports = {
  sendSuccessMessage: async () => {
    return await sendMessage(`Point registered at: ${getDate()}`);
  },
  sendErrorMessage: async (error) => {
    return await sendMessage(
      `Failed to register the point at: ${getDate()} \n Error: ${error}`
    );
  },
};
