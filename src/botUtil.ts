import { Telegraf } from "telegraf";
import IBotContext from "./IBotContext";

/** 刷新机器人session */
const refresh: (bot: Telegraf<IBotContext>) => Promise<void> = async (bot) => {
};

export default refresh;
