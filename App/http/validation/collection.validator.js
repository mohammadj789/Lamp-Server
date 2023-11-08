const createHttpError = require("http-errors");
const Joi = require("joi");
const { MONGO_ID_PATERN } = require("../../utils/paterns");

const createCollectionValidator = Joi.object({
  title: Joi.string().required().trim().min(2).messages({
    "string.min": "title must be greater than 2",
  }),

  artist: Joi.string().optional().pattern(MONGO_ID_PATERN).messages({
    "string.pattern.base": "please enter valid Id for artist",
  }),
});
const ColloectionTypeValidator = Joi.object({
  type: Joi.string().valid("playlist", "album").required(),
});

module.exports = {
  createCollectionValidator,
  ColloectionTypeValidator,
};
