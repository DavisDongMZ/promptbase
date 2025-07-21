const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Prompt = require('./prompt.model');

const PromptVersion = sequelize.define('PromptVersion', {
  branch: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'main' },
  title_diff: { type: DataTypes.TEXT, allowNull: true },
  body_diff: { type: DataTypes.TEXT, allowNull: true },
  snapshot_title: { type: DataTypes.STRING(120), allowNull: true },
  snapshot_body: { type: DataTypes.TEXT, allowNull: true },
  is_snapshot: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, {
  tableName: 'prompt_versions',
  underscored: true,
});

PromptVersion.belongsTo(Prompt, { foreignKey: 'prompt_id' });
Prompt.hasMany(PromptVersion, { foreignKey: 'prompt_id', as: 'versions' });

PromptVersion.belongsTo(PromptVersion, { foreignKey: 'parent_id', as: 'parent' });

module.exports = PromptVersion;
