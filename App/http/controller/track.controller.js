const path = require("path");
const fs = require("fs");
const { Controller } = require("./Controller");
const createHttpError = require("http-errors");
const { removeErrorFile } = require("../../utils/functions");
const os = require("os");
const {
  uploadTrackValidator,
} = require("../validation/track.validator");
const { UserModel } = require("../../models/user");
const { features } = require("process");
const Song = require("../../models/song");
const { default: mongoose } = require("mongoose");
const { CheckIDValidator } = require("../validation/index.validator");
class TrackController extends Controller {
  uplaodTrack = async (req, res, next) => {
    try {
      const user = req.user;

      //check rolles
      if (!["ARTIST", "ADMIN"].includes(user.role))
        throw createHttpError.Unauthorized(
          "you are not allowed to upload a song"
        );

      //determin artist
      const artist =
        user.role === "ADMIN"
          ? await UserModel.findOne({
              _id: req.body.artist,
              role: "ARTIST",
            })
          : req.user;
      if (!artist) throw createHttpError.NotFound("artist not found");

      //validate body
      const file = req.file;
      await uploadTrackValidator.validateAsync(req.body);
      if (!file) {
        throw createHttpError.BadRequest("please upload a file");
      }

      //generate path
      const address = path
        .join(req.filepathaddress, req.file.filename)
        .replace(/(\\)/gim, "/");
      console.log(address);

      //validate features
      let features = undefined;
      if (req.body.features.length > 0) {
        if (req.body.features.includes(artist.id))
          throw createHttpError.BadRequest(
            "enter other artists that are in this song"
          );

        features = await UserModel.find(
          {
            _id: {
              $in: req.body.features,
            },
            role: "ARTIST",
          },
          { artist_name: "$name", artist_id: "$_id" }
        );

        if (features.length !== req.body.features.length) {
          throw createHttpError.NotFound(
            "one of features that you've entered is invalid"
          );
        }
      }

      //create song
      const track = await Song.create({
        title: req.body.title,
        artist: {
          artist_id: artist._id,
          artist_name: artist.name,
        },
        features,
        address,
      });
      if (!track) throw createHttpError.InternalServerError();

      res.status(201).json({
        status: 201,
        message: "track uploaded successfully",
        track,
      });
    } catch (error) {
      req?.file?.path && removeErrorFile(req?.file?.path);
      next(error);
    }
  };
  streamTrack = async (req, res, next) => {
    try {
      //validate id and song
      await CheckIDValidator.validateAsync(req.params);
      const id = req.params.id;
      const song = await Song.findById(id);
      if (!song) throw createHttpError.NotFound("no song were found");
      const filePath = path.join(
        __dirname,
        "..",
        "..",
        "..",
        song.address
      );
      //stream song
      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;
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
    } catch (error) {
      if (error.syscall === "stat") {
        await Song.findByIdAndDelete(req.params.id);
        next(
          createHttpError.NotFound(
            "Invalid song if you are the artist upload it again"
          )
        );
      } else next(error);
    }
  };
}
module.exports = { TrackController: new TrackController() };
