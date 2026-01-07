/**
 * Main JavaScript - Korean 갠홈 Style Effects
 * Handles stars, shooting stars, and interactive elements
 */

// Mobile detection
const isMobile = () => window.innerWidth <= 850;

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initStars();
  initShootingStars();
  initClickSparkles();
  initMenuEffects();
  initWindowControls();
});

/**
 * Mobile hamburger menu
 */
function initMobileMenu() {
  // Only run on mobile
  if (!isMobile()) return;

  // Create hamburger button
  const hamburger = document.createElement('button');
  hamburger.className = 'hamburger-btn';
  hamburger.id = 'hamburgerBtn';
  hamburger.innerHTML = `
    <span class="hamburger-line"></span>
    <span class="hamburger-line"></span>
    <span class="hamburger-line"></span>
  `;
  hamburger.setAttribute('aria-label', '메뉴 열기');

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  overlay.id = 'sidebarOverlay';

  // Add to body
  document.body.appendChild(hamburger);
  document.body.appendChild(overlay);

  // Move sidebar to body for proper z-index stacking
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    document.body.appendChild(sidebar);
  }

  function getSidebar() {
    return document.getElementById('sidebar');
  }

  function openMobileMenu() {
    const sidebar = getSidebar();
    if (sidebar) sidebar.classList.add('sidebar-open');
    overlay.classList.add('active');
    hamburger.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    const sidebar = getSidebar();
    if (sidebar) sidebar.classList.remove('sidebar-open');
    overlay.classList.remove('active');
    hamburger.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Toggle menu
  hamburger.addEventListener('click', () => {
    const sidebar = getSidebar();
    if (sidebar && sidebar.classList.contains('sidebar-open')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  // Close on overlay click
  overlay.addEventListener('click', closeMobileMenu);

  // Close on menu link click (use event delegation on document)
  document.addEventListener('click', (e) => {
    if (e.target.closest('.menu-link, .category-link') && isMobile()) {
      setTimeout(closeMobileMenu, 100);
    }
  });

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    const sidebar = getSidebar();
    if (e.key === 'Escape' && sidebar?.classList.contains('sidebar-open')) {
      closeMobileMenu();
    }
  });
}

/**
 * Create background stars
 */
function initStars() {
  // No stars on mobile
  if (isMobile()) return;

  const container = document.getElementById('starsBg');
  if (!container) return;

  const starCount = 80;

  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.className = Math.random() > 0.8 ? 'star large' : 'star';

    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 3}s`;
    star.style.animationDuration = `${2 + Math.random() * 2}s`;

    container.appendChild(star);
  }
}

/**
 * Create shooting stars periodically
 */
function initShootingStars() {
  // Disable shooting stars on mobile for performance
  if (isMobile()) return;

  const container = document.getElementById('shootingStars');
  if (!container) return;

  function createShootingStar() {
    const star = document.createElement('div');
    star.className = 'shooting-star';

    // Random starting position (top area of screen)
    star.style.left = `${Math.random() * 70}%`;
    star.style.top = `${Math.random() * 30}%`;

    // Random size
    const width = 80 + Math.random() * 60;
    star.style.width = `${width}px`;

    // Random animation duration
    const duration = 2 + Math.random() * 2;
    star.style.animationDuration = `${duration}s`;

    container.appendChild(star);

    // Remove after animation
    setTimeout(() => {
      star.remove();
    }, duration * 1000);
  }

  // Create shooting stars at random intervals
  function scheduleShootingStar() {
    const delay = 3000 + Math.random() * 5000; // 3-8 seconds
    setTimeout(() => {
      createShootingStar();
      scheduleShootingStar();
    }, delay);
  }

  // Start with a slight delay
  setTimeout(scheduleShootingStar, 2000);
}

/**
 * Click sparkle effect
 */
function initClickSparkles() {
  // Disable sparkles on mobile for performance
  if (isMobile()) return;

  const colors = ['#ff6b8a', '#ff8fa3', '#ffb6c1', '#ff4757', '#ffb347'];

  document.addEventListener('click', (e) => {
    // Don't create sparkles on interactive elements
    if (e.target.closest('a, button, input, .menu-link')) return;

    createSparkle(e.clientX, e.clientY, colors);
  });
}

function createSparkle(x, y, colors) {
  const sparkleCount = 6;

  for (let i = 0; i < sparkleCount; i++) {
    const sparkle = document.createElement('div');

    const offsetX = (Math.random() - 0.5) * 50;
    const offsetY = (Math.random() - 0.5) * 50;
    const size = 4 + Math.random() * 4;

    sparkle.style.cssText = `
      position: fixed;
      left: ${x + offsetX}px;
      top: ${y + offsetY}px;
      width: ${size}px;
      height: ${size}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      animation: sparkle-fade 0.8s ease-out forwards;
      animation-delay: ${Math.random() * 0.1}s;
    `;

    document.body.appendChild(sparkle);

    setTimeout(() => {
      sparkle.remove();
    }, 900);
  }
}

/**
 * Menu hover effects
 */
function initMenuEffects() {
  // Menu link hover sound effect (visual feedback)
  const menuLinks = document.querySelectorAll('.menu-link');
  menuLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      link.style.transition = 'all 0.2s ease';
    });
  });

  // Window buttons hover effects
  const winBtns = document.querySelectorAll('.win-btn');
  winBtns.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'scale(1.1)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  // Link icons bounce effect
  const linkIcons = document.querySelectorAll('.link-icon');
  linkIcons.forEach(icon => {
    icon.addEventListener('mouseenter', () => {
      icon.style.animation = 'bounce 0.5s ease';
    });
    icon.addEventListener('animationend', () => {
      icon.style.animation = '';
    });
  });
}

/**
 * Window controls (close button)
 */
function initWindowControls() {
  const closeButtons = document.querySelectorAll('.win-btn.close');

  closeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const window = btn.closest('.content-window');
      if (window) {
        // Add closing animation
        window.classList.add('closing');

        // After animation, hide the window
        setTimeout(() => {
          window.classList.add('closed');
          window.classList.remove('closing');
        }, 300);
      }
    });
  });

  // Double-click on window header to restore all closed windows
  document.addEventListener('dblclick', (e) => {
    if (e.target.closest('.ganhome-footer')) {
      const closedWindows = document.querySelectorAll('.content-window.closed');
      closedWindows.forEach(window => {
        window.classList.remove('closed');
      });
    }
  });
}

/**
 * Utility: Show notification (갠홈 style)
 */
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');

  const bgColors = {
    info: 'linear-gradient(135deg, #ff6b8a 0%, #ff8fa3 100%)',
    success: 'linear-gradient(135deg, #ffb347 0%, #ff8fa3 100%)',
    error: 'linear-gradient(135deg, #ff4757 0%, #ff6b8a 100%)'
  };

  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 20px;
    background: ${bgColors[type]};
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    font-family: 'Nanum Gothic', sans-serif;
    font-size: 13px;
    color: white;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;

  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes sparkle-fade {
    0% {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
    100% {
      opacity: 0;
      transform: scale(0) translateY(-20px);
    }
  }

  @keyframes bounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.3); }
  }

  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);
