/**
 * Post Loader - 마크다운 포스트를 동적으로 로드
 */

document.addEventListener('DOMContentLoaded', async () => {
  // URL에서 포스트 ID 가져오기
  const params = new URLSearchParams(window.location.search);
  const postId = params.get('id');

  if (!postId) {
    showError('포스트를 찾을 수 없습니다.');
    return;
  }

  try {
    // posts.json에서 메타데이터 가져오기
    const response = await fetch('../../data/posts.json');
    const data = await response.json();
    const post = data.posts.find(p => p.id === postId);

    if (!post) {
      showError('포스트를 찾을 수 없습니다.');
      return;
    }

    // 메타데이터 적용
    applyMetadata(post);

    // 마크다운 파일 로드
    const mdResponse = await fetch(`../../data/posts/${postId}.md`);
    if (!mdResponse.ok) {
      showError('포스트 내용을 불러올 수 없습니다.');
      return;
    }

    let markdown = await mdResponse.text();

    // frontmatter 제거 (--- 로 감싸진 부분)
    markdown = markdown.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');

    // 마크다운을 HTML로 변환
    const html = marked.parse(markdown);

    // 콘텐츠 렌더링
    document.getElementById('postContent').innerHTML = html;

  } catch (error) {
    console.error('Failed to load post:', error);
    showError('포스트를 불러오는 중 오류가 발생했습니다.');
  }
});

/**
 * 포스트 메타데이터 적용
 */
function applyMetadata(post) {
  // 페이지 제목
  document.title = `☆ ${post.title} - rongronglog ☆`;

  // 윈도우 타이틀
  document.getElementById('windowTitle').textContent = `${post.id}.md`;

  // 포스트 제목
  document.getElementById('postTitle').textContent = post.title;

  // 날짜
  document.getElementById('postDate').textContent = post.date;

  // 태그
  const tagsContainer = document.getElementById('postTags');
  const allTags = [post.category, ...post.tags].filter(Boolean);
  tagsContainer.innerHTML = allTags.map(tag =>
    `<span class="tag">${tag}</span>`
  ).join('');

  // Open Graph 메타 태그 업데이트
  document.querySelector('meta[property="og:title"]').content = post.title;
  document.querySelector('meta[property="og:description"]').content = post.excerpt;
  document.querySelector('meta[name="twitter:title"]').content = post.title;
  document.querySelector('meta[name="twitter:description"]').content = post.excerpt;
  document.querySelector('meta[name="description"]').content = post.excerpt;
}

/**
 * 에러 표시
 */
function showError(message) {
  document.getElementById('postTitle').textContent = 'Error';
  document.getElementById('postContent').innerHTML = `
    <p style="color: var(--text-light);">${message}</p>
    <p><a href="../index.html">← 블로그로 돌아가기</a></p>
  `;
}
