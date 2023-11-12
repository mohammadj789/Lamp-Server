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
router.get("/:id", TrackController.getTracks);

router.get("/stream/:id", OptioanalAuth, TrackController.streamTrack);
module.exports = { TrackRoutes: router };
