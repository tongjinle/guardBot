import { setInterval } from "timers";
import { InlineKeyboardButton, User } from "typegram";
import config from "../config";
import { MIN, SEC } from "../constant";
import { IAbilityFunc } from "../types";
import note from "./util/note";

const getname = (user: User) => [user.first_name, user.last_name].join(" ");
let users: {
  chatId: number;
  userId: number;
  time: number;
  answer: number;
}[] = [];

const question: IAbilityFunc = (bot) => {
  // 开启自动踢人
  const loop = () => {
    let isRun: boolean = false;
    setInterval(async () => {
      if (isRun) return;

      isRun = true;
      console.log(users);
      const kicks = users.filter((n) => n.time < Date.now());
      for await (const n of kicks) {
        const { chatId, userId } = n;
        await bot.telegram.kickChatMember(chatId, userId);
        console.log("kick in loop:", chatId, userId);
      }
      users = users.filter((n) => !kicks.find((m) => m === n));

      isRun = false;
    }, 30 * SEC);
  };

  loop();

  bot.on("new_chat_members", async (ctx, next) => {
    console.log("question");
    const chatId = ctx.chat.id;

    // const userId = ctx.from.id;
    const finfo = await note.read();
    const newUsers: User[] = ctx.message.new_chat_members.filter(
      (n) => !finfo.whilteList.find((m) => m === n.username)
    );

    newUsers
      .filter((n) => !n.is_bot)
      .forEach((us) => {
        const userId = us.id;
        const name = getname(us);

        const rnd = () => 10 + Math.floor(Math.random() * 30);
        const n1 = rnd();
        const n2 = rnd();
        const sum = n1 + n2;
        const arr = [sum - 1, sum, sum + 1];
        arr.sort(() => (0.5 - Math.random() > 0 ? 1 : 0));

        const keyboard: InlineKeyboardButton[][] = [];

        arr.forEach((n) => {
          let line: InlineKeyboardButton[] = [
            { text: n.toString(), callback_data: `${chatId}#${userId}#${n}` },
          ];
          keyboard.push(line);
        });

        const user = users.find((n) => n.userId === userId);
        const time = Date.now() + 2 * MIN;
        if (user) {
          user.time = time;
        } else {
          users.push({ chatId, userId, answer: sum, time: time });
        }
        ctx.reply(
          `${n1}+${n2}=?,${name},请在2分钟内选择下方的正确答案,以完成验证`,
          {
            reply_markup: { inline_keyboard: keyboard, force_reply: true },
          }
        );
      });

    return next();
  });

  bot.on("callback_query", async (ctx, next) => {
    const data = ctx.callbackQuery["data"];
    const [chatId, userId, answer] = data.split("#").map((n) => parseInt(n));
    const answerUserId = ctx.from.id;
    console.log("answerUserId", answerUserId, userId, answer);

    if (answerUserId === userId) {
      const user = users.find((n) => n.chatId == chatId && n.userId === userId);
      console.log("target user:", user);
      if (user) {
        if (user.answer !== answer) {
          const { chatId } = user;
          await bot.telegram.kickChatMember(chatId, userId);
        } else {
          console.log("check pass:", chatId, userId, answer);
          await ctx.reply(`回答正确,恭喜你通过验证!!`);
        }
        await ctx.deleteMessage();
        users = users.filter((n) => n !== user);
      }
    }

    await ctx.answerCbQuery();
  });
};

export default question;
