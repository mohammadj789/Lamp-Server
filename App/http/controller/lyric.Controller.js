const createHttpError = require("http-errors");

const { Controller } = require("./Controller");
const Lyric = require("../../models/lyric");
const {
  songSchema,
  lyricStatusValidator,
} = require("../validation/lyric.validation");
const Song = require("../../models/song");
const { CheckIDValidator } = require("../validation/index.validator");

class LyricController extends Controller {
  async newLyric(req, res, next) {
    try {
      const user = req.user;
      await songSchema.validateAsync(req.body);

      const track = await Song.findById(req.body.track);
      // const prevlyric = await Lyric.findOne({});
      if (!track)
        throw createHttpError.NotFound(
          "there is no track to get lyric"
        );
      if (track.lyric)
        throw createHttpError.BadRequest(
          "this track already has a valid lyric"
        );
      const prevlyric = await Lyric.findOne({
        track: track._id,
        "writer.writer_id": user._id,
      });
      if (prevlyric?.status === "pending")
        throw createHttpError.BadRequest(
          "you have submitted your request once.wait"
        );
      else if (prevlyric?.status === "rejected")
        throw createHttpError.BadRequest("your request is rejected");

      const lyric = await Lyric.create({
        lyric: req.body.lyric,
        track: req.body.track,
        writer: {
          writer_id: user._id,
          writer_name: user.username,
        },
      });
      if (!lyric) throw createHttpError.InternalServerError();
      res.status(201).send({
        status: 200,
        message: 'we"ll respond to your request ASAP',
        lyric,
      });
    } catch (error) {
      next(error);
    }
  }
  async checkPending(req, res, next) {
    try {
      const user = req.user;
      if (user.role !== "ADMIN")
        throw createHttpError.Unauthorized(
          "you are not allowed here"
        );
      const type = req.query.type;
      const trackId = req.params.trackID;

      await CheckIDValidator.validateAsync({
        id: trackId,
      });
      await lyricStatusValidator.validateAsync({
        type,
      });
      const track = await Song.findById(trackId);
      if (!track)
        throw createHttpError.NotFound(
          "there's no track with this id"
        );

      const lyrics = await Lyric.find({
        track: track._id,
        status: type,
      });

      res.status(200).send({
        status: 200,
        lyrics,
      });
    } catch (error) {
      next(error);
    }
  }
  async changestatus(req, res, next) {
    try {
      const user = req.user;
      if (user.role !== "ADMIN")
        throw createHttpError.Unauthorized(
          "you are not allowed here"
        );
      const type = req.query.type;
      const lyricID = req.params.lyricID;
      await lyricStatusValidator.validateAsync({
        type,
      });
      await CheckIDValidator.validateAsync({
        id: lyricID,
      });
      const lyric = await Lyric.findById(lyricID);
      if (!lyric) throw createHttpError.NotFound();
      const track = await Song.findById(lyric.track);
      if (type === "accepted") {
        if (!track.lyric) {
          track.lyric = lyric._id;
          lyric.status = "accepted";
        } else if (track.lyric === lyric._id) return;
        else {
          await Lyric.findByIdAndUpdate(track.lyric, {
            status: "rejected",
          });
          track.lyric = lyric._id;
          lyric.status = "accepted";
        }
      } else {
        if (lyric.status === "accepted") {
          track.lyric = undefined;
        }
        lyric.status = type;
      }

      const savedLyric = await lyric.save();
      const savedTrack = await track.save();
      if (!savedLyric || !savedTrack)
        throw createHttpError.InternalServerError();

      res.status(200).send({
        status: 200,
        lyric,
      });
    } catch (error) {
      next(error);
    }
  }
  async getOneLyric(req, res, next) {
    try {
      const lyricID = req.params.lyricID;

      await CheckIDValidator.validateAsync({
        id: lyricID,
      });
      const lyric = await Lyric.findById(lyricID);

      if (!lyric) throw createHttpError.NotFound();

      res.status(200).send({
        status: 200,
        lyric,
      });
    } catch (error) {
      next(error);
    }
  }
}
module.exports = { LyricController: new LyricController() };
