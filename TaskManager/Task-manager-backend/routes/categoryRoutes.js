// routes/categoryRoutes.js
// Додано маршрут POST для створення категорій користувачем.

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const categoryController = require('../controllers/categoryController');

// Усі маршрути нижче вимагають авторизації (auth)
router.use(auth); 

// GET /api/categories - Отримати всі категорії користувача
router.get('/', categoryController.getCategories);

// POST /api/categories - Створити нову категорію користувачем
router.post('/', categoryController.createCategory);

module.exports = router;