const { Router } = require("express");

const { AuthRoutes } = require("./auth.routes");

const { TrackRoutes } = require("./track.routes");
const { LyricRoutes } = require("./lyric.routes");
const { CollectionRoutes } = require("./colloction.routes");
const { UserRoutes } = require("./user.routes");
const router = Router();

router.get("/", (req, res) => {
  res.send({ message: "hello" });
});

router.use("/Auth", AuthRoutes);
router.use("/Track", TrackRoutes);
router.use("/collection", CollectionRoutes);
router.use("/lyric", LyricRoutes);
router.use("/user", UserRoutes);
module.exports = { AllRoutes: router };
