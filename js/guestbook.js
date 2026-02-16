/**
 * Guestbook JavaScript
 * Handles comment fetching, posting, and admin deletion
 */

// ============ Configuration ============
// Update this URL after deploying your Vercel API
const API_URL = 'https://your-vercel-app.vercel.app/api';

// For local development/testing, you can use mock data
const USE_MOCK_DATA = true; // Set to false when API is deployed

// ============ DOM Elements ============
const guestbookForm = document.getElementById('guestbookForm');
const commentsList = document.getElementById('commentsList');
const commentCount = document.getElementById('commentCount');
const charCount = document.getElementById('charCount');
const messageInput = document.getElementById('message');
const nameInput = document.getElementById('name');
const submitBtn = document.getElementById('submitBtn');
const adminModal = document.getElementById('adminModal');
const adminPassword = document.getElementById('adminPassword');
const confirmDeleteBtn = document.getElementById('confirmDelete');
const cancelDeleteBtn = document.getElementById('cancelDelete');

let commentToDelete = null;

// ============ Mock Data for Testing ============
let mockComments = [];

// ============ Initialize ============
document.addEventListener('DOMContentLoaded', () => {
  loadComments();
  initForm();
  initModal();
});

// ============ Load Comments ============
async function loadComments() {
  try {
    let comments;

    if (USE_MOCK_DATA) {
      // Use mock data for testing
      comments = mockComments;
    } else {
      // Fetch from API
      const response = await fetch(`${API_URL}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      comments = await response.json();
    }

    renderComments(comments);
  } catch (error) {
    console.error('Error loading comments:', error);
    commentsList.innerHTML = `
      <div class="error-message">
        메시지를 불러오는데 실패했습니다.
      </div>
    `;
  }
}

// ============ Render Comments ============
function renderComments(comments) {
  if (!comments || comments.length === 0) {
    commentsList.innerHTML = `
      <div class="comments-empty">
        <span class="comments-empty-icon">&#128172;</span>
        <p>아직 메시지가 없습니다. 첫 번째 방명록을 남겨주세요!</p>
      </div>
    `;
    commentCount.textContent = '(0)';
    return;
  }

  // Sort by date (newest first)
  comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  commentsList.innerHTML = comments.map(comment => `
    <div class="comment-card" data-id="${comment.id}">
      <button class="comment-delete" onclick="openDeleteModal('${comment.id}')" title="Delete (Admin)">
        &#10006;
      </button>
      <div class="comment-header">
        <span class="comment-author">
          <span class="pixel-heart">&#9829;</span> ${escapeHtml(comment.name || 'Anonymous')}
        </span>
        <span class="comment-date">${formatDate(comment.createdAt)}</span>
      </div>
      <div class="comment-message">${escapeHtml(comment.message)}</div>
    </div>
  `).join('');

  commentCount.textContent = `(${comments.length})`;
}

// ============ Form Handling ============
function initForm() {
  // Character counter
  messageInput.addEventListener('input', () => {
    const count = messageInput.value.length;
    charCount.textContent = count;
    charCount.parentElement.classList.toggle('warning', count > 450);
  });

  // Form submission
  guestbookForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitComment();
  });
}

async function submitComment() {
  const name = nameInput.value.trim() || '익명';
  const message = messageInput.value.trim();

  if (!message) {
    showFormError('메시지를 입력해주세요!');
    return;
  }

  // Disable form
  submitBtn.disabled = true;
  submitBtn.textContent = '등록 중...';

  try {
    if (USE_MOCK_DATA) {
      // Mock submission
      const newComment = {
        id: Date.now().toString(),
        name,
        message,
        createdAt: new Date().toISOString()
      };
      mockComments.unshift(newComment);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
    } else {
      // Submit to API
      const response = await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit');
      }
    }

    // Success
    showFormSuccess('등록되었습니다! 감사합니다!');
    guestbookForm.reset();
    charCount.textContent = '0';
    loadComments();

  } catch (error) {
    console.error('Error submitting comment:', error);
    showFormError(error.message || '등록에 실패했습니다. 다시 시도해주세요.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '♡ 등록하기';
  }
}

// ============ Delete Modal ============
function initModal() {
  cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  confirmDeleteBtn.addEventListener('click', confirmDelete);

  // Close on background click
  adminModal.addEventListener('click', (e) => {
    if (e.target === adminModal) closeDeleteModal();
  });

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && adminModal.style.display !== 'none') {
      closeDeleteModal();
    }
  });
}

function openDeleteModal(commentId) {
  commentToDelete = commentId;
  adminModal.style.display = 'block';
  adminPassword.value = '';
  adminPassword.focus();
}

function closeDeleteModal() {
  adminModal.style.display = 'none';
  commentToDelete = null;
  adminPassword.value = '';
}

async function confirmDelete() {
  const password = adminPassword.value;

  if (!password) {
    alert('Please enter the admin password');
    return;
  }

  confirmDeleteBtn.disabled = true;
  confirmDeleteBtn.textContent = 'Deleting...';

  try {
    if (USE_MOCK_DATA) {
      // Mock deletion (accept any password for testing)
      mockComments = mockComments.filter(c => c.id !== commentToDelete);
      await new Promise(resolve => setTimeout(resolve, 500));
    } else {
      // Delete via API
      const response = await fetch(`${API_URL}/delete-comment`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: commentToDelete,
          adminPassword: password
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete');
      }
    }

    closeDeleteModal();
    loadComments();

  } catch (error) {
    console.error('Error deleting comment:', error);
    alert(error.message || 'Failed to delete comment');
  } finally {
    confirmDeleteBtn.disabled = false;
    confirmDeleteBtn.textContent = 'Delete';
  }
}

// ============ Utility Functions ============
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function showFormSuccess(message) {
  removeFormMessages();
  const div = document.createElement('div');
  div.className = 'success-message';
  div.textContent = message;
  guestbookForm.insertBefore(div, guestbookForm.firstChild);
  setTimeout(() => div.remove(), 5000);
}

function showFormError(message) {
  removeFormMessages();
  const div = document.createElement('div');
  div.className = 'error-message';
  div.textContent = message;
  guestbookForm.insertBefore(div, guestbookForm.firstChild);
  setTimeout(() => div.remove(), 5000);
}

function removeFormMessages() {
  const messages = guestbookForm.querySelectorAll('.success-message, .error-message');
  messages.forEach(m => m.remove());
}
