const mongoose = require("mongoose");
const collectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
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
  },
  { timestamps: true }
);
const Collection = mongoose.model("Collection", collectionSchema);
module.exports = Collection;
