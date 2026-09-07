const { Router } = require("express");
const {
  CollectionController,
} = require("../http/controller/collection.controller");

const { checkAuth } = require("../http/middleware/checkAuth");

const {
  multerUpload,
  uploadToR2,
} = require("../http/middleware/multer");
const { stringToArray } = require("../http/middleware/stringToArray");

const router = Router();

//update colloction image
router.patch(
  "/updateTumbnail/:id",
  checkAuth,

  multerUpload(3, /\.(png|jpg|jpeg|webp)/).single("image"),
  uploadToR2("public", "Thumbnail"),
  CollectionController.updateThumbnail,
);
//upload track to a album
router.post(
  "/upload/:id",
  checkAuth,
  multerUpload(20, /\.(mp3|wave)/).single("track"),
  uploadToR2("private", "Tracks"),

  stringToArray("features"),
  CollectionController.UploadTrackToAlbum,
);

//update colloction image
router.post(
  "/create/:type",
  checkAuth,
  CollectionController.createCollection,
);
//delete colloction with tracks
router.delete(
  "/delete/:id",
  checkAuth,
  CollectionController.removeCollection,
);
// addto playlist or favorits
router.post(
  "/add",
  checkAuth,
  CollectionController.addTrackToPlaylist,
);
router.delete(
  "/remove-track",
  checkAuth,
  CollectionController.removeTrackFromPlaylist,
);

router.post(
  "/favorite/:collectionID",
  checkAuth,
  CollectionController.changeFavorits,
);
router.get(
  "/topcollection",
  CollectionController.getPopularCollections,
);
router.get("/", checkAuth, CollectionController.getCollections);
router.get("/:collectionID", CollectionController.getCollectionById);
module.exports = { CollectionRoutes: router };
