// src/scripts/main.js

export function initApp() {
    initLucideIcons();
    initTypingEffect();
    initMobileMenu();
    initScrollAnimations();
    initSmoothScroll();
    initSkillBars();
    initContactForm();
}

function initLucideIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function initTypingEffect() {
    const typingElement = document.getElementById('typingText');
    if (!typingElement) return;

    const text = typingElement.textContent;
    const cursor = document.querySelector('.terminal-cursor-blink');
    
    typingElement.textContent = '';
    
    let index = 0;
    const type = () => {
        if (index < text.length) {
            typingElement.textContent += text.charAt(index);
            index++;
            setTimeout(type, 50);
        } else if (cursor) {
            cursor.style.animation = 'cursor-blink 1s infinite';
        }
    };
    
    setTimeout(type, 500);
}

function initMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');
    let menuOpen = false;

    if (!menuBtn || !navLinks) return;

    menuBtn.addEventListener('click', () => {
        menuOpen = !menuOpen;
        
        if (menuOpen) {
            navLinks.style.display = 'flex';
            navLinks.style.position = 'fixed';
            navLinks.style.top = '60px';
            navLinks.style.left = '0';
            navLinks.style.right = '0';
            navLinks.style.flexDirection = 'column';
            navLinks.style.background = 'var(--bg-tertiary)';
            navLinks.style.padding = '1rem';
            navLinks.style.borderBottom = '1px solid var(--border)';
            navLinks.style.zIndex = '999';
        } else {
            navLinks.style.display = '';
            navLinks.style.position = '';
            navLinks.style.top = '';
            navLinks.style.left = '';
            navLinks.style.right = '';
            navLinks.style.flexDirection = '';
            navLinks.style.background = '';
            navLinks.style.padding = '';
            navLinks.style.borderBottom = '';
            navLinks.style.zIndex = '';
        }
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menuOpen = false;
            if (window.innerWidth <= 768) {
                navLinks.style.display = 'none';
            }
        });
    });
}

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    const animatedElements = document.querySelectorAll(
        '.exp-card, .skills-category, .project-card, .contact-item'
    );

    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
        observer.observe(el);
    });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-fill');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const width = bar.style.width;
                bar.style.width = '0';
                setTimeout(() => {
                    bar.style.width = width;
                }, 200);
                observer.unobserve(bar);
            }
        });
    }, { threshold: 0.5 });

    skillBars.forEach(bar => observer.observe(bar));
}

function initContactForm() {
    const form = document.getElementById('contact-form');
    const statusDiv = document.getElementById('form-status');
    
    if (!form || !statusDiv) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('contact-name').value;
        const email = document.getElementById('contact-email').value;
        const message = document.getElementById('contact-message').value;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalContent = submitBtn.innerHTML;

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i data-lucide="loader-2"></i> Sending...';
        initLucideIcons();
        statusDiv.textContent = '';
        statusDiv.className = 'form-status';

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, message })
            });

            const data = await response.json();

            if (response.ok) {
                statusDiv.textContent = '✓ Message sent successfully!';
                statusDiv.classList.add('success');
                form.reset();
            } else {
                statusDiv.textContent = '✗ Failed to send. Please try again.';
                statusDiv.classList.add('error');
            }
        } catch (error) {
            console.error('Form error:', error);
            statusDiv.textContent = '✗ Network error. Please try again.';
            statusDiv.classList.add('error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalContent;
            initLucideIcons();
        }
    });
}