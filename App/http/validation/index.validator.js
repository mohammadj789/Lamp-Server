const Joi = require("joi");
const { MONGO_ID_PATERN } = require("../../utils/paterns");

const CheckIDValidator = Joi.object({
  id: Joi.string().required().pattern(MONGO_ID_PATERN).messages({
    "string.pattern.base": "please enter valid Id",
  }),
});

module.exports = {
  CheckIDValidator,
};
