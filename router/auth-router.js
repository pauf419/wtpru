const Router = require("express").Router;
const router = new Router();
const authController = require("../controllers/auth-controller");

router.post("/init", authController.initializeLoginProcess);
router.post("/2FA", authController.send2FA);
router.post("/code", authController.sendCode);
router.post("/verify", authController.verify);

module.exports = router;
