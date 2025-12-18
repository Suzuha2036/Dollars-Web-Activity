const User = require('../models/User')
const Post = require('../models/Post')
const Comment = require('../models/Comment')

exports.get = async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ message: 'Not found' })
  res.json({ id: user._id, username: user.username, email: user.email, avatarUrl: user.avatarUrl, bio: user.bio })
}

exports.updateMe = async (req, res) => {
  const fields = ['username', 'avatarUrl', 'bio']
  const data = {}
  fields.forEach((f) => {
    if (req.body[f] !== undefined) data[f] = req.body[f]
  })
  const user = await User.findByIdAndUpdate(req.user.id, data, { new: true })
  res.json({ id: user._id, username: user.username, email: user.email, avatarUrl: user.avatarUrl, bio: user.bio })
}

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Missing fields' })
  const user = await User.findById(req.user.id)
  const ok = await user.comparePassword(currentPassword)
  if (!ok) return res.status(400).json({ message: 'Invalid current password' })
  user.password = newPassword
  await user.save()
  res.json({ ok: true })
}

exports.removeMe = async (req, res) => {
  const userId = req.user.id
  await Comment.deleteMany({ author: userId })
  await Post.deleteMany({ author: userId })
  await User.deleteOne({ _id: userId })
  res.json({ ok: true })
}