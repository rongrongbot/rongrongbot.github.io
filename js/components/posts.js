/**
 * Posts Component - 포스트 목록 동적 로드 및 카테고리 필터링
 */

// 전역 변수: 포스트 데이터 캐시
let postsData = null;
let categoriesData = null;

async function loadPostsData() {
  if (postsData) return { posts: postsData, categories: categoriesData };

  // 경로 계산
  const path = window.location.pathname;
  let basePath = '';
  if (path.includes('/blog/posts/')) basePath = '../../';
  else if (path.includes('/blog/')) basePath = '../';

  try {
    const response = await fetch(basePath + 'data/posts.json');
    const data = await response.json();
    postsData = data.posts || [];
    categoriesData = data.categories || [];
    return { posts: postsData, categories: categoriesData };
  } catch (error) {
    console.error('Failed to load posts:', error);
    return { posts: [], categories: [] };
  }
}

/**
 * 카테고리별 포스트 필터링
 */
function filterPostsByCategory(categoryId) {
  const filteredPosts = categoryId === 'all'
    ? postsData
    : postsData.filter(post => post.category === categoryId);

  // 홈페이지의 최근 글 업데이트
  const recentContainer = document.getElementById('recentPosts');
  if (recentContainer) {
    renderRecentPostsHTML(recentContainer, filteredPosts.slice(0, 5));
  }

  // 블로그 페이지의 전체 글 업데이트
  const allContainer = document.getElementById('allPosts');
  if (allContainer) {
    renderAllPostsHTML(allContainer, filteredPosts);
  }

  // 홈페이지에서 카테고리 선택 시 섹션 표시/숨김
  updateHomePageSections(categoryId);
}

/**
 * 홈페이지 섹션 표시/숨김 처리
 */
function updateHomePageSections(categoryId) {
  const path = window.location.pathname;
  const isHome = path.endsWith('index.html') || path.endsWith('/') || path === '' ||
                 (!path.includes('/blog/') && !path.includes('/guestbook'));

  if (!isHome) return;

  const contentWindows = document.querySelectorAll('.main-content .content-window');
  if (contentWindows.length < 3) return;

  const welcomeWindow = contentWindows[0];  // welcome.txt
  const recentWindow = contentWindows[1];   // recent_posts.txt
  const updateWindow = contentWindows[2];   // update_log.txt

  if (categoryId === 'all' || !categoryId) {
    // 전체 보기: 모든 섹션 표시, 원래 제목 복원
    welcomeWindow.style.display = '';
    recentWindow.style.display = '';
    updateWindow.style.display = '';
    recentWindow.querySelector('.window-title').textContent = 'recent_posts.txt';
    recentWindow.querySelector('h2').textContent = '📝 Recent Posts';
  } else {
    // 카테고리 선택: welcome, update_log 숨기고 recent_posts만 표시
    welcomeWindow.style.display = 'none';
    updateWindow.style.display = 'none';
    recentWindow.style.display = '';

    // 카테고리 이름 가져오기
    const categoryName = getCategoryName(categoryId);
    recentWindow.querySelector('.window-title').textContent = `${categoryId}_posts.txt`;
    recentWindow.querySelector('h2').textContent = `📝 ${categoryName}`;
  }
}

/**
 * 카테고리 ID로 이름 가져오기
 */
function getCategoryName(categoryId) {
  if (!categoriesData) return categoryId;
  const cat = categoriesData.find(c => c.id === categoryId);
  return cat ? cat.name : categoryId;
}

/**
 * 최근 포스트 렌더링 (index.html용)
 */
async function renderRecentPosts(containerId, limit = 5) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const { posts } = await loadPostsData();
  const recentPosts = posts.slice(0, limit);

  renderRecentPostsHTML(container, recentPosts);
}

function renderRecentPostsHTML(container, posts) {
  if (posts.length === 0) {
    container.innerHTML = '<p style="color: var(--text-light); font-size: 13px;">해당 카테고리에 글이 없습니다.</p>';
    return;
  }

  const html = `
    <ul class="post-list">
      ${posts.map(post => `
        <li class="post-item">
          <a href="blog/posts/${post.file}" class="post-link">
            <span class="post-date">${post.date}</span>
            <span class="post-title">${post.title}</span>
          </a>
        </li>
      `).join('')}
    </ul>
    <div class="view-all">
      <a href="blog/index.html" class="view-all-link">→ View all posts</a>
    </div>
  `;

  container.innerHTML = html;
}

/**
 * 전체 포스트 목록 렌더링 (blog/index.html용)
 */
async function renderAllPosts(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const { posts, categories } = await loadPostsData();

  renderAllPostsHTML(container, posts, categories);
}

function renderAllPostsHTML(container, posts, categories) {
  if (posts.length === 0) {
    container.innerHTML = '<p style="color: var(--text-light); font-size: 13px;">해당 카테고리에 글이 없습니다.</p>';
    return;
  }

  // 카테고리 이름 매핑
  const categoryMap = {};
  if (categoriesData) {
    categoriesData.forEach(cat => {
      categoryMap[cat.id] = cat.name;
    });
  }

  const html = posts.map(post => `
    <article class="blog-card">
      <div class="blog-card-header">
        <span class="blog-card-date">${post.date}</span>
        <div class="blog-card-tags">
          ${post.category ? `<span class="tag category-tag">${categoryMap[post.category] || post.category}</span>` : ''}
          ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </div>
      <h3 class="blog-card-title">
        <a href="posts/${post.file}">${post.title}</a>
      </h3>
      <p class="blog-card-excerpt">${post.excerpt}</p>
    </article>
  `).join('');

  container.innerHTML = html;
}

/**
 * URL 해시에서 카테고리 가져오기
 */
function getCategoryFromHash() {
  const hash = window.location.hash.slice(1); // # 제거
  if (!hash) return 'all';

  // 유효한 카테고리인지 확인
  const validCategories = ['all', 'daily', 'ps', 'books', 'food'];
  return validCategories.includes(hash) ? hash : 'all';
}

/**
 * 해시 변경 시 카테고리 필터링 적용
 */
function handleHashChange() {
  const category = getCategoryFromHash();

  // 사이드바 active 상태 업데이트
  const categoryLinks = document.querySelectorAll('.category-link');
  categoryLinks.forEach(link => {
    if (link.dataset.category === category) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // 카테고리 필터링 적용
  if (postsData) {
    filterPostsByCategory(category);
  }
}

// 페이지 로드 시 자동 실행
document.addEventListener('DOMContentLoaded', async () => {
  await renderRecentPosts('recentPosts');
  await renderAllPosts('allPosts');

  // 초기 해시 처리
  const initialCategory = getCategoryFromHash();
  if (initialCategory !== 'all') {
    handleHashChange();
  }
});

// 해시 변경 감지
window.addEventListener('hashchange', handleHashChange);
