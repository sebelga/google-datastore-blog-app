'use strict';

const limitChars = (str, numChars = 100, suffix = '(...)') => {
    if (str.length > numChars) {
        str = str.substr(0, numChars);

        var lastspace = str.lastIndexOf(' ');
        if (lastspace !== -1) {
            str = str.substr(0, lastspace);
        }

        if (suffix) {
            str += ' ' + suffix;
        }
    }

    return str;
}

const removeMarkdown = (str) => {
    // Simple markdown remover
    // Removes # and *
    str = str.replace(/(\*{1,2})/g, '');
    str = str.replace(/(#{1,6}\s?)/g, '');
    return str;
}

const createExcerpt = (str, numChars = 300, suffix = '(...)') => {
    if (typeof str === 'undefined' || str === null) {
        return null;
    }

    const excerpt = limitChars(str, numChars);
    return removeMarkdown(excerpt);
}


module.exports = {
    limitChars,
    removeMarkdown,
    createExcerpt,
};