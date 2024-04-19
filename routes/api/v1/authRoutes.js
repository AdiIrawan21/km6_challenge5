const router = require("express").Router()
const { register, login, authenticate } = require("../../../controllers/authControllers")
const restric = require("../../../middleware/restricted")

router.post('/register', register)
router.post('/login', login)
router.get('/authenticate', restric, authenticate)
module.exports = router;