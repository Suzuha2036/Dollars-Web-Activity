const multer = require('multer')
const streamifier = require('streamifier')
const cloudinary = require('../config/cloudinary')

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

exports.imageMiddleware = upload.single('file')

exports.uploadImage = async (req, res) => {
  if (!cloudinary.config().cloud_name) return res.status(500).json({ message: 'Cloudinary not configured' })
  if (!req.file) return res.status(400).json({ message: 'No file' })
  const folder = req.query.folder || 'posts'
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, data) => {
      if (err) return reject(err)
      resolve(data)
    })
    streamifier.createReadStream(req.file.buffer).pipe(stream)
  })
  res.json({ url: result.secure_url })
}