const Joi = require("joi");
const { MONGO_ID_PATERN } = require("../../utils/paterns");

const lyricSchema = Joi.object({
  start: Joi.string()
    .pattern(/^(\d{2}):(\d{2})$/)
    .required(),
  content: Joi.string().required(),
});

const songSchema = Joi.object({
  track: Joi.string().optional().pattern(MONGO_ID_PATERN).messages({
    "string.pattern.base": "please enter valid Id for artist",
  }),
  lyric: Joi.array().items(lyricSchema).required(),
});
module.exports = { songSchema };
