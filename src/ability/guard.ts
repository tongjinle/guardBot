import { Telegraf, Telegram } from "telegraf";
import { User } from "typegram";
import config from "../config";
import { DAY } from "../constant";
import { IAbilityFunc } from "../types";
import note from "./util/note";

/** 要被踢出去的关键字 */

const getname = (user: User) => [user.first_name, user.last_name].join(" ");

const dict: { [id: number]: number } = {};

const punish = async (data: {
  userId: number;
  bot: Telegram;
  chatId: number;
}) => {
  const { userId, chatId, bot } = data;
  dict[userId] = dict[userId] ? dict[userId] + 1 : 1;
  console.log(`punish:${userId} ${dict[userId]}`);
  if (dict[userId] === 2) {
    try {
      await bot.restrictChatMember(chatId, userId, {
        permissions: { can_send_messages: false },
        until_date: (Date.now() + 1 * DAY) / 1000,
      });
    } catch (e) {
      console.log(e);
    }
  }
};

/**提升用户权限
 * 如果在跟bot的私聊中,如果说出pass,那么该用户会被认为是有着特殊权限的用户
 */
const guard: IAbilityFunc = (bot) => {
  // 文字守卫
  bot.on("text", async (ctx, next) => {
    let text: string = ctx.message.text;
    let type = ctx.chat.type;

    if (!(type === "group" || type === "supergroup")) return next();

    // 如果是白名单的机器人,不要误踢
    // console.log(ctx.from.username, config.WHITE_LIST);
    const finfo = await note.read();
    if (
      ctx.from.username &&
      finfo.whilteList.find((n) => n === ctx.from.username)
    )
      return next();

    // 敏感词触碰
    if (finfo.wordList.find((n) => text.indexOf(n) >= 0)) {
      await ctx.reply(`敏感词触碰,${getname(ctx.from)}的发言已经被删除`);
      await ctx.deleteMessage();
      await punish({
        userId: ctx.from.id,
        chatId: ctx.chat.id,
        bot: ctx.telegram,
      });
      return;
    }
  });

  // 禁止发送图片
  // 禁止发送视频
  // 禁止发送动画
  bot.on(["photo", "video", "animation"], async (ctx, next) => {
    // 如果是白名单的机器人,不要误踢
    const finfo = await note.read();
    if (
      ctx.from.username &&
      finfo.whilteList.find((n) => n === ctx.from.username)
    )
      return next();

    await ctx.reply(
      `禁止发送图片,视频,动画,${getname(ctx.from)}的发言已经被删除`
    );
    await ctx.deleteMessage();
    await punish({
      userId: ctx.from.id,
      chatId: ctx.chat.id,
      bot: ctx.telegram,
    });
    return;
  });

  // 防止有人加机器人进来
  bot.on("new_chat_members", async (ctx, next) => {
    console.log("new_chat_members");

    // 如果是白名单的机器人,不要误踢
    const finfo = await note.read();
    const members = ctx.message.new_chat_members.filter(
      (n) => !finfo.whilteList.find((m) => m === n.username)
    );

    const kick = async (user: User) => {
      const isBot: boolean = user.is_bot;
      console.log({ isBot });
      if (isBot) {
        ctx.kickChatMember(user.id);
        ctx.reply(`机器人${getname(user)}已经被踢出了`);
        return;
      } else {
        ctx.reply(`欢迎${getname(user)}!!`);
      }
    };
    const name1 = getname(ctx.from);
    const name2s: string[] = members.map((n) => getname(n));
    console.log({ name1, name2s });

    for await (const user of members) {
      await kick(user);
    }

    return next();
  });

  // 成为超级管理员
  bot.on("text", async (ctx, next) => {
    const userId = ctx.from.id;
    let text: string = ctx.message.text;
    let type = ctx.chat.type;

    if (!(type === "private")) return next();

    if (text === config.PASS) {
      ctx.reply("你已经成为超级管理员");
      const finfo = await note.read();
      finfo.adminId = userId;
      await note.write(finfo);
      return;
    }
    return next();
  });

  // 文字命令
  bot.on("text", async (ctx, next) => {
    const userId = ctx.from.id;
    let text: string = ctx.message.text;
    let type = ctx.chat.type;

    if (!(type === "private")) return next();

    const finfo = await note.read();
    // 只有admin才可以操作
    if (finfo.adminId !== userId) return next();

    /**
     * 0. 列出所有敏感词
     * eg: 所有敏感词
     *
     * 1. 增加敏感词(支持多个,中间用空格隔开)
     * eg: +敏感词 发财 注册
     * 解释: 把"发财","注册"加入敏感词
     *
     * 2. 删除敏感词(支持多个,中间用空格隔开)
     * eg: -敏感词 发财 注册
     * 解释: 删除"发财","注册"敏感词
     */

    /**
     * 0. 列出所有白名单
     * eg: 所有白名单
     *
     * 1. 增加白名单(支持多个,中间用空格隔开)
     * eg: +白名单 pumandashi tea
     * 解释: 把"pumandashi","tea"加入白名单
     *
     * 2. 删除白名单(支持多个,中间用空格隔开)
     * eg: -白名单 pumandashi tea
     * 解释: 删除"pumandashi","tea"白名单
     */

    const display = async (type: "whiteList" | "wordList") => {
      const finfo = await note.read();
      let list: string[] = [];
      let prefix: string;
      if (type === "whiteList") {
        prefix = "白名单";
        list = finfo.whilteList;
      } else {
        prefix = "敏感词";
        list = finfo.wordList;
      }

      if (list.length === 0) {
        ctx.reply(`当前${prefix}为空`);
      } else {
        ctx.reply([`当前${prefix}为:`, ...list].join("\r\n"));
      }
    };

    if (text === "所有敏感词") {
      display("wordList");
    } else if (text.startsWith("+敏感词")) {
      const words: string[] = text
        .replace("+敏感词", "")
        .split(/\s+/g)
        .filter((n) => n.trim() !== "");
      finfo.wordList = [...new Set([...finfo.wordList, ...words])];
      await note.write(finfo);
      display("wordList");
    } else if (text.startsWith("-敏感词 ")) {
      const words: string[] = text.replace("-敏感词", "").split(/\s+/g);
      finfo.wordList = finfo.wordList.filter(
        (n) => !words.find((m) => m === n)
      );
      await note.write(finfo);
      display("wordList");
    }
    // 白名单
    else if (text === "所有白名单") {
      display("whiteList");
    } else if (text.startsWith("+白名单")) {
      const whilteList: string[] = text
        .replace("+白名单", "")
        .split(/\s+/g)
        .filter((n) => n.trim() !== "");
      finfo.whilteList = [...new Set([...finfo.whilteList, ...whilteList])];
      await note.write(finfo);
      display("whiteList");
    } else if (text.startsWith("-白名单 ")) {
      const whilteList: string[] = text.replace("-白名单", "").split(/\s+/g);
      finfo.whilteList = finfo.whilteList.filter(
        (n) => !whilteList.find((m) => m === n)
      );
      await note.write(finfo);
      display("whiteList");
    }
    return next();
  });
};

export default guard;
