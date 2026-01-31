const express = require('express');
const { registerUser, loginUser, logoutUser, refreshAccessToken } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { createValidator } = require('../middleware/validation.middleware');
const { userSchemas } = require('../helpers/validation');

const router = express.Router();

router.post('/register', createValidator(userSchemas.register), registerUser);
router.post('/login', createValidator(userSchemas.login), loginUser);
router.post('/logout', protect, logoutUser);
router.post('/refresh', refreshAccessToken);
router.get('/me', protect, (req, res) => {
    res.json({
        success: true,
        data: req.user
    });
});

module.exports = router;