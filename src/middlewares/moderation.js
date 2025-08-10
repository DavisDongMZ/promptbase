module.exports = async (req, res, next) => {
  const { title = '', body = '' } = req.body || {};
  const text = `${title} ${body}`.toLowerCase();
  const banned = ['badword'];
  if (banned.some((w) => text.includes(w))) {
    return res.status(400).json({ error: 'Content rejected by moderation' });
  }
  next();
};
