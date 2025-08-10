const SYNONYMS = {
  javascript: 'js',
  'large language model': 'llm',
  'language model': 'llm',
  llm: 'llm',
  ai: 'ai',
  'artificial intelligence': 'ai',
};

const STOP_WORDS = new Set(['with', 'this', 'that', 'using', 'some', 'body', 'text', 'prompt']);

function normalizeTagName(name = '') {
  const lower = name.toLowerCase();
  return SYNONYMS[lower] || lower;
}

function generateTags({ title = '', body = '' }) {
  const text = `${title} ${body}`.toLowerCase();
  const words = Array.from(new Set(text.match(/\b[a-z]{2,}\b/g) || []));
  const filtered = words.filter((w) => !STOP_WORDS.has(w));
  return filtered.slice(0, 5).map(normalizeTagName);
}

module.exports = { generateTags, normalizeTagName };
