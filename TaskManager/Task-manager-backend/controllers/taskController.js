// controllers/taskController.js

const pool = require('../config/db');

// Допоміжна функція для отримання StatusID (наприклад, "Активне" або "Виконане")
async function getStatusIdByName(statusName) {
    const [rows] = await pool.query('SELECT StatusID FROM Status WHERE Name = ?', [statusName]);
    if (rows.length === 0) {
        throw new Error(`Status '${statusName}' not found`);
    }
    return rows[0].StatusID;
}

// -----------------------------------------------------------------
// 1. ОТРИМАННЯ ВСІХ ЗАВДАНЬ КОРИСТУВАЧА (GET /api/tasks)
// -----------------------------------------------------------------
exports.getTasks = async (req, res) => {
    const userId = req.user.id;
    
    try {
        // Отримання завдань, включаючи назву статусу та категорії
        const [tasks] = await pool.query(`
            SELECT 
                t.TaskID, t.Title, t.Description, t.DueDate, t.Priority, 
                s.Name AS Status, c.Name AS Category
            FROM Task t
            JOIN Status s ON t.StatusID = s.StatusID
            JOIN Category c ON t.CategoryID = c.CategoryID
            WHERE t.UserID = ?
            ORDER BY t.DueDate, t.Priority DESC
        `, [userId]);

        res.json(tasks);

    } catch (error) {
        console.error('Помилка при отриманні завдань:', error);
        res.status(500).json({ message: 'Помилка сервера.' });
    }
};

// -----------------------------------------------------------------
// 2. СТВОРЕННЯ НОВОГО ЗАВДАННЯ (POST /api/tasks)
// -----------------------------------------------------------------
exports.createTask = async (req, res) => {
    const userId = req.user.id;
    const { title, description, due_date, priority, category_id } = req.body;

    if (!title || !priority || !category_id) {
        return res.status(400).json({ message: 'Назва, пріоритет та категорія є обов\'язковими.' });
    }
    
    try {
        // Нове завдання завжди створюється у статусі 'Активне'
        const statusActiveId = await getStatusIdByName('Активне');
        
        const [result] = await pool.query(
            'INSERT INTO Task (UserID, Title, Description, DueDate, Priority, StatusID, CategoryID) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, title, description, due_date, priority, statusActiveId, category_id]
        );

        res.status(201).json({ 
            message: 'Завдання успішно створено.', 
            taskId: result.insertId 
        });

    } catch (error) {
        console.error('Помилка при створенні завдання:', error);
        res.status(500).json({ message: 'Помилка сервера.' });
    }
};

// -----------------------------------------------------------------
// 3. ОНОВЛЕННЯ ІСНУЮЧОГО ЗАВДАННЯ (PUT /api/tasks/:id)
// -----------------------------------------------------------------
exports.updateTask = async (req, res) => {
    // 1. Отримуємо ID завдання з параметрів URL та ID користувача з токена
    const taskId = req.params.id;
    const userId = req.user.id; 
    
    // 2. Отримуємо всі можливі поля для оновлення
    const { title, description, due_date, priority, category_id, status_id } = req.body;

    // 3. Динамічна побудова SQL-запиту
    const fields = [];
    const values = [];

    // Додаємо поля, якщо вони присутні у тілі запиту
    if (title !== undefined) {
        fields.push('Title = ?');
        values.push(title);
    }
    if (description !== undefined) {
        fields.push('Description = ?');
        values.push(description);
    }
    if (due_date !== undefined) {
        fields.push('DueDate = ?');
        values.push(due_date);
    }
    if (priority !== undefined) {
        fields.push('Priority = ?');
        values.push(priority);
    }
    if (category_id !== undefined) {
        fields.push('CategoryID = ?');
        values.push(category_id);
    }
    if (status_id !== undefined) {
        fields.push('StatusID = ?');
        values.push(status_id);
    }

    // 4. Перевірка: чи є що оновлювати?
    if (fields.length === 0) {
        // Якщо полів немає, повертаємо 400 Bad Request
        return res.status(400).json({ message: 'Немає полів для оновлення.' }); // Ви отримали цю помилку при запиті з image_cf7e59.png
    }

    try {
        // 5. Формування кінцевого запиту
        // Оновлюємо тільки ті завдання, які належать поточному користувачу (userId)
        const updateQuery = `UPDATE Task SET ${fields.join(', ')} WHERE TaskID = ? AND UserID = ?`;
        
        values.push(taskId);
        values.push(userId); 

        const [result] = await pool.query(updateQuery, values);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Завдання не знайдено або у вас немає прав на його редагування.' });
        }

        res.status(200).json({ message: 'Завдання успішно оновлено.' });

    } catch (error) {
        console.error('Помилка при оновленні завдання:', error); // Тут ви побачите реальну помилку MySQL
        res.status(500).json({ message: 'Помилка сервера.' });
    }
};
// -----------------------------------------------------------------
// 4. ВИДАЛЕННЯ ЗАВДАННЯ (DELETE /api/tasks/:id)
// -----------------------------------------------------------------
exports.deleteTask = async (req, res) => {
    const userId = req.user.id;
    const taskId = req.params.id;

    try {
        const [result] = await pool.query(
            'DELETE FROM Task WHERE TaskID = ? AND UserID = ?', 
            [taskId, userId]
        );

        if (result.affectedRows === 0) {
            const [check] = await pool.query('SELECT TaskID FROM Task WHERE TaskID = ?', [taskId]);
            if (check.length === 0) {
                 return res.status(404).json({ message: 'Завдання не знайдено.' });
            }
            return res.status(403).json({ message: 'У вас немає прав на видалення цього завдання.' });
        }

        res.json({ message: 'Завдання успішно видалено.' });

    } catch (error) {
        console.error('Помилка при видаленні завдання:', error);
        res.status(500).json({ message: 'Помилка сервера.' });
    }
};

// -----------------------------------------------------------------
// 5. ЗМІНА СТАТУСУ ВИКОНАННЯ (PATCH /api/tasks/:id/toggle)
// -----------------------------------------------------------------
exports.toggleTaskCompletion = async (req, res) => {
    const userId = req.user.id;
    const taskId = req.params.id;
    const { is_completed } = req.body; // true/false

    try {
        const newStatusName = is_completed ? 'Виконане' : 'Активне';
        const newStatusId = await getStatusIdByName(newStatusName);

        const [result] = await pool.query(
            'UPDATE Task SET StatusID = ? WHERE TaskID = ? AND UserID = ?',
            [newStatusId, taskId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Завдання не знайдено.' });
        }

        res.json({ message: `Статус завдання змінено на: ${newStatusName}` });

    } catch (error) {
        console.error('Помилка при зміні статусу:', error);
        res.status(500).json({ message: 'Помилка сервера.' });
    }
};