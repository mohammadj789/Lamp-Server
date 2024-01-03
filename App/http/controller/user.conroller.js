const createHttpError = require("http-errors");

const { Controller } = require("./Controller");
const { UserModel } = require("../../models/user");
const { removeErrorFile } = require("../../utils/functions");
const path = require("path");
const { CheckIDValidator } = require("../validation/index.validator");
const Song = require("../../models/song");
const Collection = require("../../models/collection");

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
          followers: followers.length,
          followings: followings.length,
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
        select: "image username name role",
      });

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
        select: "image username name role",
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
  search = async (req, res, next) => {
    try {
      const search = req.params.search;

      const users = await UserModel.find(
        {
          $text: { $search: search },
        },
        { image: 1, name: 1, username: 1, _id: 1, role: 1 }
      );
      const tracks = await Song.find({
        $text: { $search: search },
      });
      const collection = await Collection.find({
        $text: { $search: search },
      });
      res.status(200).json({ collection, tracks, users });
    } catch (error) {
      next(error);
    }
  };
  searchArtist = async (req, res, next) => {
    try {
      const search = req.params.search;

      const users = await UserModel.find(
        {
          $text: { $search: search },
          role: "ARTIST",
        },
        { image: 1, name: 1, username: 1, _id: 1 }
      );

      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  };
  getTracks = async (req, res, next) => {
    try {
      const user = req.user;

      const PopulatedUser = await user.populate({
        path: "streams.TrackId",
        // select: "-address -status artist", // Add the fields you want to select
      });
      return res.status(200).json({
        status: 200,
        streams: PopulatedUser.streams,
      });
    } catch (error) {
      next(error);
    }
  };
  getArtistTracks = async (req, res, next) => {
    try {
      const ArtistId = req.params.id;
      await CheckIDValidator.validateAsync({
        id: ArtistId,
      });
      const user = await UserModel.findById(ArtistId);

      if (!user) throw createHttpError.NotFound();

      if (user.role !== "ARTIST")
        throw createHttpError.Unauthorized();

      const PopulatedUser = await user.populate({
        path: "tracks",
        select: "-address -status -artist", // Add the fields you want to select
      });
      return res.status(200).json({
        status: 200,
        tracks: {
          artist: { id: user._id, name: user.name },
          tracks: PopulatedUser.tracks,
        },
      });
    } catch (error) {
      next(error);
    }
  };
  getPopularArtists = async (req, res, next) => {
    try {
      const popularArtist = await UserModel.aggregate([
        { $match: { role: "ARTIST" } }, // Filter tracks by status, adjust as needed
        { $sort: { listenners: -1 } }, // Sort by stream in descending order
        { $limit: 10 }, // Limit the results to the top 10 tracks
      ]);
      res.status(200).json({ status: 200, artists: popularArtist });
    } catch (error) {
      next(error);
    }
  };
}
module.exports = { UserController: new UserController() };
