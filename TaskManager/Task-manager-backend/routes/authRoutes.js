// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Маршрут для реєстрації
router.post('/register', authController.register);

// Маршрут для входу
router.post('/login', authController.login);

// Маршрут для виходу (на бекенді це просто інформаційна дія)
router.post('/logout', (req, res) => {
    // На клієнті відбувається видалення токена.
    // На бекенді можна просто повернути успішний статус.
    res.json({ message: 'Вихід успішний. Токен має бути видалений на клієнті.' });
});

module.exports = router;