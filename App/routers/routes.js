const { Router } = require("express");

const { AuthRoutes } = require("./auth.routes");

const { TrackRoutes } = require("./track.routes");
const router = Router();

router.get("/", (req, res) => {
  res.send({ message: "hello" });
});
router.use("/Auth", AuthRoutes);
router.use("/Track", TrackRoutes);
module.exports = { AllRoutes: router };
