const { Router } = require('express');
const c = require('../controllers/search.controller');

const router = Router();

router.get('/prompts', c.searchPrompts);

module.exports = router;
