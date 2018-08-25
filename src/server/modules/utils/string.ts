export interface StringUtils {
  limitChars(str: string, numChars?: number, suffix?: string): string;
  removeMarkdown(str: string): string;
  createExcerpt(str: string, numChars?: number, suffix?: string): string;
}

const stringUtils: StringUtils = {
  /**
   * Limit a long string to a number of chars and optionaly add an ellipsis
   */
  limitChars(str, numChars = 100, suffix = '(...)') {
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
  },
  removeMarkdown(str) {
    str = str.replace(/(\*{1,2})/g, '');
    str = str.replace(/(#{1,6}\s?)/g, '');
    return str;
  },
  createExcerpt(str, numChars = 300, suffix = '(...)') {
    if (typeof str === 'undefined' || str === null) {
      return null;
    }

    const excerpt = this.limitChars(str, numChars, suffix);
    return this.removeMarkdown(excerpt);
  },
};

export default stringUtils;
