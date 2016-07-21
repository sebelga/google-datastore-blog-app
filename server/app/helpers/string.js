'use strict';

function limitChars(str, numChars, sufix) {
    numChars = typeof numChars === 'undefined' ? 100 : numChars;
    sufix    = typeof sufix === 'undefined' ? '(...)' : sufix;

    if (str.length > numChars) {
        str = str.substr(0, numChars);

        var lastspace = str.lastIndexOf(' ');
        if (lastspace !== -1) {
            str = str.substr(0, lastspace);
        }

        if (sufix) {
            str += ' ' + sufix;
        }
    }

    return str;
}

function removeMarkdown(str) {
    // Simple markdown remover
    // Removes # and *
    str = str.replace(/(\*{1,2})/g, '');
    str = str.replace(/(#{1,6}\s?)/g, '');
    return str;
}


module.exports = {
    limitChars :     limitChars,
    removeMarkdown : removeMarkdown
};