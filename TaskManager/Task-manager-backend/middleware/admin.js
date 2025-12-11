// middleware/admin.js

/**
 * Middleware для перевірки ролі: дозволяє доступ тільки адміністраторам.
 * Цей middleware повинен викликатися ПІСЛЯ auth.js.
 */
module.exports = (req, res, next) => {
    // req.user був встановлений в auth.js
    if (req.user && req.user.role === 'admin') {
        next(); // Адмін, дозволяємо
    } else {
        res.status(403).json({ 
            message: 'Доступ заборонено. Необхідні права адміністратора.' 
        });
    }
};