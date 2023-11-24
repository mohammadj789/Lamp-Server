const { Router } = require("express");

const { checkAuth } = require("../http/middleware/checkAuth");
const {
  UserController,
} = require("../http/controller/user.conroller");
const { multerUpload } = require("../http/middleware/Multer");

const router = Router();

router.patch(
  "/profile/image",
  checkAuth,
  multerUpload("public", "profile", 3, /\.(png|jpg|jpeg)/).single(
    "image"
  ),
  UserController.UpdateProfile
);
router.get("/:id", UserController.getUserProfile);

module.exports = { UserRoutes: router };
