const { customAlphabet } = require('nanoid');

// URL-safe alphabet, no ambiguous chars
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 7);

const generateSlug = (length = 7) => {
  const gen = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', length);
  return gen();
};

const generateApiKey = (type = 'live') => {
  const prefix = type === 'test' ? 'sk_test_nv_' : 'sk_live_nv_';
  const body = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 32)();
  return `${prefix}${body}`;
};

module.exports = { generateSlug, generateApiKey, nanoid };
