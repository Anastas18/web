// admin.js - ОНОВЛЕНИЙ ДЛЯ РОБОТИ З БЕКЕНДОМ

// --- ІМІТАЦІЯ БАЗИ ДАНИХ (ВИДАЛЕНО, ТЕПЕР ВИКОРИСТОВУЄМО API) ---
const API_BASE_URL = 'http://localhost:3000/api/admin';

// --- AUTH UTILS ---
const getAuthToken = () => {
    return localStorage.getItem('authToken');
}
const redirectToIndex = () => {
    window.location.href = 'index.html';
};
const redirectToLogin = () => {
    window.location.href = 'login.html';
};

// Допоміжна функція для надсилання запитів з токеном
async function adminApiFetch(endpoint, options = {}) {
    const token = getAuthToken();
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers 
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });
    
    if (response.status === 401 || response.status === 403) {
        // Якщо токен недійсний/права відсутні, редирект
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        alert('Сесія закінчилася або відсутні права доступу.');
        redirectToLogin();
        throw new Error('Unauthorized or Forbidden');
    }

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API request failed');
    }

    return response.json().catch(() => ({})); 
}


// --- CONSTANTS ---
// Елементи Header 
const burgerMenu = document.getElementById('burger-menu');
const navMenu = document.querySelector('.under_p_service_u'); 
const guestMenu = document.querySelector('.under_p_service_g');
const userPanel = document.querySelector('.user_panel');
const adminPanel = document.querySelector('.admin_div');
const userNameDisplay = document.getElementById('name_u_footer');
const adminLink = document.querySelector('.admin_a');
const logoutButton = document.querySelector('.button_logout');

// Елементи Панелі 
const dashbtn = document.getElementById('dashbtn');
const usersbtn = document.getElementById('usersbtn');
const tasksbtn = document.getElementById('tasksbtn');
const categorybtn = document.getElementById('categorybtn');

const dashTitle = document.querySelector('.tittle_panel.dash');
const usersTitle = document.querySelector('.tittle_panel.users');
const tasksTitle = document.querySelector('.tittle_panel.tasks');
const categoryTitle = document.querySelector('.tittle_panel.category');

const dashInfo = document.querySelector('.inf_panel.dash');
const usersInfo = document.querySelector('.users_panel.users');
const tasksInfo = document.querySelector('.tasks.tasks_cards');
const categoryInfo = document.querySelector('.category.tasks_cards');

const usersSearchInput = document.querySelector('.tittle_panel.users .input_panel');
const tasksSearchInput = document.querySelector('.tittle_panel.tasks .input_panel');
const categorySearchInput = document.querySelector('.tittle_panel.category .input_panel');

// --- ЕЛЕМЕНТИ ДЛЯ МОДАЛЬНИХ ВІКОН ---
const categoryModalBackground = document.getElementById('category-modal-background');
const categoryModalTitle = document.getElementById('category-modal-title');
const categoryInputName = document.getElementById('category-input-name');
const saveCategoryBtn = document.getElementById('save-category-btn');
const cancelCategoryBtn = document.getElementById('cancel-category-btn');
const addCategoryBtn = document.getElementById('add-category-btn');

let editingCategoryId = null; // ID категорії, яку редагуємо

const taskModalBackground = document.getElementById('task-modal-background');
const taskInputName = document.getElementById('task-input-name');
const taskInputDeadline = document.getElementById('task-input-deadline');
const taskInputPriority = document.getElementById('task-input-priority');
const taskInputCategory = document.getElementById('task-input-category');
const taskInputCompleted = document.getElementById('task-input-completed');
const saveTaskBtnModal = document.getElementById('save-task-btn'); 
const cancelTaskBtn = document.getElementById('cancel-task-btn');

let editingTaskId = null; 

const PRIORITIES = ['Високий', 'Середній', 'Низький'];
const COMPLETION_STATUSES = [
    { value: 'Виконане', text: 'Виконано' },
    { value: 'Активне', text: 'Не виконано' }
];
// admin.js (НОВА ЛОГІКА БУРГЕР-МЕНЮ)

// Перевіряємо, чи існує кнопка бургер-меню та меню користувача
if (burgerMenu && navMenu) {
    burgerMenu.addEventListener('click', () => {
        // На сторінці адміна завжди очікується авторизований користувач
        // Ми просто перемикаємо клас 'active' на меню користувача
        navMenu.classList.toggle('active');
    });
}
// -----------------------------------------------------------------
// --- AUTH PROTECTION AND HEADER LOGIC ---
// -----------------------------------------------------------------
function updateAuthUI() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const token = getAuthToken();
    const isLoggedIn = !!user && !!token;

    // 1. ЗАХИСТ СТОРІНКИ
    if (!isLoggedIn || user.role !== 'admin') {
        alert('У вас немає прав доступу до панелі адміністратора. Перенаправлення на головну.');
        redirectToIndex(); 
        return;
    }

    // 2. ЛОГІКА HEADER
    if (navMenu) navMenu.classList.add('visible-desktop');
    if (guestMenu) guestMenu.style.display = 'none';
    if (userNameDisplay) userNameDisplay.textContent = user.name;
    if (adminLink) adminLink.style.display = 'block'; 
}

// ... БУРГЕР-МЕНЮ та Вийти (logoutButton) залишаються як у script.js ...
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken'); 
        fetch('http://localhost:3000/api/auth/logout', { method: 'POST' });
        redirectToIndex(); 
    });
}
// -----------------------------------------------------------------
// --- PANEL NAVIGATION LOGIC ---
// -----------------------------------------------------------------
function hideAllPanels() {
    [dashTitle, usersTitle, tasksTitle, categoryTitle].forEach(el => el.style.display = 'none');
    [dashInfo, usersInfo, tasksInfo, categoryInfo].forEach(el => el.style.display = 'none');
}

function setActivePanel(infoContainer, titleContainer, renderFunction) {
    hideAllPanels();
    titleContainer.style.display = 'flex';
    infoContainer.style.display = 'flex';
    if (renderFunction) {
        // Очищення інпутів при зміні панелі
        if(titleContainer === usersTitle && usersSearchInput) usersSearchInput.value = '';
        if(titleContainer === tasksTitle && tasksSearchInput) tasksSearchInput.value = '';
        if(titleContainer === categoryTitle && categorySearchInput) categorySearchInput.value = '';
        
        renderFunction(); 
    }
}

// -----------------------------------------------------------------
// --- 1. DASHBOARD LOGIC (Оновлено для API) ---
// -----------------------------------------------------------------
async function renderDashboard() {
    try {
        const [users, tasks, categories] = await Promise.all([
            adminApiFetch('/users'),
            adminApiFetch('/tasks/all'),
            adminApiFetch('/categories/all')
        ]);

        const totalUsers = users.length;
        const totalTasks = tasks.length;
        // Обчислення кількості виконаних та невиконаних завдань
        const completedTasks = tasks.filter(t => t.Status === 'Виконане').length; 
        const uncompletedTasks = totalTasks - completedTasks;
        const totalCategories = categories.length;

        dashInfo.innerHTML = `
            <div class="inf_div">
                <p class="name_inf no_m">Користувачів: </p>
                <p class="inf_p no_m">${totalUsers}</p>
            </div>
            <div class="inf_div">   
                <p class="name_inf no_m">Завдань (заг.): </p>
                <p class="inf_p no_m">${totalTasks}</p>
            </div>
            <div class="inf_div">
                <p class="name_inf no_m">Виконаних зав.: </p>
                <p class="inf_p no_m">${completedTasks}</p>
            </div>
            <div class="inf_div">
                <p class="name_inf no_m">Невиконаних зав.: </p>
                <p class="inf_p no_m">${uncompletedTasks}</p>
            </div>
            <div class="inf_div">
                <p class="name_inf no_m">Категорій: </p>
                <p class="inf_p no_m">${totalCategories}</p>
            </div>
            `;
        // ...
    } catch (error) {
        // ...
    }
}

// -----------------------------------------------------------------
// --- 2. USERS LOGIC (Оновлено для API) ---
// -----------------------------------------------------------------
async function renderUsers(keyword = '') {
    try {
        const allUsers = await adminApiFetch('/users');
        usersInfo.innerHTML = '';
        const currentUserId = getCurrentUserId();

        let filteredUsers = allUsers;
        if (keyword) {
            const lowerKeyword = keyword.toLowerCase();
            filteredUsers = allUsers.filter(user => 
                user.Email.toLowerCase().includes(lowerKeyword) || 
                String(user.id).includes(lowerKeyword) ||
                user.name.toLowerCase().includes(lowerKeyword)
            );
        }
        
        filteredUsers.forEach(user => {
            const isAdmin = user.Role === 'admin';
            const canDelete = !isAdmin && user.id !== currentUserId;
            
            usersInfo.innerHTML += `
                <div class="user_div">
                    <p class="inf_u">ID: ${user.id}</p>
                    <p class="inf_u">Name: ${user.name}</p>
                    <p class="inf_u">Email: ${user.Email}</p>
                    <button class="delete_btn_u" data-id="${user.id}" ${!canDelete ? 'disabled' : ''} style="background-color: ${isAdmin ? '#FF9800' : 'red'}; color: white;">
                        ${isAdmin ? 'Адмін' : 'Видалити'}
                    </button>
                </div>
            `;
        });

        usersInfo.querySelectorAll('.delete_btn_u').forEach(btn => {
            if (!btn.disabled) {
                btn.addEventListener('click', deleteUser);
            }
        });

    } catch (error) {
        console.error('Error rendering users:', error);
        usersInfo.innerHTML = `<p class="error_msg">Помилка завантаження користувачів: ${error.message}</p>`;
    }
}

async function deleteUser(event) {
    const userIdToDelete = event.target.dataset.id;
    
    if (!confirm(`Ви впевнені, що хочете видалити користувача з ID: ${userIdToDelete}? Це видалить усі його завдання.`)) return;

    try {
        await adminApiFetch(`/users/${userIdToDelete}`, { method: 'DELETE' });
        alert('Користувача та його завдання видалено.');
        renderUsers(usersSearchInput.value); // Оновлюємо список

    } catch (error) {
        console.error('Error deleting user:', error);
        alert(error.message || 'Помилка при видаленні користувача.');
    }
}

// -----------------------------------------------------------------
// --- 3. TASKS LOGIC (Оновлено для API) ---
// -----------------------------------------------------------------

let allAdminCategories = []; // Зберігаємо категорії для модального вікна

async function populateTaskSelects() {
    taskInputPriority.innerHTML = PRIORITIES.map(p => `<option value="${p}">${p}</option>`).join('');
    taskInputCompleted.innerHTML = COMPLETION_STATUSES.map(s => `<option value="${s.value}">${s.text}</option>`).join('');
    
    try {
        const categories = await adminApiFetch('/categories/all');
        allAdminCategories = categories;
        taskInputCategory.innerHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    } catch (error) {
        console.error('Error fetching categories for task modal:', error);
    }
}

async function openTaskModal(taskId) {
    await populateTaskSelects(); // Завантажуємо категорії
    
    taskModalBackground.classList.add('active'); 
    editingTaskId = taskId;

    try {
        // Отримуємо всі завдання, потім знаходимо потрібне
        const allTasks = await adminApiFetch('/tasks/all');
        const task = allTasks.find(t => String(t.id) === String(taskId));

        if (task) {
            taskInputName.value = task.Title;
            taskInputDeadline.value = task.DueDate ? new Date(task.DueDate).toISOString().substring(0, 10) : '';
            taskInputPriority.value = task.Priority;
            taskInputCompleted.value = task.Status; 
            
            // Знаходимо CategoryID за назвою
            const category = allAdminCategories.find(c => c.name === task.Category);
            if (category) {
                taskInputCategory.value = category.id;
            }
        }
    } catch (error) {
        console.error('Error loading task for modal:', error);
        alert('Помилка завантаження даних завдання.');
        closeTaskModal();
    }
}

function closeTaskModal() {
    taskModalBackground.classList.remove('active');
    editingTaskId = null;
}

async function saveEditedTask() {
    if (!editingTaskId) return;

    const category = allAdminCategories.find(c => String(c.id) === taskInputCategory.value);

    const updatedData = {
        title: taskInputName.value.trim(),
        due_date: taskInputDeadline.value,
        priority: taskInputPriority.value,
        status_name: taskInputCompleted.value,
        category_id: parseInt(taskInputCategory.value),
    };
    
    if (!updatedData.title) {
        alert("Назва завдання не може бути порожньою!");
        return;
    }

    try {
        await adminApiFetch(`/tasks/${editingTaskId}`, {
            method: 'PUT',
            body: JSON.stringify(updatedData)
        });
        
        alert('Завдання успішно оновлено.');
        closeTaskModal();
        renderAdminTasks(tasksSearchInput.value); // Оновлюємо список
    } catch (error) {
        console.error('Error saving task:', error);
        alert(error.message || 'Помилка при збереженні завдання.');
    }
}

function editAdminTask(event) {
    const id = event.target.dataset.id;
    openTaskModal(id);
}

async function renderAdminTasks(keyword = '') {
    try {
        const tasks = await adminApiFetch('/tasks/all');
        tasksInfo.innerHTML = '';
        
        let filteredTasks = tasks;
        if (keyword) {
            const lowerKeyword = keyword.toLowerCase();
            
            filteredTasks = tasks.filter(task => {
                return task.Title.toLowerCase().includes(lowerKeyword) ||
                       task.UserName.toLowerCase().includes(lowerKeyword);
            });
        }

        filteredTasks.forEach(task => {
            const isCompleted = task.Status === 'Виконане';

            tasksInfo.innerHTML += `
                <div class="task_card">
                    <p class="name_p">${task.Title}</p>
                    <p class="inf_p">User: ${task.UserName} (ID: ${task.userId})</p>
                    <p class="inf_p">Deadline: ${task.DueDate || 'N/A'}</p>
                    <p class="inf_p">Priority: ${task.Priority}</p>
                    <p class="inf_p">Status: ${task.Status}</p>
                    <p class="inf_p">Category: ${task.Category}</p>
                    <button class="button_edit" data-id="${task.id}">Редагувати</button>
                    <button class="button_delete" data-id="${task.id}">Видалити</button>
                </div>
            `;
        });
        
        tasksInfo.querySelectorAll('.button_edit').forEach(btn => {
            btn.addEventListener('click', editAdminTask);
        });
        tasksInfo.querySelectorAll('.button_delete').forEach(btn => {
            btn.addEventListener('click', deleteAdminTask);
        });

    } catch (error) {
        console.error('Error rendering admin tasks:', error);
        tasksInfo.innerHTML = `<p class="error_msg">Помилка завантаження завдань: ${error.message}</p>`;
    }
}

async function deleteAdminTask(event) {
    const id = event.target.dataset.id;

    if (!confirm(`Ви впевнені, що хочете видалити завдання з ID: ${id}?`)) return;

    try {
        await adminApiFetch(`/tasks/${id}`, { method: 'DELETE' });
        alert('Завдання видалено адміністратором.');
        renderAdminTasks(tasksSearchInput.value);
    } catch (error) {
        console.error('Error deleting admin task:', error);
        alert(error.message || 'Помилка при видаленні завдання.');
    }
}

// -----------------------------------------------------------------
// --- 4. CATEGORIES LOGIC (Оновлено для API) ---
// -----------------------------------------------------------------

async function renderCategories(keyword = '') {
    try {
        const categories = await adminApiFetch('/categories/all');
        categoryInfo.innerHTML = '';
        
        let filteredCategories = categories;
        if (keyword) {
            const lowerKeyword = keyword.toLowerCase();
            filteredCategories = categories.filter(cat => 
                cat.name.toLowerCase().includes(lowerKeyword)
            );
        }

        filteredCategories.forEach(cat => {
            const isGeneral = cat.name === 'Інше';
            const canDelete = !isGeneral;

            categoryInfo.innerHTML += `
                <div class="task_card">
                    <p class="name_p">${cat.name}</p>
                    <p class="inf_p">Завдань: ${cat.taskCount}</p>
                    <button class="button_edit" data-id="${cat.id}" data-name="${cat.name}">Редагувати</button>
                    <button class="button_delete" data-id="${cat.id}" ${!canDelete ? 'disabled' : ''}>
                        Видалити
                    </button>
                </div>
            `;
        });
        
        categoryInfo.querySelectorAll('.button_edit').forEach(btn => {
            btn.addEventListener('click', editCategory);
        });
        categoryInfo.querySelectorAll('.button_delete').forEach(btn => {
            if (!btn.disabled) {
                btn.addEventListener('click', deleteCategory);
            }
        });

    } catch (error) {
        console.error('Error rendering categories:', error);
        categoryInfo.innerHTML = `<p class="error_msg">Помилка завантаження категорій: ${error.message}</p>`;
    }
}

function openCategoryModal(categoryId = null, name = null) {
    categoryModalBackground.classList.add('active');
    
    if (categoryId && name) {
        editingCategoryId = categoryId;
        categoryModalTitle.textContent = 'Редагувати категорію';
        categoryInputName.value = name;
    } else {
        editingCategoryId = null;
        categoryModalTitle.textContent = 'Додати нову категорію';
        categoryInputName.value = '';
    }
}

function closeCategoryModal() {
    categoryModalBackground.classList.remove('active');
    editingCategoryId = null;
    categoryInputName.value = '';
}

function editCategory(event) {
    const id = event.target.dataset.id;
    const name = event.target.dataset.name;
    openCategoryModal(id, name);
}

async function saveCategory() {
    const name = categoryInputName.value.trim();
    if (!name) {
        alert('Назва категорії не може бути порожньою!');
        return;
    }

    const method = editingCategoryId ? 'PUT' : 'POST';
    const endpoint = editingCategoryId ? `/categories/${editingCategoryId}` : '/categories';
    
    try {
        await adminApiFetch(endpoint, {
            method: method,
            body: JSON.stringify({ name })
        });

        alert(`Категорію успішно ${editingCategoryId ? 'оновлено' : 'додано'}.`);
        closeCategoryModal();
        renderCategories(categorySearchInput.value); 
    } catch (error) {
        console.error('Error saving category:', error);
        alert(error.message || 'Помилка при збереженні категорії.');
    }
}

async function deleteCategory(event) {
    const categoryId = event.target.dataset.id;
    
    if (confirm(`Ви впевнені, що хочете видалити цю категорію? Пов'язані завдання будуть перенесені до "Інше".`)) {
        try {
            await adminApiFetch(`/categories/${categoryId}`, { method: 'DELETE' });
            alert('Категорія успішно видалена.');
            renderCategories(categorySearchInput.value);
        } catch (error) {
            console.error('Error deleting category:', error);
            alert(error.message || 'Помилка при видаленні категорії.');
        }
    }
}


// --- EVENT LISTENERS ---
if (dashbtn) dashbtn.addEventListener('click', () => setActivePanel(dashInfo, dashTitle, renderDashboard));
if (usersbtn) usersbtn.addEventListener('click', () => setActivePanel(usersInfo, usersTitle, renderUsers));
if (tasksbtn) tasksbtn.addEventListener('click', () => setActivePanel(tasksInfo, tasksTitle, renderAdminTasks));
if (categorybtn) categorybtn.addEventListener('click', () => setActivePanel(categoryInfo, categoryTitle, renderCategories));

if (usersSearchInput) usersSearchInput.addEventListener('input', (e) => renderUsers(e.target.value));
if (tasksSearchInput) tasksSearchInput.addEventListener('input', (e) => renderAdminTasks(e.target.value));
if (categorySearchInput) categorySearchInput.addEventListener('input', (e) => renderCategories(e.target.value));

// Обробники для модального вікна категорії
if (addCategoryBtn) addCategoryBtn.addEventListener('click', () => openCategoryModal());
if (saveCategoryBtn) saveCategoryBtn.addEventListener('click', saveCategory);
if (cancelCategoryBtn) cancelCategoryBtn.addEventListener('click', closeCategoryModal);
if (categoryModalBackground) {
    categoryModalBackground.addEventListener('click', (event) => {
        if (event.target === categoryModalBackground) closeCategoryModal();
    });
}

// Обробники для модального вікна завдання
if (saveTaskBtnModal) saveTaskBtnModal.addEventListener('click', saveEditedTask);
if (cancelTaskBtn) cancelTaskBtn.addEventListener('click', closeTaskModal);
if (taskModalBackground) {
    taskModalBackground.addEventListener('click', (event) => {
        if (event.target === taskModalBackground) closeTaskModal();
    });
}


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    // Запускаємо Dashboard після успішної перевірки прав
    if (getAuthToken() && JSON.parse(localStorage.getItem('currentUser'))?.role === 'admin') {
        if (dashbtn) dashbtn.click(); 
    }
});