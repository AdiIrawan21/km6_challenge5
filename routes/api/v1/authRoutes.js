const router = require("express").Router()
const { register, login, authenticate } = require("../../../controllers/authControllers")
const restric = require("../../../middleware/restricted")

router.post('/auth/register', register)
router.post('/auth/login', login)
router.get('/auth/authenticate', restric, authenticate)
module.exports = router;