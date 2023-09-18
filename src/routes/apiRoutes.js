const express = require('express');
const UserController = require('../controllers/userController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.post('/sample-route', (req, res) => {
    console.log("🚀 ~ file: apiRoutes.js:16 ~ router.post ~ req.body:", req.body)
    res.status(200).json({ message: "congratulations, data transmitted successfully!", data: "success" })
});


// Protected route using the authenticate middleware
router.get('/protected', authenticate, UserController.protectedRoute);

module.exports = router;
