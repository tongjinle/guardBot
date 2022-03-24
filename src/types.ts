import { Context, Telegraf } from "telegraf";

export enum EAbility {
  guard = "guard",
  question = "question",
}

export type IBotContext = Context & {};

export type IAbilityFunc = (bot: Telegraf<IBotContext>) => void;
