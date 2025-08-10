const Bundle = require('../models/bundle.model');
const Prompt = require('../models/prompt.model');

exports.create = async ({ name, description, promptIds = [] }) => {
  const bundle = await Bundle.create({ name, description });
  if (promptIds.length) {
    const prompts = await Prompt.findAll({ where: { id: promptIds } });
    await bundle.addPrompts(prompts);
  }
  return exports.getById(bundle.id);
};

exports.getById = (id) =>
  Bundle.findByPk(id, {
    include: [{ model: Prompt, as: 'prompts', through: { attributes: [] } }],
  });

exports.remove = (id) => Bundle.destroy({ where: { id } });
