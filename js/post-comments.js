/**
 * Post Comments - 포스트 댓글 기능
 */

// API 엔드포인트 (Vercel 배포 후 수정 필요)
const COMMENTS_API = 'https://rongrongbot.vercel.app/api/post-comments';

let currentPostId = null;

document.addEventListener('DOMContentLoaded', () => {
  // URL에서 포스트 ID 가져오기
  const params = new URLSearchParams(window.location.search);
  currentPostId = params.get('id');

  if (currentPostId) {
    loadComments();
    initCommentForm();
  }
});

/**
 * 댓글 목록 로드
 */
async function loadComments() {
  const container = document.getElementById('commentsList');
  if (!container) return;

  try {
    const response = await fetch(`${COMMENTS_API}?postId=${currentPostId}`);
    const comments = await response.json();

    if (comments.length === 0) {
      container.innerHTML = '<p class="no-comments">아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>';
    } else {
      container.innerHTML = comments.map(comment => `
        <div class="comment-item">
          <div class="comment-header">
            <span class="comment-name">${escapeHtml(comment.name)}</span>
            <span class="comment-date">${formatDate(comment.createdAt)}</span>
          </div>
          <p class="comment-message">${escapeHtml(comment.message)}</p>
        </div>
      `).join('');
    }

    // 댓글 수 업데이트
    const countEl = document.getElementById('commentCount');
    if (countEl) {
      countEl.textContent = `(${comments.length})`;
    }
  } catch (error) {
    console.error('Failed to load comments:', error);
    container.innerHTML = '<p class="error-message">댓글을 불러오는데 실패했습니다.</p>';
  }
}

/**
 * 댓글 폼 초기화
 */
function initCommentForm() {
  const form = document.getElementById('commentForm');
  if (!form) return;

  const messageInput = document.getElementById('commentMessage');
  const charCount = document.getElementById('commentCharCount');

  // 글자 수 카운트
  if (messageInput && charCount) {
    messageInput.addEventListener('input', () => {
      charCount.textContent = messageInput.value.length;
    });
  }

  // 폼 제출
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('commentName').value.trim();
    const message = messageInput.value.trim();

    if (!message) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    const submitBtn = document.getElementById('commentSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = '등록 중...';

    try {
      const response = await fetch(COMMENTS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: currentPostId,
          name: name || '익명',
          message
        })
      });

      if (response.ok) {
        form.reset();
        if (charCount) charCount.textContent = '0';
        await loadComments();
      } else {
        const error = await response.json();
        alert(error.error || '댓글 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
      alert('댓글 등록에 실패했습니다.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '댓글 등록';
    }
  });
}

/**
 * HTML 이스케이프
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 날짜 포맷
 */
function formatDate(isoString) {
  const date = new Date(isoString);
  const year = date.getFullYear().toString().slice(2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}.${month}.${day} ${hours}:${minutes}`;
}
