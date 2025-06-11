// teamSimpleRoutes.js - Simple and reliable team search routes
// Focused on core functionality without complex features

const express = require('express');
const router = express.Router();

// Import controllers
const teamSimpleSearchController = require('../controllers/teamSimpleSearch.controller');

// Import middleware
const auth = require('../middleware/auth');

// Basic rate limiting (lighter than complex rate limiting)
const basicRateLimit = require('express-rate-limit')({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// =============================================================================
// SIMPLE SEARCH ROUTES (Lightweight and Fast)
// =============================================================================

// GET /api/teams-simple/search?name=teamName
// Search teams by name only - Simple and fast
router.get('/search',
  basicRateLimit,
  auth,
  teamSimpleSearchController.searchTeamsByName
);

// GET /api/teams-simple/:teamId/members/search?query=nameOrEmail  
// Search members in team by name/email - Simple and fast
router.get('/:teamId/members/search',
  basicRateLimit,
  auth,
  teamSimpleSearchController.searchMembersInTeam
);

// Health check for simple API
router.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Simple Team Search API is running',
    timestamp: new Date().toISOString(),
    features: [
      'Simple team search by name',
      'Simple member search in team',
      'Basic rate limiting',
      'Fast response times'
    ]
  });
});

module.exports = router;
