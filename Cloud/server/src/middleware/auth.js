const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  const header = req.headers.authorization
  if (!header) return res.status(401).json({ message: 'Unauthorized' })
  const token = header.split(' ')[1]
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { id: payload.id }
    next()
  } catch (_) {
    res.status(401).json({ message: 'Unauthorized' })
  }
}