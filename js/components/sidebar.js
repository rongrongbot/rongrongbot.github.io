/**
 * Sidebar Component - Korean 갠홈 Style
 * 모든 페이지에서 공유되는 사이드바 컴포넌트
 */

// 전역 변수: 현재 선택된 카테고리
let currentCategory = 'all';

// 카테고리 목록 (여기서 직접 수정)
const CATEGORIES = [
  { id: 'daily', name: '일상' },
  { id: 'ps', name: 'PS' },
  { id: 'books', name: '독서' },
  { id: 'food', name: '미식' },
  { id: 'miscellany', name: '선집' }
];

function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  // 현재 페이지 감지
  const path = window.location.pathname;
  let currentPage = 'home';
  if (path.includes('guestbook')) currentPage = 'guestbook';
  else if (path.includes('blog')) currentPage = 'blog';

  // 경로 깊이 계산 (상대 경로용)
  let basePath = '';
  if (path.includes('/blog/posts/')) basePath = '../../';
  else if (path.includes('/blog/')) basePath = '../';

  sidebar.innerHTML = getSidebarHTML(currentPage, basePath, CATEGORIES);

  // 카테고리 클릭 이벤트 설정
  initCategoryEvents();
}

function initCategoryEvents() {
  const categoryLinks = document.querySelectorAll('.category-link');
  categoryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const category = link.dataset.category;

      // active 클래스 업데이트
      categoryLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      // 카테고리 필터링
      currentCategory = category;

      // 현재 페이지 확인
      const path = window.location.pathname;
      const isHome = path.endsWith('index.html') || path.endsWith('/') || path === '' ||
                     (!path.includes('/blog/') && !path.includes('/guestbook'));
      const isBlogRoot = path.includes('/blog/') && !path.includes('/posts/');
      const isPostPage = path.includes('/blog/posts/');
      const isGuestbook = path.includes('/guestbook') || path.includes('guestbook.html');

      const hash = category === 'all' ? '' : '#' + category;

      if (isPostPage) {
        // 포스트 페이지에서는 기록(블로그)으로 이동
        window.location.href = '../index.html' + hash;
        return;
      }

      if (isGuestbook) {
        // 방명록에서는 기록(블로그)으로 이동
        window.location.href = 'blog/index.html' + hash;
        return;
      }

      if (isHome || isBlogRoot) {
        window.location.hash = category === 'all' ? '' : category;
      }

      if (typeof filterPostsByCategory === 'function') {
        filterPostsByCategory(category);
      }
    });
  });
}

function getSidebarHTML(currentPage, basePath, categories) {
  // 블로그 링크 경로 계산
  let blogHref = basePath + 'blog/index.html';
  if (basePath === '../') blogHref = 'index.html';
  if (basePath === '../../') blogHref = '../index.html';

  // 카테고리 서브메뉴 HTML
  const categorySubMenu = categories.map(cat => `
    <a href="#" class="category-link" data-category="${cat.id}">
      <span class="category-name">${cat.name}</span>
    </a>
  `).join('');

  return `
    <!-- Profile Box -->
    <div class="sidebar-box profile-box">
      <div class="box-title">
        <span class="deco">✧</span> Profile <span class="deco">✧</span>
      </div>
      <div class="profile-content">
        <div class="profile-img">
          <img src="${basePath}images/profile.jpg" alt="profile" loading="lazy" decoding="async">
        </div>
        <div class="profile-name">rongrongbot</div>
        <div class="profile-status">
          <span class="status-dot"></span>
          <span>online</span>
        </div>
              </div>
    </div>

    <!-- Menu Box -->
    <div class="sidebar-box menu-box">
      <div class="box-title">
        <span class="deco">✧</span> Menu <span class="deco">✧</span>
      </div>
      <nav class="menu-nav">
        <a href="${basePath}index.html" class="menu-link${currentPage === 'home' ? ' active' : ''}">
          <span class="menu-icon">🏠</span>
          <span>Home</span>
        </a>
        <a href="${blogHref}" class="menu-link${currentPage === 'blog' ? ' active' : ''}">
          <span class="menu-icon">📝</span>
          <span>기록</span>
        </a>
        <!-- Category Sub-menu -->
        <div class="category-submenu">
          <a href="#" class="category-link${currentPage === 'blog' ? ' active' : ''}" data-category="all">
            <span class="category-name">전체</span>
          </a>
          ${categorySubMenu}
        </div>
        <a href="${basePath}guestbook.html" class="menu-link${currentPage === 'guestbook' ? ' active' : ''}">
          <span class="menu-icon">📮</span>
          <span>방명록</span>
        </a>
      </nav>
    </div>

    <!-- Links Box -->
    <div class="sidebar-box links-box">
      <div class="box-title">
        <span class="deco">☆</span> Links <span class="deco">☆</span>
      </div>
      <div class="link-icons">
        <a href="#" class="link-icon" title="Email">✉️</a>
        <a href="#" class="link-icon" title="GitHub">💻</a>
        <a href="#" class="link-icon" title="Twitter">🐦</a>
      </div>
    </div>
  `;
}

// DOM 로드 시 사이드바 초기화
document.addEventListener('DOMContentLoaded', initSidebar);
