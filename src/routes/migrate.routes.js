const { Router } = require('express');
const sequelize = require('../config/database');
require('../models/prompt.model');
require('../models/tag.model');
require('../models/promptVersion.model');
require('../models/promptStat.model');
require('../models/bundle.model');

const router = Router();

router.get('/migrate', async (req, res, next) => {
  try {
    await sequelize.sync();
    res.send('Migration completed');
  } catch (e) {
    next(e);
  }
});

module.exports = router;
