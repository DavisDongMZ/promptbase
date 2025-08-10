const express = require('express');
require('dotenv').config();
const sequelize = require('./config/database');
require('./models/promptVersion.model');
require('./models/promptStat.model');
const promptRoutes = require('./routes/prompt.routes');
const migrateRoutes = require('./routes/migrate.routes');
const notFound = require('./middlewares/notFound');

const app = express();
app.use(express.json());

app.use('/prompts', promptRoutes);
app.use('/api', migrateRoutes);
app.use(notFound);

const start = async () => {
  await sequelize.authenticate();
  const PORT = process.env.PORT || 3000;
  return app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
};

if (require.main === module) {
  start();
}

module.exports = { app, start };
