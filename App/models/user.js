const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Lyric = require("./lyric");
const createHttpError = require("http-errors");

const userSchema = new mongoose.Schema({
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
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
  },

  score: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
  roles: { type: [String], default: ["USER"] },
  favorits: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Lyric",
    default: [],
  },
});
userSchema.virtual("lyrics", {
  ref: "Lyric",
  localField: "_id",
  foreignField: "writer",
});

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    const salt = bcrypt.genSaltSync(10);
    user.password = await bcrypt.hash(user.password, salt);
  }

  next();
});

userSchema.pre("remove", async function (next) {
  const user = this;
  const lyrics = await Lyric.find({ writer: user._id });
  for (const lyric of lyrics) {
    lyric.writer = undefined;
    await lyric.save();
  }
  next();
});

userSchema.methods.createAuthTocken = async function () {
  const user = this;

  const token = jwt.sign(
    { _id: user._id.toString() },
    process.env.JTWTOKEN,
    { expiresIn: "2h" }
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
