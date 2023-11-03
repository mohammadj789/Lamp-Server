const mongoose = require("mongoose");
const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    artist: {
      artist_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      artist_name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
    },
    features: [
      {
        artist_id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "User",
        },
        artist_name: {
          type: String,
          required: true,
          trim: true,
          lowercase: true,
        },
      },
    ],
    address: {
      type: String,
      required: true,
    },
    lyric: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lyric",
    },

    image: { type: String },
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);
const Song = mongoose.model("Song", songSchema);

module.exports = Song;