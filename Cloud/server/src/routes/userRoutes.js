const router = require('express').Router()
const controller = require('../controllers/userController')
const auth = require('../middleware/auth')

router.get('/:id', auth, controller.get)
router.put('/me', auth, controller.updateMe)
router.post('/me/password', auth, controller.changePassword)
router.delete('/me', auth, controller.removeMe)

module.exports = router