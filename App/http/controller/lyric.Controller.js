const createHttpError = require("http-errors");

const { Controller } = require("./Controller");
const Lyric = require("../../models/lyric");
const {
  songSchema,
  lyricStatusValidator,
  syncsongSchema,
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
          "you have submitted your request once. wait!"
        );
      else if (prevlyric?.status === "rejected")
        throw createHttpError.BadRequest("your request is rejected");

      const lyric = await Lyric.create({
        lyric: req.body.lyric.map((item) => {
          return { content: item };
        }),
        track: req.body.track,
        writer: {
          writer_id: user._id,
          writer_name: user.username,
        },
      });
      if (!lyric) throw createHttpError.InternalServerError();
      res.status(201).send({
        status: 201,
        message: 'we"ll respond to your request ASAP',
        lyric,
      });
    } catch (error) {
      next(error);
    }
  }
  async syncLyric(req, res, next) {
    try {
      const user = req.user;
      await syncsongSchema.validateAsync(req.body);

      const lyric = await Lyric.findOne({
        _id: req.body.lyric,
        status: "accepted",
        is_sync: false,
      });

      if (!lyric) throw createHttpError.NotFound();

      if (lyric.lyric.length !== req.body.timestamps.length)
        throw createHttpError.BadRequest(
          "match the lyric line count"
        );
      const is_submited = lyric.sync_requests.findIndex(
        (req) => req.user.toString() === user._id.toString()
      );
      if (is_submited > -1)
        throw createHttpError.BadRequest(
          "you have submitted your request"
        );

      lyric.sync_requests.push({
        timestamps: req.body.timestamps,
        user: user._id,
      });

      const savedlyric = await lyric.save();
      if (!savedlyric) throw createHttpError.InternalServerError();

      res.status(200).send({
        status: 200,
        message: "we'll check your request asap",
        // lyric: savedlyric,
      });
    } catch (error) {
      next(error);
    }
  }
  async getSyncRequests(req, res, next) {
    try {
      const user = req.user;
      if (user.role !== "ADMIN")
        throw createHttpError.Unauthorized(
          "you are not allowed here"
        );

      const LyricId = req.params.lyricID;

      await CheckIDValidator.validateAsync({
        id: LyricId,
      });

      const lyric = await Lyric.findOne({
        _id: LyricId,
        is_sync: false,
      });
      if (!lyric) throw createHttpError.NotFound();
      res
        .status(200)
        .json({ status: 200, requests: lyric.sync_requests });
    } catch (error) {
      next(error);
    }
  }
  async changeSyncstatus(req, res, next) {
    try {
      const user = req.user;
      if (user.role !== "ADMIN")
        throw createHttpError.Unauthorized(
          "you are not allowed here"
        );

      const syncID = req.body.syncID;
      const lyricID = req.body.lyricID;

      await CheckIDValidator.validateAsync({
        id: lyricID,
      });
      await CheckIDValidator.validateAsync({
        id: syncID,
      });

      const lyric = await Lyric.findOne({
        _id: lyricID,
        status: "accepted",
        is_sync: false,
      });
      if (!lyric) throw createHttpError.NotFound();

      const syncObject = lyric.sync_requests.find(
        (item) => item._id.toString() === syncID
      );
      if (!syncObject) throw createHttpError.NotFound();
      lyric.lyric = lyric.lyric.map((line, i) => {
        return { ...line, start: syncObject.timestamps[i] };
      });
      lyric.is_sync = true;
      lyric.sync_requests = [];
      const savedlyric = await lyric.save();
      if (!savedlyric) throw createHttpError.InternalServerError();

      res.status(200).send({
        status: 200,
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
      const lyric = await Lyric.findById(lyricID).populate({
        path: "track",
        // select: "", // Add the fields you want to select
      });

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
