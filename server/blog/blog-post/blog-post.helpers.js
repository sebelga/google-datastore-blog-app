const stringHelpers = require('../../helpers/string');
const BlogPost = require('./blog-post.model');

// const createExcerpt = (text) => {
//     if (typeof text === 'undefined' || text === null) {
//         return null;
//     }

//     let excerpt = stringHelpers.limitChars(text, 300);
//     excerpt = stringHelpers.removeMarkdown(excerpt);
//     return excerpt;
// }

// const prepareData = (_data, file) => {
//     // Always sanitize untrusted source
//     const data = Object.assign({}, BlogPost.sanitize(_data));

//     data.excerpt = createExcerpt(data.content);

//     if (file) {
//         data.posterUri = file.cloudStoragePublicUrl || null;
//         data.cloudStorageObject = file.cloudStorageObject || null;
//     } else {
//         if (data.posterUri === null) {
//             data.cloudStorageObject = null;
//         }
//     }

//     return data;
// }

module.exports = {};
// module.exports = { createExcerpt, prepareData };
