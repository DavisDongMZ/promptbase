const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Prompt = require('./prompt.model');

/**
 * 统计数据：每条 Prompt 一行
 * likes、uses 为累积计数；rating_sum/rating_count 用于求平均分。
 */
const PromptStat = sequelize.define('PromptStat', {
  prompt_id:   { type: DataTypes.INTEGER, allowNull: false, unique: true },
  likes:       { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  uses:        { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  rating_sum:  { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  rating_count:{ type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
}, {
  tableName: 'prompt_stats',
  underscored: true,
});

PromptStat.belongsTo(Prompt, { foreignKey: 'prompt_id' });
Prompt.hasOne(PromptStat, { foreignKey: 'prompt_id', as: 'stat' });

module.exports = PromptStat;
