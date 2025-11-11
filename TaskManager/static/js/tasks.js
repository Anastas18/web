// --- Global State ---
// УВАГА: Завдання тепер фільтруються за ID користувача, і зберігаються під спільним ключем 'admin_tasks'
const getCurrentUserId = () => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    // Використовуємо id користувача, що зберігається при логіні
    return user ? (user.id || user.email) : 'guest'; 
}

const taskContainer = document.querySelector('.tasks_cards');

// Отримання полів форми за ID
const taskDeadlineInput = document.getElementById('task-deadline-input');
const taskPrioritySelect = document.getElementById('task-priority-select');
const taskCategorySelect = document.getElementById('task-category-select');
const taskNameInput = document.querySelector('.add_task [type="text"]');
const saveTaskBtn = document.querySelector('.add_task .button_save_card');

// Списки для вибору
const PRIORITIES = ['Низький', 'Середній', 'Високий'];

// --- НОВИЙ СТАН РЕДАГУВАННЯ ---
let editingTaskId = null; 

// --- Header Logic (Збережено лише необхідний мінімум для функціоналу) ---
const navMenu = document.querySelector('.under_p_service_u'); 
const guestMenu = document.querySelector('.under_p_service_g');
const userPanel = document.querySelector('.user_panel');
const adminPanel = document.querySelector('.admin_div');
const userNameDisplay = document.getElementById('name_u_footer');
const adminLink = document.querySelector('.admin_a');
const logoutButton = document.querySelector('.button_logout');

function redirectToLogin() {
    window.location.href = 'loginsignup.html';
}

function updateAuthUI() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const isLoggedIn = !!user;

    navMenu.classList.remove('active');
    guestMenu.classList.remove('active');

    if (isLoggedIn) {
        guestMenu.style.display = 'none';
        navMenu.style.display = 'flex'; 
        userNameDisplay.textContent = user.name;

        if (user.role === 'admin') {
            adminLink.style.display = 'block'; 
        } else {
            adminLink.style.display = 'none'; 
        }
        
        renderTasks();
    } else {
        alert('Для доступу до завдань потрібно авторизуватися.');
        redirectToLogin(); 
    }
}

// Випадаюче меню адміна та Вийти (залишається без змін)
if (userPanel && adminPanel) {
    userPanel.addEventListener('click', (event) => {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user && user.role === 'admin') {
            adminPanel.classList.toggle('active');
        }
    });

    window.addEventListener('click', (event) => {
        if (!userPanel.contains(event.target) && !adminPanel.contains(event.target)) {
            adminPanel.classList.remove('active');
        }
    });
}

if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        updateAuthUI();
        window.location.href = 'index.html'; 
    });
}

// ----------------------------------------------------------------------
// --- Task Management Logic (Оновлено для синхронізації) ---
// ----------------------------------------------------------------------

function getTasksForCurrentUser() {
    const allTasks = JSON.parse(localStorage.getItem('admin_tasks')) || [];
    const userId = getCurrentUserId();
    // Фільтруємо завдання, показуючи тільки ті, що належать поточному користувачу
    return allTasks.filter(task => task.userId === userId);
}

function saveTask(newTaskData = null, taskIdToRemove = null) {
    const allTasks = JSON.parse(localStorage.getItem('admin_tasks')) || [];
    let updatedTasks = [...allTasks];
    const userId = getCurrentUserId();
    const isNew = !newTaskData || !newTaskData.isEdit;

    if (taskIdToRemove) {
        // Видалення завдання
        updatedTasks = updatedTasks.filter(task => task.id !== taskIdToRemove);
    } 
    
    if (newTaskData) {
        if (newTaskData.isEdit) {
             // Редагування існуючого завдання
             const index = updatedTasks.findIndex(t => t.id === newTaskData.id && t.userId === userId);
             if (index !== -1) {
                 updatedTasks[index] = { ...updatedTasks[index], ...newTaskData };
                 delete updatedTasks[index].isEdit;
             }
        } else {
            // Додавання нового завдання
            const newTask = { 
                ...newTaskData, 
                id: Date.now(), 
                userId: userId, // Додаємо ID користувача
                completed: false 
            };
            updatedTasks.push(newTask);
        }
    }

    localStorage.setItem('admin_tasks', JSON.stringify(updatedTasks));
    return updatedTasks.filter(task => task.userId === userId); // Повертаємо лише завдання користувача
}

function renderTasks(filter = 'all', keyword = '') {
    let tasks = getTasksForCurrentUser();
    taskContainer.innerHTML = '';
    
    let filteredTasks = tasks;

    // 1. Пошук за назвою
    if (keyword) {
        const normalizedKeyword = keyword.toLowerCase();
        filteredTasks = filteredTasks.filter(task => 
            task.name.toLowerCase().includes(normalizedKeyword)
        );
    }
    
    // 2. Фільтрація
    switch (filter) {
        case 'priority':
            const priorityOrder = { 'Високий': 3, 'Середній': 2, 'Низький': 1 };
            filteredTasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
            break;
        case 'completed':
            filteredTasks = filteredTasks.filter(task => task.completed);
            break;
        case 'uncompleted':
            filteredTasks = filteredTasks.filter(task => !task.completed);
            break;
        case 'newest':
        default:
            filteredTasks.sort((a, b) => b.id - a.id);
            break;
    }


    if (filteredTasks.length === 0) {
        taskContainer.innerHTML = '<p style="color:#3B82F6; font-size:20px; width:100%; text-align:center; padding: 40px;">Завдань не знайдено.</p>';
        return;
    }


    filteredTasks.forEach(task => {
        const card = document.createElement('div');
        card.classList.add('task_card');
        if (task.completed) {
            card.style.opacity = '0.6';
            card.style.backgroundColor = '#e0f7fa';
        }

        const completeText = task.completed ? 'Скасувати' : 'Виконано';
        const completeClass = task.completed ? 'button_uncomplete' : 'button_complete';
        
        card.innerHTML = `
            <p class="name_p" style="text-decoration: ${task.completed ? 'line-through' : 'none'};">${task.name}</p>
            <p class="inf_p">Deadline: ${task.deadline || 'N/A'}</p>
            <p class="inf_p">Priority: ${task.priority || 'N/A'}</p>
            <p class="inf_p">Category: ${task.category || 'N/A'}</p>
            <button class="${completeClass} button_edit" data-id="${task.id}">${completeText}</button>
            <button class="button_edit" data-id="${task.id}">Редагувати</button>
            <button class="button_delete" data-id="${task.id}">Видалити</button>
        `;
        taskContainer.appendChild(card);
    });

    // Додаємо обробники подій для кнопок
    taskContainer.querySelectorAll('.button_delete').forEach(btn => {
        btn.addEventListener('click', deleteTask);
    });
    taskContainer.querySelectorAll('.button_complete, .button_uncomplete').forEach(btn => {
        btn.addEventListener('click', toggleCompleteTask);
    });
    taskContainer.querySelectorAll('.button_edit[data-id]').forEach(btn => {
        if (btn.textContent === 'Редагувати') {
             btn.addEventListener('click', openTaskModalForEdit);
        }
    });
}

// Функції керування завданнями
function addTask(name, deadline, priority, category) {
    const newTaskData = { name, deadline, priority, category };
    saveTask(newTaskData);
    renderTasks();
}

function editTask(id, name, deadline, priority, category) {
    const updatedData = { 
        id, 
        name, 
        deadline, 
        priority, 
        category,
        isEdit: true
    };
    saveTask(updatedData);
    renderTasks();
}

function deleteTask(event) {
    const id = Number(event.target.dataset.id);
    saveTask(null, id);
    renderTasks();
}

function toggleCompleteTask(event) {
    const id = Number(event.target.dataset.id);
    const userId = getCurrentUserId();
    
    // Отримуємо повний масив і оновлюємо
    const allTasks = JSON.parse(localStorage.getItem('admin_tasks')) || [];
    const globalIndex = allTasks.findIndex(t => t.id === id && t.userId === userId);
    
    if (globalIndex !== -1) {
         allTasks[globalIndex].completed = !allTasks[globalIndex].completed;
         localStorage.setItem('admin_tasks', JSON.stringify(allTasks));
         renderTasks();
    }
}


// ----------------------------------------------------------------------
// --- Modal Windows and Forms Logic ---
// ----------------------------------------------------------------------

function populateSelects() {
    // 1. Пріоритет
    taskPrioritySelect.innerHTML = PRIORITIES.map(p => `<option value="${p}">${p}</option>`).join('');

    // 2. Категорії 
    const categories = JSON.parse(localStorage.getItem('admin_categories')) || [{name:'Особисте'}, {name:'Робота'}, {name:'Навчання'}, {name:'Інше'}];
    taskCategorySelect.innerHTML = categories.map(c => `<option value="${c.name}">${c.name}</option>`).join(''); 
}


// Add Task Modal
const addTaskBack = document.querySelector('.add_task_background');
const addTaskModal = document.querySelector('.add_task');
const addTaskBtn = document.querySelector('.button_add');


// Режим додавання
addTaskBtn.addEventListener('click', () => {
    addTaskBack.classList.add('active');
    editingTaskId = null; // Скидаємо режим редагування
    
    // Очищення полів форми та встановлення значень за замовчуванням
    taskNameInput.value = ''; 
    if (taskDeadlineInput) taskDeadlineInput.value = '';
    
    populateSelects();
    saveTaskBtn.textContent = 'Зберегти';
});

// Режим редагування
function openTaskModalForEdit(event) {
    const id = Number(event.target.dataset.id);
    const tasks = getTasksForCurrentUser();
    const task = tasks.find(t => t.id === id);

    if (task) {
        editingTaskId = id;
        addTaskBack.classList.add('active'); 
        
        // Заповнення полів форми даними завдання
        taskNameInput.value = task.name;
        if (taskDeadlineInput) taskDeadlineInput.value = task.deadline || '';

        // Заповнення select-ів
        populateSelects();
        if (taskPrioritySelect) taskPrioritySelect.value = task.priority || PRIORITIES[0];
        if (taskCategorySelect) taskCategorySelect.value = task.category || 'Інше';

        // Оновлення тексту кнопки
        saveTaskBtn.textContent = 'Зберегти зміни';
    }
}

// Кнопка Зберегти/Редагувати Завдання
saveTaskBtn.addEventListener('click', () => {
    
    const name = taskNameInput ? taskNameInput.value.trim() : '';
    const deadline = taskDeadlineInput ? taskDeadlineInput.value : '';
    const priority = taskPrioritySelect ? taskPrioritySelect.value : 'N/A';
    const category = taskCategorySelect ? taskCategorySelect.value : 'N/A';

    if (name) {
        if (editingTaskId) {
            // РЕЖИМ РЕДАГУВАННЯ
            editTask(editingTaskId, name, deadline, priority, category);
        } else {
            // РЕЖИМ ДОДАВАННЯ
            addTask(name, deadline, priority, category);
        }
        addTaskBack.classList.remove('active');
    } else {
        alert('Назва завдання є обов\'язковою!');
    }
});

// Closing Add/Edit Task Modal (Outside click)
window.addEventListener('click', (event) => {
    if (addTaskBtn.contains(event.target)) return; 
    if (!addTaskModal.contains(event.target) && addTaskBack.classList.contains('active')) {
        addTaskBack.classList.remove('active');
        saveTaskBtn.textContent = 'Зберегти'; // Скидаємо текст кнопки при закритті
    }
});


// Add Category Modal (Оновлюємо логіку додавання категорії)
const addCategoryBackground = document.querySelector('.add_category_background');
const addCategoryModal = document.querySelector('.add_category');
const buttonCategory = document.querySelector('.button_category');
const saveCategoryBtnModal = addCategoryModal.querySelector('.button_save_card'); 
const categoryInput = addCategoryModal.querySelector('.inout_add_card'); 

buttonCategory.addEventListener('click', () => {
    addCategoryBackground.classList.add('active');
    categoryInput.value = ''; 
});

// Збереження нової категорії
if (saveCategoryBtnModal) {
    saveCategoryBtnModal.addEventListener('click', () => {
        const newCategory = categoryInput.value.trim();
        let categories = JSON.parse(localStorage.getItem('admin_categories')) || [];

        if (newCategory && !categories.some(c => c.name === newCategory)) {
            categories.push({ name: newCategory, count: 0 }); // Додаємо як об'єкт
            localStorage.setItem('admin_categories', JSON.stringify(categories));
            populateSelects(); 
            addCategoryBackground.classList.remove('active');
        } else if (categories.some(c => c.name === newCategory)) {
            alert('Така категорія вже існує!');
        } else {
            alert('Введіть назву категорії.');
        }
    });
}

// Closing Add Category Modal (Outside click)
window.addEventListener('click', (event) => {
    if (buttonCategory.contains(event.target)) return; 
    if (!addCategoryModal.contains(event.target) && addCategoryBackground.classList.contains('active')) {
        addCategoryBackground.classList.remove('active');
    }
});


// ----------------------------------------------------------------------
// --- Filter and Search Logic ---
// ----------------------------------------------------------------------

const searchInput = document.querySelector('.input_p');
const filterBtn = document.getElementById('filter-toggle-btn');
const filterMenu = document.getElementById('filter-menu');
const filterArrow = filterBtn ? filterBtn.querySelector('.arrow-down') : null;


// Фільтр: Відкриття/Закриття
if (filterBtn && filterMenu) {
    filterBtn.addEventListener('click', (event) => {
        filterMenu.classList.toggle('show');
        if (filterArrow) filterArrow.classList.toggle('rotated');
        event.stopPropagation();
    });
    
    // Закриття фільтра по кліку поза ним
    window.addEventListener('click', (event) => {
        if (!filterBtn.contains(event.target) && !filterMenu.contains(event.target)) {
            if (filterMenu.classList.contains('show')) {
                filterMenu.classList.remove('show');
                if (filterArrow) filterArrow.classList.remove('rotated');
            }
        }
    });

    // Фільтр: Обробка вибору
    filterMenu.addEventListener('click', (event) => {
        if (event.target.classList.contains('dropdown-item')) {
            event.preventDefault();
            const filterType = event.target.dataset.filter;
            const filterName = event.target.textContent;

            document.querySelector('.p_filtr').dataset.filter = filterType;
            document.querySelector('.p_filtr').textContent = filterName;

            let currentKeyword = searchInput ? searchInput.value : '';
            
            // Викликаємо renderTasks з новим типом фільтрації
            if (['completed', 'uncompleted', 'priority', 'newest'].includes(filterType)) {
                renderTasks(filterType, currentKeyword);
            } else {
                renderTasks('all', currentKeyword); 
            }

            filterMenu.classList.remove('show');
            if (filterArrow) filterArrow.classList.remove('rotated');
        }
    });
}

// Пошук: Обробка вводу
if (searchInput) {
    searchInput.addEventListener('input', () => {
        const currentFilter = document.querySelector('.p_filtr').dataset.filter || 'all';
        renderTasks(currentFilter, searchInput.value);
    });
}

// Ініціалізація стану при завантаженні сторінки
document.addEventListener('DOMContentLoaded', updateAuthUI);