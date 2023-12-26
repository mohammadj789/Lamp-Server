const mongoose = require("mongoose");
const collectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    likes: { default: 0, type: Number },
    streams: { default: 0, type: Number },
    image: { type: String },
    owner: {
      owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      owner_name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
    },
    tracks: [
      {
        // unique: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song",
      },
    ],
    type: { type: String, default: "playlist" },
    status: { type: String, default: "pending" },
    theme_color: { type: String },
  },
  { timestamps: true }
);
collectionSchema.index({
  title: "text",
  // short_text: "text",
  // title: "text",
});
const Collection = mongoose.model("Collection", collectionSchema);
module.exports = Collection;
