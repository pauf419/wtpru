const Response = require("../responses/response");

module.exports = function (data, _, res, _) {
  if (data instanceof Response) {
    if (data.force) {
      res.set("Content-Type", "text/plain; charset=utf-8");
      return res.status(data.status).send(data.data);
    }
    return res.status(data.status ? data.status : 200).json(data);
  }
  if (data instanceof Error)
    return res.status(500).json(Response.InternalServerError());
  return res.json(data);
};
