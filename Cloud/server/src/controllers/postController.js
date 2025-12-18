const Post = require('../models/Post')
const Comment = require('../models/Comment')

exports.create = async (req, res) => {
  const { content, imageUrl } = req.body
  const post = await Post.create({ author: req.user.id, content, imageUrl })
  res.json(post)
}

exports.feed = async (req, res) => {
  const page = parseInt(req.query.page || '1')
  const limit = parseInt(req.query.limit || '20')
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('author', 'username avatarUrl')
    .lean()
  const userId = req.user ? req.user.id : null
  const enriched = posts.map((p) => {
    const myVote = userId ? p.votes.find((v) => String(v.user) === String(userId)) : null
    return { ...p, myVote: myVote ? myVote.value : 0 }
  })
  res.json(enriched)
}

exports.listByAuthor = async (req, res) => {
  const { id } = req.params
  const posts = await Post.find({ author: id })
    .sort({ createdAt: -1 })
    .populate('author', 'username avatarUrl')
    .lean()
  const userId = req.user ? req.user.id : null
  const enriched = posts.map((p) => {
    const myVote = userId ? p.votes.find((v) => String(v.user) === String(userId)) : null
    return { ...p, myVote: myVote ? myVote.value : 0 }
  })
  res.json(enriched)
}

exports.get = async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author', 'username avatarUrl').lean()
  if (!post) return res.status(404).json({ message: 'Not found' })
  res.json(post)
}

exports.vote = async (req, res) => {
  const { value } = req.body
  if (![1, -1, 0].includes(value)) return res.status(400).json({ message: 'Invalid value' })
  const post = await Post.findById(req.params.id)
  if (!post) return res.status(404).json({ message: 'Not found' })
  const idx = post.votes.findIndex((v) => String(v.user) === String(req.user.id))
  if (value === 0) {
    if (idx >= 0) {
      const prev = post.votes[idx].value
      if (prev === 1) post.upvotes -= 1
      if (prev === -1) post.downvotes -= 1
      post.votes.splice(idx, 1)
    }
  } else {
    if (idx >= 0) {
      const prev = post.votes[idx].value
      if (prev !== value) {
        if (prev === 1) post.upvotes -= 1
        if (prev === -1) post.downvotes -= 1
        post.votes[idx].value = value
        if (value === 1) post.upvotes += 1
        if (value === -1) post.downvotes += 1
      }
    } else {
      post.votes.push({ user: req.user.id, value })
      if (value === 1) post.upvotes += 1
      if (value === -1) post.downvotes += 1
    }
  }
  await post.save()
  res.json({ upvotes: post.upvotes, downvotes: post.downvotes, myVote: value === 0 ? 0 : value })
}

exports.share = async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { sharesCount: 1 } }, { new: true })
  if (!post) return res.status(404).json({ message: 'Not found' })
  res.json({ sharesCount: post.sharesCount })
}

exports.update = async (req, res) => {
  const { content, imageUrl } = req.body
  const post = await Post.findById(req.params.id)
  if (!post) return res.status(404).json({ message: 'Not found' })
  if (String(post.author) !== String(req.user.id)) return res.status(403).json({ message: 'Forbidden' })
  if (content !== undefined) post.content = content
  if (imageUrl !== undefined) post.imageUrl = imageUrl
  await post.save()
  const populated = await Post.findById(post._id).populate('author', 'username avatarUrl').lean()
  const myVote = populated.votes.find((v) => String(v.user) === String(req.user.id))
  res.json({ ...populated, myVote: myVote ? myVote.value : 0 })
}

exports.remove = async (req, res) => {
  const post = await Post.findById(req.params.id)
  if (!post) return res.status(404).json({ message: 'Not found' })
  if (String(post.author) !== String(req.user.id)) return res.status(403).json({ message: 'Forbidden' })
  await Comment.deleteMany({ post: post._id })
  await Post.deleteOne({ _id: post._id })
  res.json({ ok: true })
}