const Prompt = require('../models/prompt.model');
const Tag = require('../models/tag.model');

const includeTags = { model: Tag, as: 'tags', through: { attributes: [] } };

exports.create = async (data) => {
  const { tags = [], ...promptData } = data;
  const prompt = await Prompt.create(promptData);
  if (tags.length) {
    const tagInstances = [];
    for (const t of tags) {
      let tag;
      if (typeof t === 'string') {
        [tag] = await Tag.findOrCreate({ where: { name: t, category: 'general' } });
      } else {
        [tag] = await Tag.findOrCreate({
          where: { name: t.name, category: t.category || 'general' },
        });
      }
      tagInstances.push(tag);
    }
    await prompt.addTags(tagInstances);
  }
  return exports.getById(prompt.id);
};

exports.getById = (id) => Prompt.findByPk(id, { include: includeTags });

exports.list = (offset = 0, limit = 20) =>
  Prompt.findAll({ offset, limit, order: [['created_at', 'DESC']], include: includeTags });

exports.update = async (id, data) => {
  const prompt = await Prompt.findByPk(id);
  if (!prompt) return null;
  const { tags, ...promptData } = data;
  await prompt.update(promptData);
  if (tags) {
    const tagInstances = [];
    for (const t of tags) {
      let tag;
      if (typeof t === 'string') {
        [tag] = await Tag.findOrCreate({ where: { name: t, category: 'general' } });
      } else {
        [tag] = await Tag.findOrCreate({
          where: { name: t.name, category: t.category || 'general' },
        });
      }
      tagInstances.push(tag);
    }
    await prompt.setTags(tagInstances);
  }
  return exports.getById(id);
};

exports.remove = (id) => Prompt.destroy({ where: { id } });
