/* Modal auth (localStorage), contact form handler, visit counter, reveal on scroll */

(function () {
    // Helpers
    const $ = sel => document.querySelector(sel);
    const $$ = sel => Array.from(document.querySelectorAll(sel));

    // ===== MODAL AUTH =====
    function initModalAuth() {
        const openLoginBtn = $('#open-login');
        const openRegBtn = $('#open-register');
        const backdrop = $('#authModal');
        const closeBtn = $('#modal-close');
        const modalTitle = $('#modal-title');
        const authForm = $('#authForm');
        const authEmail = $('#auth-email');
        const authPassword = $('#auth-password');
        const authSubmit = $('button[type="submit"]', authForm);

        if (!backdrop) return;

        function openModal(mode = 'login') {
            backdrop.classList.add('show');
            backdrop.setAttribute('aria-hidden', 'false');
            modalTitle.textContent = mode === 'register' ? 'Zarejestruj' : 'Zaloguj';
            authForm.dataset.mode = mode;
            authEmail.value = '';
            authPassword.value = '';
            authEmail.focus();
        }

        function closeModal() {
            backdrop.classList.remove('show');
            backdrop.setAttribute('aria-hidden', 'true');
        }

        openLoginBtn && openLoginBtn.addEventListener('click', () => openModal('login'));
        openRegBtn && openRegBtn.addEventListener('click', () => openModal('register'));
        closeBtn && closeBtn.addEventListener('click', closeModal);
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) closeModal();
        });

        // Form submit handler
        authForm && authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = authEmail.value.trim().toLowerCase();
            const password = authPassword.value;
            const mode = authForm.dataset.mode || 'login';

            if (!email || !password) {
                alert('Wypełnij wszystkie pola.');
                return;
            }

            try {
                const users = JSON.parse(localStorage.getItem('users') || '{}');

                if (mode === 'register') {
                    if (users[email]) {
                        alert('Konto o tym adresie już istnieje.');
                        return;
                    }
                    // Simple hash (for demo only)
                    const hash = btoa(password);
                    users[email] = { passHash: hash, created: Date.now() };
                    localStorage.setItem('users', JSON.stringify(users));
                    localStorage.setItem('session', JSON.stringify({ email, loggedIn: true }));
                    alert('Zarejestrowano i zalogowano.');
                } else {
                    // Login
                    const user = users[email];
                    if (!user) {
                        alert('Nie znaleziono konta.');
                        return;
                    }
                    const hash = btoa(password);
                    if (hash !== user.passHash) {
                        alert('Nieprawidłowe hasło.');
                        return;
                    }
                    localStorage.setItem('session', JSON.stringify({ email, loggedIn: true }));
                    alert('Zalogowano.');
                }
                closeModal();
            } catch (err) {
                console.error('Auth error:', err);
                alert('Błąd podczas przetwarzania.');
            }
        });
    }

    // ===== CONTACT FORM =====
    function initContact() {
        const form = $('#contactForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = $('#contact-name')?.value.trim() || '';
            const email = $('#contact-email')?.value.trim() || '';
            const msg = $('#contact-message')?.value.trim() || '';

            if (!name || !email || !msg) {
                alert('Wypełnij wszystkie pola formularza.');
                return;
            }

            if (!/^\S+@\S+\.\S+$/.test(email)) {
                alert('Podaj poprawny adres e-mail.');
                return;
            }

            try {
                const messages = JSON.parse(localStorage.getItem('messages') || '[]');
                messages.push({ name, email, msg, at: Date.now() });
                localStorage.setItem('messages', JSON.stringify(messages));
            } catch (err) {
                console.warn('Failed to save message:', err);
            }

            alert('Dziękujemy za wiadomość! Wiadomość zapisana lokalnie.');
            form.reset();
        });
    }

    // ===== VISIT COUNTER =====
    function initVisitCount() {
        try {
            let count = parseInt(localStorage.getItem('visitCount') || '0');
            count++;
            localStorage.setItem('visitCount', count.toString());
            const el = $('#visit-count');
            if (el) el.textContent = '👁️ ' + count;
        } catch (err) {
            console.warn('Visit counter error:', err);
        }
    }

    // ===== REVEAL ON SCROLL (lazy animations) =====
    function initReveal() {
        const reveals = $$('[class*="animate-"]');
        if (!reveals.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        reveals.forEach(el => {
            observer.observe(el);
        });
    }

    // ===== CONFETTI (optional mouse hover effect) =====
    function initConfetti() {
        const canvas = document.createElement('canvas');
        if (canvas.getContext) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            canvas.style.position = 'fixed';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.pointerEvents = 'none';
            canvas.style.zIndex = '999';
            canvas.style.opacity = '0.8';
            document.body.appendChild(canvas);

            const ctx = canvas.getContext('2d');
            const particles = [];

            function createParticle(x, y) {
                particles.push({
                    x, y,
                    vx: (Math.random() - 0.5) * 8,
                    vy: Math.random() * -5 - 2,
                    life: 1,
                    color: ['#d4af37', '#b8860b', '#f5f7fa'][Math.floor(Math.random() * 3)]
                });
            }

            function update() {
                particles.forEach((p, i) => {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += 0.15; // gravity
                    p.life -= 0.015;
                    if (p.life <= 0) particles.splice(i, 1);
                });
            }

            function draw() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                particles.forEach(p => {
                    ctx.globalAlpha = p.life;
                    ctx.fillStyle = p.color;
                    ctx.fillRect(p.x, p.y, 4, 4);
                });
                ctx.globalAlpha = 1;
            }

            function loop() {
                update();
                draw();
                if (particles.length > 0) requestAnimationFrame(loop);
            }

            // Trigger on button clicks or special events
            const buttons = $$('button[type="submit"]');
            buttons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    for (let i = 0; i < 20; i++) {
                        createParticle(e.clientX, e.clientY);
                    }
                    loop();
                });
            });
        }
    }

    // ===== INITIALIZATION =====
    document.addEventListener('DOMContentLoaded', () => {
        initVisitCount();
        initModalAuth();
        initContact();
        initReveal();
        initConfetti();
    });

})();
