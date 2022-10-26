const axios = require("axios");
const { Telegraf } = require("telegraf");
require("dotenv").config();

const telegraf = new Telegraf(process.env.TELEGRAM_TOKEN);

telegraf.command("start", (ctx) => {
  console.log(ctx.chat.id);
  telegraf.telegram.sendMessage(ctx.chat.id, "BIENVENIDO AL BOT");
});

module.exports = telegraf;
