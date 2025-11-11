// --- ІМІТАЦІЯ БАЗИ ДАНИХ (для localStorage) ---

// Видаляємо статичні масиви USERS_DB, TASKS_DB, CATEGORIES_DB
// Тепер дані читаються виключно з localStorage

function initAdminDB() {
    // ВАЖЛИВО: Перевіряємо та ініціалізуємо лише загальні сховища, якщо вони відсутні
    
    // Ініціалізація загальних сховищ, якщо вони відсутні
    if (!localStorage.getItem('admin_tasks')) {
        localStorage.setItem('admin_tasks', JSON.stringify([]));
    }
    if (!localStorage.getItem('admin_categories')) {
        localStorage.setItem('admin_categories', JSON.stringify([{ name: 'Особисте' }, { name: 'Робота' }, { name: 'Навчання' }, { name: 'Інше' }]));
    }
    // Користувачі ініціалізуються у login.js
}

function getAdminDB(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

function setAdminDB(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getAllUsersWithAdmin() {
    const users = getAdminDB('admin_users');
    const adminUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Використовуємо email як ID, якщо ID відсутній (як зроблено в login.js)
    const adminId = adminUser.id || adminUser.email; 
    
    // Додаємо адміністратора до списку
    const allUsers = [{ id: adminId, name: adminUser.name, email: adminUser.email, role: 'admin' }, ...users];
    return allUsers;
}


// --- CONSTANTS ---
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

// --- ЕЛЕМЕНТИ ДЛЯ КАТЕГОРІЙ ---
const categoryModalBackground = document.getElementById('category-modal-background');
const categoryModalTitle = document.getElementById('category-modal-title');
const categoryInputName = document.getElementById('category-input-name');
const saveCategoryBtn = document.getElementById('save-category-btn');
const cancelCategoryBtn = document.getElementById('cancel-category-btn');
const addCategoryBtn = document.getElementById('add-category-btn');

let editingCategoryName = null; 

// --- ЕЛЕМЕНТИ ДЛЯ ЗАВДАНЬ ---
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
    { value: 'false', text: 'Не виконано' },
    { value: 'true', text: 'Виконано' }
];

// --- HEADER LOGIC ---
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
        if(titleContainer === usersTitle && usersSearchInput) usersSearchInput.value = '';
        if(titleContainer === tasksTitle && tasksSearchInput) tasksSearchInput.value = '';
        if(titleContainer === categoryTitle && categorySearchInput) categorySearchInput.value = '';
        
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
    const allUsers = getAllUsersWithAdmin();
    usersInfo.innerHTML = '';

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

    usersInfo.querySelectorAll('.delete_btn_u').forEach(btn => {
        if (btn.dataset.id !== 'admin') {
            btn.addEventListener('click', deleteUser);
        }
    });
}

function deleteUser(event) {
    const userIdToDelete = event.target.dataset.id;
    let users = getAdminDB('admin_users');
    let tasks = getAdminDB('admin_tasks');
    
    if (!confirm(`Ви впевнені, що хочете видалити користувача з ID: ${userIdToDelete}?`)) return;

    // Видаляємо користувача
    users = users.filter(user => user.id !== userIdToDelete);
    // Видаляємо всі завдання, пов'язані з цим користувачем
    tasks = tasks.filter(task => task.userId !== userIdToDelete);

    setAdminDB('admin_users', users);
    setAdminDB('admin_tasks', tasks);
    renderUsers(usersSearchInput.value);
}

// --- 3. TASKS LOGIC ---

function populateTaskSelects(categories) {
    taskInputPriority.innerHTML = PRIORITIES.map(p => `<option value="${p}">${p}</option>`).join('');
    taskInputCategory.innerHTML = categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    taskInputCompleted.innerHTML = COMPLETION_STATUSES.map(s => `<option value="${s.value}">${s.text}</option>`).join('');
}

function openTaskModal(taskId = null) {
    const tasks = getAdminDB('admin_tasks');
    const categories = getAdminDB('admin_categories');

    populateTaskSelects(categories);
    
    taskModalBackground.classList.add('active'); 

    if (taskId) {
        editingTaskId = taskId;
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            taskInputName.value = task.name;
            taskInputDeadline.value = task.deadline || '';
            taskInputPriority.value = task.priority || PRIORITIES[0];
            taskInputCategory.value = task.category || categories[0].name;
            taskInputCompleted.value = task.completed.toString();
        }
    }
}

function closeTaskModal() {
    taskModalBackground.classList.remove('active');
    editingTaskId = null;
}

function saveEditedTask() {
    if (!editingTaskId) return;

    let tasks = getAdminDB('admin_tasks');
    const taskIndex = tasks.findIndex(t => t.id === editingTaskId);

    if (taskIndex !== -1) {
        if (!taskInputName.value.trim()) {
            alert("Назва завдання не може бути порожньою!");
            return;
        }

        tasks[taskIndex].name = taskInputName.value.trim();
        tasks[taskIndex].deadline = taskInputDeadline.value;
        tasks[taskIndex].priority = taskInputPriority.value;
        tasks[taskIndex].category = taskInputCategory.value;
        tasks[taskIndex].completed = taskInputCompleted.value === 'true';

        setAdminDB('admin_tasks', tasks);
        closeTaskModal();
        renderAdminTasks(tasksSearchInput.value);
    }
}

function editAdminTask(event) {
    const id = Number(event.target.dataset.id);
    openTaskModal(id);
}

function renderAdminTasks(keyword = '') {
    const tasks = getAdminDB('admin_tasks');
    const allUsers = getAllUsersWithAdmin();
    tasksInfo.innerHTML = '';

    let filteredTasks = tasks;
    if (keyword) {
        const lowerKeyword = keyword.toLowerCase();
        
        filteredTasks = tasks.filter(task => {
            const user = allUsers.find(u => u.id === task.userId);
            const userName = user ? user.name : 'Видалений користувач';

            // Пошук за назвою завдання або ім'ям користувача
            return task.name.toLowerCase().includes(lowerKeyword) ||
                   userName.toLowerCase().includes(lowerKeyword);
        });
    }

    filteredTasks.forEach(task => {
        const user = allUsers.find(u => u.id === task.userId);
        const userName = user ? user.name : 'Видалений користувач';
        const userRole = user ? user.role : 'user';


        tasksInfo.innerHTML += `
            <div class="task_card">
                <p class="name_p">${task.name}</p>
                <p class="inf_p">User: ${userName} (${userRole})</p>
                <p class="inf_p">Deadline: ${task.deadline || 'N/A'}</p>
                <p class="inf_p">Priority: ${task.priority || 'N/A'}</p>
                <p class="inf_p">Status: ${task.completed ? 'Виконано' : 'Не виконано'}</p>
                <p class="inf_p">Category: ${task.category || 'N/A'}</p>
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
}

function deleteAdminTask(event) {
    const id = Number(event.target.dataset.id);
    let tasks = getAdminDB('admin_tasks');

    if (!confirm(`Ви впевнені, що хочете видалити завдання з ID: ${id}?`)) return;

    tasks = tasks.filter(task => task.id !== id);
    setAdminDB('admin_tasks', tasks);
    renderAdminTasks(tasksSearchInput.value);
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
                <button class="button_edit" data-name="${cat.name}">Редагувати</button>
                <button class="button_delete" data-name="${cat.name}">Видалити</button>
            </div>
        `;
    });
    
    categoryInfo.querySelectorAll('.button_edit').forEach(btn => {
        btn.addEventListener('click', editCategory);
    });
    categoryInfo.querySelectorAll('.button_delete').forEach(btn => {
        btn.addEventListener('click', deleteCategory);
    });
}

function openCategoryModal(name = null) {
    categoryModalBackground.classList.add('active');
    if (name) {
        editingCategoryName = name;
        categoryModalTitle.textContent = 'Редагувати категорію';
        categoryInputName.value = name;
    } else {
        editingCategoryName = null;
        categoryModalTitle.textContent = 'Додати нову категорію';
        categoryInputName.value = '';
    }
}

function closeCategoryModal() {
    categoryModalBackground.classList.remove('active');
    editingCategoryName = null;
    categoryInputName.value = '';
}

function editCategory(event) {
    const name = event.target.dataset.name;
    openCategoryModal(name);
}

function saveCategory() {
    const newName = categoryInputName.value.trim();
    if (!newName) {
        alert('Назва категорії не може бути порожньою!');
        return;
    }

    let categories = getAdminDB('admin_categories');
    let tasks = getAdminDB('admin_tasks');

    if (editingCategoryName) {
        // Редагування
        const oldName = editingCategoryName;
        
        if (oldName !== newName && categories.some(cat => cat.name === newName)) {
            alert('Категорія з такою назвою вже існує!');
            return;
        }

        categories = categories.map(cat => {
            if (cat.name === oldName) {
                return { ...cat, name: newName };
            }
            return cat;
        });

        tasks = tasks.map(task => {
            if (task.category === oldName) {
                return { ...task, category: newName };
            }
            return task;
        });

    } else {
        // Додавання
        if (categories.some(cat => cat.name === newName)) {
            alert('Категорія з такою назвою вже існує!');
            return;
        }
        categories.push({ name: newName, count: 0 });
    }

    setAdminDB('admin_categories', categories);
    setAdminDB('admin_tasks', tasks);
    closeCategoryModal();
    renderCategories(categorySearchInput.value); 
}

function deleteCategory(event) {
    const name = event.target.dataset.name;
    let categories = getAdminDB('admin_categories');
    let tasks = getAdminDB('admin_tasks');
    
    if (name === 'Інше') {
        alert('Категорію "Інше" не можна видалити.');
        return;
    }

    if (confirm(`Ви впевнені, що хочете видалити категорію "${name}"? Завдання, які її використовують, будуть перенесені до "Інше".`)) {
        categories = categories.filter(cat => cat.name !== name);
        tasks = tasks.map(task => {
            if (task.category === name) {
                return { ...task, category: 'Інше' };
            }
            return task;
        });

        setAdminDB('admin_categories', categories);
        setAdminDB('admin_tasks', tasks);
        renderCategories(categorySearchInput.value);
    }
}


// --- EVENT LISTENERS ---
dashbtn.addEventListener('click', () => setActivePanel(dashInfo, dashTitle, renderDashboard));
usersbtn.addEventListener('click', () => setActivePanel(usersInfo, usersTitle, renderUsers));
tasksbtn.addEventListener('click', () => setActivePanel(tasksInfo, tasksTitle, renderAdminTasks));
categorybtn.addEventListener('click', () => setActivePanel(categoryInfo, categoryTitle, renderCategories));

if (usersSearchInput) {
    usersSearchInput.addEventListener('input', (e) => renderUsers(e.target.value));
}
if (tasksSearchInput) {
    tasksSearchInput.addEventListener('input', (e) => renderAdminTasks(e.target.value));
}
if (categorySearchInput) {
    categorySearchInput.addEventListener('input', (e) => renderCategories(e.target.value));
}

// Обробники для модального вікна категорії
if (addCategoryBtn) {
    addCategoryBtn.addEventListener('click', () => openCategoryModal());
}
if (saveCategoryBtn) {
    saveCategoryBtn.addEventListener('click', saveCategory);
}
if (cancelCategoryBtn) {
    cancelCategoryBtn.addEventListener('click', closeCategoryModal);
}
if (categoryModalBackground) {
    categoryModalBackground.addEventListener('click', (event) => {
        if (event.target === categoryModalBackground) {
            closeCategoryModal();
        }
    });
}

// Обробники для модального вікна завдання
if (saveTaskBtnModal) {
    saveTaskBtnModal.addEventListener('click', saveEditedTask);
}
if (cancelTaskBtn) {
    cancelTaskBtn.addEventListener('click', closeTaskModal);
}
if (taskModalBackground) {
    taskModalBackground.addEventListener('click', (event) => {
        if (event.target === taskModalBackground) {
            closeTaskModal();
        }
    });
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initAdminDB(); 
    updateAuthUI();
    dashbtn.click(); 
});