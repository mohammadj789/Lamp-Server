const createHttpError = require("http-errors");
const { UserModel } = require("../../models/user");
const {
  signupValidator,
  loginValidator,
  resetPassValidator,
} = require("../validation/auth.validation");
const { Controller } = require("./Controller");
const { compare } = require("bcrypt");

class AuthController extends Controller {
  async getUser(req, res, next) {
    try {
      const user = req.user;

      const PopulatedCollection = await user.populate({
        path: "tracks favorit_collections Collections favorit_songs",
        select: "", // Add the fields you want to select
      });
      res.status(201).json({
        status: 201,
        data: { user: PopulatedCollection },
      });
    } catch (error) {
      next(error);
    }
  }
  async signup(req, res, next) {
    try {
      await signupValidator.validateAsync(req.body);

      const { name, email, password, username } = req.body;
      const user = await UserModel.create({
        name,
        email,
        password,
        username,
      });
      if (!user)
        throw createHttpError.InternalServerError(
          "somthing went wrong"
        );
      const token = await user.createAuthTocken();
      const PopulatedCollection = await user.populate({
        path: "tracks favorit_collections Collections favorit_songs",
        select: "", // Add the fields you want to select
      });
      res.status(201).json({
        status: 201,
        data: { token, user: PopulatedCollection },
      });
    } catch (error) {
      next(error);
    }
  }
  async login(req, res, next) {
    try {
      await loginValidator.validateAsync(req.body);

      const { email, password } = req.body;
      const user = await UserModel.checkForLogin({ email, password });
      const token = await user.createAuthTocken();
      const PopulatedCollection = await user.populate({
        path: "tracks favorit_collections Collections favorit_songs",
        select: "", // Add the fields you want to select
      });

      res.status(200).json({
        status: 200,
        data: { token, user: PopulatedCollection },
      });
    } catch (error) {
      next(error);
    }
  }
  async frogetPass(req, res, next) {
    try {
      await resetPassValidator.validateAsync(req.body);
      const { currentpass, newpass } = req.body;
      const isMatch = await compare(currentpass, req.user.password);
      if (!isMatch) {
        throw createHttpError.Unauthorized(
          "current password is wrong"
        );
      }
      req.user.password = newpass;
      const result = await req.user.save();
      if (!result) createHttpError.InternalServerError();

      res.status(200).json({
        status: 200,
        message: "password changed successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
module.exports = { AuthController: new AuthController() };
