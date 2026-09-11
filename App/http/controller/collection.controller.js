const path = require("path");
const { Controller } = require("./Controller");
const createHttpError = require("http-errors");
const { removeErrorFile } = require("../../utils/functions");
const Song = require("../../models/song");
const { CheckIDValidator } = require("../validation/index.validator");
const Collection = require("../../models/collection");
const {
  ColloectionTypeValidator,
  createCollectionValidator,
} = require("../validation/collection.validator");
const { UserModel } = require("../../models/user");
const {
  uploadTrackValidator,
} = require("../validation/track.validator");
const mm = require("music-metadata");
const Vibrant = require("node-vibrant");
const { removeAOSObject } = require("../middleware/multer");
class CollectionController extends Controller {
  updateThumbnail = async (req, res, next) => {
    try {
      const user = req.user;
      //validate body
      await CheckIDValidator.validateAsync(req.params);
      const id = req.params.id;

      //check file
      const file = req.file;
      if (!file) {
        throw createHttpError.BadRequest("please upload a file");
      }

      // req.file.location is the public ArvanCloud URL set by uploadToAOS --
      // no local path building needed anymore, and Vibrant can read the
      // buffer directly instead of a disk file
      const address = req.file.location;

      const VibrantVar = await Vibrant.from(
        req.file.buffer,
      ).getPalette();

      //updtae colloction image
      const collection = await Collection.findOneAndUpdate(
        { _id: id, owner: user._id },
        {
          $set: {
            image: address,
            theme_color: VibrantVar.Muted.getHex(),
          },
        },
      );

      if (!collection) throw createHttpError.NotFound();
      //update colloction tracks in case of playlist and album
      if (
        collection.type !== "playlist" &&
        collection.tracks.length > 0
      ) {
        const updateResult = await Song.updateMany(
          {
            _id: {
              $in: collection.tracks,
            },
          },
          {
            $set: {
              image: address,
              theme_color: VibrantVar.Muted.getHex(),
            },
          },
        );
        if (updateResult.modifiedCount === 0)
          throw createHttpError.InternalServerError();
      }
      //done
      return res.status(200).json({
        status: 200,
        message: "colloction image updated successfully",
        collection,
      });
    } catch (error) {
      req?.file?.key && removeAOSObject(req.file.key);
      next(error);
    }
  };
  removeCollection = async (req, res, next) => {
    try {
      const user = req.user;
      //validate body
      await CheckIDValidator.validateAsync(req.params);
      const id = req.params.id;

      //updtae colloction image
      const collection = await Collection.findOneAndDelete({
        _id: id,
        owner: user._id,
      });

      if (!collection) throw createHttpError.NotFound();

      const index = user.Collections.indexOf(collection._id);
      if (index > -1) {
        user.Collections.splice(index, 1);
        const saved = await user.save();
        if (!saved) {
          throw createHttpError.InternalServerError();
        }
      } else throw createHttpError.NotFound();
      //update colloction tracks in case of playlist and album
      if (
        collection.type !== "playlist" &&
        collection.tracks.length > 0
      ) {
        const updateResult = await Song.deleteMany({
          _id: {
            $in: collection.tracks,
          },
        });
        if (updateResult.deletedCount === 0)
          throw createHttpError.InternalServerError();
      }
      user.tracks = user.tracks.filter(
        (track) => !collection.tracks.includes(track),
      );
      user.save();
      //done
      return res.status(200).json({
        status: 200,
        message: "colloction deleted successfully",
      });
    } catch (error) {
      req?.file?.path && removeErrorFile(req?.file?.path);
      next(error);
    }
  };
  async createCollection(req, res, next) {
    try {
      const user = req.user;

      await ColloectionTypeValidator.validateAsync(req.params);
      await createCollectionValidator.validateAsync(req.body);

      //check rolles
      const admin_for_artist =
        user.role === "ADMIN" && req.params.type === "album";
      if (
        !["ARTIST", "ADMIN"].includes(user.role) &&
        req.params.type === "album"
      )
        throw createHttpError.BadRequest(
          "you are not allowed to create a album",
        );
      if (admin_for_artist && !req.body.artist) {
        throw createHttpError.BadRequest("you shold set a artist");
      }
      //determin artist
      const owner = admin_for_artist
        ? await UserModel.findOne({
            _id: req.body.artist,
          })
        : req.user;
      if (!owner) throw createHttpError.NotFound("artist not found");
      const colloction = await Collection.create({
        title: req.body.title,
        owner: owner._id,

        type: req.params.type,
      });
      if (!colloction) {
        throw createHttpError.InternalServerError();
      }
      owner.Collections.push(colloction._id);
      const userUpdate = owner.save();
      if (!userUpdate) {
        await Collection.findByIdAndRemove(colloction._id);
        throw createHttpError.InternalServerError();
      }
      res.status(200).json({ status: 200, colloction });
    } catch (error) {
      next(error);
    }
  }

  UploadTrackToAlbum = async (req, res, next) => {
    try {
      const user = req.user;
      await CheckIDValidator.validateAsync(req.params);
      //check rolles
      if (!["ARTIST", "ADMIN"].includes(user.role))
        throw createHttpError.Unauthorized(
          "you are not allowed to upload a song",
        );
      if (user.role === "ADMIN" && !req.body.artist) {
        throw createHttpError.BadRequest("you shold set a artist");
      }
      //determin artist
      const artist =
        user.role === "ADMIN"
          ? await UserModel.findOne({
              _id: req.body.artist,
              role: "ARTIST",
            })
          : req.user;
      if (!artist) throw createHttpError.NotFound("artist not found");

      //validate body
      const file = req.file;

      await uploadTrackValidator.validateAsync(req.body);
      if (!file) {
        throw createHttpError.BadRequest("please upload a file");
      }

      //generate path
      const address = req.file.location;

      //validate features
      let features = undefined;
      if (req.body.features.length > 0) {
        if (req.body.features.includes(artist.id))
          throw createHttpError.BadRequest(
            "enter other artists that are in this song",
          );

        features = await UserModel.find(
          {
            _id: {
              $in: req.body.features,
            },
            role: "ARTIST",
          },
          { artist_name: "$name", artist_id: "$_id" },
        );

        if (features.length !== req.body.features.length) {
          throw createHttpError.NotFound(
            "one of features that you've entered is invalid",
          );
        }
      }

      const metadata = await mm.parseBuffer(
        req.file.buffer,
        req.file.mimetype,
      );

      const colloction = await Collection.findOne({
        _id: req.params.id,
        type: "album",
      });
      //create song
      const track = await Song.create({
        genre: req.body.genre,
        title: req.body.title,
        artist: {
          artist_id: artist._id,
          artist_name: artist.name,
        },
        duration: metadata.format.duration,
        album: colloction.title,
        features,
        address,
      });
      if (!track) throw createHttpError.InternalServerError();
      //update collection
      colloction.tracks.push(track._id);
      const updatedCollection = await colloction.save();

      //remove song on colloctionerror
      if (!updatedCollection) {
        await Song.findByIdAndRemove(track._id);
        throw createHttpError.InternalServerError();
      }
      //update user
      const userUpdateresult = await UserModel.findByIdAndUpdate(
        artist._id,
        { $push: { tracks: track._id } },
      );
      //remove song and colloction on cupdate error
      if (!userUpdateresult) {
        await Song.findByIdAndRemove(track._id);
        await colloction.findByIdAndUpdate(colloction._id, {
          $pull: { tracks: track._id },
        });
        throw createHttpError.InternalServerError();
      }
      //done
      return res.status(201).json({
        status: 201,
        message: "track uploaded successfully",
        track,
      });
    } catch (error) {
      req?.file?.key && removeAOSObject(req.file.key);
      next(error);
    }
  };
  addTrackToPlaylist = async (req, res, next) => {
    try {
      const user = req.user;

      await CheckIDValidator.validateAsync({
        id: req.body.trackID,
      });
      await CheckIDValidator.validateAsync({
        id: req.body.playlistID,
      });

      const track = await Song.findById(req.body.trackID);
      if (!track)
        throw createHttpError.NotFound("track is not a valid one");

      const playlist = await Collection.findOne({
        _id: req.body.playlistID,
        type: "playlist",
        owner: user._id,
      });

      if (!playlist) {
        throw createHttpError.NotFound("playlist is notfound");
      }
      playlist.tracks.push(track._id);
      const saved = await playlist.save();
      if (!saved) {
        throw createHttpError.InternalServerError();
      }
      return res.status(200).json({
        status: 200,
        message: "track Added successfully",
        playlist: saved,
      });
    } catch (error) {
      next(error);
    }
  };
  removeTrackFromPlaylist = async (req, res, next) => {
    try {
      const user = req.user;

      await CheckIDValidator.validateAsync({
        id: req.body.trackID,
      });
      await CheckIDValidator.validateAsync({
        id: req.body.playlistID,
      });

      const playlist = await Collection.findOne({
        _id: req.body.playlistID,
        type: "playlist",
        owner: user._id,
      });

      if (!playlist) {
        throw createHttpError.NotFound("playlist is notfound");
      }

      const index = playlist.tracks.indexOf(req.body.trackID);
      if (index > -1) {
        playlist.tracks.splice(index, 1);
        const saved = await playlist.save();
        if (!saved) {
          throw createHttpError.InternalServerError();
        }
        return res.status(200).json({
          status: 200,
          message: "track reemoved successfully",
          playlist: saved,
        });
      } else
        throw createHttpError.NotFound(
          "theres no such track in your playlist",
        );
    } catch (error) {
      next(error);
    }
  };
  changeFavorits = async (req, res, next) => {
    try {
      const user = req.user;
      await CheckIDValidator.validateAsync({
        id: req.params.collectionID,
      });
      const index = user.favorit_collections.indexOf(
        req.params.collectionID,
      );
      const collectioan = await Collection.findById(
        req.params.collectionID,
      );
      if (!collectioan)
        throw createHttpError.NotFound(
          "collection is not a valid one",
        );
      if (index > -1) {
        user.favorit_collections.splice(index, 1);
        collectioan.likes = collectioan.likes - 1;
      } else {
        user.favorit_collections.push(collectioan._id);
        collectioan.likes = collectioan.likes + 1;
      }
      const saved = await user.save();
      const savedCollection = await collectioan.save();
      if (!saved || !savedCollection) {
        throw createHttpError.InternalServerError();
      }
      return res.status(200).json({
        status: 200,
        message: `track ${
          index > -1 ? "removed" : "added"
        } successfully`,
        favorits: saved.favorit_collections,
      });
    } catch (error) {
      next(error);
    }
  };
  getCollections = async (req, res, next) => {
    try {
      const user = req.user;

      const PopulatedUser = await user.populate({
        path: "favorit_collections Collections",
        select: " -status", // Add the fields you want to select
      });
      return res.status(200).json({
        status: 200,
        collectioans: {
          wished: PopulatedUser.favorit_collections,
          me: PopulatedUser.Collections,

          // .filter(
          //   (item) => item.type === "playlist"
          // ),
        },
      });
    } catch (error) {
      next(error);
    }
  };
  getCollectionById = async (req, res, next) => {
    try {
      await CheckIDValidator.validateAsync({
        id: req.params.collectionID,
      });

      const PopulatedCollection = await Collection.findById(
        req.params.collectionID,
      )
        .populate({
          path: "tracks",
          select: "-address -status",
        })
        .populate({
          path: "owner",
          select: "name image",
        });

      if (!PopulatedCollection) throw createHttpError.NotFound();
      return res.status(200).json({
        status: 200,
        collection: PopulatedCollection,
      });
    } catch (error) {
      next(error);
    }
  };
  getPopularCollections = async (req, res, next) => {
    try {
      const top10Collections = await Collection.find()
        .sort({ likes: -1 })
        .limit(10);

      res.status(200).json({
        status: 200,
        collections: top10Collections,
      });
    } catch (error) {
      next(error);
    }
  };
}
module.exports = { CollectionController: new CollectionController() };
