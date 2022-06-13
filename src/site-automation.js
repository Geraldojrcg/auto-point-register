const puppeteer = require("puppeteer");
const telegranBot = require("./telegram-bot");

const TIMEOUT = 1000 * 60;

async function handleLogin(page) {
  await page.waitForSelector("title");
  await page.type("[name=login]", process.env.SITE_LOGIN_EMAIL);
  await page.type("[name=password]", process.env.SITE_LOGIN_PASSWORD);
  const [button] = await page.$x("//button[contains(., 'Entrar')]");
  if (button) {
    await Promise.all([button.click(), page.waitForTimeout(TIMEOUT)]);
    return true;
  }
}

async function handleClickButton(page, xpath) {
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
        await page.waitForTimeout(TIMEOUT);
        const lastLocation =
          "//a[contains(., 'Utilizar localização do meu último registro')]";
        await page.waitForXPath(lastLocation, {
          visible: true,
        });
        const lastLocationClick = await handleClickButton(page, lastLocation);
        if (lastLocationClick) {
          const registerxpath =
            "//pm-button[@class='pm-btn-icon btn-register']/button[@class='pm-button pm-primary']";
          await page.waitForXPath(registerxpath, {
            visible: true,
          });
          const pointRegistered = await handleClickButton(page, registerxpath);
          if (pointRegistered) {
            await telegranBot.sendSuccessMessage();
          } else {
            await telegranBot.sendErrorMessage("Point register error");
          }
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
