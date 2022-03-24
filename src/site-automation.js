const puppeteer = require("puppeteer");
const telegranBot = require("./telegram-bot");

const TIMEOUT = 1000 * 60 * 2;

async function handleLogin(page) {
  await page.type("[name=login]", process.env.SITE_LOGIN_EMAIL);
  await page.type("[name=password]", process.env.SITE_LOGIN_PASSWORD);
  const [button] = await page.$x("//button[contains(., 'Entrar')]");
  if (button) {
    await Promise.all([button.click(), page.waitForTimeout(TIMEOUT)]);
    return true;
  }
}

async function handleRegisterPoint(page, xpath) {
  const [button] = await page.$x(xpath);
  if (button) {
    await Promise.all([button.click(), page.waitForTimeout(TIMEOUT)]);
    return true;
  }
}

module.exports = {
  registerPoint: async () => {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox"],
      });
      const page = await browser.newPage();
      await page.goto(process.env.SITE_LOGIN_URL);
      const context = browser.defaultBrowserContext();
      await context.overridePermissions(process.env.SITE_HOME_URL, [
        "geolocation",
      ]);
      const hasLogged = await handleLogin(page);
      if (hasLogged) {
        const xpath = "//button[contains(., 'Registrar ponto')]";
        await page.waitForXPath(xpath, {
          visible: true,
        });
        const pointRegistered = await handleRegisterPoint(page, xpath);
        if (pointRegistered) {
          await telegranBot.sendSuccessMessage();
        } else {
          await telegranBot.sendErrorMessage("Point register error");
        }
      } else {
        await telegranBot.sendErrorMessage("Login error");
      }
      await browser.close();
    } catch (error) {
      await telegranBot.sendErrorMessage(error);
    }
  },
};
