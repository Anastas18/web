// routes/taskRoutes.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const taskController = require('../controllers/taskController');

// Усі маршрути нижче вимагають авторизації (auth)
router.use(auth); 

// GET /api/tasks - Отримати всі завдання
router.get('/', taskController.getTasks);

// POST /api/tasks - Створити нове завдання
router.post('/', taskController.createTask);

// PUT /api/tasks/:id - Оновити завдання
router.put('/:id', taskController.updateTask);

// DELETE /api/tasks/:id - Видалити завдання
router.delete('/:id', taskController.deleteTask);

// PATCH /api/tasks/:id/toggle - Змінити статус виконання
router.patch('/:id/toggle', taskController.toggleTaskCompletion);


module.exports = router;