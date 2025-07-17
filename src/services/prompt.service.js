const Prompt = require('../models/prompt.model');

exports.create = (data) => Prompt.create({ ...data, tags: data.tags?.join(',') });

exports.getById = (id) => Prompt.findByPk(id);

exports.list = (offset = 0, limit = 20) =>
  Prompt.findAll({ offset, limit, order: [['created_at', 'DESC']] });

exports.update = async (id, data) => {
  const prompt = await Prompt.findByPk(id);
  if (!prompt) return null;
  await prompt.update({ ...data, tags: data.tags?.join(',') });
  return prompt;
};

exports.remove = (id) => Prompt.destroy({ where: { id } });
