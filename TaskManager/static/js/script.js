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
        window.location.href = 'loginsignup.html';
    }

    // Керування станом авторизації
    function updateAuthUI() {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        const isLoggedIn = !!user;

        // 1. Скидаємо мобільні класи при зміні стану
        navMenu.classList.remove('active');
        guestMenu.classList.remove('active');

        if (isLoggedIn) {
            // КОРИСТУВАЧ (Керування ДЕСКТОПОМ через style.display)
            guestMenu.style.display = 'none';
            navMenu.style.display = 'flex';
            userNameDisplay.textContent = user.name;
            
            // Керування адмін-доступом
            if (user.role === 'admin') {
                adminLink.style.display = 'block';
            } else {
                adminLink.style.display = 'none';
            }
            
            // Керування кнопкою "Розпочати"
            if (buttonGetStart) {
                buttonGetStart.textContent = 'До завдань';
                buttonGetStart.removeEventListener('click', redirectToLogin);
                buttonGetStart.addEventListener('click', redirectToTasks);
            }

        } else {
            // ГІСТЬ (Керування ДЕСКТОПОМ через style.display)
            guestMenu.style.display = 'flex';
            navMenu.style.display = 'none';
            
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
                guestMenu.classList.remove('active'); 
                navMenu.classList.toggle('active');
            } else {
                // Якщо гість: перемикаємо гостьове меню
                navMenu.classList.remove('active'); 
                guestMenu.classList.toggle('active');
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

    // Кнопка "Вийти" (залишається без змін)
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            updateAuthUI();
            window.location.href = 'index.html'; 
        });
    }
    
    // Ініціалізація стану
    document.addEventListener('DOMContentLoaded', updateAuthUI);