// routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin'); // Для перевірки ролі
const adminController = require('../controllers/adminController');

// Усі маршрути нижче вимагають АУТЕНТИФІКАЦІЇ та ролі АДМІН
router.use(auth, admin); 

// --- КОРИСТУВАЧІ ---
// GET /api/admin/users - Всі користувачі (для Users Panel)
router.get('/users', adminController.getAllUsers);
// DELETE /api/admin/users/:id - Видалити користувача
router.delete('/users/:id', adminController.deleteUser);


// --- ЗАВДАННЯ ---
// GET /api/admin/tasks/all - Всі завдання (для Tasks Panel)
router.get('/tasks/all', adminController.getAllTasks);
// PUT /api/admin/tasks/:id - Оновити будь-яке завдання
router.put('/tasks/:id', adminController.updateAnyTask);
// DELETE /api/admin/tasks/:id - Видалити будь-яке завдання
router.delete('/tasks/:id', adminController.deleteAnyTask);


// --- КАТЕГОРІЇ ---
// GET /api/admin/categories/all - Всі категорії (для Categories Panel)
router.get('/categories/all', adminController.getAllCategories);
// POST /api/admin/categories - Додати категорію
router.post('/categories', adminController.createCategory);
// PUT /api/admin/categories/:id - Редагувати категорію
router.put('/categories/:id', adminController.updateCategory);
// DELETE /api/admin/categories/:id - Видалити категорію
router.delete('/categories/:id', adminController.deleteCategory);


module.exports = router;