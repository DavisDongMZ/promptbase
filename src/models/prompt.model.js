const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Tag = require('./tag.model');

const Prompt = sequelize.define('Prompt', {
  title: { type: DataTypes.STRING(120), allowNull: false },
  body:  { type: DataTypes.TEXT,        allowNull: false },
}, {
  tableName: 'prompts',
  underscored: true,          // created_at, updated_at
});

Prompt.belongsToMany(Tag, { through: 'prompt_tags', as: 'tags' });
Tag.belongsToMany(Prompt, { through: 'prompt_tags', as: 'prompts' });

module.exports = Prompt;
