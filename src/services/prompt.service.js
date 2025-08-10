const Prompt = require('../models/prompt.model');
const Tag = require('../models/tag.model');
const PromptVersion = require('../models/promptVersion.model');
const PromptStat = require('../models/promptStat.model');
const diff_match_patch = require('diff-match-patch');
const sequelize = require('../config/database');
const dmp = new diff_match_patch();

const SNAPSHOT_INTERVAL = 10;

const includeTags = { model: Tag, as: 'tags', through: { attributes: [] } };

exports.create = async (data) => {
  const { tags = [], ...promptData } = data;
  const prompt = await Prompt.create(promptData);
  await PromptVersion.create({
    prompt_id: prompt.id,
    snapshot_title: prompt.title,
    snapshot_body: prompt.body,
    is_snapshot: true,
    branch: 'main',
  });
  // 初始化统计行
  await PromptStat.findOrCreate({
    where: { prompt_id: prompt.id },
    defaults: { likes: 0, uses: 0, rating_sum: 0, rating_count: 0 },
  });
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

exports.getById = (id) =>
  Prompt.findByPk(id, { include: [includeTags, { model: PromptStat, as: 'stat' }] });

/**
 * 列表排序：
 *  - hot：根据 likes、uses、rating_avg 组合排序
 *  - rating：评分优先
 *  - new：按创建时间
 */
exports.list = (offset = 0, limit = 20, sort = 'hot') => {
  // 评分平均值
  const ratingAvg =
    'CASE WHEN stat.rating_count > 0 THEN 1.0 * stat.rating_sum / stat.rating_count ELSE 0 END';
  // 热度得分（可按需调整系数）
  const hotScore = `COALESCE(stat.likes,0) * 2 + COALESCE(stat.uses,0) + (${ratingAvg}) * 3`;

  let order;
  if (sort === 'rating') {
    order = [[sequelize.literal(ratingAvg), 'DESC'], ['created_at', 'DESC']];
  } else if (sort === 'new') {
    order = [['created_at', 'DESC']];
  } else {
    order = [[sequelize.literal(hotScore), 'DESC'], ['created_at', 'DESC']];
  }

  return Prompt.findAll({
    offset,
    limit,
    include: [includeTags, { model: PromptStat, as: 'stat' }],
    order,
    subQuery: false,
  });
};

exports.getVersionById = (id) => PromptVersion.findByPk(id);

exports.getVersions = (promptId, branch = 'main') =>
  PromptVersion.findAll({
    where: { prompt_id: promptId, branch },
    order: [['created_at', 'ASC']],
  });

exports.reconstructVersion = async (versionId) => {
  const version = await PromptVersion.findByPk(versionId);
  if (!version) return null;
  const chain = [];
  let current = version;
  while (current) {
    chain.unshift(current);
    if (current.is_snapshot) break;
    current = await PromptVersion.findByPk(current.parent_id);
  }
  if (!chain[0].is_snapshot) return null;
  let title = chain[0].snapshot_title;
  let body = chain[0].snapshot_body;
  for (let i = 1; i < chain.length; i++) {
    const v = chain[i];
    if (v.is_snapshot) {
      title = v.snapshot_title;
      body = v.snapshot_body;
      continue;
    }
    if (v.title_diff) {
      [title] = dmp.patch_apply(dmp.patch_fromText(v.title_diff), title);
    }
    if (v.body_diff) {
      [body] = dmp.patch_apply(dmp.patch_fromText(v.body_diff), body);
    }
  }
  return { title, body };
};

exports.update = async (id, data) => {
  const prompt = await Prompt.findByPk(id);
  if (!prompt) return null;
  const { tags, branch = 'main', ...promptData } = data;
  const latestVersion = await PromptVersion.findOne({
    where: { prompt_id: id, branch },
    order: [['created_at', 'DESC']],
  });
  const titleDiff = dmp.patch_toText(
    dmp.patch_make(prompt.title, promptData.title ?? prompt.title)
  );
  const bodyDiff = dmp.patch_toText(
    dmp.patch_make(prompt.body, promptData.body ?? prompt.body)
  );
  await prompt.update(promptData);
  const count = await PromptVersion.count({ where: { prompt_id: id, branch } });
  const isSnapshot = count % SNAPSHOT_INTERVAL === 0;
  await PromptVersion.create({
    prompt_id: id,
    parent_id: latestVersion.id,
    branch,
    title_diff: titleDiff,
    body_diff: bodyDiff,
    snapshot_title: isSnapshot ? prompt.title : null,
    snapshot_body: isSnapshot ? prompt.body : null,
    is_snapshot: isSnapshot,
  });
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

exports.createBranch = async (promptId, fromVersionId, branchName) => {
  const base = await exports.reconstructVersion(fromVersionId);
  if (!base) return null;
  await PromptVersion.create({
    prompt_id: promptId,
    parent_id: fromVersionId,
    branch: branchName,
    snapshot_title: base.title,
    snapshot_body: base.body,
    is_snapshot: true,
  });
  return exports.getVersions(promptId, branchName);
};

// -------- 统计写入 API --------
async function ensureStat(promptId) {
  const [stat] = await PromptStat.findOrCreate({
    where: { prompt_id: promptId },
    defaults: { likes: 0, uses: 0, rating_sum: 0, rating_count: 0 },
  });
  return stat;
}

exports.addLike = async (id) => {
  const stat = await ensureStat(id);
  await stat.increment('likes', { by: 1 });
  return exports.getById(id);
};

exports.addUse = async (id) => {
  const stat = await ensureStat(id);
  await stat.increment('uses', { by: 1 });
  return exports.getById(id);
};

exports.addRating = async (id, score) => {
  const s = Number(score);
  if (!Number.isFinite(s) || s < 1 || s > 5) {
    throw new Error('score must be an integer in [1,5]');
  }
  const stat = await ensureStat(id);
  await stat.increment({ rating_sum: s, rating_count: 1 });
  return exports.getById(id);
};
