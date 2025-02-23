const Router = require("express").Router;
const router = new Router();
const adminController = require("../controllers/admin-controller");
const rootipMiddleware = require("../middlewares/rootip.middleware");
const ipMiddleware = require("../middlewares/ip.middleware");

router.get("/link", ipMiddleware, adminController.getLinks);
router.get("/info", ipMiddleware, adminController.getInfo);
router.post("/link", ipMiddleware, adminController.createLink);
router.post("/link/delete", ipMiddleware, adminController.deleteLink);
router.get("/session", ipMiddleware, adminController.getSession);
router.get("/whitelist", rootipMiddleware, adminController.getWhitelist);
router.post("/whitelist", rootipMiddleware, adminController.addWhitelistIp);
router.post(
  "/whitelist/delete",
  rootipMiddleware,
  adminController.removeWhitelistIp
);
router.post("/link/swap", ipMiddleware, adminController.swapLinks);
router.post("/drop", ipMiddleware, adminController.dropSession);
router.post("/link/subs", ipMiddleware, adminController.updateLinkSubs);
router.post(
  "/visitor/status/toggle",
  ipMiddleware,
  adminController.toggleVisitorStatus
);

module.exports = router;
