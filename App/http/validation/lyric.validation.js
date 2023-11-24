const Joi = require("joi");
const { MONGO_ID_PATERN } = require("../../utils/paterns");

const lyricSchema = Joi.object({
  start: Joi.number().required(),
  content: Joi.string().required(),
});

const songSchema = Joi.object({
  track: Joi.string().optional().pattern(MONGO_ID_PATERN).messages({
    "string.pattern.base": "please enter valid Id for artist",
  }),
  lyric: Joi.array().items(lyricSchema).required(),
});
const lyricStatusValidator = Joi.object({
  type: Joi.string()
    .valid("pending", "rejected", "accepted")
    .required(),
});

module.exports = { songSchema, lyricStatusValidator };
