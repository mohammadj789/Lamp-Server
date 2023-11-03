const createHttpError = require("http-errors");
const Joi = require("joi");

const signupValidator = Joi.object({
  name: Joi.string()
    .required()
    .trim()
    .min(3)
    .error(
      createHttpError.BadRequest(
        "Name must be greater than 3 charecter"
      )
    ),
  password: Joi.string()
    .required()
    .trim()
    .min(8)
    .max(16)
    .error(
      createHttpError.BadRequest("Password must be in range of 8-16")
    ),
  email: Joi.string()
    .required()
    .trim()
    .email()
    .error(createHttpError.BadRequest("please enter a valid email")),
});
const loginValidator = Joi.object({
  password: Joi.string()
    .required()
    .trim()
    .min(8)
    .max(16)
    .error(
      createHttpError.BadRequest("Password must be in range of 8-16")
    ),
  email: Joi.string()
    .required()
    .trim()
    .email()
    .error(createHttpError.BadRequest("please enter a valid email")),
});
const resetPassValidator = Joi.object({
  currentpass: Joi.string()
    .required()
    .trim()
    .min(8)
    .max(16)
    .error(
      createHttpError.BadRequest("Password must be in range of 8-16")
    ),
  newpass: Joi.string()
    .required()
    .trim()
    .min(8)
    .max(16)
    .error(
      createHttpError.BadRequest("newpass must be in range of 8-16")
    ),
  repeatnewpass: Joi.string()
    .required()
    .valid(Joi.ref("newpass"))
    .error(
      createHttpError.BadRequest(
        "enter the same password with new password field"
      )
    ),
});
module.exports = {
  signupValidator,
  loginValidator,
  resetPassValidator,
};
