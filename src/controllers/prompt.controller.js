const service = require('../services/prompt.service');

exports.create = async (req, res, next) => {
  try {
    const prompt = await service.create(req.body);
    res.status(201).json(prompt);
  } catch (e) { next(e); }
};

exports.list = async (req, res, next) => {
  try {
    const { page = 1, size = 20, sort = 'hot' } = req.query;
    const prompts = await service.list((page - 1) * size, +size, sort);
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

exports.like = async (req, res, next) => {
  try {
    const prompt = await service.addLike(req.params.id);
    if (!prompt) return res.status(404).send('Not Found');
    res.status(200).json(prompt);
  } catch (e) { next(e); }
};

exports.use = async (req, res, next) => {
  try {
    const prompt = await service.addUse(req.params.id);
    if (!prompt) return res.status(404).send('Not Found');
    res.status(200).json(prompt);
  } catch (e) { next(e); }
};

exports.rating = async (req, res, next) => {
  try {
    const prompt = await service.addRating(req.params.id, req.body.score);
    if (!prompt) return res.status(404).send('Not Found');
    res.status(200).json(prompt);
  } catch (e) { next(e); }
};

exports.listVersions = async (req, res, next) => {
  try {
    const versions = await service.getVersions(req.params.id, req.query.branch);
    res.json(versions);
  } catch (e) { next(e); }
};

exports.getVersion = async (req, res, next) => {
  try {
    const version = await service.reconstructVersion(req.params.versionId);
    if (!version) return res.status(404).send('Not Found');
    res.json(version);
  } catch (e) { next(e); }
};

exports.restoreVersion = async (req, res, next) => {
  try {
    const content = await service.reconstructVersion(req.params.versionId);
    if (!content) return res.status(404).send('Not Found');
    const updated = await service.update(req.params.id, content);
    res.json(updated);
  } catch (e) { next(e); }
};

exports.branch = async (req, res, next) => {
  try {
    const versions = await service.createBranch(
      req.params.id,
      req.body.fromVersionId,
      req.body.branchName
    );
    if (!versions) return res.status(404).send('Not Found');
    res.status(201).json(versions);
  } catch (e) { next(e); }
};
