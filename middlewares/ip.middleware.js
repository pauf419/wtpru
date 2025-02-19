const Response = require("../responses/response");
const DB = require("../utils/db_query");

module.exports = async function (req, res, next) {
  var remA = (req.headers["x-forwarded-for"] || req.socket.remoteAddress)
    .replaceAll("::1", "")
    .replaceAll("::ffff:", "");
  if (remA === "") remA = "127.0.0.1";
  if (remA === process.env.ROOT_IP) return next();
  const ip = await DB.query("SELECT * FROM whitelistIp WHERE ip = ?", [
    remA,
  ]).then((data) => data[0]);
  if (!ip) return res.status(404).send("Access denied");
  return next();
};
