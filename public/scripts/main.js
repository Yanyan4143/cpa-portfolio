// public/scripts/main.js
// Page navigation and interactions

let currentPage = 'about';

function initNavigation() {
    const navButtons = document.querySelectorAll('[data-page]');
    const pages = document.querySelectorAll('.page');
    
    function showPage(pageId) {
        // Hide all pages
        pages.forEach(page => {
            page.classList.remove('active');
        });
        
        // Show selected page
        const activePage = document.getElementById(`page-${pageId}`);
        if (activePage) {
            activePage.classList.add('active');
            currentPage = pageId;
            
            // Update URL without reload
            history.pushState({ page: pageId }, '', `#${pageId}`);
            
            // Scroll to top
            window.scrollTo(0, 0);
            
            // Reinitialize Lucide icons for new content
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    }
    
    // Add click handlers to nav buttons
    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = button.getAttribute('data-page');
            showPage(pageId);
        });
    });
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', (event) => {
        const pageId = event.state?.page || getPageFromHash() || 'about';
        showPage(pageId);
        
        // Update active nav button styling
        updateActiveNavButton(pageId);
    });
    
    // Check URL hash on load
    const initialPage = getPageFromHash() || 'about';
    showPage(initialPage);
    updateActiveNavButton(initialPage);
    
    // Close mobile menu on page change
    function updateActiveNavButton(pageId) {
        navButtons.forEach(btn => {
            if (btn.getAttribute('data-page') === pageId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
}

function getPageFromHash() {
    const hash = window.location.hash.slice(1);
    const validPages = ['about', 'experience', 'skills', 'projects', 'contact'];
    return validPages.includes(hash) ? hash : null;
}

function initTypingEffect() {
    const typingElement = document.getElementById('typingText');
    if (!typingElement) return;
    
    const text = typingElement.textContent;
    const cursor = document.querySelector('.terminal-cursor-blink');
    
    typingElement.textContent = '';
    
    let index = 0;
    function type() {
        if (index < text.length) {
            typingElement.textContent += text.charAt(index);
            index++;
            setTimeout(type, 50);
        } else if (cursor) {
            cursor.style.animation = 'cursor-blink 1s infinite';
        }
    }
    
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
            navLinks.style.background = 'rgba(17, 24, 39, 0.95)';
            navLinks.style.backdropFilter = 'blur(10px)';
            navLinks.style.padding = '1rem';
            navLinks.style.borderBottom = '1px solid #374151';
            navLinks.style.zIndex = '999';
        } else {
            navLinks.style.display = '';
            navLinks.style.position = '';
            navLinks.style.top = '';
            navLinks.style.left = '';
            navLinks.style.right = '';
            navLinks.style.flexDirection = '';
            navLinks.style.background = '';
            navLinks.style.backdropFilter = '';
            navLinks.style.padding = '';
            navLinks.style.borderBottom = '';
            navLinks.style.zIndex = '';
        }
    });
    
    // Close menu when clicking a link on mobile
    navLinks.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', () => {
            menuOpen = false;
            if (window.innerWidth <= 768) {
                navLinks.style.display = '';
                navLinks.style.position = '';
                navLinks.style.top = '';
                navLinks.style.left = '';
                navLinks.style.right = '';
                navLinks.style.flexDirection = '';
                navLinks.style.background = '';
                navLinks.style.backdropFilter = '';
                navLinks.style.padding = '';
                navLinks.style.borderBottom = '';
                navLinks.style.zIndex = '';
            }
        });
    });

    // Reset menu styles when switching to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            navLinks.style.display = '';
            navLinks.style.position = '';
            navLinks.style.top = '';
            navLinks.style.left = '';
            navLinks.style.right = '';
            navLinks.style.flexDirection = '';
            navLinks.style.background = '';
            navLinks.style.backdropFilter = '';
            navLinks.style.padding = '';
            navLinks.style.borderBottom = '';
            navLinks.style.zIndex = '';
        }
    });
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
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
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
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    });
}

function initSkillBars() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bars = entry.target.querySelectorAll('.skill-fill');
                bars.forEach(bar => {
                    const width = bar.style.width;
                    bar.style.width = '0';
                    setTimeout(() => {
                        bar.style.width = width;
                    }, 100);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    
    const skillCategories = document.querySelectorAll('.skills-category');
    skillCategories.forEach(category => observer.observe(category));
}

function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    const animatedElements = document.querySelectorAll('.exp-card, .skills-category, .project-card, .contact-item');
    animatedElements.forEach(el => observer.observe(el));
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initTypingEffect();
    initMobileMenu();
    initContactForm();
    initSkillBars();
    initAnimations();
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});
