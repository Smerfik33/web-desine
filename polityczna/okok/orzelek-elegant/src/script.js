// Small interactive enhancements: typewriter subtitle, reveal on scroll,
// lightweight confetti (red/white), contact validation and misc helpers.

(function () {
    // Typewriter-like reveal for hero-subtitle (keeps the provided text)
    function typeHeroSubtitle() {
        const el = document.getElementById('hero-subtitle');
        if (!el) return;
        const text = el.getAttribute('data-text') || el.textContent;
        el.textContent = '';
        let i = 0;
        const speed = 40;
        const timer = setInterval(() => {
            el.textContent += text.charAt(i) || '';
            i++;
            if (i >= text.length) clearInterval(timer);
        }, speed);
    }

    // Reveal elements on scroll
    function setupReveal() {
        if (!('IntersectionObserver' in window)) return;
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) e.target.classList.add('is-visible');
            });
        }, { threshold: 0.12 });

        document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    }

    // Simple confetti: red & white particles for a short burst
    function fireConfetti() {
        const canvas = document.getElementById('confetti-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let W = canvas.width = innerWidth;
        let H = canvas.height = innerHeight;
        window.addEventListener('resize', () => { W = canvas.width = innerWidth; H = canvas.height = innerHeight; });

        const particles = [];
        const colors = ['#d91e18', '#ffffff'];
        const count = 80;
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * W,
                y: Math.random() * -H,
                r: 6 + Math.random() * 6,
                vx: -1 + Math.random() * 2,
                vy: 2 + Math.random() * 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                rot: Math.random() * Math.PI
            });
        }

        let frames = 0;
        function draw() {
            ctx.clearRect(0, 0, W, H);
            particles.forEach(p => {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
                ctx.restore();
                p.x += p.vx;
                p.y += p.vy;
                p.rot += 0.03;
                if (p.y > H + 20) {
                    p.y = -10 - Math.random() * H * 0.6;
                    p.x = Math.random() * W;
                }
            });
            frames++;
            if (frames < 420) requestAnimationFrame(draw);
            else ctx.clearRect(0, 0, W, H);
        }
        requestAnimationFrame(draw);
    }

    // Friendly helper: pick first existing selector from a list
    function pick(form, selectors) {
        for (const s of selectors) {
            const el = form.querySelector(s) || document.querySelector(s);
            if (el) return el;
        }
        return null;
    }

    // Visit counter stored in localStorage
    function initVisitCount() {
        const el = document.getElementById('visit-count');
        if (!el) return;
        try {
            const key = 'orzelek_visits_v1';
            const current = parseInt(localStorage.getItem(key) || '0', 10) + 1;
            localStorage.setItem(key, String(current));
            el.textContent = `👁️ ${current}`;
        } catch (e) {
            // ignore localStorage errors
            el.textContent = '👁️ -';
        }
    }

    // Simple contact form validation (supports multiple id variants)
    function setupContact() {
        const form = document.getElementById('contactForm');
        if (!form) return;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameEl = pick(form, ['#name', '#contact-name', '[name="name"]']);
            const emailEl = pick(form, ['#email', '#contact-email', '[name="email"]']);
            const messageEl = pick(form, ['#message', '#contact-message', '[name="message"]']);
            const name = nameEl ? nameEl.value.trim() : '';
            const email = emailEl ? emailEl.value.trim() : '';
            const message = messageEl ? messageEl.value.trim() : '';
            if (!name || !email || !message) {
                alert('Wypełnij wszystkie pola formularza.');
                return;
            }
            if (!/^\S+@\S+\.\S+$/.test(email)) { alert('Podaj poprawny email.'); return; }
            // Simulate send
            alert('Dzięki — wiadomość została wysłana.');
            form.reset();
        });
    }

    // Modal auth: open/close and toggle title
    function setupAuthModal() {
        const modal = document.getElementById('authModal');
        const openLogin = document.getElementById('open-login');
        const openRegister = document.getElementById('open-register');
        const closeBtn = document.getElementById('modal-close');
        const title = document.getElementById('modal-title');
        const form = document.getElementById('authForm');
        const emailInput = document.getElementById('auth-email');
        const passwordInput = document.getElementById('auth-password');

        if (!modal) return;

        function open(type) {
            modal.classList.add('show');
            modal.setAttribute('aria-hidden', 'false');
            if (title) title.textContent = type === 'register' ? 'Zarejestruj' : 'Zaloguj';
            if (form) form.dataset.mode = type;
            if (emailInput) emailInput.focus();
        }

        function close() {
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
        }

        if (openLogin) openLogin.addEventListener('click', () => open('login'));
        if (openRegister) openRegister.addEventListener('click', () => open('register'));
        if (closeBtn) closeBtn.addEventListener('click', close);
        modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

        // Form submission
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = (emailInput?.value || '').trim().toLowerCase();
                const password = (passwordInput?.value || '').trim();
                const mode = form.dataset.mode || 'login';

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
                        const hash = btoa(password);
                        users[email] = { passHash: hash, created: Date.now() };
                        localStorage.setItem('users', JSON.stringify(users));
                        localStorage.setItem('session', JSON.stringify({ email, loggedIn: true }));
                        alert('Zarejestrowano i zalogowano.');
                    } else {
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
                    close();
                    form.reset();
                } catch (err) {
                    console.error('Auth error:', err);
                    alert('Błąd podczas przetwarzania.');
                }
            });
        }
    }

    // Init
    document.addEventListener('DOMContentLoaded', () => {
        typeHeroSubtitle();
        setupReveal();
        setupContact();
        setupAuthModal();
        initVisitCount();
        // small celebratory confetti on load (no-op if no canvas)
        setTimeout(fireConfetti, 400);
    });

})();