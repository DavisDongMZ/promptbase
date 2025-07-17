const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Prompt = sequelize.define('Prompt', {
  title:      { type: DataTypes.STRING(120), allowNull: false },
  body:       { type: DataTypes.TEXT,        allowNull: false },
  tags:       { type: DataTypes.STRING(255), allowNull: true },
}, {
  tableName: 'prompts',
  underscored: true,          // created_at, updated_at
});

module.exports = Prompt;
