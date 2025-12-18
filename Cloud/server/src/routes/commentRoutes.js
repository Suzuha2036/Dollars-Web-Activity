const router = require('express').Router()
const controller = require('../controllers/commentController')
const auth = require('../middleware/auth')

router.get('/post/:id', auth, controller.listByPost)
router.post('/', auth, controller.create)
router.delete('/:id', auth, controller.remove)

module.exports = router