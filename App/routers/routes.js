const { Router } = require("express");
const path = require("path");
const fs = require("fs");
const { AuthRoutes } = require("./auth.routes");
const { checkAuth } = require("../http/middleware/checkAuth");
const router = Router();
/**
 * @swagger
 * tags:
 *    - name: Auth
 *      description: routes for authentication of a user
 */
router.get("/stream", (req, res) => {
  const filePath = path.join(
    __dirname,
    "..",
    "..",
    "Public",
    "Hiphopologist - DMT.mp3"
  );

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;
  console.log(range);

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = +parts[0];
    const end = parts[1] ? +parts[1] : fileSize - 1;
    const chunkSize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "audio/mpeg",
    };

    res.writeHead(206, headers);
    file.pipe(res);
  } else {
    const headers = {
      "Content-Length": fileSize,
      "Content-Type": "audio/mpeg",
    };

    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  }
});
router.get("/", checkAuth, (req, res) => {
  res.send("hi");
});
router.use("/Auth", AuthRoutes);
module.exports = { AllRoutes: router };
