const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Prompt = require('./prompt.model');

const Bundle = sequelize.define(
  'Bundle',
  {
    name: { type: DataTypes.STRING(120), allowNull: false },
    description: { type: DataTypes.TEXT },
  },
  {
    tableName: 'bundles',
    underscored: true,
  }
);

Bundle.belongsToMany(Prompt, { through: 'bundle_prompts', as: 'prompts' });
Prompt.belongsToMany(Bundle, { through: 'bundle_prompts', as: 'bundles' });

module.exports = Bundle;
