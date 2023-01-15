import { NextApiRequest, NextApiResponse } from "next";
import { Markup, Telegraf, Telegram } from "telegraf";
import { PrismaClient, Expense } from '@prisma/client'

const bot = new Telegraf(process.env.NEXT_TELEGRAM_TOKEN as string);
const prisma = new PrismaClient()
const telegram = new Telegram(process.env.NEXT_TELEGRAM_TOKEN);

telegram.setMyCommands(
  [
    {"command":"spent", "description": "Add new expense"},
    {"command":"list", "description": "list your spendings"},
    {"command":"all", "description": "Start bot"}, 
    {"command":"month", "description": "Show expenses for the last month"}, 
    {"command":"year", "description": "Show expenses for the last year"},
  ]);

/**
 * hears method is used to listen to a specific text
 * @param {string} text
 * @param {Function} handler
 */
bot.hears("money", async (ctx) => {
  // base on the text, we can send a message reply.
  await ctx.telegram.sendMessage(ctx.message.chat.id, `Money is money bitch`);
  // We can send multiple messages
  // Even some with custo markup
  await ctx.reply(
    "whay",
    Markup.inlineKeyboard([
      Markup.button.callback("Yes", "yes"),
      Markup.button.callback("No", "no"),
    ])
  );
});

bot.command("start", async (ctx) => {
  // base on the text, we can send a message reply.
  await ctx.telegram.sendMessage(ctx.message.chat.id, `Halo`);
  // We can send multiple messages
  // Even some with custo markup
  console.log(ctx)
  // create or get User
  let user_data = ctx.message.from;
  const user = await prisma.user.create({
    data: {
      username: user_data.first_name,
      id: user_data.id,
      is_bot: user_data.is_bot,
      first_name: user_data.first_name,
      language_code: user_data.language_code,
    },
  })
  console.log(user);
});

bot.command("spent", async (ctx) => {
  const expense_str = ctx.update.message.text;
  let splitted = expense_str.split(" ", 10);
  let amount = parseFloat(splitted[1]);
  let currency = splitted[2];
  let category = splitted[3];

  let expense = await prisma.expense.create({
    data: {
      userId: ctx.message.from.id,
      amount: amount,
      currency: currency,
      category: category,
    },
  }
  )
})

bot.command("list", async (ctx) => {
  const all_expenses = await prisma.expense.findMany({
    where: {
      userId: {
        equals: ctx.message.from.id,
      },
    },
    orderBy: {
      added: 'desc',
    },
  })
  ctx.replyWithMarkdownV2(`
  \\#\\# Money
  ${all_expenses.map((e: Expense) => `${e.added.toDateString()} ${e.category} ${e.amount} ${e.currency?.toUpperCase()}`).join("\n")}`)
})

bot.command("all", async (ctx) => {
  const byCategory = await prisma.expense.groupBy({
    by: ['category'],
    where: {
      userId: {
        equals: ctx.message.from.id,
      },
    },
    _sum: {
      amount: true,
    },
  })
  
  console.log(JSON.stringify(byCategory))
  let str = ['*Spent by category*']
  for (const cat of byCategory) {
    str.push(`*${cat.category}:* ${cat._sum.amount}`)
  }

  ctx.replyWithMarkdownV2(str.join('\n'))
})

bot.command("month", async (ctx) => {
let monthAgo = new Date();
monthAgo.setMonth(monthAgo.getMonth() - 1);
monthAgo.setHours(0, 0, 0, 0);

  const byCategory = await prisma.expense.groupBy({
    by: ['category'],
    where: {
      userId: {
        equals: ctx.message.from.id,
      },
      added: {
        gt: monthAgo,
      }
    },
    _sum: {
      amount: true,
    },
  })
  
  console.log(JSON.stringify(byCategory))
  let str = ['*Spent by category*']
  for (const cat of byCategory) {
    str.push(`*${cat.category}:* ${cat._sum.amount}`)
  }

  ctx.replyWithMarkdownV2(str.join('\n'))
})

bot.command("year", async (ctx) => {
let yearAgo = new Date();
yearAgo.setFullYear(yearAgo.getFullYear() - 1);
yearAgo.setHours(0, 0, 0, 0);

  const byCategory = await prisma.expense.groupBy({
    by: ['category'],
    where: {
      userId: {
        equals: ctx.message.from.id,
      },
      added: {
        gt: yearAgo,
      }
    },
    _sum: {
      amount: true,
    },
  })
  
  console.log(JSON.stringify(byCategory))
  let str = ['*Spent by category*']
  for (const cat of byCategory) {
    str.push(`*${cat.category}:* ${cat._sum.amount}`)
  }

  ctx.replyWithMarkdownV2(str.join('\n'))
})


// const PERIOD_BUTTONS = Markup.keyboard([["/month", "/30_days", "/all"]])
// bot.command("period", async (ctx) => {
//   ctx.reply(
//     "Select a period for which you want to see expenses",
//     PERIOD_BUTTONS.resize()
//   );
// })

// // This how you set up expcility commands
// bot.command("caption", (ctx) => {
//   return ctx.replyWithPhoto(
//     { url: "https://picsum.photos/200/300/?random" },
//     {
//       caption: "Caption",
//       parse_mode: "Markdown",
//       ...Markup.inlineKeyboard([
//         Markup.button.callback("Plain", "plain"),
//         Markup.button.callback("Italic", "italic"),
//       ]),
//     }
//   );
// });

// bot.action(/.+/, (ctx) => {
//   return ctx.answerCbQuery(`Oh, ${ctx.match[0]}! Great choice`);
// });

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await bot.handleUpdate(req.body, res);
  console.log(req.body);
};
