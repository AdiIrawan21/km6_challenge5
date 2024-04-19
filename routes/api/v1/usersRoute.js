const router = require("express").Router()
const usersControllers = require("../../../controllers/usersControllers")

// auth middleware

// function auth(req, res, next) {
//     let { authorization } = req.headers;

//     if (authorization) {
//         let token = authorization.split(' ')[1];

//         if (token) {
//             return next()
//         }
//     }
//     return res.status(401).json({
//         status: false,
//         message: 'you\'re unauthorized',
//         data: null
//     });
// }

router.post('/users', usersControllers.create);
router.get('/users', usersControllers.index);
router.get('/users/:id', usersControllers.show);
router.put('/users/:id', usersControllers.edit);
router.delete('/users/:id', usersControllers.destroy);

module.exports = router;