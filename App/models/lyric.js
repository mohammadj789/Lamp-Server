const { boolean } = require("joi");
const mongoose = require("mongoose");
const lyricSchema = new mongoose.Schema(
  {
    track: { type: mongoose.Schema.Types.ObjectId, ref: "Song" },
    lyric: [
      {
        start: {
          type: Number,
          default: 0,
        },
        content: {
          type: String,
          required: true,
          trim: true,
          lowercase: true,
        },
      },
    ],

    status: { type: String, default: "pending" },
    writer: {
      writer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      writer_name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
    },
    is_sync: { type: Boolean, default: false },
    sync_requests: [
      {
        timestamps: [Number],
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  { timestamps: true }
);
const Lyric = mongoose.model("Lyric", lyricSchema);

module.exports = Lyric;
