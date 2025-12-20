document.addEventListener('DOMContentLoaded', () => {
    // Theme Switcher
    const themeToggle = document.getElementById('theme-toggle');
    const icon = themeToggle ? themeToggle.querySelector('i') : null;
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        if (savedTheme === 'dark' && icon) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);

            if (icon) {
                icon.classList.toggle('fa-moon');
                icon.classList.toggle('fa-sun');
            }
        });
    }

    // Mobile Navigation
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links li');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            
            // Animate Links
            links.forEach((link, index) => {
                if (link.style.animation) {
                    link.style.animation = '';
                } else {
                    link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
                }
            });

            // Hamburger Animation
            hamburger.classList.toggle('toggle');
        });
    }

    // Load Portfolio Data
    loadPortfolio();

    // GSAP Animations
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Hero Animations
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            gsap.from(".hero-content h1", {
                duration: 1,
                y: 100,
                opacity: 0,
                ease: "power4.out",
                delay: 0.5
            });
            
            gsap.from(".hero-content p", {
                duration: 1,
                y: 50,
                opacity: 0,
                ease: "power3.out",
                delay: 0.8
            });

            gsap.from(".cta-group", {
                duration: 1,
                y: 50,
                opacity: 0,
                ease: "power3.out",
                delay: 1
            });

            // Parallax Effect on Hero
            gsap.to(".hero", {
                backgroundPosition: "50% 100%",
                ease: "none",
                scrollTrigger: {
                    trigger: ".hero",
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                }
            });
        }
    }
});

async function loadPortfolio() {
    const featuredContainer = document.getElementById('featured-portfolio');
    const fullContainer = document.getElementById('full-portfolio');

    if (!featuredContainer && !fullContainer) return;

    try {
        const response = await fetch('data/projects.json');
        const data = await response.json();

        if (featuredContainer) {
            // Home Page: Random Selection
            const allProjects = [];
            data.themes.forEach(theme => {
                theme.projects.forEach(project => {
                    allProjects.push(project);
                });
            });

            // Shuffle and pick 3
            const shuffled = allProjects.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 3);

            selected.forEach(project => {
                const card = createProjectCard(project);
                featuredContainer.appendChild(card);
            });
        }

        if (fullContainer) {
            // Portfolio Page: Filterable Grid
            fullContainer.innerHTML = ''; // Clear existing content

            // 1. Create Filter Controls
            const filterContainer = document.createElement('div');
            filterContainer.className = 'filter-container';
            
            const allBtn = document.createElement('button');
            allBtn.className = 'filter-btn active';
            allBtn.textContent = 'All';
            allBtn.dataset.filter = 'all';
            filterContainer.appendChild(allBtn);

            data.themes.forEach(theme => {
                const btn = document.createElement('button');
                btn.className = 'filter-btn';
                btn.textContent = theme.title;
                btn.dataset.filter = theme.id;
                filterContainer.appendChild(btn);
            });

            fullContainer.appendChild(filterContainer);

            // 2. Create Grid
            const grid = document.createElement('div');
            grid.className = 'portfolio-grid';

            data.themes.forEach(theme => {
                theme.projects.forEach(project => {
                    const card = createProjectCard(project);
                    card.dataset.category = theme.id;
                    // Add animation class for initial load
                    card.classList.add('fade-in-up');
                    grid.appendChild(card);
                });
            });

            fullContainer.appendChild(grid);

            // 3. Filter Logic
            const buttons = filterContainer.querySelectorAll('.filter-btn');
            const cards = grid.querySelectorAll('.project-card');

            buttons.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Update Active Button
                    buttons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    const filterValue = btn.dataset.filter;

                    cards.forEach(card => {
                        if (filterValue === 'all' || card.dataset.category === filterValue) {
                            card.style.display = 'block';
                            // Small timeout to allow display:block to apply before opacity transition
                            setTimeout(() => {
                                card.style.opacity = '1';
                                card.style.transform = 'translateY(0)';
                            }, 10);
                        } else {
                            card.style.opacity = '0';
                            card.style.transform = 'translateY(20px)';
                            setTimeout(() => {
                                card.style.display = 'none';
                            }, 300); // Match CSS transition duration
                        }
                    });
                });
            });
        }

        // Initialize Observers for new elements
        initObservers();

    } catch (error) {
        console.error('Error loading portfolio:', error);
    }
}

function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';

    let mediaHtml = '';
    
    if (project.type === 'web' || project.type === 'image-gallery') {
        if (project.images && project.images.length > 0) {
            if (project.images.length > 1) {
                // Carousel
                const slides = project.images.map(img => `<div class="carousel-slide"><img src="${img}" alt="${project.title}"></div>`).join('');
                mediaHtml = `
                    <div class="carousel-container">
                        <div class="carousel-track">
                            ${slides}
                        </div>
                        <button class="carousel-btn prev" onclick="moveCarousel(this, -1)"><i class="fas fa-chevron-left"></i></button>
                        <button class="carousel-btn next" onclick="moveCarousel(this, 1)"><i class="fas fa-chevron-right"></i></button>
                    </div>
                `;
            } else {
                // Single Image
                mediaHtml = `<img src="${project.images[0]}" alt="${project.title}">`;
            }
        } else {
             mediaHtml = `<div style="height:100%; background:#eee; display:flex; align-items:center; justify-content:center;">No Image</div>`;
        }
    } else if (project.type === 'video') {
        mediaHtml = `
            <video controls>
                <source src="${project.src}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        `;
    } else if (project.type === 'pdf') {
        mediaHtml = `
            <div style="height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#f9f9f9;">
                <i class="fas fa-file-pdf pdf-icon"></i>
                <a href="${project.src}" class="btn text-btn" download>Download PDF</a>
            </div>
        `;
        card.classList.add('pdf-card');
    }

    const linkHtml = project.link ? `<a href="${project.link}" target="_blank" class="btn secondary" style="padding: 5px 15px; font-size: 0.8rem;">View Live</a>` : '';
    
    card.innerHTML = `
        <div class="card-media">
            ${mediaHtml}
        </div>
        <div class="card-content">
            <h3 class="card-title">${project.title}</h3>
            <p class="card-desc">${project.description}</p>
            <div class="card-actions">
                ${linkHtml}
            </div>
        </div>
    `;

    return card;
}

window.moveCarousel = function(btn, direction) {
    const container = btn.closest('.carousel-container');
    const track = container.querySelector('.carousel-track');
    const slides = track.children;
    const slideWidth = slides[0].offsetWidth;
    
    let currentIndex = parseInt(track.getAttribute('data-index') || '0');
    let newIndex = currentIndex + direction;

    if (newIndex < 0) newIndex = slides.length - 1;
    if (newIndex >= slides.length) newIndex = 0;

    track.style.transform = `translateX(-${newIndex * slideWidth}px)`;
    track.setAttribute('data-index', newIndex);
};

function initObservers() {
    const observerOptions = {
        threshold: 0.1
    };

    const appearObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                appearObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.project-card');
    fadeElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        appearObserver.observe(el);
    });
}

// Keyframes for nav link fade
const styleSheet = document.createElement("style");
styleSheet.innerText = `
    @keyframes navLinkFade {
        from {
            opacity: 0;
            transform: translateX(50px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .toggle .line:nth-child(1) {
        transform: rotate(-45deg) translate(-5px, 6px);
    }
    .toggle .line:nth-child(2) {
        opacity: 0;
    }
    .toggle .line:nth-child(3) {
        transform: rotate(45deg) translate(-5px, -6px);
    }
`;
document.head.appendChild(styleSheet);
