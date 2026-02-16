/**
 * Vercel Serverless Function - Delete Comment API
 * Handles DELETE operations with admin authentication
 *
 * Environment Variables needed:
 * - ADMIN_PASSWORD: Password for deleting comments
 */

// If using Vercel KV, uncomment this:
// import { kv } from '@vercel/kv';

// Reference to the same comments array (in production, use shared storage)
// This is a workaround - in production, use Vercel KV or a database
let comments = [];

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, adminPassword } = req.body;

    // Validate admin password
    const correctPassword = process.env.ADMIN_PASSWORD;

    if (!correctPassword) {
      console.error('ADMIN_PASSWORD environment variable not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    if (adminPassword !== correctPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    if (!id) {
      return res.status(400).json({ error: 'Comment ID is required' });
    }

    // For Vercel KV:
    // const allComments = await kv.lrange('comments', 0, -1);
    // const filteredComments = allComments.filter(c => JSON.parse(c).id !== id);
    // await kv.del('comments');
    // for (const comment of filteredComments.reverse()) {
    //   await kv.lpush('comments', comment);
    // }

    // In-memory deletion:
    const initialLength = comments.length;
    comments = comments.filter(c => c.id !== id);

    if (comments.length === initialLength) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    return res.status(200).json({ success: true, message: 'Comment deleted' });

  } catch (error) {
    console.error('Delete Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
