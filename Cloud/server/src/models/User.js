const mongoose = require('mongoose')
const crypto = require('crypto')

const schema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatarUrl: { type: String },
    bio: { type: String }
  },
  { timestamps: true }
)

schema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(this.password, salt, 100000, 64, 'sha512').toString('hex')
  this.password = `${salt}:${hash}`
  next()
})

schema.methods.comparePassword = function (candidate) {
  const [salt, stored] = String(this.password).split(':')
  const hash = crypto.pbkdf2Sync(candidate, salt, 100000, 64, 'sha512').toString('hex')
  return Promise.resolve(hash === stored)
}

module.exports = mongoose.model('User', schema)