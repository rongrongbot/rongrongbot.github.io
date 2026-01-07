/**
 * Vercel Serverless Function - Post Comments API
 * 포스트별 댓글 관리
 */

// 포스트별 댓글 저장 (메모리 - 배포 시 리셋됨)
// 실제 서비스에서는 Vercel KV 사용 권장
let postComments = {};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    return res.status(200).end();
  }

  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  try {
    if (req.method === 'GET') {
      return handleGet(req, res);
    } else if (req.method === 'POST') {
      return handlePost(req, res);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/post-comments?postId=xxx
 */
async function handleGet(req, res) {
  const { postId } = req.query;

  if (!postId) {
    return res.status(400).json({ error: 'postId is required' });
  }

  const comments = postComments[postId] || [];
  return res.status(200).json(comments);
}

/**
 * POST /api/post-comments
 */
async function handlePost(req, res) {
  const { postId, name, message } = req.body;

  if (!postId) {
    return res.status(400).json({ error: 'postId is required' });
  }

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (message.length > 500) {
    return res.status(400).json({ error: 'Message too long (max 500 characters)' });
  }

  const sanitizedName = (name || '익명').slice(0, 50).trim();
  const sanitizedMessage = message.slice(0, 500).trim();

  const comment = {
    id: generateId(),
    name: sanitizedName,
    message: sanitizedMessage,
    createdAt: new Date().toISOString(),
  };

  if (!postComments[postId]) {
    postComments[postId] = [];
  }

  postComments[postId].unshift(comment);

  // 포스트당 최대 100개 댓글
  if (postComments[postId].length > 100) {
    postComments[postId] = postComments[postId].slice(0, 100);
  }

  return res.status(201).json(comment);
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
