const mongoose = require('mongoose')
let memoryServer

module.exports = async () => {
  let uri = (process.env.MONGO_URI || '').trim()
  if (uri) {
    try {
      await mongoose.connect(uri)
      return
    } catch (e) {}
  }
  const { MongoMemoryServer } = require('mongodb-memory-server')
  memoryServer = await MongoMemoryServer.create()
  uri = memoryServer.getUri()
  await mongoose.connect(uri)
}