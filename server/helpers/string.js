'use strict';

/**
 * Limit a long string to a number of chars and optionaly add an ellipsis
 */
const limitChars = (str, numChars = 100, suffix = '(...)') => {
  if (str.length > numChars) {
    str = str.substr(0, numChars);

    const lastspace = str.lastIndexOf(' ');
    if (lastspace !== -1) {
      str = str.substr(0, lastspace);
    }

    if (suffix) {
      str += ` ${suffix}`;
    }
  }

  return str;
};

/**
 * Basic Markdown text to plain text
 * (removes # and *)
 */
const removeMarkdown = str => {
  str = str.replace(/(\*{1,2})/g, '');
  str = str.replace(/(#{1,6}\s?)/g, '');
  return str;
};

/**
 * Creates an excerpt from a paragraph by limiting the characters
 * and cleaning up Markdown tags
 */
const createExcerpt = (str, numChars = 300, suffix = '(...)') => {
  if (typeof str === 'undefined' || str === null) {
    return null;
  }

  const excerpt = limitChars(str, numChars, suffix);
  return removeMarkdown(excerpt);
};

module.exports = {
  limitChars,
  removeMarkdown,
  createExcerpt,
};
