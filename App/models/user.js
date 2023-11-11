const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const createHttpError = require("http-errors");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
    },
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },
    image: { type: String },
    favorit_songs: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Song",
      default: [],
    },
    role: { type: String, default: "USER" },
    tracks: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Song",
    },
    // either users albums or playlist
    Collections: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Collection",
    },
    description: {
      type: String,
      default: "Hi ,I'm new to this app",
    },
    //monthly for artists
    listenners: { type: Number },
    favorit_collections: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Collection",
      default: [],
    },
    score: { type: Number, default: 0 },
    //last visited songs
    streams: {
      type: [
        {
          TrackId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Song",
          },
          addedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);
// userSchema.virtual("lyrics", {
//   ref: "Lyric",
//   localField: "_id",
//   foreignField: "writer",
// });

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    const salt = bcrypt.genSaltSync(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
  next();
});

userSchema.pre("save", function (next) {
  const user = this;
  const maxItems = 200;
  if (user.isModified("password") && user.streams.length > maxItems) {
    user.streams = user.streams.slice(-maxItems);
  }
  next();
});
// userSchema.pre("remove", async function (next) {
//   const user = this;
//   const lyrics = await Lyric.find({ writer: user._id });
//   for (const lyric of lyrics) {
//     lyric.writer = undefined;
//     await lyric.save();
//   }
//   next();
// });

userSchema.methods.createAuthTocken = async function () {
  const user = this;
  const token = jwt.sign(
    { _id: user._id.toString() },
    process.env.JTWTOKEN,
    { expiresIn: "7d" }
  );
  return token;
};

userSchema.statics.checkForLogin = async function ({
  email,
  password,
}) {
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw createHttpError.Unauthorized(
      "username or password is wrong"
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw createHttpError.Unauthorized(
      "username or password is wrong"
    );
  }
  return user;
};
const UserModel = mongoose.model("User", userSchema);

module.exports = { UserModel };
