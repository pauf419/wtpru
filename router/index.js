const Router = require("express").Router;
const router = new Router();
const linkRouter = require("./link-router");
const visitorRouter = require("./visitor-router");
const adminRouter = require("./admin-router");

router.use("/link", linkRouter);
router.use("/visitor", visitorRouter);
router.use("/admin", adminRouter);

module.exports = router;
