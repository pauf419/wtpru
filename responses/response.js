const Responses = require("../utils/res.models");

module.exports = class Response {
  status;
  msg;
  description;
  json;
  force;

  constructor(model = {}) {
    if (model.force) {
      this.status = model.status;
      this.json = model.json;
      this.force = true;
      return;
    }
    this.status = model.status ? model.status : 200;
    this.msg = model.msg ? model.msg : null;
    this.description = model.description ? model.description : null;
    this.json = model.json ? model.json : null;
  }

  static DEFAULT(json) {
    return new Response({ force: true, json, status: 200 });
  }

  static NotFound(msg = Responses.NotFound.msg) {
    return new Response({ ...Responses.NotFound, json: null, msg });
  }

  static OK(json = null, msg = Responses.OK.msg) {
    return new Response({ ...Responses.OK, json, msg });
  }

  static Created(json = null, msg = Responses.Created.msg) {
    return new Response({ ...Responses.Created, json, msg });
  }

  static BadRequest(msg = Responses.BadRequest.msg) {
    return new Response({ ...Responses.BadRequest, msg });
  }

  static BadRequestPayload(json = null, msg = Responses.BadRequest.msg) {
    return new Response({ ...Responses.BadRequest, json });
  }

  static InternalServerError(msg = Responses.InternalServerError.msg) {
    return new Response({ ...Responses.InternalServerError, msg });
  }

  static Unauthorized(msg) {
    return new Response({ ...Responses.Unauthorized, msg });
  }
};
