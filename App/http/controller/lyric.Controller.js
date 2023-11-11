const createHttpError = require("http-errors");

const { Controller } = require("./Controller");
const Lyric = require("../../models/lyric");
const { songSchema } = require("../validation/lyric.validation");
const Song = require("../../models/song");

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
      res
        .status(201)
        .send({
          status: 200,
          message: 'we"ll respond to your request ASAP',
          lyric,
        });
    } catch (error) {
      next(error);
    }
  }
}
module.exports = { LyricController: new LyricController() };
