// middleware/auth.js

const jwt = require('jsonwebtoken');
const pool = require('../config/db'); // Для перевірки існування користувача

/**
 * Middleware для перевірки JWT токена
 * Токен очікується у форматі: 'Bearer <TOKEN>' у заголовку Authorization
 */
module.exports = async (req, res, next) => {
    // 1. Отримання токена
    const authHeader = req.header('Authorization');
    
    // Перевіряємо, чи існує заголовок і чи він починається з 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            message: 'Доступ заборонено. Токен відсутній або невірний формат.' 
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        // 2. Верифікація токена
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Зберігання даних користувача в об'єкті запиту
        // Це дозволить контролерам знати, який користувач робить запит (req.user)
        req.user = decoded; 
        
        // Додаткова перевірка: чи існує користувач у БД (запобігання атакам з недійсними ID)
        const [rows] = await pool.query('SELECT UserID FROM User WHERE UserID = ?', [req.user.id]);
        
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Користувача, вказаного в токені, не знайдено.' });
        }

        next(); // Продовжуємо обробку запиту
        
    } catch (err) {
        // Якщо токен недійсний (закінчився термін дії, невірний підпис)
        res.status(401).json({ 
            message: 'Токен недійсний.' 
        });
    }
};