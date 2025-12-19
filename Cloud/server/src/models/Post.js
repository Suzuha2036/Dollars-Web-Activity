const mongoose = require('mongoose')

const voteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    value: { type: Number, enum: [1, -1], required: true }
  },
  { _id: false }
)

const schema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: function () { return !this.sharedFrom } },
    imageUrl: { type: String },
    sharedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    votes: [voteSchema],
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Post', schema)
