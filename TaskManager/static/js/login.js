// --- Логіка Перемикання Вкладки (залишається без змін) ---
    const burgerMenu = document.getElementById('burger-menu');
    const navMenu = document.querySelector('.under_p_service_u'); 

    burgerMenu.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    const loginButton = document.querySelector('.login_button');
    const registerButton = document.querySelector('.register_button');

    const loginFormDiv = document.getElementById('login-form'); 
    const registerFormDiv = document.getElementById('register-form'); 

    loginButton.addEventListener('click', () => {
        loginFormDiv.style.display = 'flex';
        registerFormDiv.style.display = 'none';

        loginButton.classList.add('active');
        registerButton.classList.remove('active');
    });

    registerButton.addEventListener('click', () => {
        loginFormDiv.style.display = 'none';
        registerFormDiv.style.display = 'flex';

        registerButton.classList.add('active');
        loginButton.classList.remove('active');
    });

    // --- ЛОГІКА АВТОРИЗАЦІЇ З СИНХРОНІЗАЦІЄЮ LOCALSTORAGE ---
    
    // Імітація бази даних користувачів з фіксованим адміном
    let USERS_DB_INIT = [
        { id: 1, name: 'Admin', email: 'admin@tam.com', password: 'admin', role: 'admin' },
        { id: 2, name: 'User', email: 'user@tam.com', password: 'user', role: 'user' }
    ];

    // Функція, що повертає список користувачів (без адміна)
    function getUsersFromLocalStorage() {
        const storedUsers = JSON.parse(localStorage.getItem('admin_users'));
        // Видаляємо адміністратора з цього списку, оскільки він зберігається окремо
        return storedUsers ? storedUsers.filter(u => u.role !== 'admin') : [];
    }

    function saveUserToLocalStorage(newUser) {
        let storedUsers = getUsersFromLocalStorage();
        storedUsers.push(newUser);
        // Зберігаємо лише звичайних користувачів
        localStorage.setItem('admin_users', JSON.stringify(storedUsers)); 
    }

    // Отримання полів форми входу
    const loginEmailInput = loginFormDiv.querySelector('.inputs:nth-child(1) input');
    const loginPasswordInput = loginFormDiv.querySelector('.inputs:nth-child(2) input');
    const loginConfirmButton = loginFormDiv.querySelector('.button_confirm');

    // Отримання полів форми реєстрації
    const regNameInput = registerFormDiv.querySelector('.inputs:nth-child(1) input');
    const regEmailInput = registerFormDiv.querySelector('.inputs:nth-child(2) input');
    const regPasswordInput = registerFormDiv.querySelector('.inputs:nth-child(3) input');
    const regConfirmPasswordInput = registerFormDiv.querySelector('.inputs:nth-child(4) input');
    const regConfirmButton = registerFormDiv.querySelector('.button_confirm');

    // Логіка Входу
    loginConfirmButton.addEventListener('click', (event) => {
        event.preventDefault(); 
        
        const email = loginEmailInput.value;
        const password = loginPasswordInput.value;

        // Збираємо всіх користувачів для перевірки (включаючи фіксованого адміна)
        const allUsers = [...getUsersFromLocalStorage(), ...USERS_DB_INIT.filter(u => u.role === 'admin')];
        
        const user = allUsers.find(u => u.email === email && u.password === password);

        if (user) {
            // Використовуємо email як унікальний ID, якщо ID відсутній (для нових користувачів)
            const userId = user.id || user.email;

            localStorage.setItem('currentUser', JSON.stringify({
                id: userId, // Зберігаємо ID або Email як ID
                name: user.name,
                email: user.email,
                role: user.role 
            }));
            
            alert(`Успішний вхід! Вітаємо, ${user.name} (${user.role}).`);
            window.location.href = 'index.html'; 
        } else {
            alert('Невірний email або пароль!');
        }
    });

    // Логіка Реєстрації
    regConfirmButton.addEventListener('click', (event) => {
        event.preventDefault(); 
        
        const name = regNameInput.value;
        const email = regEmailInput.value;
        const password = regPasswordInput.value;
        const confirmPassword = regConfirmPasswordInput.value;

        if (name.trim() === '' || email.trim() === '' || password.trim() === '' || confirmPassword.trim() === '') {
            alert('Всі поля мають бути заповнені!');
            return;
        }

        if (password !== confirmPassword) {
            alert('Паролі не збігаються!');
            return;
        }

        // Перевіряємо унікальність серед усіх (локальних та фіксованих)
        const allUsers = [...getUsersFromLocalStorage(), ...USERS_DB_INIT];
        if (allUsers.some(u => u.email === email)) {
            alert('Користувач з таким email вже існує!');
            return;
        }

        // Імітація успішної реєстрації
        const newUser = { 
            id: email, // Використовуємо email як ID
            name, 
            email, 
            password, // У реальному житті тут буде хеш
            role: 'user' 
        }; 
        
        // Зберігаємо нового користувача в localStorage
        saveUserToLocalStorage(newUser);
        
        // Автоматичний вхід після реєстрації
        localStorage.setItem('currentUser', JSON.stringify({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role 
        }));
        
        alert(`Реєстрація успішна! Вітаємо, ${newUser.name}.`);
        window.location.href = 'index.html'; 
    });

    // Ініціалізуємо ADMIN_USERS у localStorage, якщо він ще порожній
    document.addEventListener('DOMContentLoaded', () => {
        if (!localStorage.getItem('admin_users')) {
            // Зберігаємо лише фіксованих звичайних користувачів (адмін додасться динамічно)
            const initialUsers = USERS_DB_INIT.filter(u => u.role === 'user');
            localStorage.setItem('admin_users', JSON.stringify(initialUsers));
        }
    });