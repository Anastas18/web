// --- Логіка Перемикання Вкладки (залишається без змін) ---
    const burgerMenu = document.getElementById('burger-menu');
    const navMenu = document.querySelector('.under_p_service_u'); 

    if (burgerMenu) {
        burgerMenu.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    const loginButton = document.querySelector('.login_button');
    const registerButton = document.querySelector('.register_button');

    const loginFormDiv = document.getElementById('login-form'); 
    const registerFormDiv = document.getElementById('register-form'); 

    if (loginButton && registerButton && loginFormDiv && registerFormDiv) {
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
    }


    // --- НОВА ЛОГІКА АВТОРИЗАЦІЇ З БЕКЕНДОМ ---
    
    // БАЗОВИЙ URL БЕКЕНДУ
    const API_URL = 'http://localhost:3000/api/auth'; // Залежить від порту в server.js

    // Отримання полів форми входу
    const loginEmailInput = loginFormDiv ? loginFormDiv.querySelector('.inputs:nth-child(1) input') : null;
    const loginPasswordInput = loginFormDiv ? loginFormDiv.querySelector('.inputs:nth-child(2) input') : null;
    const loginConfirmButton = loginFormDiv ? loginFormDiv.querySelector('.button_confirm') : null;

    // Отримання полів форми реєстрації
    const regNameInput = registerFormDiv ? registerFormDiv.querySelector('.inputs:nth-child(1) input') : null;
    const regEmailInput = registerFormDiv ? registerFormDiv.querySelector('.inputs:nth-child(2) input') : null;
    const regPasswordInput = registerFormDiv ? registerFormDiv.querySelector('.inputs:nth-child(3) input') : null;
    const regConfirmPasswordInput = registerFormDiv ? registerFormDiv.querySelector('.inputs:nth-child(4) input') : null;
    const regConfirmButton = registerFormDiv ? registerFormDiv.querySelector('.button_confirm') : null;


    // --- Логіка Входу (Log in) ---
    if (loginConfirmButton) {
        loginConfirmButton.addEventListener('click', async (event) => {
            event.preventDefault(); 
            
            const email = loginEmailInput.value;
            const password = loginPasswordInput.value;

            try {
                const response = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    // Успішний вхід: зберігаємо токен та дані користувача
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('currentUser', JSON.stringify({
                        id: data.user.id,
                        name: data.user.name,
                        email: data.user.email,
                        role: data.user.role 
                    }));
                    
                    alert(`Успішний вхід! Вітаємо, ${data.user.name} (${data.user.role}).`);
                    window.location.href = 'index.html'; 
                } else {
                    // Помилка входу
                    alert(data.message || 'Помилка входу. Спробуйте ще раз.');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Помилка підключення до сервера.');
            }
        });
    }

    // --- Логіка Реєстрації (Register) ---
    if (regConfirmButton) {
        regConfirmButton.addEventListener('click', async (event) => {
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

            try {
                const response = await fetch(`${API_URL}/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert(data.message || 'Реєстрація успішна! Тепер увійдіть.');
                    // Перемикаємо на форму входу після успішної реєстрації
                    if (loginButton) loginButton.click(); 
                } else {
                    alert(data.message || 'Помилка реєстрації. Спробуйте інший email.');
                }
            } catch (error) {
                console.error('Registration error:', error);
                alert('Помилка підключення до сервера.');
            }
        });
    }

    // --- INITIALIZATION (Чистимо стару логіку) ---
    document.addEventListener('DOMContentLoaded', () => {
        // Стара логіка ініціалізації admin_users видалена, 
        // оскільки вона тепер керується бекендом та MySQL.
        // Залишаємо лише перемикання форми за замовчуванням (якщо потрібно)
    });