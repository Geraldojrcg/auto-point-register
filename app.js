require("dotenv").config();
const express = require("express");

const cron = require("./src/cron");

async function setup() {
  const app = express();
  await cron.createSchedule();
  app.listen(process.env.PORT || 3000);
}
setup();
