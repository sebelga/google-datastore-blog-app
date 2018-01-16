const stringHelpers = require('../helpers/string');

const createExcerpt = (text) => {
    if (typeof text === 'undefined' || text === null) {
        return null;
    }

    let excerpt = stringHelpers.limitChars(text, 300);
    excerpt = stringHelpers.removeMarkdown(excerpt);
    return excerpt;
}

const prepareData = (_data, file) => {
    const data = Object.assign({}, _data);

    data.excerpt = createExcerpt(data.content);

    if (file) {
        data.posterUri = file.cloudStoragePublicUrl || null;
        data.cloudStorageObject = file.cloudStorageObject || null;
    }

    return data;
}

module.exports = { createExcerpt, prepareData };
