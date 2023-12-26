const Joi = require("joi");
const { MONGO_ID_PATERN } = require("../../utils/paterns");

const songSchema = Joi.object({
  track: Joi.string().required().pattern(MONGO_ID_PATERN).messages({
    "string.pattern.base": "please enter valid Id for artist",
  }),
  lyric: Joi.array().items(Joi.string()).required(),
});
const syncsongSchema = Joi.object({
  lyric: Joi.string().required().pattern(MONGO_ID_PATERN).messages({
    "string.pattern.base": "please enter valid Id for artist",
  }),
  timestamps: Joi.array().items(Joi.number()).required(),
});
const lyricStatusValidator = Joi.object({
  type: Joi.string()
    .valid("pending", "rejected", "accepted")
    .required(),
});

module.exports = { songSchema, lyricStatusValidator, syncsongSchema };
