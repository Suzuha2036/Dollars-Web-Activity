const router = require('express').Router()
const auth = require('../middleware/auth')
const controller = require('../controllers/uploadController')

router.post('/image', auth, controller.imageMiddleware, controller.uploadImage)

module.exports = router