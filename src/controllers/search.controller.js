const service = require('../services/prompt.service');

exports.searchPrompts = async (req, res, next) => {
  try {
    const { keyword, tags, limit, offset } = req.query;
    const tagArr = tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
    const prompts = await service.search(keyword, tagArr, Number(limit) || 20, Number(offset) || 0);
    res.json(prompts);
  } catch (e) {
    next(e);
  }
};
