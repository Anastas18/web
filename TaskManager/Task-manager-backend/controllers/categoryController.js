// controllers/categoryController.js
// Оновлено для підтримки GET (читання) та POST (створення) категорій користувачем.

const pool = require('../config/db');

// -----------------------------------------------------------------
// 1. ОТРИМАННЯ КАТЕГОРІЙ КОРИСТУВАЧА (GET /api/categories)
// -----------------------------------------------------------------
exports.getCategories = async (req, res) => {
    const userId = req.user.id;
    
    try {
        // Отримати всі категорії, які належать поточному користувачу
        const [categories] = await pool.query(
            'SELECT CategoryID AS id, Name AS name, UserID AS user_id FROM Category WHERE UserID = ?', 
            [userId]
        );

        res.json(categories);

    } catch (error) {
        console.error('Помилка при отриманні категорій:', error);
        res.status(500).json({ message: 'Помилка сервера.' });
    }
};

// -----------------------------------------------------------------
// 2. СТВОРЕННЯ НОВОЇ КАТЕГОРІЇ КОРИСТУВАЧЕМ (POST /api/categories)
// -----------------------------------------------------------------
exports.createCategory = async (req, res) => {
    const userId = req.user.id;
    const { name } = req.body;
    
    if (!name) return res.status(400).json({ message: 'Назва категорії є обов\'язковою.' });

    try {
        // Перевірка на унікальність для цього користувача
        const [existing] = await pool.query('SELECT CategoryID FROM Category WHERE Name = ? AND UserID = ?', [name, userId]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Категорія з такою назвою вже існує у вашому списку.' });
        }

        const [result] = await pool.query('INSERT INTO Category (Name, UserID) VALUES (?, ?)', [name, userId]);
        res.status(201).json({ 
            message: 'Категорія успішно створена.', 
            categoryId: result.insertId,
            name: name
        });

    } catch (error) {
        console.error('Error creating user category:', error);
        res.status(500).json({ message: 'Помилка сервера.' });
    }
};