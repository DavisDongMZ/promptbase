const { Router } = require('express');
const c = require('../controllers/prompt.controller');

const router = Router();

// Create a new Prompt
// POST /prompts
router.post('/', c.create);

// List all Prompts (with optional pagination via query params ?page=&size=)
// GET /prompts
router.get('/', c.list);

// Retrieve a single Prompt by its ID
// GET /prompts/:id
router.get('/:id', c.get);

// Replace an existing Prompt completely by its ID
// PUT /prompts/:id
router.put('/:id', c.update);

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
