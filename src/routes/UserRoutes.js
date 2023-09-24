const express = require("express");
const router = express.Router();
const userController = require('../controllers/UserController');

router.get('/', userController.home);

router.post('/studentLogin', userController.studentLogin);
router.post('/adminLogin', userController.adminLogin);

module.exports = router;