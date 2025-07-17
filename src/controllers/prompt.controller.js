const service = require('../services/prompt.service');

exports.create = async (req, res, next) => {
  try {
    const prompt = await service.create(req.body);
    res.status(201).json(prompt);
  } catch (e) { next(e); }
};

exports.list = async (req, res, next) => {
  try {
    const { page = 1, size = 20 } = req.query;
    const prompts = await service.list((page - 1) * size, +size);
    res.json(prompts);
  } catch (e) { next(e); }
};

exports.get = async (req, res, next) => {
  try {
    const prompt = await service.getById(req.params.id);
    if (!prompt) return res.status(404).send('Not Found');
    res.json(prompt);
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const prompt = await service.update(req.params.id, req.body);
    if (!prompt) return res.status(404).send('Not Found');
    res.json(prompt);
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    const rows = await service.remove(req.params.id);
    if (!rows) return res.status(404).send('Not Found');
    res.status(204).end();
  } catch (e) { next(e); }
};
