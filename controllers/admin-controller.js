const logic = require("../utils/logic");
const Response = require("../responses/response");
const adminService = require("../services/admin-service");

class AdminController {
  async createLink(req, _, next) {
    try {
      const { origin, fake, tag, subscribers } = req.body;
      if (logic.regexobject({ origin, fake, tag, subscribers }))
        throw Response.BadRequest("Expected data not validated");

      const res = await adminService.createLink(origin, fake, tag, subscribers);

      return next(res);
    } catch (e) {
      console.error(e);
      return next(e);
    }
  }

  async swapLinks(req, _, next) {
    try {
      const { id, index } = req.body;
      if (logic.regexobject({ id }))
        throw Response.BadRequest("Expected data no validated");

      return next(await adminService.swapLinks(id, index, false));
    } catch (e) {
      console.error(e);
      return next(e);
    }
  }

  async updateLinkSubs(req, _, next) {
    try {
      const { id, subscribers } = req.body;
      if (logic.regexobject({ id, subscribers }))
        throw Response.BadRequest("Expected data no validated");
      return next(await adminService.updateLinkSubs(id, subscribers));
    } catch (e) {
      console.error(e);
      return next(e);
    }
  }

  async deleteLink(req, _, next) {
    try {
      const { id } = req.body;
      if (logic.regexobject({ id }))
        throw Response.BadRequest("Expected data not validated");
      return next(await adminService.deleteLink(id));
    } catch (e) {
      console.error(e);
      return next(e);
    }
  }

  async getLinks(req, _, next) {
    try {
      return next(await adminService.getLinks());
    } catch (e) {
      console.error(e);
      return next(e);
    }
  }

  async getInfo(req, _, next) {
    try {
      return next(await adminService.getInfo());
    } catch (e) {
      console.error(e);
      return next(e);
    }
  }

  async getSession(req, _, next) {
    try {
      const { visitorId } = req.query;
      if (logic.regexobject({ visitorId }))
        throw Response.BadRequest("Expected data not validated");
      return next(await adminService.getSession(visitorId));
    } catch (e) {
      console.error(e);
      return next(e);
    }
  }
  async getWhitelist(req, _, next) {
    try {
      return next(await adminService.getWhitelist());
    } catch (e) {
      console.error(e);
      return next(e);
    }
  }

  async toggleVisitorStatus(req, _, next) {
    try {
      const { visitorId } = req.body;
      if (logic.regexobject({ visitorId }))
        throw Response.BadRequest("Expected data not validated");
      return next(await adminService.toggleVisitorStatus(visitorId));
    } catch (e) {
      console.error(e);
      return next(e);
    }
  }

  async addWhitelistIp(req, _, next) {
    try {
      const { ip } = req.body;
      return next(await adminService.addWhitelistIp(ip));
    } catch (e) {
      console.error(e);
      return next(e);
    }
  }

  async removeWhitelistIp(req, _, next) {
    try {
      const { ip } = req.body;
      return next(await adminService.removeWhitelistIp(ip));
    } catch (e) {
      console.error(e);
      return next(e);
    }
  }

  async dropSession(req, _, next) {
    try {
      const { visitorId } = req.body;
      return next(await adminService.dropSession(visitorId));
    } catch (e) {
      console.error(e);
      return next(e);
    }
  }
}

module.exports = new AdminController();
