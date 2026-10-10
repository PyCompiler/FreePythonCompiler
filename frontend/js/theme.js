/**
 * Global Theme Manager
 * Handles light/dark mode preference and applies it consistently across pages.
 */
document.addEventListener('DOMContentLoaded', () => {
    const themeToggles = document.querySelectorAll('#theme-toggle, .theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    // Check for saved theme or fallback to OS preference
    const savedTheme = localStorage.getItem('theme');
    const currentTheme = savedTheme ? savedTheme : (prefersDarkScheme.matches ? 'theme-dark' : 'theme-light');

    // Apply current theme
    document.body.classList.value = document.body.classList.value.replace(/theme-(light|dark)/, '').trim();
    document.body.classList.add(currentTheme);

    // Update icons for all toggle buttons
    const updateIcons = (theme) => {
        themeToggles.forEach(toggle => {
            if (theme === 'theme-light') {
                toggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-moon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
            } else {
                toggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sun"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
            }
        });
    };

    updateIcons(currentTheme);

    // Listen for toggle clicks
    themeToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const current = document.body.classList.contains('theme-dark') ? 'theme-dark' : 'theme-light';
            const next = current === 'theme-light' ? 'theme-dark' : 'theme-light';

            document.body.classList.remove(current);
            document.body.classList.add(next);
            localStorage.setItem('theme', next);
            updateIcons(next);
        });
    });

    // Mobile navigation burger toggle
    const burgerBtn = document.querySelector('.burger-btn, #burger-btn');
    const navLinks = document.querySelector('.page-nav-links');
    if (burgerBtn && navLinks) {
        burgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = burgerBtn.classList.toggle('open');
            navLinks.classList.toggle('mobile-open', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                burgerBtn.classList.remove('open');
                navLinks.classList.remove('mobile-open');
                document.body.style.overflow = '';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('mobile-open')) {
                if (!navLinks.contains(e.target) && !burgerBtn.contains(e.target)) {
                    burgerBtn.classList.remove('open');
                    navLinks.classList.remove('mobile-open');
                    document.body.style.overflow = '';
                }
            }
        });
    }
});
