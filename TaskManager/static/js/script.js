// --- Логіка Header та Меню (ФІНАЛЬНЕ ВИПРАВЛЕННЯ) ---
    const burgerMenu = document.getElementById('burger-menu');
    const navMenu = document.getElementById('nav-menu'); // under_p_service_u
    const guestMenu = document.querySelector('.under_p_service_g');

    const userPanel = document.querySelector('.user_panel');
    const adminPanel = document.querySelector('.admin_div');
    const userNameDisplay = document.getElementById('name_u_footer');
    const adminLink = document.querySelector('.admin_a');
    const logoutButton = document.querySelector('.button_logout');

    const buttonGetStart = document.querySelector('.button_getstart');

    // Функції перенаправлення (залишаються без змін)
    function redirectToTasks() {
        window.location.href = 'tasks.html';
    }
    function redirectToLogin() {
        window.location.href = 'login.html';
    }

    // Керування станом авторизації
    function updateAuthUI() {
        // Зчитуємо дані користувача з localStorage
        const user = JSON.parse(localStorage.getItem('currentUser'));
        // Перевіряємо токен. Якщо токен є, вважаємо користувача залогіненим.
        const authToken = localStorage.getItem('authToken');
        const isLoggedIn = !!user && !!authToken;

        // 1. Скидаємо мобільні класи при зміні стану
        if (navMenu) navMenu.classList.remove('active');
        if (guestMenu) guestMenu.classList.remove('active');

        if (isLoggedIn) {
            // КОРИСТУВАЧ (Керування ДЕСКТОПОМ через style.display)
            if (navMenu) navMenu.classList.add('visible-desktop');
            if (guestMenu) {
                guestMenu.classList.remove('visible-desktop');
                guestMenu.style.display = 'none';
            }
            if (userNameDisplay) userNameDisplay.textContent = user.name;
            
            // Керування адмін-доступом
            if (adminLink) {
                if (user.role === 'admin') {
                    adminLink.style.display = 'block';
                } else {
                    adminLink.style.display = 'none';
                }
            }
            
            // Керування кнопкою "Розпочати"
            if (buttonGetStart) {
                buttonGetStart.textContent = 'До завдань';
                buttonGetStart.removeEventListener('click', redirectToLogin);
                buttonGetStart.addEventListener('click', redirectToTasks);
            }

        } else {
            // ГІСТЬ (Керування ДЕСКТОПОМ через style.display)
            if (guestMenu) guestMenu.classList.add('visible-desktop');
            if (navMenu) {
                navMenu.classList.remove('visible-desktop');
                navMenu.style.display = 'none';
            }
            // Керування кнопкою "Розпочати"
            if (buttonGetStart) {
                buttonGetStart.textContent = 'Розпочати';
                buttonGetStart.removeEventListener('click', redirectToTasks);
                buttonGetStart.addEventListener('click', redirectToLogin);
            }
        }
    }

    // БУРГЕР-МЕНЮ (ФІКС: Просте перемикання класу на потрібному меню)
    if (burgerMenu) {
        burgerMenu.addEventListener('click', () => {
            const user = JSON.parse(localStorage.getItem('currentUser'));
            const isLoggedIn = !!user;

            if (isLoggedIn) {
                // Якщо користувач: перемикаємо меню користувача
                if (guestMenu) guestMenu.classList.remove('active'); 
                if (navMenu) navMenu.classList.toggle('active');
            } else {
                // Якщо гість: перемикаємо гостьове меню
                if (navMenu) navMenu.classList.remove('active'); 
                if (guestMenu) guestMenu.classList.toggle('active');
            }
        });
    }

    // Випадаюче меню адміна (залишається без змін)
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

    // Кнопка "Вийти" (Оновлена логіка)
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // Видаляємо дані та токен
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authToken'); 
            // Викликаємо API /logout (не обов'язково, але можна для повноти)
            fetch('http://localhost:3000/api/auth/logout', { method: 'POST' });

            updateAuthUI();
            window.location.href = 'index.html'; 
        });
    }
    
    // Ініціалізація стану
    document.addEventListener('DOMContentLoaded', updateAuthUI);