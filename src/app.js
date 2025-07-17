const express = require('express');
require('dotenv').config();
const sequelize = require('./config/database');
const promptRoutes = require('./routes/prompt.routes');
const notFound = require('./middlewares/notFound');

const app = express();
app.use(express.json());

app.use('/prompts', promptRoutes);
app.use(notFound);

(async () => {
  await sequelize.authenticate();
  await sequelize.sync();      
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
})();
