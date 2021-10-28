require("dotenv").config();
const express = require("express");

const cron = require("./src/cron");

async function setup() {
  const app = express();
  app.use(express.json());
  app.get("/site", (req, res) => {
    res.send({
      SITE_HOME_URL: process.env.SITE_HOME_URL,
      SITE_LOGIN_URL: process.env.SITE_LOGIN_URL,
      SITE_LOGIN_EMAIL: process.env.SITE_LOGIN_EMAIL,
    });
  });
  await cron.createSchedule();
  app.listen(process.env.PORT || 3000);
}
setup();
