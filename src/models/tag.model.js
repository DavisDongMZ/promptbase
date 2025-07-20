const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tag = sequelize.define('Tag', {
  name:     { type: DataTypes.STRING(50), allowNull: false },
  category: { type: DataTypes.STRING(50), allowNull: false },
}, {
  tableName: 'tags',
  underscored: true,
});

module.exports = Tag;
