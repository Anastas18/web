// controllers/adminController.js

const pool = require('../config/db');
const { getStatusIdByName } = require('./taskController'); // Перевикористовуємо функцію

// -----------------------------------------------------------------
// 1. КОРИСТУВАЧІ (USERS CRUD)
// -----------------------------------------------------------------

// GET /api/admin/users - Отримати всіх користувачів
exports.getAllUsers = async (req, res) => {
    try {
        // Виключення чутливих даних (PasswordHash)
        const [users] = await pool.query('SELECT UserID AS id, Username AS name, Email, Role FROM User ORDER BY UserID');
        res.json(users);
    } catch (error) {
        console.error('Admin error fetching users:', error);
        res.status(500).json({ message: 'Помилка сервера при отриманні користувачів.' });
    }
};

// DELETE /api/admin/users/:id - Видалити користувача
exports.deleteUser = async (req, res) => {
    const userIdToDelete = req.params.id;
    
    // Перевірка, чи не намагається адміністратор видалити сам себе
    if (userIdToDelete === String(req.user.id)) {
        return res.status(403).json({ message: 'Адміністратор не може видалити власний обліковий запис через панель.' });
    }

    try {
        // Завдання, пов'язані з цим користувачем, будуть автоматично видалені (ON DELETE CASCADE)
        const [result] = await pool.query('DELETE FROM User WHERE UserID = ? AND Role != "admin"', [userIdToDelete]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Користувача не знайдено або це адміністратор.' });
        }
        
        res.json({ message: `Користувач з ID ${userIdToDelete} успішно видалений.` });

    } catch (error) {
        console.error('Admin error deleting user:', error);
        res.status(500).json({ message: 'Помилка сервера при видаленні користувача.' });
    }
};


// -----------------------------------------------------------------
// 2. ЗАВДАННЯ (TASKS CRUD)
// -----------------------------------------------------------------

// GET /api/admin/tasks/all - Отримати всі завдання всіх користувачів
exports.getAllTasks = async (req, res) => {
    try {
        const [tasks] = await pool.query(`
            SELECT 
                t.TaskID AS id, t.Title, t.DueDate, t.Priority, 
                s.Name AS Status, c.Name AS Category,
                u.UserID AS userId, u.Username AS UserName
            FROM Task t
            JOIN Status s ON t.StatusID = s.StatusID
            JOIN Category c ON t.CategoryID = c.CategoryID
            JOIN User u ON t.UserID = u.UserID
            ORDER BY t.TaskID DESC
        `);
        res.json(tasks);
    } catch (error) {
        console.error('Admin error fetching all tasks:', error);
        res.status(500).json({ message: 'Помилка сервера при отриманні всіх завдань.' });
    }
};

// PUT /api/admin/tasks/:id - Оновити будь-яке завдання
exports.updateAnyTask = async (req, res) => {
    const taskId = req.params.id;
    const { title, due_date, priority, status_name, category_id } = req.body;
    
    if (!title || !priority || !status_name || !category_id) {
         return res.status(400).json({ message: 'Відсутні обов\'язкові поля для оновлення.' });
    }

    try {
        const statusId = await getStatusIdByName(status_name);

        const [result] = await pool.query(
            `UPDATE Task SET 
                Title = ?, DueDate = ?, Priority = ?, StatusID = ?, CategoryID = ?
            WHERE TaskID = ?`,
            [title, due_date, priority, statusId, category_id, taskId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Завдання не знайдено.' });
        }

        res.json({ message: 'Завдання успішно оновлено адміністратором.' });

    } catch (error) {
        console.error('Admin error updating task:', error);
        res.status(500).json({ message: 'Помилка сервера при оновленні завдання.' });
    }
};

// DELETE /api/admin/tasks/:id - Видалити будь-яке завдання
exports.deleteAnyTask = async (req, res) => {
    const taskId = req.params.id;

    try {
        const [result] = await pool.query('DELETE FROM Task WHERE TaskID = ?', [taskId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Завдання не знайдено.' });
        }

        res.json({ message: 'Завдання успішно видалено адміністратором.' });

    } catch (error) {
        console.error('Admin error deleting task:', error);
        res.status(500).json({ message: 'Помилка сервера при видаленні завдання.' });
    }
};

// -----------------------------------------------------------------
// 3. КАТЕГОРІЇ (CATEGORIES CRUD)
// -----------------------------------------------------------------

// GET /api/admin/categories/all - Отримати всі категорії
exports.getAllCategories = async (req, res) => {
    try {
        // Отримання категорій, а також підрахунок кількості завдань у кожній
        const [categories] = await pool.query(`
            SELECT 
                c.CategoryID AS id, 
                c.Name AS name, 
                COUNT(t.TaskID) AS taskCount
            FROM Category c
            LEFT JOIN Task t ON c.CategoryID = t.CategoryID
            GROUP BY c.CategoryID, c.Name
            ORDER BY c.Name
        `);
        res.json(categories);
    } catch (error) {
        console.error('Admin error fetching categories:', error);
        res.status(500).json({ message: 'Помилка сервера при отриманні категорій.' });
    }
};

// POST /api/admin/categories - Створити нову категорію (як загальну, UserID=NULL)
exports.createCategory = async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Назва категорії є обов\'язковою.' });

    try {
        // Перевірка на унікальність
        const [existing] = await pool.query('SELECT CategoryID FROM Category WHERE Name = ?', [name]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Категорія з такою назвою вже існує.' });
        }

        // Категорії, створені адміністратором, можуть бути загальними (UserID NULL)
        const [result] = await pool.query('INSERT INTO Category (Name, UserID) VALUES (?, NULL)', [name]);
        res.status(201).json({ message: 'Категорія успішно створена.', categoryId: result.insertId });

    } catch (error) {
        console.error('Admin error creating category:', error);
        res.status(500).json({ message: 'Помилка сервера.' });
    }
};

// PUT /api/admin/categories/:id - Оновити категорію
exports.updateCategory = async (req, res) => {
    const categoryId = req.params.id;
    const { name: newName } = req.body;
    
    if (!newName) return res.status(400).json({ message: 'Нова назва категорії є обов\'язковою.' });

    try {
        const [result] = await pool.query('UPDATE Category SET Name = ? WHERE CategoryID = ?', [newName, categoryId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Категорія не знайдена.' });
        }
        res.json({ message: 'Категорія успішно оновлена.' });
        
    } catch (error) {
        console.error('Admin error updating category:', error);
        res.status(500).json({ message: 'Помилка сервера.' });
    }
};

// DELETE /api/admin/categories/:id - Видалити категорію
exports.deleteCategory = async (req, res) => {
    const categoryId = req.params.id;
    
    try {
        // Перевіряємо, чи це не "Інше" (як зазначено у вашій логіці admin.js)
        const [category] = await pool.query('SELECT Name FROM Category WHERE CategoryID = ?', [categoryId]);
        if (category.length > 0 && category[0].Name === 'Інше') {
            return res.status(403).json({ message: 'Категорію "Інше" не можна видалити.' });
        }

        // Змінюємо всі завдання з цією категорією на NULL (ON DELETE SET NULL),
        // але для відповідності логіці front-end ("Інше"), потрібно знайти ID "Інше" та оновити завдання вручну.
        const [otherCat] = await pool.query('SELECT CategoryID FROM Category WHERE Name = "Інше"');
        const otherCatId = otherCat.length > 0 ? otherCat[0].CategoryID : null;

        // 1. Оновлюємо завдання (якщо 'Інше' існує)
        if (otherCatId) {
             await pool.query('UPDATE Task SET CategoryID = ? WHERE CategoryID = ?', [otherCatId, categoryId]);
        }
        // 2. Видаляємо категорію
        const [result] = await pool.query('DELETE FROM Category WHERE CategoryID = ?', [categoryId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Категорія не знайдена.' });
        }

        res.json({ message: 'Категорія успішно видалена. Пов\'язані завдання перенесені до "Інше".' });

    } catch (error) {
        console.error('Admin error deleting category:', error);
        res.status(500).json({ message: 'Помилка сервера.' });
    }
};