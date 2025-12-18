const jwt = require('jsonwebtoken')
const User = require('../models/User')

const sign = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

exports.register = async (req, res) => {
  const { username, email, password } = req.body
  const existing = await User.findOne({ $or: [{ email }, { username }] })
  if (existing) return res.status(400).json({ message: 'User exists' })
  const user = await User.create({ username, email, password })
  const token = sign(user)
  res.json({ token, user: { id: user._id, username: user.username, email: user.email, avatarUrl: user.avatarUrl, bio: user.bio } })
}

exports.login = async (req, res) => {
  const { email, username, identifier, password } = req.body
  const id = String(identifier || email || username || '').trim()
  const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const exactCI = new RegExp('^' + esc + '$', 'i')
  const user = await User.findOne({ $or: [{ email: exactCI }, { username: exactCI }] })
  if (!user) return res.status(400).json({ message: 'Invalid credentials' })
  const ok = await user.comparePassword(password)
  if (!ok) return res.status(400).json({ message: 'Invalid credentials' })
  const token = sign(user)
  res.json({ token, user: { id: user._id, username: user.username, email: user.email, avatarUrl: user.avatarUrl, bio: user.bio } })
}

exports.me = async (req, res) => {
  const user = await User.findById(req.user.id)
  res.json({ id: user._id, username: user.username, email: user.email, avatarUrl: user.avatarUrl, bio: user.bio })
}