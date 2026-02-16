/**
 * Vercel Serverless Function - Comments API
 * Handles GET (list) and POST (create) operations
 *
 * Deploy this folder to Vercel separately from your GitHub Pages site.
 *
 * Environment Variables needed:
 * - ADMIN_PASSWORD: Password for deleting comments
 *
 * For storage, this uses Vercel KV (Redis).
 * Set up Vercel KV in your project settings.
 */

// If using Vercel KV, uncomment this:
// import { kv } from '@vercel/kv';

// Simple in-memory storage for demo (will reset on each deploy)
// For production, use Vercel KV or a database
let comments = [];

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Set CORS headers for all responses
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
 * GET /api/comments - List all comments
 */
async function handleGet(req, res) {
  // For Vercel KV:
  // const comments = await kv.lrange('comments', 0, -1);

  return res.status(200).json(comments);
}

/**
 * POST /api/comments - Create a new comment
 */
async function handlePost(req, res) {
  const { name, message } = req.body;

  // Validation
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (message.length > 500) {
    return res.status(400).json({ error: 'Message too long (max 500 characters)' });
  }

  // Sanitize inputs
  const sanitizedName = (name || 'Anonymous').slice(0, 50).trim();
  const sanitizedMessage = message.slice(0, 500).trim();

  // Simple rate limiting (in production, use proper rate limiting)
  // This is just a basic check

  // Create comment
  const comment = {
    id: generateId(),
    name: sanitizedName,
    message: sanitizedMessage,
    createdAt: new Date().toISOString(),
  };

  // For Vercel KV:
  // await kv.lpush('comments', JSON.stringify(comment));

  // In-memory storage:
  comments.unshift(comment);

  // Keep only last 100 comments
  if (comments.length > 100) {
    comments = comments.slice(0, 100);
  }

  return res.status(201).json(comment);
}

/**
 * Generate a simple unique ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
