const Comment = require('../models/Comment')
const Post = require('../models/Post')

exports.create = async (req, res) => {
  const { postId, content } = req.body
  const comment = await Comment.create({ post: postId, author: req.user.id, content })
  await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } })
  const populated = await Comment.findById(comment._id).populate('author', 'username avatarUrl')
  res.json(populated)
}

exports.listByPost = async (req, res) => {
  const { id } = req.params
  const comments = await Comment.find({ post: id })
    .sort({ createdAt: -1 })
    .populate('author', 'username avatarUrl')
  res.json(comments)
}

exports.remove = async (req, res) => {
  const c = await Comment.findById(req.params.id)
  if (!c) return res.status(404).json({ message: 'Not found' })
  if (String(c.author) !== String(req.user.id)) return res.status(403).json({ message: 'Forbidden' })
  await Comment.deleteOne({ _id: c._id })
  await Post.findByIdAndUpdate(c.post, { $inc: { commentsCount: -1 } })
  res.json({ ok: true })
}