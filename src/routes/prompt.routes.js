const { Router } = require('express');
const c = require('../controllers/prompt.controller');
const moderation = require('../middlewares/moderation');

const router = Router();

// Create a new Prompt
// POST /prompts
router.post('/', moderation, c.create);

// List all Prompts (with optional pagination via query params ?page=&size=)
// GET /prompts
router.get('/', c.list);

// Retrieve a single Prompt by its ID
// GET /prompts/:id
router.get('/:id', c.get);

// Replace an existing Prompt completely by its ID
// PUT /prompts/:id
router.put('/:id', moderation, c.update);

// --- Stats APIs ---
// POST /prompts/:id/like
router.post('/:id/like', c.like);
// POST /prompts/:id/use
router.post('/:id/use', c.use);
// POST /prompts/:id/rating  { score: 1..5 }
router.post('/:id/rating', c.rating);

// List versions
router.get('/:id/versions', c.listVersions);

// Get a reconstructed version
router.get('/:id/versions/:versionId', c.getVersion);

// Restore to a version
router.post('/:id/versions/:versionId/restore', c.restoreVersion);

// Create a new branch
router.post('/:id/branches', c.branch);

// Remove a Prompt by its ID
// DELETE /prompts/:id
router.delete('/:id', c.remove);

module.exports = router;
