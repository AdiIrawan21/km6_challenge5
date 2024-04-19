const router = require("express").Router();
const accountsControllers = require("../../../controllers/accountsControllers");

router.post('/accounts', accountsControllers.create);
router.get('/accounts', accountsControllers.index);
router.get('/accounts/:id', accountsControllers.show);
router.delete('/accounts/:id', accountsControllers.destroy);

module.exports = router;