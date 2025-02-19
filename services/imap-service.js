const Imap = require("imap");
const { simpleParser } = require("mailparser");

const email = "akaja264@gmail.com";
const password = "wtpru2024";

const imap = new Imap({
  user: email,
  password: password,
  host: "imap.gmail.com",
  port: 993,
  tls: true,
});

function openInbox() {
  return new Promise((resolve, reject) => {
    imap.openBox("INBOX", false, (err, box) => {
      if (err) reject(err);
      else resolve(box);
    });
  });
}

/**
 * @returns {Promise<string>}
 */
function waitForTelegramCode() {
  return new Promise((resolve, reject) => {
    imap.on("mail", async () => {
      try {
        const searchCriteria = [["FROM", "noreply@telegram.org"], ["UNSEEN"]];
        const fetchOptions = {
          bodies: "",
          markSeen: true,
        };

        imap.search(searchCriteria, (err, results) => {
          if (err) return reject(err);

          if (results.length > 0) {
            const fetch = imap.fetch(results, fetchOptions);

            fetch.on("message", (msg) => {
              msg.on("body", async (stream) => {
                const parsed = await simpleParser(stream);

                const codeMatch = parsed.text.match(/\b\d{6}\b/);
                if (codeMatch) {
                  resolve(codeMatch[0]);
                } else {
                  reject(new Error("Verification code not found in email"));
                }
              });
            });

            fetch.once("end", () => {
              console.log("Сообщение обработано");
            });
          } else {
            reject(new Error("No new messages from Telegram found"));
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  });
}

/**
 * @returns {Promise<string>}
 */
async function getTelegramVerificationCode() {
  return new Promise((resolve, reject) => {
    imap.once("ready", async () => {
      try {
        await openInbox();
        console.log("Ожидаем код от Telegram...");
        const code = await waitForTelegramCode();
        resolve(code);
      } catch (err) {
        reject(err);
      }
    });

    imap.once("error", (err) => {
      reject(err);
    });

    imap.once("end", () => {
      console.log("Соединение закрыто");
    });

    imap.connect();
  });
}

module.exports = getTelegramVerificationCode;
