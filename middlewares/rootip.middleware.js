const Response = require("../responses/response");

module.exports = async function (req, res, next) {
  var remA = (req.headers["x-forwarded-for"] || req.socket.remoteAddress)
    .replaceAll("::1", "")
    .replaceAll("::ffff:", "");
  if (remA === "") remA = "127.0.0.1";

  if (remA !== process.env.ROOT_IP)
    return res.status(404).send("Access denied");
  return next();
};
