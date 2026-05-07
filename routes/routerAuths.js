const router = require('express').Router();
const {login, logout, me} = require('../controllers/authController');
const { loginRules } = require('../validator/authValidator');

router.post('/login', loginRules ,login);
router.post('/logout', logout);
router.get('/', me);

module.exports=router;