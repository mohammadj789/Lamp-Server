const createHttpError = require("http-errors");

const { Controller } = require("./Controller");
const Lyric = require("../../models/lyric");
const { songSchema } = require("../validation/lyric.validation");

class LyricController extends Controller {
  async newLyric(req, res, next) {
    try {
      const user = req.user;
      await songSchema.validateAsync(req.body);

      const lyric = await Lyric.create({
        lyric: req.body.lyric,
        track: req.body.track,
        writer: {
          writer_id: user._id,
          writer_name: user.username,
        },
      });
      if (!lyric) throw createHttpError.InternalServerError();
      res.status(201).send(lyric);
    } catch (error) {
      next(error);
    }
  }
}
module.exports = { LyricController: new LyricController() };
