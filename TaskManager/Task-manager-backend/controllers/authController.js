// controllers/authController.js

const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Функція для генерації JWT токена
const generateToken = (user) => {
    return jwt.sign(
        { id: user.UserID, role: user.Role, email: user.Email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

// -----------------------------------------------------------------
// 1. РЕЄСТРАЦІЯ НОВОГО КОРИСТУВАЧА (POST /api/auth/register)
// -----------------------------------------------------------------
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Будь ласка, заповніть усі поля.' });
    }

    try {
        // Перевірка, чи існує користувач з таким email
        const [existingUser] = await pool.query('SELECT UserID FROM User WHERE Email = ?', [email]);
        
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Користувач з таким email вже існує.' });
        }

        // Хешування пароля
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        // Роль 'user' встановлюється за замовчуванням у таблиці (TaskAnManager.sql)
        const role = 'user'; 

        // Додавання користувача до БД
        const [result] = await pool.query(
            'INSERT INTO User (Username, Email, PasswordHash, Role) VALUES (?, ?, ?, ?)',
            [name, email, passwordHash, role]
        );
        
        // Створення початкових категорій для нового користувача (імітація адмін-логіки)
        const newUserId = result.insertId;
        const defaultCategories = ['Особисте', 'Робота', 'Навчання', 'Інше'];
        
        const categoryInsertValues = defaultCategories.map(cat => [cat, newUserId]);
        await pool.query(
            'INSERT INTO Category (Name, UserID) VALUES ?', 
            [categoryInsertValues]
        );

        // Повертаємо успішну відповідь, без автоматичного входу
        res.status(201).json({ 
            message: 'Реєстрація успішна. Будь ласка, увійдіть.',
            userId: newUserId 
        });

    } catch (error) {
        console.error('Помилка реєстрації:', error);
        res.status(500).json({ message: 'Помилка сервера під час реєстрації.' });
    }
};

// -----------------------------------------------------------------
// 2. ВХІД КОРИСТУВАЧА (POST /api/auth/login)
// -----------------------------------------------------------------
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Будь ласка, введіть email та пароль.' });
    }

    try {
        // Пошук користувача за email
        const [users] = await pool.query('SELECT * FROM User WHERE Email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(400).json({ message: 'Невірний email або пароль.' });
        }

        const user = users[0];

        // Порівняння хешованих паролів
        const isMatch = await bcrypt.compare(password, user.PasswordHash);

        if (!isMatch) {
            return res.status(400).json({ message: 'Невірний email або пароль.' });
        }

        // Генерація JWT токена
        const token = generateToken(user);

        // Повертаємо токен та дані користувача
        res.json({
            token,
            user: {
                id: user.UserID,
                name: user.Username,
                email: user.Email,
                role: user.Role
            }
        });

    } catch (error) {
        console.error('Помилка входу:', error);
        res.status(500).json({ message: 'Помилка сервера під час входу.' });
    }
};