const logic = require("../utils/logic");
const Response = require("../responses/response");
const visitorService = require("../services/visitor-service");

class VisitorController {
  async get(req, _, next) {
    try {
      const { linkId, visitorId } = req.query;
      if (logic.regexobject({ linkId }))
        throw Response.BadRequest("Expected data not validated");
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
