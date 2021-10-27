const puppeteer = require("puppeteer");
const telegranBot = require("./telegram-bot");

async function handleLogin(page) {
  await page.type("[name=login]", process.env.SITE_LOGIN_EMAIL);
  await page.type("[name=password]", process.env.SITE_LOGIN_PASSWORD);
  const [button] = await page.$x("//button[contains(., 'Entrar')]");
  if (button) {
    await Promise.all([
      button.click(),
      page.waitForNavigation({ waitUntil: "networkidle0" }),
      page.waitForNavigation({ waitUntil: "load" }),
    ]);
    return true;
  }
}

async function registerPoint(page, xpath) {
  const [button] = await page.$x(xpath);
  if (button) {
    await Promise.all([button.click(), page.waitForTimeout(2000)]);
    return true;
  }
}

module.exports = {
  registerPoint: async () => {
    try {
      console.log("Starting point register");
      const browser = await puppeteer.launch({
        headless: false,
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
        const pointRegistered = await registerPoint(page, xpath);
        if (pointRegistered) {
          await telegranBot.sendSuccessMessage();
        }
      }
      await browser.close();
      console.log("End point register");
    } catch (error) {
      console.error(error);
      await telegranBot.sendErrorMessage();
    }
  },
};
