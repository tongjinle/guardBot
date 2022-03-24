import { Telegraf } from "telegraf";
import addAblity from "./addAbility";
import config from "./config";
import IBotContext from "./IBotContext";
import { EAbility } from "./types";

const { BOT_TOKEN } = config;

let bot: Telegraf<IBotContext>;
async function runBot() {
  console.log("token:", BOT_TOKEN);
  bot = new Telegraf<IBotContext>(BOT_TOKEN);

  addAblity(bot, EAbility.guard);
  // addAblity(bot, EAbility.question);

  await bot.launch();

  console.log("bot launch");
}

runBot();
