// --- Логіка Перемикання Вкладки (залишена без змін) ---
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

    // --- Логіка Авторизації (Імітація) ---
    
    // Імітація бази даних користувачів
    let users = [
        { name: 'Admin', email: 'admin@tam.com', password: 'admin', role: 'admin' },
        { name: 'User', email: 'user@tam.com', password: 'user', role: 'user' }
    ];
    
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
        event.preventDefault(); // Запобігаємо стандартній відправці форми
        
        const email = loginEmailInput.value;
        const password = loginPasswordInput.value;
        
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // Успішний вхід. Зберігаємо користувача в локальне сховище.
            localStorage.setItem('currentUser', JSON.stringify({
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
        event.preventDefault(); // Запобігаємо стандартній відправці форми
        
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

        if (users.some(u => u.email === email)) {
            alert('Користувач з таким email вже існує!');
            return;
        }

        // Імітація успішної реєстрації
        const newUser = { name, email, password, role: 'user' }; // Новий користувач завжди 'user'
        users.push(newUser); 
        
        // Автоматичний вхід після реєстрації
        localStorage.setItem('currentUser', JSON.stringify({
            name: newUser.name,
            email: newUser.email,
            role: newUser.role 
        }));
        
        alert(`Реєстрація успішна! Вітаємо, ${newUser.name}.`);
        window.location.href = 'index.html'; 
    });
