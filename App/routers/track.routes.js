const { Router } = require("express");
const {
  TrackController,
} = require("../http/controller/track.controller");

const { checkAuth } = require("../http/middleware/checkAuth");
const { stringToArray } = require("../http/middleware/stringToArray");

const { multerUpload } = require("../http/middleware/Multer");

const router = Router();
//upload a track with colloction
router.post(
  "/upload",
  checkAuth,
  multerUpload("private", "Tracks", 20, /\.(mp3|wave)/).single(
    "track"
  ),
  stringToArray("features"),
  TrackController.uplaodTrack
);
router.post(
  "/favorite/add/:trackID",
  checkAuth,
  TrackController.addTrackToFavorits
);
router.delete(
  "/favorite/remove/:trackID",
  checkAuth,
  TrackController.removeTrackFromFavorits
);

router.get("/stream/:id", TrackController.streamTrack);
module.exports = { TrackRoutes: router };
