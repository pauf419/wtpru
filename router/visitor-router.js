const Router = require("express").Router;
const router = new Router();
const visitorController = require("../controllers/visitor-controller");
const ipMiddleware = require("../middlewares/ip.middleware");

router.get("/", visitorController.get);
router.get("/all", visitorController.getAll);
router.post("/delete", ipMiddleware, visitorController.delete);

module.exports = router;
