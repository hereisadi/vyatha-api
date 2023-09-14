const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');

router.get('/', userController.home);

router.post('/vyatha/api/studentLogin',userController.studentLogin);
router.post('/vyatha/api/adminLogin',userController.adminLogin);


module.exports = router;