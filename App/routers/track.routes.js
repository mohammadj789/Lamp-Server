const { Router } = require("express");
const {
  TrackController,
} = require("../http/controller/track.controller");

const { checkAuth } = require("../http/middleware/checkAuth");
const { stringToArray } = require("../http/middleware/stringToArray");

const { multerUpload } = require("../http/middleware/Multer");
const { OptioanalAuth } = require("../http/middleware/OptioanalAuth");

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
  "/favorite/:trackID",
  checkAuth,
  TrackController.changeFavorits
);
router.get("/favorite", checkAuth, TrackController.getFavorits);
router.get("/toptracks", TrackController.getTopTracks);
router.get("/:id", TrackController.getTrackById);
router.get("/stream/:id", TrackController.streamTrack);
router.get(
  "/update-stats/:id",
  checkAuth,
  TrackController.updateStreamTrackStats
);
module.exports = { TrackRoutes: router };
