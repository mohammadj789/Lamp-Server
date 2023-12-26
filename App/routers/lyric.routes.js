const { Router } = require("express");

const { checkAuth } = require("../http/middleware/checkAuth");
const {
  LyricController,
} = require("../http/controller/lyric.Controller");
const { stringToArray } = require("../http/middleware/stringToArray");

const router = Router();

router.post("/new", checkAuth, LyricController.newLyric);
router.post("/sync", checkAuth, LyricController.syncLyric);
router.get("/:trackID/all", checkAuth, LyricController.checkPending);
router.get(
  "/sync/:lyricID/all",
  checkAuth,
  LyricController.getSyncRequests
);
router.post(
  "/status/sync",
  checkAuth,
  LyricController.changeSyncstatus
);
router.post(
  "/status/:lyricID",
  checkAuth,
  LyricController.changestatus
);

router.get("/:lyricID", LyricController.getOneLyric);
module.exports = { LyricRoutes: router };
