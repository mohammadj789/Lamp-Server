const { Router } = require("express");
const {
  uplaodTrack,
  TrackController,
} = require("../http/controller/track.controller");
const { multerUploadFile } = require("../http/middleware/multer");
const { checkAuth } = require("../http/middleware/checkAuth");
const { stringToArray } = require("../http/middleware/stringToArray");

const router = Router();
router.post(
  "/upload",
  checkAuth,
  multerUploadFile.single("track"),
  stringToArray("features"),
  TrackController.uplaodTrack
);
router.get("/stream/:id", TrackController.streamTrack);
module.exports = { TrackRoutes: router };
