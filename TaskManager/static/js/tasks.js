// tasks.js - ОНОВЛЕНИЙ ДЛЯ РОБОТИ З БЕКЕНДОМ

// --- Global Constants ---
const API_BASE_URL = 'http://localhost:3000/api'; 
const taskContainer = document.querySelector('.tasks_cards');

// Отримання полів форми
const taskDeadlineInput = document.getElementById('task-deadline-input');
const taskPrioritySelect = document.getElementById('task-priority-select');
const taskCategorySelect = document.getElementById('task-category-select');
const taskNameInput = document.querySelector('.add_task [type="text"]');
const taskDescInput = document.querySelector('.add_task .add_task_textarea'); // Припустимо, ви додали textarea для опису
const saveTaskBtn = document.querySelector('.add_task .button_save_card');

// Елементи для Header та UI
const burgerMenu = document.getElementById('burger-menu');
const navMenu = document.querySelector('.under_p_service_u'); 
const guestMenu = document.querySelector('.under_p_service_g');
const userPanel = document.querySelector('.user_panel');
const adminPanel = document.querySelector('.admin_div');
const userNameDisplay = document.getElementById('name_u_footer');
const adminLink = document.querySelector('.admin_a');
const logoutButton = document.querySelector('.button_logout');
const filterMenu = document.querySelector('.dropdown-menu');
const filterArrow = document.querySelector('.arrow_filtr');
const searchInput = document.querySelector('.input_p');
const addTaskBackground = document.querySelector('.add_task_background');
const buttonAdd = document.querySelector('.button_add');


const addCategoryBackground = document.querySelector('.add_category_background');
const addCategoryModal = document.querySelector('.add_category');
const buttonCategory = document.querySelector('.button_category');
const saveCategoryBtnModal = addCategoryModal ? addCategoryModal.querySelector('.button_save_card') : null; 
const categoryInput = addCategoryModal ? addCategoryModal.querySelector('.inout_add_card') : null; 

if (buttonCategory) {
    buttonCategory.addEventListener('click', () => {
        if (addCategoryBackground) addCategoryBackground.classList.add('active');
        if (categoryInput) categoryInput.value = ''; 
    });
}

// Збереження нової категорії через API
if (saveCategoryBtnModal) {
    saveCategoryBtnModal.addEventListener('click', async () => {
        const newCategory = categoryInput.value.trim();
        if (!newCategory) {
            alert('Введіть назву категорії.');
            return;
        }

        try {
            // POST запит до API для створення категорії
            const result = await apiFetch('/categories', {
                method: 'POST',
                body: JSON.stringify({ name: newCategory })
            });

            alert(result.message || `Категорія "${result.name}" успішно створена!`);
            
            // Перезавантажуємо список категорій у модальному вікні завдання
            await fetchCategories(); 
            
            if (addCategoryBackground) addCategoryBackground.classList.remove('active');
        
        } catch (error) {
            console.error('Error creating category:', error);
            alert(error.message || 'Помилка при створенні категорії.');
        }
    });
}

// Closing Add Category Modal (Outside click - залишається без змін)
window.addEventListener('click', (event) => {
    if (buttonCategory && buttonCategory.contains(event.target)) return; 
    if (addCategoryModal && !addCategoryModal.contains(event.target) && addCategoryBackground && addCategoryBackground.classList.contains('active')) {
        addCategoryBackground.classList.remove('active');
    }
});


// Стан редагування
let editingTaskId = null; 
let allCategories = []; // Зберігаємо категорії для вибору

// --- AUTH UTILS ---
const getCurrentUserId = () => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    return user ? user.id : null; 
}
const getAuthToken = () => {
    return localStorage.getItem('authToken');
}
function redirectToLogin() {
    window.location.href = 'login.html';
}

// --- CORE FETCH FUNCTION ---
// Допоміжна функція для надсилання запитів з токеном
async function apiFetch(endpoint, options = {}) {
    const token = getAuthToken();
    if (!token) {
        throw new Error('User not authenticated. Redirecting to login.');
    }
    
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
        // Якщо токен недійсний, скидаємо його та перенаправляємо
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        redirectToLogin();
        return; // Зупиняємо виконання
    }

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API request failed');
    }

    return response.json().catch(() => ({})); // Повертає {} для DELETE/PUT, які можуть не мати тіла
}


// ----------------------------------------------------------------------
// --- CATEGORY & SELECT LOGIC ---
// ----------------------------------------------------------------------

async function fetchCategories() {
    try {
        const categories = await apiFetch('/categories');
        allCategories = categories;
        populateCategorySelect(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
    }
}

function populateCategorySelect(categories) {
    if (!taskCategorySelect) return;
    taskCategorySelect.innerHTML = '<option value="">Оберіть категорію</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id; // ID категорії з БД
        option.textContent = category.name;
        taskCategorySelect.appendChild(option);
    });
}

// Заповнення пріоритетів (залишається локальним)
function populatePrioritySelect() {
    const PRIORITIES = ['Низький', 'Середній', 'Високий'];
    if (!taskPrioritySelect) return;
    taskPrioritySelect.innerHTML = '';
    PRIORITIES.forEach(priority => {
        const option = document.createElement('option');
        option.value = priority;
        option.textContent = priority;
        taskPrioritySelect.appendChild(option);
    });
}


// ----------------------------------------------------------------------
// --- TASK CRUD LOGIC ---
// ----------------------------------------------------------------------
// --- Змінено селектори для відповідності HTML ---
const filterMenuM = document.getElementById('filter-menu'); // ЗМІНА: з .dropdown-menu на #filter-menu
const filterArrowD = document.querySelector('.arrow-down'); // ЗМІНА: з .arrow_filtr на .arrow-down
const filterToggleButton = document.getElementById('filter-toggle-btn');

// --- Виправлений обробник ВІДКРИТТЯ/ЗАКРИТТЯ ФІЛЬТРА ---
if (filterToggleButton && filterMenuM && filterArrowD) {
    filterToggleButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Запобігаємо баблінгу
        // 1. Перемикаємо клас 'show' на самому меню
        filterMenuM.classList.toggle('show');
        // 2. Перемикаємо клас 'rotated' на стрілці
        filterArrowD.classList.toggle('rotated');
    });
}

// --- Виправлений обробник СКРИВАННЯ ПРИ КЛІКУ ПОЗА МЕНЮ ---
document.addEventListener('click', (event) => {
    // Якщо клік не був на кнопці-тригері і не був на самому меню, закрити його
    if (filterMenuM && filterMenuM.classList.contains('show') && 
        !filterToggleButton.contains(event.target) && 
        !filterMenuM.contains(event.target)) {
        
        filterMenuM.classList.remove('show');
        if (filterArrowD) filterArrowD.classList.remove('rotated');
    }
});

// --- Оновлена функція fetchAndRenderTasks ---
async function fetchAndRenderTasks(filterType = 'all', searchKeyword = '') {
    try {
        const tasks = await apiFetch('/tasks');
        
        let filteredTasks = tasks;

        // Фільтрація за типом
        if (filterType === 'completed') {
            filteredTasks = filteredTasks.filter(t => t.Status === 'Виконане');
        } else if (filterType === 'uncompleted') {
            filteredTasks = filteredTasks.filter(t => t.Status === 'Активне');
        } else if (filterType === 'priority') {
            // Сортування за пріоритетом (Високий > Середній > Низький)
            const priorityOrder = { 'Високий': 3, 'Середній': 2, 'Низький': 1 };
            filteredTasks = filteredTasks.sort((a, b) => 
                priorityOrder[b.Priority] - priorityOrder[a.Priority]
            );
        } else if (filterType === 'newest') {
            // Спочатку нові (за ID або датою створення)
            filteredTasks = filteredTasks.sort((a, b) => b.TaskID - a.TaskID);
        }
        // 'all' - без фільтрації

        // Пошук
        if (searchKeyword) {
            const keyword = searchKeyword.toLowerCase();
            filteredTasks = filteredTasks.filter(t => 
                t.Title.toLowerCase().includes(keyword) || 
                (t.Description && t.Description.toLowerCase().includes(keyword))
            );
        }

        renderTasksToDOM(filteredTasks);

    } catch (error) {
        console.error("Error fetching and rendering tasks:", error);
        taskContainer.innerHTML = '<p class="no_tasks">Не вдалося завантажити завдання. Спробуйте пізніше.</p>';
    }
}

// 2. CREATE (Створити/Оновити)
if (saveTaskBtn) {
    saveTaskBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        
        const title = taskNameInput.value.trim();
        const description = taskDescInput ? taskDescInput.value.trim() : '';
        const priority = taskPrioritySelect.value;
        const category_id = taskCategorySelect.value;
        const due_date = taskDeadlineInput.value;

        if (!title || !priority || !category_id) {
            alert('Будь ласка, заповніть Назву, Пріоритет та Категорію.');
            return;
        }

        const taskData = {
            title,
            description,
            priority,
            category_id: parseInt(category_id), 
            due_date: due_date || null // Якщо порожнє, передаємо null
        };
        
        try {
            if (editingTaskId) {
                // ОНОВЛЕННЯ (PUT)
                await apiFetch(`/tasks/${editingTaskId}`, {
                    method: 'PUT',
                    body: JSON.stringify(taskData)
                });
                alert('Завдання успішно оновлено!');
            } else {
                // СТВОРЕННЯ (POST)
                await apiFetch('/tasks', {
                    method: 'POST',
                    body: JSON.stringify(taskData)
                });
                alert('Завдання успішно створено!');
            }

            // Очищення форми
            clearTaskForm();
            editingTaskId = null;
            
            // Перезавантаження списку завдань
            fetchAndRenderTasks();

        } catch (error) {
            console.error('Task save error:', error);
            alert(error.message || 'Помилка при збереженні завдання.');
        }
    });
}

function clearTaskForm() {
    if (taskNameInput) taskNameInput.value = '';
    if (taskDescInput) taskDescInput.value = '';
    if (taskDeadlineInput) taskDeadlineInput.value = '';
    // Скидаємо селекти
    if (taskPrioritySelect) taskPrioritySelect.value = taskPrioritySelect.options[0].value;
    if (taskCategorySelect) taskCategorySelect.value = ''; 
    
    if (saveTaskBtn) saveTaskBtn.textContent = 'Зберегти';
}

// 3. UPDATE (Toggle Completion)
async function toggleCompleteTask(taskId, isCompleted) {
    try {
        await apiFetch(`/tasks/${taskId}/toggle`, {
            method: 'PATCH',
            body: JSON.stringify({ is_completed: isCompleted })
        });
        
        // Перезавантаження завдань після успішного оновлення
        fetchAndRenderTasks(document.querySelector('.p_filtr').dataset.filter || 'all', searchInput.value);

    } catch (error) {
        console.error('Toggle completion error:', error);
        alert(error.message || 'Помилка при зміні статусу завдання.');
    }
}

// 4. DELETE (Видалити завдання)
async function deleteTask(taskId) {
    if (!confirm('Ви впевнені, що хочете видалити це завдання?')) {
        return;
    }
    try {
        await apiFetch(`/tasks/${taskId}`, {
            method: 'DELETE'
        });
        
        alert('Завдання видалено.');
        // Перезавантаження завдань
        fetchAndRenderTasks(document.querySelector('.p_filtr').dataset.filter || 'all', searchInput.value);

    } catch (error) {
        console.error('Delete task error:', error);
        alert(error.message || 'Помилка при видаленні завдання.');
    }
}

// 5. EDIT (Завантажити дані завдання у форму)
async function editTask(taskId) {
    try {
        // Отримуємо всі завдання, потім знаходимо потрібне
        const allTasks = await apiFetch('/tasks');
        const taskToEdit = allTasks.find(t => t.TaskID === taskId);

        if (!taskToEdit) {
            alert('Завдання для редагування не знайдено.');
            return;
        }

        // Заповнюємо форму
        editingTaskId = taskId;
        taskNameInput.value = taskToEdit.Title;
        if (taskDescInput) taskDescInput.value = taskToEdit.Description || '';
        taskDeadlineInput.value = taskToEdit.DueDate ? new Date(taskToEdit.DueDate).toISOString().substring(0, 10) : '';
        taskPrioritySelect.value = taskToEdit.Priority;
        
        // Знаходимо CategoryID за назвою (потрібно додати CategoryID до taskToEdit у бекенді)
        const category = allCategories.find(c => c.name === taskToEdit.Category);
        if (category) {
            taskCategorySelect.value = category.id;
        }

        if (saveTaskBtn) saveTaskBtn.textContent = 'Оновити завдання';
        
        // Прокрутка до форми
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        console.error('Error loading task for editing:', error);
        alert(error.message || 'Помилка завантаження даних завдання.');
    }
}

// ----------------------------------------------------------------------
// --- DOM RENDERING ---
// ----------------------------------------------------------------------

// tasks.js (ОНОВЛЕНА ФУНКЦІЯ renderTasksToDOM)
// Використовуємо класи з admin.js (task_card, name_p, inf_p) для уніфікації стилів.

function renderTasksToDOM(tasks) {
    if (!taskContainer) return;
    taskContainer.innerHTML = '';

    if (tasks.length === 0) {
        taskContainer.innerHTML = '<p class="no_tasks">Завдань не знайдено.</p>';
        return;
    }

    tasks.forEach(task => {
        const isCompleted = task.Status === 'Виконане';
        const card = document.createElement('div');
        
        // Використовуємо класи, які ви стилізували, та додаємо клас для статусу
        card.className = `task_card ${isCompleted ? 'completed' : 'active'}`;
        card.dataset.id = task.TaskID;
        let formattedDate = '';
        if (task.DueDate) {
            // 1. Створюємо об'єкт Date з UTC-рядка
            const dateObj = new Date(task.DueDate);
            
            // 2. Форматуємо дату відповідно до локалі (наприклад, uk-UA)
            // options: { day: 'numeric', month: 'long', year: 'numeric' }
            // Або простіше: 'YYYY-MM-DD'
            formattedDate = dateObj.toLocaleDateString('uk-UA', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
            });
        }
        // Зверніть увагу: ми використовуємо inf_p для всіх деталей, як у admin.js
        card.innerHTML = `
            <p class="name_p">${task.Title}</p>
            <p class="inf_p">Статус: ${task.Status}</p>
            <p class="inf_p">Пріоритет: ${task.Priority}</p>
            <p class="inf_p">Категорія: ${task.Category}</p>
            ${task.DueDate ? `<p class="inf_p">Дедлайн: ${formattedDate}</p>` : ''}
            
            <div class="card_actions" style="display: flex; gap: 10px; margin-top: 10px;flex-direction: column;">
                <button class="button_edit" data-id="${task.TaskID}">Редагувати</button>
                <button class="button_delete" data-id="${task.TaskID}">Видалити</button>
            </div>
            
            <label class="checkbox_container" style="margin-top: 10px; display: flex; align-items: center; gap: 5px;">
                <input type="checkbox" ${isCompleted ? 'checked' : ''} data-id="${task.TaskID}">
                <p class="status_text">${isCompleted ? 'Виконано' : 'Активне'}</p>
            </label>
        `;

        // Обробники подій для карток (залишаються без змін, але тепер використовують кнопки)
        card.querySelector('.button_edit').addEventListener('click', (e) => editTask(parseInt(e.target.dataset.id)));
        card.querySelector('.button_delete').addEventListener('click', (e) => deleteTask(parseInt(e.target.dataset.id)));
        card.querySelector('input[type="checkbox"]').addEventListener('change', (e) => 
            // передаємо e.target.checked, яке є НОВИМ СТАНОМ
            toggleCompleteTask(parseInt(e.target.dataset.id), e.target.checked) 
        );

        taskContainer.appendChild(card);
    });
}


// ----------------------------------------------------------------------
// --- INITIALIZATION AND EVENT LISTENERS ---
// ----------------------------------------------------------------------

// Захист сторінки та завантаження даних
function initializePage() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const authToken = getAuthToken();
    const isLoggedIn = !!user && !!authToken;

    if (!isLoggedIn) {
        alert('Для доступу до завдань потрібно авторизуватися.');
        redirectToLogin(); 
        return; 
    }

    // Оновлення UI (для tasks.html)
    if (userNameDisplay) userNameDisplay.textContent = user.name;
    if (adminLink) adminLink.style.display = user.role === 'admin' ? 'block' : 'none';

    // Завантаження категорій та завдань
    populatePrioritySelect();
    fetchCategories().then(() => {
        fetchAndRenderTasks();
    });
}

// Обробники фільтрів
if (filterMenu) {
    // Обробник для перемикання випадаючого меню
    document.querySelector('.filtr_dropdown').addEventListener('click', (event) => {
        if (event.target.closest('.filtr_dropdown')) {
            filterMenu.classList.toggle('show');
            if (filterArrow) filterArrow.classList.toggle('rotated');
        }
    });

    // Обробник вибору фільтра
    filterMenu.addEventListener('click', (event) => {
        if (event.target.classList.contains('dropdown-item')) {
            event.preventDefault();
            const filterType = event.target.dataset.filter;
            const filterName = event.target.textContent;

            document.querySelector('.p_filtr').dataset.filter = filterType;
            document.querySelector('.p_filtr').textContent = filterName;

            let currentKeyword = searchInput ? searchInput.value : '';
            
            fetchAndRenderTasks(filterType, currentKeyword);

            filterMenu.classList.remove('show');
            if (filterArrow) filterArrow.classList.remove('rotated');
        }
    });
}

// Обробник пошуку
if (searchInput) {
    searchInput.addEventListener('input', () => {
        const currentFilter = document.querySelector('.p_filtr').dataset.filter || 'all';
        fetchAndRenderTasks(currentFilter, searchInput.value);
    });
}

// Обробник кнопки "Вийти" (скопійовано з script.js)
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken'); 
        fetch('http://localhost:3000/api/auth/logout', { method: 'POST' });
        redirectToLogin(); 
    });
}
// tasks.js (Новий код для відкриття та закриття модального вікна завдання)

// --- Обробники для модального вікна "Щось нове" ---

if (buttonAdd && addTaskBackground) {
    buttonAdd.addEventListener('click', () => {
        // Очищаємо форму перед відкриттям
        clearTaskForm();
        editingTaskId = null; 
        
        // Відкриваємо модальне вікно
        addTaskBackground.classList.add('active');
    });
}

// Обробник для закриття модального вікна при натисканні на фон
if (addTaskBackground) {
    addTaskBackground.addEventListener('click', (event) => {
        // Якщо клік був саме по фону, а не всередині модального вікна
        const addTaskModal = document.querySelector('.add_task'); 
        if (!addTaskModal.contains(event.target) && event.target === addTaskBackground) {
            addTaskBackground.classList.remove('active');
        }
    });
}

if (burgerMenu && navMenu) {
    burgerMenu.addEventListener('click', () => {
        // На сторінках завдань/адміна завжди очікується авторизований користувач
        // Ми просто перемикаємо клас 'active' на меню користувача
        navMenu.classList.toggle('active');
    });
}
// Додатково: закриття модального вікна через кнопку "Скасувати" 
// (Якщо ви додавали таку кнопку у HTML для зручності)
// let cancelButton = document.querySelector('.add_task .button_cancel_card'); 
// if (cancelButton) {
//     cancelButton.addEventListener('click', () => {
//         addTaskBackground.classList.remove('active');
//     });
// }

document.addEventListener('DOMContentLoaded', initializePage);