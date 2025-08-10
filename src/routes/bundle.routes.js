const { Router } = require('express');
const c = require('../controllers/bundle.controller');

const router = Router();

router.post('/', c.create);
router.get('/:id', c.get);
router.delete('/:id', c.remove);

module.exports = router;
