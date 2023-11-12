const { Router } = require("express");

const { checkAuth } = require("../http/middleware/checkAuth");
const {
  LyricController,
} = require("../http/controller/lyric.Controller");
const { stringToArray } = require("../http/middleware/stringToArray");

const router = Router();

router.post("/new", checkAuth, LyricController.newLyric);
router.get("/:trackID/all", checkAuth, LyricController.checkPending);
router.post(
  "/status/:lyricID",
  checkAuth,
  LyricController.changestatus
);
router.get("/:lyricID", LyricController.getOneLyric);
module.exports = { LyricRoutes: router };
