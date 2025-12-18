const router = require('express').Router()
const controller = require('../controllers/postController')
const auth = require('../middleware/auth')

router.get('/', auth, controller.feed)
router.get('/author/:id', auth, controller.listByAuthor)
router.post('/', auth, controller.create)
router.get('/:id', auth, controller.get)
router.post('/:id/vote', auth, controller.vote)
router.post('/:id/share', auth, controller.share)
router.put('/:id', auth, controller.update)
router.delete('/:id', auth, controller.remove)

module.exports = router