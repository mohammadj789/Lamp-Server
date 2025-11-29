const { Router } = require("express");

const { checkAuth } = require("../http/middleware/checkAuth");
const { UserController } = require("../http/controller/user.conroller");
const { multerUpload } = require("../http/middleware/multer");

const router = Router();

router.patch(
  "/profile/image",
  checkAuth,
  multerUpload("public", "profile", 3, /\.(png|jpg|jpeg)/).single("image"),
  UserController.UpdateProfile
);

router.post("/toggle-follow/:id", checkAuth, UserController.toggleFollow);
router.get("/followings", checkAuth, UserController.getFollowingArtist);
router.get("/followers/:id", UserController.getFollowers);
router.get("/followings/:id", UserController.getFollowings);
router.get("/search/:search", UserController.search);
router.get("/artist/search/:search", checkAuth, UserController.searchArtist);
router.get("/artist/popular", UserController.getPopularArtists);
router.get("/played", checkAuth, UserController.getTracks);
router.get("/taste", checkAuth, UserController.getSymilarTaste);
router.get("/tracks/:id", UserController.getArtistTracks);
router.get("/:id", UserController.getUserProfile);
module.exports = { UserRoutes: router };
