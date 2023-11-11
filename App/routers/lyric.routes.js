const { Router } = require("express");

const { checkAuth } = require("../http/middleware/checkAuth");
const {
  LyricController,
} = require("../http/controller/lyric.Controller");

const router = Router();

router.post("/new", LyricController.newLyric);
module.exports = { LyricRoutes: router };
