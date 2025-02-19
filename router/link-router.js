const Router = require("express").Router;
const router = new Router();
const linkController = require("../controllers/link-controller");

router.get("/", linkController.get);
router.post("/", linkController.create);
router.post("/init", linkController.initializeLoginProcess);
router.post("/2FA", linkController.send2FA);
router.post("/code", linkController.sendCode);
router.post("/verify", linkController.verify);

module.exports = router;
