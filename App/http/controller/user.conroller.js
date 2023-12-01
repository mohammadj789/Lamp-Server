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
        followers,
        followings,
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
          followers:
            PopulatedUser.role === "ARTIST"
              ? undefined
              : followers.length,
          followings:
            PopulatedUser.role === "ARTIST"
              ? undefined
              : followings.length,
        },
      });
    } catch (error) {
      req?.file?.path && removeErrorFile(req?.file?.path);
      next(error);
    }
  };
  toggleFollow = async (req, res, next) => {
    try {
      const user = req.user;
      const id = req.params.id;

      await CheckIDValidator.validateAsync({
        id: id,
      });
      //get user
      const targetUser = await UserModel.findById(id);
      if (!targetUser) throw createHttpError.NotFound();
      //check for existatnce
      const index = user.followings.indexOf(id);
      if (index > -1) {
        user.followings.splice(index, 1);
        console.log(
          targetUser.followers.filter((item) => {
            console.log(
              item.toString(),
              user._id,
              item.toString() !== user._id.toString()
            );

            return item !== user._id.toString();
          })
        );

        targetUser.followers = targetUser.followers.filter(
          (item) => item.toString() !== user._id.toString()
        );
      } else {
        user.followings.push(targetUser._id);
        targetUser.followers.push(user._id);
      }
      const savedUser = await user.save();
      const savedTargetUser = await targetUser.save();
      if (!savedUser || !savedTargetUser)
        throw createHttpError.InternalServerError();
      res.status(200).json({
        status: 200,
        message: `user ${
          index > -1 ? "removed" : "added"
        } succesfully`,
      });
    } catch (error) {
      next(error);
    }
  };
  getFollowers = async (req, res, next) => {
    try {
      const id = req.params.id;
      await CheckIDValidator.validateAsync({
        id: id,
      });
      const PopulatedUser = await UserModel.findById(id).populate({
        path: "followers",
        select: "image username name",
      });
      console.log(PopulatedUser);

      if (!PopulatedUser) throw createHttpError.InternalServerError();
      const { followers } = PopulatedUser;

      //done
      return res.status(200).json({
        status: 200,
        followers,
      });
    } catch (error) {
      next(error);
    }
  };
  getFollowings = async (req, res, next) => {
    try {
      const id = req.params.id;
      await CheckIDValidator.validateAsync({
        id: id,
      });
      const PopulatedUser = await UserModel.findById(id).populate({
        path: "followings",
        select: "image username name",
      });

      if (!PopulatedUser) throw createHttpError.InternalServerError();
      const { followings } = PopulatedUser;
      //done
      return res.status(200).json({
        status: 200,
        followings,
      });
    } catch (error) {
      next(error);
    }
  };
  getFollowingArtist = async (req, res, next) => {
    try {
      const PopulatedUser = await req.user.populate({
        path: "followings",
        select: "image username name role",
      });

      const { followings } = PopulatedUser;
      const artist = followings.filter(
        (user) => user.role === "ARTIST"
      );
      return res.status(200).json({
        status: 200,
        artist,
      });
    } catch (error) {
      next(error);
    }
  };
}
module.exports = { UserController: new UserController() };
