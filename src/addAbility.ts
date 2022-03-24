import { Telegraf } from "telegraf";
import guard from "./ability/guard";
import question from "./ability/question";
import IBotContext from "./IBotContext";
import { EAbility } from "./types";

const dict = {
  [EAbility.guard]: guard,
  [EAbility.question]: question,
};

const addAblity: (bot: Telegraf<IBotContext>, name: EAbility) => Promise<void> =
  async (bot, name) => {
    dict[name](bot);
  };

export default addAblity;
