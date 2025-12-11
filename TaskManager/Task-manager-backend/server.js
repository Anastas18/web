// server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Завантаження змінних середовища з файлу .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Дозволяє запити з фронтенду (наприклад, localhost:8080)
app.use(express.json()); // Для парсингу JSON-тіла запитів

// ----------------------------------------------------
// 1. ІМПОРТ МАРШРУТІВ
// ----------------------------------------------------
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const adminRoutes = require('./routes/adminRoutes'); 
const categoryRoutes = require('./routes/categoryRoutes');

// ----------------------------------------------------
// 2. ВИКОРИСТАННЯ МАРШРУТІВ
// ----------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/api/categories', categoryRoutes);

// Тестовий маршрут
app.get('/', (req, res) => {
  res.send('Task Manager Backend запрацював!');
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('http://localhost:3000');
});
// server.js (після app.use(express.json());)

// ----------------------------------------------------
// 0. ОБСЛУГОВУВАННЯ СТАТИЧНИХ ФАЙЛІВ (CSS, JS, images)
// ----------------------------------------------------
const path = require('path'); // Додайте require('path') на початку файлу
app.use('/static', express.static(path.join(__dirname, '..', 'WEB', 'static')));
// Якщо ваша папка static знаходиться безпосередньо в корені проекту:
// app.use('/static', express.static(path.join(__dirname, '..', 'static')));