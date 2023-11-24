const createHttpError = require("http-errors");

const { Controller } = require("./Controller");
const { UserModel } = require("../../models/user");
const { removeErrorFile } = require("../../utils/functions");
const path = require("path");
const { CheckIDValidator } = require("../validation/index.validator");
class UserController extends Controller {
  UpdateProfile = async (req, res, next) => {
    try {
      const user = req.user;
      //validate body

      //check file
      const file = req.file;
      if (!file) {
        throw createHttpError.BadRequest("please upload a file");
      }
      //generate path
      const address = path
        .join(
          req.filepathaddress?.[0]?.replace("static\\public", ""),
          req.file.filename
        )
        .replace(/(\\)/gim, "/");

      user.image = address;
      const updateResult = await user.save();

      if (!updateResult) throw createHttpError.InternalServerError();

      //done
      return res.status(200).json({
        status: 200,
        message: "colloction image updated successfully",
        profile: address,
      });
    } catch (error) {
      req?.file?.path && removeErrorFile(req?.file?.path);
      next(error);
    }
  };
  getUserProfile = async (req, res, next) => {
    try {
      const id = req.params.id;
      await CheckIDValidator.validateAsync({
        id: id,
      });
      const PopulatedUser = await UserModel.findById(id).populate({
        path: "tracks Collections",
      });

      if (!PopulatedUser) throw createHttpError.InternalServerError();
      const {
        tracks,
        Collections,
        username,
        name,
        _id,
        role,
        description,
        image,
        listenners,
      } = PopulatedUser;
      //done
      return res.status(200).json({
        status: 200,
        profile: {
          tracks,
          Collections,
          username,
          name,
          _id,
          role,
          description,
          image,
          listenners,
        },
      });
    } catch (error) {
      req?.file?.path && removeErrorFile(req?.file?.path);
      next(error);
    }
  };
}
module.exports = { UserController: new UserController() };
