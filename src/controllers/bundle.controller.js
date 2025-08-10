const service = require('../services/bundle.service');

exports.create = async (req, res, next) => {
  try {
    const bundle = await service.create(req.body);
    res.status(201).json(bundle);
  } catch (e) {
    next(e);
  }
};

exports.get = async (req, res, next) => {
  try {
    const bundle = await service.getById(req.params.id);
    if (!bundle) return res.status(404).send('Not Found');
    res.json(bundle);
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const rows = await service.remove(req.params.id);
    if (!rows) return res.status(404).send('Not Found');
    res.status(204).end();
  } catch (e) {
    next(e);
  }
};
