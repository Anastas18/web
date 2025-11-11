// --- ІМІТАЦІЯ БАЗИ ДАНИХ (для localStorage) ---

// Приклад користувачів (Admin тут не потрібен, оскільки він залогінений)
let USERS_DB = [
    { id: 1, name: 'User', email: 'user@tam.com', role: 'user' },
    { id: 2, name: 'Taras Shevchenko', email: 'taras@ua.com', role: 'user' },
    { id: 3, name: 'Lesya Ukrainka', email: 'lesya@ua.com', role: 'user' },
];

// Приклад завдань
let TASKS_DB = [
    { id: 101, userId: 1, name: 'Купити продукти', deadline: '2025-11-15', priority: 'Високий', category: 'Особисте', completed: false },
    { id: 102, userId: 1, name: 'Написати звіт', deadline: '2025-11-12', priority: 'Середній', category: 'Робота', completed: true },
    { id: 103, userId: 2, name: 'Вивчити JS', deadline: '2025-12-01', priority: 'Високий', category: 'Навчання', completed: false },
    { id: 104, userId: 3, name: 'Відповісти на пошту', deadline: '2025-11-11', priority: 'Низький', category: 'Робота', completed: true },
];

// Приклад категорій
let CATEGORIES_DB = [
    { name: 'Особисте', count: 0 },
    { name: 'Робота', count: 0 },
    { name: 'Навчання', count: 0 },
    { name: 'Інше', count: 0 },
];

function initAdminDB() {
    if (!localStorage.getItem('admin_users')) {
        localStorage.setItem('admin_users', JSON.stringify(USERS_DB));
    }
    if (!localStorage.getItem('admin_tasks')) {
        localStorage.setItem('admin_tasks', JSON.stringify(TASKS_DB));
    }
    if (!localStorage.getItem('admin_categories')) {
        localStorage.setItem('admin_categories', JSON.stringify(CATEGORIES_DB));
    }
}

function getAdminDB(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

function setAdminDB(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// --- CONSTANTS ---
const burgerMenu = document.getElementById('burger-menu'); // Залишаємо для коректної роботи
const navMenu = document.querySelector('.under_p_service_u'); 
const guestMenu = document.querySelector('.under_p_service_g');

const userPanel = document.querySelector('.user_panel');
const adminPanel = document.querySelector('.admin_div');
const userNameDisplay = document.getElementById('name_u_footer');
const adminLink = document.querySelector('.admin_a');
const logoutButton = document.querySelector('.button_logout');

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


// --- HEADER LOGIC (Залишаємо для захисту сторінки) ---
function updateAuthUI() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const isLoggedIn = !!user;

    if (isLoggedIn && user.role === 'admin') {
        guestMenu.style.display = 'none';
        navMenu.style.display = 'flex'; 
        userNameDisplay.textContent = user.name;
        adminLink.style.display = 'block'; 
    } else {
        alert('У вас немає прав доступу до панелі адміністратора. Перенаправлення на головну.');
        window.location.href = 'index.html'; 
        return;
    }
    
    // Ігноруємо логіку бургер-меню, як ви просили.
}

if (userPanel && adminPanel) {
    userPanel.addEventListener('click', () => { adminPanel.classList.toggle('active'); });
    window.addEventListener('click', (event) => {
        if (!userPanel.contains(event.target) && !adminPanel.contains(event.target)) {
            adminPanel.classList.remove('active');
        }
    });
}

if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html'; 
    });
}


// --- PANEL NAVIGATION LOGIC ---
function hideAllPanels() {
    [dashTitle, usersTitle, tasksTitle, categoryTitle].forEach(el => el.style.display = 'none');
    [dashInfo, usersInfo, tasksInfo, categoryInfo].forEach(el => el.style.display = 'none');
}

function setActivePanel(infoContainer, titleContainer, renderFunction) {
    hideAllPanels();
    titleContainer.style.display = 'flex';
    infoContainer.style.display = 'flex';
    if (renderFunction) {
        renderFunction(); 
    }
}

// --- 1. DASHBOARD LOGIC ---
function renderDashboard() {
    const users = getAdminDB('admin_users');
    const tasks = getAdminDB('admin_tasks');
    const categories = getAdminDB('admin_categories');

    const totalUsers = users.length + 1; // +1 для самого адміністратора
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
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
}

// --- 2. USERS LOGIC ---
function renderUsers(keyword = '') {
    const users = getAdminDB('admin_users');
    usersInfo.innerHTML = '';
    
    // Додаємо адміністратора до списку
    const adminUser = JSON.parse(localStorage.getItem('currentUser'));
    const allUsers = [{ id: 'admin', name: adminUser.name, email: adminUser.email, role: 'admin' }, ...users];

    let filteredUsers = allUsers;
    if (keyword) {
        const lowerKeyword = keyword.toLowerCase();
        filteredUsers = allUsers.filter(user => 
            user.email.toLowerCase().includes(lowerKeyword) || 
            String(user.id).includes(lowerKeyword)
        );
    }
    
    filteredUsers.forEach(user => {
        usersInfo.innerHTML += `
            <div class="user_div">
                <p class="inf_u">ID: ${user.id}</p>
                <p class="inf_u">Name: ${user.name}</p>
                <p class="inf_u">Email: ${user.email}</p>
                <button class="delete_btn_u" data-id="${user.id}" ${user.role === 'admin' ? 'disabled' : ''}>
                    ${user.role === 'admin' ? 'Адмін' : 'Видалити'}
                </button>
            </div>
        `;
    });

    // Додаємо обробники для видалення
    usersInfo.querySelectorAll('.delete_btn_u').forEach(btn => {
        if (btn.dataset.id !== 'admin') {
            btn.addEventListener('click', deleteUser);
        }
    });
}

function deleteUser(event) {
    const id = Number(event.target.dataset.id);
    let users = getAdminDB('admin_users');
    let tasks = getAdminDB('admin_tasks');

    // Видаляємо користувача
    users = users.filter(user => user.id !== id);
    // Видаляємо всі завдання, пов'язані з цим користувачем
    tasks = tasks.filter(task => task.userId !== id);

    setAdminDB('admin_users', users);
    setAdminDB('admin_tasks', tasks);
    renderUsers();
}

// --- 3. TASKS LOGIC ---
function renderAdminTasks(keyword = '') {
    const tasks = getAdminDB('admin_tasks');
    const users = getAdminDB('admin_users');
    tasksInfo.innerHTML = '';

    let filteredTasks = tasks;
    if (keyword) {
        const lowerKeyword = keyword.toLowerCase();
        // Пошук за ім'ям користувача, якому належить завдання
        filteredTasks = tasks.filter(task => {
            const user = users.find(u => u.id === task.userId);
            return user && user.name.toLowerCase().includes(lowerKeyword);
        });
    }

    filteredTasks.forEach(task => {
        const user = users.find(u => u.id === task.userId);
        const userName = user ? user.name : 'Видалений користувач';

        tasksInfo.innerHTML += `
            <div class="task_card">
                <p class="name_p">${task.name}</p>
                <p class="inf_p">User: ${userName}</p>
                <p class="inf_p">Deadline: ${task.deadline || 'N/A'}</p>
                <p class="inf_p">Priority: ${task.priority || 'N/A'}</p>
                <p class="inf_p">Status: ${task.completed ? 'Виконано' : 'Не виконано'}</p>
                <p class="inf_p">Сategory: ${task.category || 'N/A'}</p>
                <button class="button_delete" data-id="${task.id}">Видалити</button>
            </div>
        `;
    });
    
    // Додаємо обробники для видалення
    tasksInfo.querySelectorAll('.button_delete').forEach(btn => {
        btn.addEventListener('click', deleteAdminTask);
    });
}

function deleteAdminTask(event) {
    const id = Number(event.target.dataset.id);
    let tasks = getAdminDB('admin_tasks');
    tasks = tasks.filter(task => task.id !== id);
    setAdminDB('admin_tasks', tasks);
    renderAdminTasks();
}

// --- 4. CATEGORIES LOGIC ---
function renderCategories(keyword = '') {
    const categories = getAdminDB('admin_categories');
    const tasks = getAdminDB('admin_tasks');
    categoryInfo.innerHTML = '';

    let filteredCategories = categories;
    if (keyword) {
        const lowerKeyword = keyword.toLowerCase();
        filteredCategories = categories.filter(cat => 
            cat.name.toLowerCase().includes(lowerKeyword)
        );
    }

    filteredCategories.forEach(cat => {
        const taskCount = tasks.filter(t => t.category === cat.name).length;

        categoryInfo.innerHTML += `
            <div class="task_card">
                <p class="name_p">${cat.name}</p>
                <p class="inf_p">Завдань: ${taskCount}</p>
                <button class="button_delete" data-name="${cat.name}">Видалити</button>
            </div>
        `;
    });
    
    // Додаємо обробники для видалення
    categoryInfo.querySelectorAll('.button_delete').forEach(btn => {
        btn.addEventListener('click', deleteCategory);
    });
}

function deleteCategory(event) {
    const name = event.target.dataset.name;
    let categories = getAdminDB('admin_categories');
    let tasks = getAdminDB('admin_tasks');
    
    if (confirm(`Ви впевнені, що хочете видалити категорію "${name}"? Завдання, які її використовують, будуть перенесені до "Інше".`)) {
        // Видаляємо категорію
        categories = categories.filter(cat => cat.name !== name);
        // Переносимо завдання до "Інше"
        tasks = tasks.map(task => {
            if (task.category === name) {
                return { ...task, category: 'Інше' };
            }
            return task;
        });

        setAdminDB('admin_categories', categories);
        setAdminDB('admin_tasks', tasks);
        renderCategories();
    }
}


// --- EVENT LISTENERS ---
dashbtn.addEventListener('click', () => setActivePanel(dashInfo, dashTitle, renderDashboard));
usersbtn.addEventListener('click', () => setActivePanel(usersInfo, usersTitle, renderUsers));
tasksbtn.addEventListener('click', () => setActivePanel(tasksInfo, tasksTitle, renderAdminTasks));
categorybtn.addEventListener('click', () => setActivePanel(categoryInfo, categoryTitle, renderCategories));

// Пошук користувачів
if (usersSearchInput) {
    usersSearchInput.addEventListener('input', (e) => renderUsers(e.target.value));
}
// Пошук завдань
if (tasksSearchInput) {
    tasksSearchInput.addEventListener('input', (e) => renderAdminTasks(e.target.value));
}
// Пошук категорій
if (categorySearchInput) {
    categorySearchInput.addEventListener('input', (e) => renderCategories(e.target.value));
}


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initAdminDB(); 
    updateAuthUI();
    dashbtn.click(); // Встановлюємо Дашборд як активний
});