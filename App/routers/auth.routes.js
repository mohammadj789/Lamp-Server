const { Router } = require("express");
const {
  AuthController,
} = require("../http/controller/auth.controller");

const { checkAuth } = require("../http/middleware/checkAuth");

const router = Router();

router.post("/signup", AuthController.signup);

router.post("/login", AuthController.login);

router.post("/resetpass", checkAuth, AuthController.frogetPass);
module.exports = { AuthRoutes: router };
