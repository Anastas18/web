// --- Global State ---
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
const taskContainer = document.querySelector('.tasks_cards');

// Отримання полів форми за ID
const taskDeadlineInput = document.getElementById('task-deadline-input');
const taskPrioritySelect = document.getElementById('task-priority-select');
const taskCategorySelect = document.getElementById('task-category-select');

// Списки для вибору
const PRIORITIES = ['Низький', 'Середній', 'Високий'];
// В ідеалі категорії мають завантажуватися з localStorage, але для прикладу:
let CATEGORIES = JSON.parse(localStorage.getItem('categories')) || ['Особисте', 'Робота', 'Навчання', 'Інше'];


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
// --- Task Management Logic ---
// ----------------------------------------------------------------------

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks(filter = 'all', keyword = '') {
    taskContainer.innerHTML = '';
    
    let filteredTasks = tasks;

    // 1. Пошук за назвою
    if (keyword) {
        const normalizedKeyword = keyword.toLowerCase();
        filteredTasks = filteredTasks.filter(task => 
            task.name.toLowerCase().includes(normalizedKeyword)
        );
    }
    
    // 2. Фільтрація (Тут ми використовуємо 'priority' як ознаку сортування за важливістю)
    switch (filter) {
        case 'priority':
            // Сортування: Високий > Середній > Низький
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
            // Сортування за датою створення (найновіші нагорі)
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
            <button class="button_delete" data-id="${task.id}">Видалити</button>
        `;
        taskContainer.appendChild(card);
    });

    // Додаємо обробники подій для нових кнопок
    taskContainer.querySelectorAll('.button_delete').forEach(btn => {
        btn.addEventListener('click', deleteTask);
    });
    taskContainer.querySelectorAll('.button_complete, .button_uncomplete').forEach(btn => {
        btn.addEventListener('click', toggleCompleteTask);
    });
}

// Функції керування завданнями
function addTask(name, deadline, priority, category) {
    const newTask = {
        id: Date.now(),
        name,
        deadline, 
        priority,
        category,
        completed: false
    };
    tasks.push(newTask);
    saveTasks();
    renderTasks();
}

function deleteTask(event) {
    const id = Number(event.target.dataset.id);
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

function toggleCompleteTask(event) {
    const id = Number(event.target.dataset.id);
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasks();
        renderTasks();
    }
}


// ----------------------------------------------------------------------
// --- Modal Windows and Forms Logic ---
// ----------------------------------------------------------------------

// Функція для наповнення випадаючих списків
function populateSelects() {
    // 1. Пріоритет
    taskPrioritySelect.innerHTML = PRIORITIES.map(p => `<option value="${p}">${p}</option>`).join('');

    // 2. Категорії (оновлюємо категорії, якщо вони змінилися через інше модальне вікно)
    CATEGORIES = JSON.parse(localStorage.getItem('categories')) || ['Особисте', 'Робота', 'Навчання', 'Інше'];
    taskCategorySelect.innerHTML = CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');
}


// Add Task Modal
const addTaskBack = document.querySelector('.add_task_background');
const addTaskModal = document.querySelector('.add_task');
const addTaskBtn = document.querySelector('.button_add');
const saveTaskBtn = addTaskModal.querySelector('.button_save_card');

addTaskBtn.addEventListener('click', () => {
    addTaskBack.classList.add('active');
    
    // Очищення полів форми та встановлення значень за замовчуванням
    addTaskModal.querySelector('.inout_add_card[type="text"]').value = ''; // Назва
    if (taskDeadlineInput) taskDeadlineInput.value = ''; // Дедлайн
    if (taskPrioritySelect) populateSelects();
});

// Кнопка Зберегти Завдання
saveTaskBtn.addEventListener('click', () => {
    
    // Знаходимо всі поля, використовуючи їх типи та унікальні ID
    const nameInput = addTaskModal.querySelector('.inout_add_card[type="text"]'); 

    const name = nameInput ? nameInput.value.trim() : '';
    const deadline = taskDeadlineInput ? taskDeadlineInput.value : '';
    const priority = taskPrioritySelect ? taskPrioritySelect.value : 'N/A';
    const category = taskCategorySelect ? taskCategorySelect.value : 'N/A';

    if (name) {
        addTask(name, deadline, priority, category);
        addTaskBack.classList.remove('active');
    } else {
        alert('Назва завдання є обов\'язковою!');
    }
});

// Closing Add Task Modal (Outside click)
window.addEventListener('click', (event) => {
    if (addTaskBtn.contains(event.target)) return; 
    if (!addTaskModal.contains(event.target) && addTaskBack.classList.contains('active')) {
        addTaskBack.classList.remove('active');
    }
});


// Add Category Modal (Оновлюємо логіку додавання категорії)
const addCategoryBackground = document.querySelector('.add_category_background');
const addCategoryModal = document.querySelector('.add_category');
const buttonCategory = document.querySelector('.button_category');
const saveCategoryBtn = addCategoryModal.querySelector('.button_save_card');
const categoryInput = addCategoryModal.querySelector('.inout_add_card'); // Припускаємо, що це інпут для нової категорії

buttonCategory.addEventListener('click', () => {
    addCategoryBackground.classList.add('active');
    categoryInput.value = ''; // Очищаємо поле
});

// Збереження нової категорії
if (saveCategoryBtn) {
    saveCategoryBtn.addEventListener('click', () => {
        const newCategory = categoryInput.value.trim();
        if (newCategory && !CATEGORIES.includes(newCategory)) {
            CATEGORIES.push(newCategory);
            localStorage.setItem('categories', JSON.stringify(CATEGORIES));
            populateSelects(); // Оновлюємо випадаючий список завдань
            addCategoryBackground.classList.remove('active');
        } else if (CATEGORIES.includes(newCategory)) {
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